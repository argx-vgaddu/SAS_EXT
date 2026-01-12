import * as vscode from 'vscode';
import { SASDatasetProvider } from './SasDataProvider';
import { XPTDatasetProvider } from './XptDataProvider';
import { SASWebviewPanel } from './WebviewPanel';
import { Logger } from './utils/logger';

/**
 * Activates the SAS Data Explorer extension
 * @param context - The VS Code extension context
 */
export function activate(context: vscode.ExtensionContext) {
    // Initialize logging
    Logger.initialize('SAS Data Explorer');
    Logger.info('Extension activating...');

    const sasProvider = new SASDatasetProvider(context);
    const xptProvider = new XPTDatasetProvider(context);

    // Register custom editor providers
    const sasDisposable = vscode.window.registerCustomEditorProvider(
        'sasDataExplorer.sas7bdat',
        sasProvider,
        {
            webviewOptions: {
                retainContextWhenHidden: true,
            },
            supportsMultipleEditorsPerDocument: false,
        }
    );

    const xptDisposable = vscode.window.registerCustomEditorProvider(
        'sasDataExplorer.xpt',
        xptProvider,
        {
            webviewOptions: {
                retainContextWhenHidden: true,
            },
            supportsMultipleEditorsPerDocument: false,
        }
    );

    // Register command to show output channel
    const showOutputCommand = vscode.commands.registerCommand(
        'sasDataExplorer.showOutput',
        () => {
            Logger.show();
            Logger.info('Output channel displayed');
        }
    );

    // Register command to open SAS dataset
    const openCommand = vscode.commands.registerCommand(
        'sasDataExplorer.openDataset',
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
                await vscode.commands.executeCommand('vscode.openWith', fileUri[0], 'sasDataExplorer.sas7bdat');
            }
        }
    );

    // Register command to open XPT file
    const openXPTCommand = vscode.commands.registerCommand(
        'sasDataExplorer.openXPT',
        async () => {
            const options: vscode.OpenDialogOptions = {
                canSelectMany: false,
                openLabel: 'Open SAS XPT File',
                filters: {
                    'SAS XPT Files': ['xpt']
                }
            };

            const fileUri = await vscode.window.showOpenDialog(options);
            if (fileUri && fileUri[0]) {
                await vscode.commands.executeCommand('vscode.openWith', fileUri[0], 'sasDataExplorer.xpt');
            }
        }
    );

    // Add disposables to context for proper cleanup
    context.subscriptions.push(sasDisposable, xptDisposable, openCommand, openXPTCommand, showOutputCommand);

    // Ensure logger is disposed when extension deactivates
    context.subscriptions.push({ dispose: () => Logger.dispose() });

    Logger.info('Extension activated successfully');
    Logger.info('TypeScript reader v2.0.0 with improved WHERE clause filtering');
    Logger.info('XPT file support enabled');
    // Logger is available via command: "SAS Data Explorer: Show Output"
}

/**
 * Deactivates the extension and cleans up resources
 */
export function deactivate() {
    Logger.info('Extension deactivating...');
    Logger.dispose();
}