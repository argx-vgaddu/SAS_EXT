import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process';
import { SASWebviewPanel } from './WebviewPanel';
import { SASMetadata, SASDataResponse, SASDataRequest } from './types';
import { Logger } from './utils/logger';

/**
 * VS Code custom editor provider for SAS dataset files (.sas7bdat)
 * Handles the lifecycle of SAS dataset documents and their associated webview editors
 */
export class SASDatasetProvider implements vscode.CustomReadonlyEditorProvider<SASDatasetDocument> {
    private static readonly viewType = 'sasDatasetViewer.sas7bdat';
    private readonly logger = Logger.createScoped('SASDatasetProvider');

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {
        this.logger.debug('SASDatasetProvider initialized');
    }

    /**
     * Creates a custom document for a SAS dataset file
     */
    public async openCustomDocument(
        uri: vscode.Uri,
        openContext: vscode.CustomDocumentOpenContext,
        _token: vscode.CancellationToken
    ): Promise<SASDatasetDocument> {
        this.logger.info(`Opening SAS dataset: ${uri.fsPath}`);
        const document = await SASDatasetDocument.create(uri, this.context);
        return document;
    }

    /**
     * Resolves a custom editor for a SAS dataset document
     */
    public async resolveCustomEditor(
        document: SASDatasetDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        this.logger.debug(`Resolving custom editor for: ${document.uri.fsPath}`);
        const sasWebviewPanel = new SASWebviewPanel(webviewPanel, document, this.context);
        await sasWebviewPanel.initialize();
    }
}

/**
 * Represents a SAS dataset document with metadata and data access capabilities
 */
export class SASDatasetDocument implements vscode.CustomDocument {
    private readonly logger = Logger.createScoped('SASDatasetDocument');

    private constructor(
        public readonly uri: vscode.Uri,
        public metadata: SASMetadata | null = null,
        private readonly context: vscode.ExtensionContext
    ) {}

    /**
     * Factory method to create a SAS dataset document
     */
    public static async create(
        uri: vscode.Uri,
        context: vscode.ExtensionContext
    ): Promise<SASDatasetDocument> {
        const document = new SASDatasetDocument(uri, null, context);
        await document.loadMetadata();
        return document;
    }

    /**
     * Loads metadata for the SAS dataset file
     */
    private async loadMetadata(): Promise<void> {
        try {
            this.logger.info(`Loading metadata for: ${this.uri.fsPath}`);
            this.metadata = await this.executePythonCommand('metadata', this.uri.fsPath);
            this.logger.info('Metadata loaded successfully', {
                totalRows: this.metadata?.total_rows,
                totalVariables: this.metadata?.total_variables
            });
        } catch (error) {
            this.logger.error('Failed to load metadata', error);
            throw error;
        }
    }

    /**
     * Retrieves data from the SAS dataset based on the request parameters
     */
    public async getData(request: SASDataRequest): Promise<SASDataResponse> {
        this.logger.debug('Getting data', {
            startRow: request.startRow,
            numRows: request.numRows,
            selectedVarsCount: request.selectedVars?.length || 0,
            hasWhereClause: !!request.whereClause
        });

        const args = [
            'data',
            request.filePath,
            request.startRow.toString(),
            request.numRows.toString(),
            request.selectedVars ? request.selectedVars.join(',') : '',
            request.whereClause || ''
        ];

        return await this.executePythonCommand('data', ...args.slice(1));
    }

    /**
     * Executes a Python command and returns the parsed result
     */
    private async executePythonCommand(command: string, ...args: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const pythonScript = path.join(this.context.extensionPath, 'python', 'sas_reader.py');
            const fullArgs = [pythonScript, command, ...args];

            this.logger.debug(`Executing Python command: py ${fullArgs.join(' ')}`);

            const pythonProcess = spawn('py', fullArgs, {
                cwd: this.context.extensionPath
            });

            let stdout = '';
            let stderr = '';

            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            pythonProcess.on('close', (code) => {
                this.logger.debug(`Python process exited with code ${code}`);

                if (code !== 0) {
                    this.logger.error('Python process failed', { code, stderr });
                    reject(new Error(`Python process exited with code ${code}: ${stderr}`));
                    return;
                }

                try {
                    const result = JSON.parse(stdout);
                    if (result.error) {
                        this.logger.error('Python script returned error', result.error);
                        reject(new Error(result.error));
                    } else {
                        resolve(result.metadata || result);
                    }
                } catch (parseError) {
                    this.logger.error('Failed to parse Python output', {
                        parseError: parseError instanceof Error ? parseError.message : parseError,
                        stdout: stdout.substring(0, 500) // Limit output for logging
                    });
                    reject(new Error(`Failed to parse Python output: ${parseError}. Output was: ${stdout}`));
                }
            });

            pythonProcess.on('error', (error) => {
                this.logger.error('Failed to spawn Python process', error);
                reject(new Error(`Failed to spawn Python process: ${error.message}`));
            });
        });
    }

    /**
     * Disposes of the document and cleans up resources
     */
    dispose(): void {
        this.logger.debug(`Disposing document: ${this.uri.fsPath}`);
        // Clean up resources if needed
    }
}