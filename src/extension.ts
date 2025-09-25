import * as vscode from 'vscode';
import { SASDatasetProvider } from './SasDataProvider';
import { SASWebviewPanel } from './WebviewPanel';

export function activate(context: vscode.ExtensionContext) {
    const provider = new SASDatasetProvider(context);

    // Register custom editor provider
    const disposable = vscode.window.registerCustomEditorProvider(
        'sasDatasetViewer.sas7bdat',
        provider,
        {
            webviewOptions: {
                retainContextWhenHidden: true,
            },
            supportsMultipleEditorsPerDocument: false,
        }
    );

    // Register command to open SAS dataset
    const openCommand = vscode.commands.registerCommand(
        'sasDatasetViewer.openDataset',
        async () => {
            const options: vscode.OpenDialogOptions = {
                canSelectMany: false,
                openLabel: 'Open SAS Dataset',
                filters: {
                    'SAS Datasets': ['sas7bdat']
                }
            };

            const fileUri = await vscode.window.showOpenDialog(options);
            if (fileUri && fileUri[0]) {
                await vscode.commands.executeCommand('vscode.openWith', fileUri[0], 'sasDatasetViewer.sas7bdat');
            }
        }
    );

    context.subscriptions.push(disposable, openCommand);
}

export function deactivate() {}