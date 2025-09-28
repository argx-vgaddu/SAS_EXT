import * as vscode from 'vscode';
import { SASDatasetProvider } from './SasDataProvider';
import { SASWebviewPanel } from './WebviewPanel';
import { Logger } from './utils/logger';

/**
 * Activates the SAS Dataset Viewer extension
 * @param context - The VS Code extension context
 */
export function activate(context: vscode.ExtensionContext) {
    // Initialize logging
    Logger.initialize('SAS Dataset Viewer');
    Logger.info('Extension activating...');

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

    // Register command to show output channel
    const showOutputCommand = vscode.commands.registerCommand(
        'sasDatasetViewer.showOutput',
        () => {
            Logger.show();
            Logger.info('Output channel displayed');
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

    // Add disposables to context for proper cleanup
    context.subscriptions.push(disposable, openCommand, showOutputCommand);

    // Ensure logger is disposed when extension deactivates
    context.subscriptions.push({ dispose: () => Logger.dispose() });

    Logger.info('Extension activated successfully');
    Logger.info('TypeScript reader v2.0.0 with improved WHERE clause filtering');
    Logger.show(); // Automatically show output on activation for visibility
}

/**
 * Deactivates the extension and cleans up resources
 */
export function deactivate() {
    Logger.info('Extension deactivating...');
    Logger.dispose();
}