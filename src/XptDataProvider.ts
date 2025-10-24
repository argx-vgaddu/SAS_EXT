import * as vscode from 'vscode';
import * as path from 'path';
import { SASWebviewPanel } from './WebviewPanel';
import { SASMetadata, SASDataResponse, SASDataRequest, IDatasetDocument } from './types';
import { Logger } from './utils/logger';
import { XPTReader, DatasetMetadata, DataRow } from './readers/XPTReader';

/**
 * VS Code custom editor provider for XPT files (.xpt)
 * Handles the lifecycle of XPT dataset documents and their associated webview editors
 */
export class XPTDatasetProvider implements vscode.CustomReadonlyEditorProvider<XPTDatasetDocument> {
    private static readonly viewType = 'sasDatasetViewer.xpt';
    private readonly logger = Logger.createScoped('XPTDatasetProvider');

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {
        this.logger.debug('XPTDatasetProvider initialized');
    }

    /**
     * Creates a custom document for an XPT file
     */
    public async openCustomDocument(
        uri: vscode.Uri,
        openContext: vscode.CustomDocumentOpenContext,
        _token: vscode.CancellationToken
    ): Promise<XPTDatasetDocument> {
        this.logger.info(`Opening XPT file: ${uri.fsPath}`);
        const document = await XPTDatasetDocument.create(uri, this.context);
        return document;
    }

    /**
     * Resolves a custom editor for an XPT dataset document
     */
    public async resolveCustomEditor(
        document: XPTDatasetDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        this.logger.debug(`Resolving custom editor for: ${document.uri.fsPath}`);
        const sasWebviewPanel = new SASWebviewPanel(webviewPanel, document, this.context);
        await sasWebviewPanel.initialize();
    }
}

/**
 * Represents an XPT dataset document with metadata and data access capabilities
 */
export class XPTDatasetDocument implements IDatasetDocument {
    private readonly logger = Logger.createScoped('XPTDatasetDocument');
    private reader: XPTReader | null = null;

    private constructor(
        public readonly uri: vscode.Uri,
        public metadata: SASMetadata | null = null,
        private readonly context: vscode.ExtensionContext
    ) {}

    /**
     * Factory method to create an XPT dataset document
     */
    public static async create(
        uri: vscode.Uri,
        context: vscode.ExtensionContext
    ): Promise<XPTDatasetDocument> {
        const document = new XPTDatasetDocument(uri, null, context);
        await document.loadMetadata();
        return document;
    }

    /**
     * Loads metadata for the XPT file
     */
    private async loadMetadata(): Promise<void> {
        try {
            this.logger.info(`Loading metadata for XPT file: ${this.uri.fsPath}`);

            this.reader = new XPTReader(this.uri.fsPath);
            const xptMetadata = await this.reader.getMetadata();

            // Convert to existing format for compatibility
            this.metadata = this.convertMetadata(xptMetadata);

            this.logger.info('XPT metadata loaded successfully', {
                totalRows: this.metadata?.total_rows,
                totalVariables: this.metadata?.total_variables,
                dataset_label: this.metadata?.dataset_label
            });

        } catch (error) {
            this.logger.error('Failed to load XPT metadata', error);
            throw error;
        }
    }

    /**
     * Converts XPT reader metadata to existing format
     */
    private convertMetadata(xptMetadata: DatasetMetadata): SASMetadata {
        return {
            total_rows: xptMetadata.rowCount,
            total_variables: xptMetadata.columnCount,
            variables: xptMetadata.variables.map(v => ({
                name: v.name,
                type: v.type === 'string' ? 'character' : 'numeric',
                label: v.label,
                format: v.format || '',
                length: v.length,
                dtype: v.type
            })),
            file_path: this.uri.fsPath,
            dataset_label: xptMetadata.label || path.basename(this.uri.fsPath, '.xpt')
        };
    }

    /**
     * Get the count of rows matching a filter without loading data
     */
    public async getFilteredRowCount(whereClause: string): Promise<number> {
        if (this.reader) {
            try {
                return await this.reader.getFilteredRowCount(whereClause);
            } catch (error) {
                this.logger.warn('Failed to get filtered row count', error);
            }
        }

        return 0;
    }

    /**
     * Retrieves data from the XPT file based on the request parameters
     */
    public async getData(request: SASDataRequest): Promise<SASDataResponse> {
        this.logger.debug('Getting data from XPT file', {
            startRow: request.startRow,
            numRows: request.numRows,
            selectedVarsCount: request.selectedVars?.length || 0,
            hasWhereClause: !!request.whereClause
        });

        if (!this.reader) {
            throw new Error('XPT reader not initialized');
        }

        try {
            const startTime = Date.now();

            // Get data with XPT reader
            let data: DataRow[];
            let filteredRowCount: number;

            if (request.whereClause) {
                // Get filtered row count efficiently
                filteredRowCount = await this.reader.getFilteredRowCount(request.whereClause);

                // Log the request parameters for debugging
                this.logger.debug(`getData request params: startRow=${request.startRow}, numRows=${request.numRows}`);

                // Now get the actual data page
                data = await this.reader.getData({
                    startRow: request.startRow,
                    numRows: request.numRows,
                    variables: request.selectedVars,
                    whereClause: request.whereClause
                });

                this.logger.info(`Filter applied, ${filteredRowCount} rows match, returned ${data.length} rows for current page (requested: ${request.numRows})`);
            } else {
                data = await this.reader.getData({
                    startRow: request.startRow,
                    numRows: request.numRows,
                    variables: request.selectedVars
                });
                filteredRowCount = this.metadata?.total_rows || 0;
            }

            const elapsed = Date.now() - startTime;
            this.logger.debug(`Data retrieved in ${elapsed}ms from XPT file`);

            // Convert to existing response format
            return {
                data: data,
                total_rows: this.metadata?.total_rows || 0,
                filtered_rows: filteredRowCount,
                start_row: request.startRow,
                returned_rows: data.length,
                columns: request.selectedVars || this.metadata?.variables.map(v => v.name) || []
            };

        } catch (error) {
            this.logger.error('Failed to get data from XPT file', error);
            throw error;
        }
    }

    /**
     * Gets unique values for a column
     */
    public async getUniqueValues(columnName: string, includeCount: boolean = false): Promise<any[]> {
        if (this.reader) {
            return await this.reader.getUniqueValues(columnName, includeCount);
        }

        return [];
    }

    /**
     * Gets unique combinations for multiple columns
     */
    public async getUniqueCombinations(columnNames: string[], includeCount: boolean = false): Promise<any[]> {
        if (this.reader) {
            return await this.reader.getUniqueCombinations(columnNames, includeCount);
        }

        return [];
    }

    /**
     * Disposes of the document and cleans up resources
     */
    dispose(): void {
        this.logger.debug(`Disposing XPT document: ${this.uri.fsPath}`);
        if (this.reader) {
            this.reader.dispose();
            this.reader = null;
        }
    }
}
