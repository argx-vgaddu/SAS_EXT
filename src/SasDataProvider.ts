import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process';
import { SASWebviewPanel } from './WebviewPanel';
import { SASMetadata, SASDataResponse, SASDataRequest } from './types';

export class SASDatasetProvider implements vscode.CustomReadonlyEditorProvider<SASDatasetDocument> {
    private static readonly viewType = 'sasDatasetViewer.sas7bdat';

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public async openCustomDocument(
        uri: vscode.Uri,
        openContext: vscode.CustomDocumentOpenContext,
        _token: vscode.CancellationToken
    ): Promise<SASDatasetDocument> {
        const document = await SASDatasetDocument.create(uri, this.context);
        return document;
    }

    public async resolveCustomEditor(
        document: SASDatasetDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        const sasWebviewPanel = new SASWebviewPanel(webviewPanel, document, this.context);
        await sasWebviewPanel.initialize();
    }
}

export class SASDatasetDocument implements vscode.CustomDocument {
    private constructor(
        public readonly uri: vscode.Uri,
        public metadata: SASMetadata | null = null,
        private readonly context: vscode.ExtensionContext
    ) {}

    public static async create(
        uri: vscode.Uri,
        context: vscode.ExtensionContext
    ): Promise<SASDatasetDocument> {
        const document = new SASDatasetDocument(uri, null, context);
        await document.loadMetadata();
        return document;
    }

    private async loadMetadata(): Promise<void> {
        try {
            console.log(`SASDatasetDocument: Loading metadata for ${this.uri.fsPath}`);
            this.metadata = await this.executePythonCommand('metadata', this.uri.fsPath);
            console.log('SASDatasetDocument: Metadata loaded successfully:', this.metadata);
        } catch (error) {
            console.error('SASDatasetDocument: Failed to load metadata:', error);
            vscode.window.showErrorMessage(`Failed to load SAS dataset metadata: ${error}`);
            throw error;
        }
    }

    public async getData(request: SASDataRequest): Promise<SASDataResponse> {
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

    private async executePythonCommand(command: string, ...args: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const pythonScript = path.join(this.context.extensionPath, 'python', 'sas_reader.py');
            const fullArgs = [pythonScript, command, ...args];

            console.log(`SASDatasetDocument: Executing Python command: py ${fullArgs.join(' ')}`);

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
                console.log(`SASDatasetDocument: Python process exited with code ${code}`);
                console.log(`SASDatasetDocument: stdout: ${stdout}`);
                if (stderr) console.log(`SASDatasetDocument: stderr: ${stderr}`);

                if (code !== 0) {
                    reject(new Error(`Python process exited with code ${code}: ${stderr}`));
                    return;
                }

                try {
                    const result = JSON.parse(stdout);
                    if (result.error) {
                        reject(new Error(result.error));
                    } else {
                        resolve(result.metadata || result);
                    }
                } catch (parseError) {
                    console.error(`SASDatasetDocument: Failed to parse JSON: ${stdout}`);
                    reject(new Error(`Failed to parse Python output: ${parseError}. Output was: ${stdout}`));
                }
            });

            pythonProcess.on('error', (error) => {
                console.error(`SASDatasetDocument: Failed to spawn Python process:`, error);
                reject(new Error(`Failed to spawn Python process: ${error.message}`));
            });
        });
    }

    dispose(): void {
        // Clean up resources if needed
    }
}