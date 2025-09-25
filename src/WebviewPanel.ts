import * as vscode from 'vscode';
import * as path from 'path';
import { SASDatasetDocument } from './SasDataProvider';
import { WebviewMessage, FilterState, SASDataRequest } from './types';

export class SASWebviewPanel {
    private filterState: FilterState;
    private disposed: boolean = false;
    private currentWhereClause: string = '';

    constructor(
        private readonly panel: vscode.WebviewPanel,
        private readonly document: SASDatasetDocument,
        private readonly context: vscode.ExtensionContext
    ) {
        this.filterState = {
            selectedVariables: [],
            whereClause: '',
            variableOrder: []
        };

        this.panel.onDidDispose(() => this.dispose(), null, this.context.subscriptions);
        this.panel.webview.onDidReceiveMessage(this.onDidReceiveMessage, this, this.context.subscriptions);
    }

    public async initialize(): Promise<void> {
        try {
            console.log('SASWebviewPanel: Starting initialization');

            this.panel.webview.options = {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(this.context.extensionPath, 'webview'))
                ]
            };

            // Set HTML content first
            this.panel.webview.html = this.getWebviewContent();
            console.log('SASWebviewPanel: HTML content set');

            // Wait a bit for webview to be ready, then send data directly in HTML
            setTimeout(async () => {
                if (this.disposed) return;
                await this.loadDataDirectly();
            }, 500);

        } catch (error) {
            console.error('SASWebviewPanel: Error during initialization:', error);
            vscode.window.showErrorMessage(`Failed to initialize SAS viewer: ${error}`);
        }
    }

    private async loadDataDirectly(): Promise<void> {
        try {
            console.log('SASWebviewPanel: Loading data directly');

            if (!this.document.metadata) {
                console.error('SASWebviewPanel: No metadata available');
                return;
            }

            // Get ALL data at once for fast client-side filtering
            const request: SASDataRequest = {
                filePath: this.document.uri.fsPath,
                startRow: 0,
                numRows: 10000, // Load more data at once
                selectedVars: this.document.metadata.variables.map(v => v.name),
                whereClause: '' // No server-side filtering
            };

            const data = await this.document.getData(request);
            console.log('SASWebviewPanel: Data loaded:', data);

            // Update the HTML directly with the data
            this.updateWebviewWithData(this.document.metadata, data);

        } catch (error) {
            console.error('SASWebviewPanel: Error loading data directly:', error);
        }
    }

    private async sendMetadata(): Promise<void> {
        if (!this.document.metadata) return;

        // Initialize filter state with all variables selected
        this.filterState.selectedVariables = this.document.metadata.variables.map(v => v.name);
        this.filterState.variableOrder = [...this.filterState.selectedVariables];

        await this.postMessage({
            command: 'metadata',
            data: {
                metadata: this.document.metadata,
                filterState: this.filterState
            }
        });
    }

    private async loadInitialData(): Promise<void> {
        const request: SASDataRequest = {
            filePath: this.document.uri.fsPath,
            startRow: 0,
            numRows: 100,
            selectedVars: this.filterState.selectedVariables,
            whereClause: this.filterState.whereClause
        };

        try {
            const data = await this.document.getData(request);
            await this.postMessage({
                command: 'data',
                data: data
            });
        } catch (error) {
            await this.postMessage({
                command: 'error',
                data: { message: `Failed to load data: ${error}` }
            });
        }
    }

    private async onDidReceiveMessage(message: WebviewMessage): Promise<void> {
        switch (message.command) {
            case 'loadData':
                await this.handleLoadData(message.data);
                break;

            case 'updateFilter':
                await this.handleUpdateFilter(message.data);
                break;

            case 'toggleVariable':
                await this.handleToggleVariable(message.data);
                break;

            case 'reorderVariables':
                await this.handleReorderVariables(message.data);
                break;

            case 'searchVariables':
                await this.handleSearchVariables(message.data);
                break;

            case 'applyWhereClause':
                await this.handleApplyWhereClause(message.data);
                break;

            case 'applyFilter':
                await this.handleApplyFilter(message.data);
                break;

            default:
                console.log(`Unknown command: ${message.command}`);
        }
    }

    private async handleLoadData(data: any): Promise<void> {
        const request: SASDataRequest = {
            filePath: this.document.uri.fsPath,
            startRow: data.startRow || 0,
            numRows: data.numRows || 100,
            selectedVars: this.filterState.selectedVariables,
            whereClause: this.filterState.whereClause
        };

        try {
            const result = await this.document.getData(request);
            await this.postMessage({
                command: 'data',
                data: result
            });
        } catch (error) {
            await this.postMessage({
                command: 'error',
                data: { message: `Failed to load data: ${error}` }
            });
        }
    }

    private async handleUpdateFilter(data: any): Promise<void> {
        this.filterState = { ...this.filterState, ...data };
        await this.loadInitialData();
    }

    private async handleToggleVariable(data: { variable: string, selected: boolean }): Promise<void> {
        if (data.selected) {
            if (!this.filterState.selectedVariables.includes(data.variable)) {
                this.filterState.selectedVariables.push(data.variable);
                // Add to the end of variable order if not already there
                if (!this.filterState.variableOrder.includes(data.variable)) {
                    this.filterState.variableOrder.push(data.variable);
                }
            }
        } else {
            this.filterState.selectedVariables = this.filterState.selectedVariables.filter(v => v !== data.variable);
        }

        await this.loadInitialData();
    }

    private async handleReorderVariables(data: { newOrder: string[] }): Promise<void> {
        this.filterState.variableOrder = data.newOrder;
        // Update selected variables to maintain the new order
        this.filterState.selectedVariables = data.newOrder.filter(v =>
            this.filterState.selectedVariables.includes(v)
        );

        await this.loadInitialData();
    }

    private async handleSearchVariables(data: { searchTerm: string }): Promise<void> {
        // This is handled on the frontend, but we could do server-side filtering here if needed
        await this.postMessage({
            command: 'variableSearchResult',
            data: { searchTerm: data.searchTerm }
        });
    }

    private async handleApplyWhereClause(data: { whereClause: string }): Promise<void> {
        this.filterState.whereClause = data.whereClause;
        await this.loadInitialData();
    }

    private async handleApplyFilter(data: any): Promise<void> {
        // Client-side filtering now, no need for this
        console.log('SASWebviewPanel: Filter applied client-side');
    }

    private async postMessage(message: WebviewMessage): Promise<void> {
        await this.panel.webview.postMessage(message);
    }

    private getDataStats(data: any, metadata: any): string {
        const filtered = data.filtered_rows !== data.total_rows;
        if (filtered) {
            return `${data.filtered_rows} of ${data.total_rows} observations (filtered), ${metadata.total_variables} variables`;
        } else {
            return `${data.total_rows} observations, ${metadata.total_variables} variables`;
        }
    }

    private getVariableIcon(variable: any): string {
        // Only check for date/time formats on NUMERIC variables
        if (variable.type === 'numeric' && variable.format) {
            const format = variable.format.toUpperCase();
            if (format.includes('DATETIME')) return '🕐';
            if (format.includes('DATE')) return '📅';
            if (format.includes('TIME')) return '🕐';
            if (format.includes('DOLLAR') || format.includes('CURRENCY')) return '💰';
            if (format.includes('PERCENT')) return '%';
        }

        // For numeric variables without special formats, check name patterns
        if (variable.type === 'numeric') {
            const nameUpper = variable.name.toUpperCase();
            if (nameUpper.includes('DATETIME') || nameUpper.includes('DTTM')) return '🕐';
            if (nameUpper.includes('DATE') || nameUpper.includes('DT')) return '📅';
            if (nameUpper.includes('TIME') || nameUpper.includes('TM')) return '🕐';
            return '#'; // Default numeric icon
        }

        // Character variables are always shown as text, regardless of name
        if (variable.type === 'character') return '📝';

        return '?';
    }

    private getVariableTooltipText(variable: any): string {
        let tooltip = `${variable.name} (${variable.type})`;
        if (variable.label) tooltip += `\\n${variable.label}`;
        if (variable.format) tooltip += `\\nFormat: ${variable.format}`;
        return tooltip;
    }

    private updateWebviewWithData(metadata: any, data: any): void {
        console.log('SASWebviewPanel: Updating webview with data directly');
        const fileName = metadata.file_path.split(/[\\/]/).pop();

        const variableList = metadata.variables.map((variable: any, index: number) => {
            const icon = this.getVariableIcon(variable);
            return `
                <div class="variable-item">
                    <input type="checkbox" checked id="var-${index}" onchange="toggleColumn('${variable.name}', this.checked)">
                    <span class="variable-text show-both" title="${this.getVariableTooltipText(variable)}">${icon} ${variable.name}${variable.label && variable.label !== variable.name ? ` (${variable.label})` : ''}</span>
                </div>`;
        }).join('');

        this.panel.webview.html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline' 'unsafe-eval';">
            <style>
                body { font-family: var(--vscode-font-family); background: var(--vscode-editor-background); color: var(--vscode-foreground); margin: 0; padding: 10px; }
                .header {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 20px;
                    padding: 15px 20px;
                    background: var(--vscode-sideBar-background);
                    border-radius: 6px;
                    border: 1px solid var(--vscode-panel-border);
                    margin-bottom: 15px;
                    align-items: center;
                }
                .header-section { display: flex; flex-direction: column; }
                .header-section.center { align-items: center; }
                .header-section.right { align-items: flex-end; }
                .dataset-title { font-size: 18px; font-weight: 600; margin: 0; color: var(--vscode-foreground); }
                .dataset-label { color: var(--vscode-descriptionForeground); font-size: 12px; margin: 2px 0 0 0; }
                .stats { color: var(--vscode-descriptionForeground); font-size: 11px; margin: 2px 0 0 0; }
                .filter-section { display: flex; flex-direction: column; gap: 8px; }
                .filter-input { display: flex; gap: 5px; align-items: center; }
                .where-input { flex: 1; padding: 8px 12px; border: 1px solid var(--vscode-input-border); background: var(--vscode-input-background); color: var(--vscode-input-foreground); border-radius: 3px; font-size: 13px; min-width: 300px; }
                .btn { padding: 6px 12px; border: 1px solid var(--vscode-button-border); background: var(--vscode-button-background); color: var(--vscode-button-foreground); border-radius: 3px; cursor: pointer; font-size: 11px; }
                .btn:hover { background: var(--vscode-button-hoverBackground); }
                .btn-secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
                .btn-secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
                .controls-section { display: flex; flex-direction: column; gap: 10px; }
                .control-group { display: flex; align-items: center; gap: 8px; }
                .control-label { font-size: 11px; color: var(--vscode-descriptionForeground); min-width: 50px; }
                select { padding: 4px 6px; border: 1px solid var(--vscode-input-border); background: var(--vscode-input-background); color: var(--vscode-input-foreground); border-radius: 3px; font-size: 11px; }
                .content { display: flex; gap: 15px; height: calc(100vh - 180px); }
                .sidebar { min-width: 250px; max-width: 450px; width: 320px; display: flex; flex-direction: column; transition: width 0.3s ease; }
                .sidebar.compact { width: 280px; }
                .sidebar.expanded { width: 400px; }
                .data-area { flex: 1; display: flex; flex-direction: column; }
                .variables-container { flex: 1; overflow-y: auto; border: 1px solid var(--vscode-panel-border); border-radius: 3px; padding: 10px; background: var(--vscode-sideBar-background); }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid var(--vscode-panel-border); padding: 6px 8px; text-align: left; font-size: 12px; }
                th { background: var(--vscode-editor-background); font-weight: 600; position: sticky; top: 0; z-index: 10; }
                .variable-item {
                    padding: 6px 0;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .variable-item:last-child { border-bottom: none; }
                .variable-item input { margin: 0; flex-shrink: 0; }
                .variable-text {
                    flex: 1;
                    font-size: 11px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    min-width: 0;
                }
                .variable-text.show-both {
                    white-space: normal;
                    line-height: 1.3;
                }
                h3 { margin: 0 0 10px 0; font-size: 13px; font-weight: 600; }
                .section-title { font-size: 11px; font-weight: 600; color: var(--vscode-descriptionForeground); text-transform: uppercase; margin-bottom: 8px; }
            </style>
            <title>SAS Dataset Viewer</title>
        </head>
        <body>
            <div class="header">
                <!-- Dataset Info Section -->
                <div class="header-section">
                    <div class="dataset-title">${fileName.replace('.sas7bdat', '')}</div>
                    ${metadata.dataset_label ? `<div class="dataset-label">${metadata.dataset_label}</div>` : ''}
                    <div class="stats">${data.total_rows.toLocaleString()} observations • ${metadata.total_variables} variables</div>
                </div>

                <!-- Filter Section -->
                <div class="header-section center">
                    <div class="section-title">Filtering</div>
                    <div class="filter-section">
                        <div class="filter-input">
                            <input type="text" class="where-input" placeholder="visitnum = 2 or age > 60" id="where-clause" onkeypress="if(event.key==='Enter') applyFilter()">
                        </div>
                        <div class="filter-input">
                            <button class="btn" onclick="applyFilter()">Apply</button>
                            <button class="btn btn-secondary" onclick="clearFilter()">Clear</button>
                        </div>
                    </div>
                </div>

                <!-- Controls Section -->
                <div class="header-section right">
                    <div class="section-title">Display Options</div>
                    <div class="controls-section">
                        <div class="control-group">
                            <label class="control-label">Show:</label>
                            <select id="variable-display-mode" onchange="updateVariableDisplay()">
                                <option value="name">Names</option>
                                <option value="label">Labels</option>
                                <option value="both" selected>Both</option>
                            </select>
                        </div>
                        <button class="btn" onclick="showVariableMetadata()">Variable Details</button>
                    </div>
                </div>
            </div>

            <div class="content">
                <div class="sidebar">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h3>Variables</h3>
                        <div id="selected-count" style="font-size: 11px; color: var(--vscode-descriptionForeground);">
                            ${metadata.total_variables} selected
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <button class="btn" onclick="selectAll()" style="margin-right: 8px;">Select All</button>
                        <button class="btn btn-secondary" onclick="deselectAll()">Deselect All</button>
                    </div>

                    <div class="variables-container">
                        ${variableList}
                    </div>
                </div>

                <div class="data-area">
                    <div class="data-stats" id="data-stats" style="margin-bottom: 10px; font-size: 12px; color: var(--vscode-descriptionForeground);">
                        Showing ${data.returned_rows.toLocaleString()} rows
                    </div>
                    <div style="flex: 1; overflow: auto; border: 1px solid var(--vscode-panel-border); border-radius: 3px;">
                        <table id="data-table" style="min-width: max-content;">
                            <thead id="table-header">
                                <tr></tr>
                            </thead>
                            <tbody id="table-body">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <script>
                // Embedded data from extension
                const allData = ${JSON.stringify(data.data)};
                const columns = ${JSON.stringify(data.columns)};
                const metadata = ${JSON.stringify(metadata)};
                let filteredData = allData;
                let selectedColumns = [...columns];

                // Initialize the table
                renderTable();
                updateStats();

                function toggleColumn(columnName, isVisible) {
                    if (isVisible && !selectedColumns.includes(columnName)) {
                        selectedColumns.push(columnName);
                    } else if (!isVisible) {
                        selectedColumns = selectedColumns.filter(col => col !== columnName);
                    }
                    renderTable();
                    updateSelectedCount();
                }

                function selectAll() {
                    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                    checkboxes.forEach(cb => { cb.checked = true; });
                    selectedColumns = [...columns];
                    renderTable();
                    updateSelectedCount();
                }

                function deselectAll() {
                    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                    checkboxes.forEach(cb => { cb.checked = false; });
                    selectedColumns = [];
                    renderTable();
                    updateSelectedCount();
                }

                function updateSelectedCount() {
                    const checkedCount = document.querySelectorAll('input[type="checkbox"]:checked').length;
                    const selectedCountEl = document.getElementById('selected-count');
                    if (selectedCountEl) {
                        selectedCountEl.textContent = 'Selected variables: ' + checkedCount;
                    }
                }

                function applyFilter() {
                    const whereInput = document.getElementById('where-clause');
                    const whereClause = whereInput ? whereInput.value.trim() : '';

                    console.log('Applying filter:', whereClause);

                    if (!whereClause) {
                        filteredData = allData;
                        console.log('No filter, showing all', allData.length, 'rows');
                    } else {
                        try {
                            filteredData = allData.filter(row => {
                                return evaluateWhereClause(row, whereClause);
                            });
                            console.log('Filtered to', filteredData.length, 'rows');
                        } catch (error) {
                            console.error('Filter error:', error);
                            alert('Invalid WHERE clause: ' + error.message);
                            return;
                        }
                    }

                    renderTable();
                    updateStats();
                }

                function clearFilter() {
                    const whereInput = document.getElementById('where-clause');
                    if (whereInput) {
                        whereInput.value = '';
                        applyFilter();
                    }
                }

                function evaluateWhereClause(row, whereClause) {
                    // Simple WHERE clause evaluation without eval()
                    let expression = whereClause.trim();
                    console.log('Original expression:', expression);

                    // Handle simple cases first
                    if (!expression) return true;

                    // Replace SAS operators first
                    expression = expression.replace(/\bAND\b/gi, ' && ');
                    expression = expression.replace(/\bOR\b/gi, ' || ');
                    expression = expression.replace(/\bEQ\b/gi, ' == ');
                    expression = expression.replace(/\bNE\b/gi, ' != ');
                    expression = expression.replace(/\bGT\b/gi, ' > ');
                    expression = expression.replace(/\bLT\b/gi, ' < ');
                    expression = expression.replace(/\bGE\b/gi, ' >= ');
                    expression = expression.replace(/\bLE\b/gi, ' <= ');

                    console.log('After operator replacement:', expression);

                    // Simple parsing for basic conditions
                    // This handles: column operator value
                    const parts = expression.split(/(\s*(?:&&|\|\||==|!=|>=|<=|>|<|=)\s*)/);

                    if (parts.length === 3) {
                        // Simple condition: column operator value
                        const columnNameInput = parts[0].trim();
                        const operator = parts[1].trim();
                        let expectedValue = parts[2].trim();

                        // Find the actual column name (case-insensitive)
                        const columnName = columns.find(col =>
                            col.toLowerCase() === columnNameInput.toLowerCase()
                        );

                        if (!columnName) {
                            console.warn('Column not found:', columnNameInput);
                            return false;
                        }

                        // Remove quotes from string values
                        if ((expectedValue.startsWith("'") && expectedValue.endsWith("'")) ||
                            (expectedValue.startsWith('"') && expectedValue.endsWith('"'))) {
                            expectedValue = expectedValue.slice(1, -1);
                        }

                        const actualValue = row[columnName];
                        console.log('Comparing:', actualValue, operator, expectedValue);

                        // Convert expectedValue to same type as actualValue
                        let compareValue = expectedValue;
                        if (typeof actualValue === 'number' && !isNaN(Number(expectedValue))) {
                            compareValue = Number(expectedValue);
                        }

                        switch (operator.replace(/\s/g, '')) {
                            case '=':
                            case '==':
                                return actualValue == compareValue;
                            case '!=':
                                return actualValue != compareValue;
                            case '>':
                                return actualValue > compareValue;
                            case '<':
                                return actualValue < compareValue;
                            case '>=':
                                return actualValue >= compareValue;
                            case '<=':
                                return actualValue <= compareValue;
                            default:
                                console.warn('Unknown operator:', operator);
                                return false;
                        }
                    }

                    // For complex expressions, fall back to eval with proper variable substitution
                    try {
                        let evalExpression = expression;
                        const sortedColumns = [...columns].sort((a, b) => b.length - a.length);

                        sortedColumns.forEach(col => {
                            const value = row[col];
                            // Case-insensitive replacement
                            const regex = new RegExp('\\\\b' + col + '\\\\b', 'gi');
                            if (typeof value === 'string') {
                                const escapedValue = value.replace(/'/g, "\\\\'").replace(/"/g, '\\\\"');
                                evalExpression = evalExpression.replace(regex, "'" + escapedValue + "'");
                            } else if (value === null || value === undefined) {
                                evalExpression = evalExpression.replace(regex, 'null');
                            } else {
                                evalExpression = evalExpression.replace(regex, String(value));
                            }
                        });

                        // Convert single = to == for JavaScript evaluation
                        evalExpression = evalExpression.replace(/([^!<>=])=([^=])/g, '$1==$2');

                        console.log('Eval expression:', evalExpression);
                        return eval(evalExpression);
                    } catch (error) {
                        console.error('Evaluation error:', error);
                        return false; // Don't throw, just exclude the row
                    }
                }

                function getVariableTypeIcon(variableName) {
                    const variable = metadata.variables.find(v => v.name === variableName);
                    if (!variable) return '';

                    // Check for date/time formats first
                    if (variable.format) {
                        const format = variable.format.toUpperCase();
                        if (format.includes('DATE')) return '📅'; // Calendar for dates
                        if (format.includes('TIME')) return '🕐'; // Clock for times
                        if (format.includes('DATETIME')) return '🕐'; // Clock for datetime
                        if (format.includes('DOLLAR') || format.includes('CURRENCY')) return '💰'; // Money for currency
                        if (format.includes('PERCENT')) return '%'; // Percent symbol
                    }

                    // Check variable name patterns for date/time
                    const nameUpper = variableName.toUpperCase();
                    if (nameUpper.includes('DATE') || nameUpper.includes('DT')) return '📅';
                    if (nameUpper.includes('TIME') || nameUpper.includes('TM')) return '🕐';

                    // Standard type icons
                    if (variable.type === 'character') return '📝'; // Text document for character
                    if (variable.type === 'numeric') return '#'; // Hash symbol for numeric

                    return '?'; // Unknown type
                }

                function getVariableTooltip(variableName) {
                    const variable = metadata.variables.find(v => v.name === variableName);
                    if (!variable) return variableName;

                    let tooltip = variable.name + ' (' + variable.type + ')';
                    if (variable.label) tooltip += '\\n' + variable.label;
                    if (variable.format) tooltip += '\\nFormat: ' + variable.format;

                    return tooltip;
                }

                function renderTable() {
                    const headerRow = document.querySelector('#table-header tr');
                    const tbody = document.getElementById('table-body');

                    // Clear existing content
                    headerRow.innerHTML = '';
                    tbody.innerHTML = '';

                    // Render header with type icons
                    selectedColumns.forEach(col => {
                        const th = document.createElement('th');
                        const variable = metadata.variables.find(v => v.name === col);
                        if (variable) {
                            th.innerHTML = getVariableDisplayText(variable);
                        } else {
                            const icon = getVariableTypeIcon(col);
                            th.innerHTML = icon + ' ' + col;
                        }
                        th.title = getVariableTooltip(col); // Add tooltip with more info
                        headerRow.appendChild(th);
                    });

                    // Render rows
                    filteredData.forEach(row => {
                        const tr = document.createElement('tr');
                        selectedColumns.forEach(col => {
                            const td = document.createElement('td');
                            const value = row[col];
                            td.textContent = value === null || value === undefined ? '' : String(value);
                            if (typeof value === 'number') {
                                td.style.textAlign = 'right';
                            }
                            tr.appendChild(td);
                        });
                        tbody.appendChild(tr);
                    });
                }

                function updateStats() {
                    const statsEl = document.getElementById('stats');
                    const dataStatsEl = document.getElementById('data-stats');

                    if (filteredData.length === allData.length) {
                        statsEl.textContent = allData.length + ' observations, ' + metadata.total_variables + ' variables';
                    } else {
                        statsEl.textContent = filteredData.length + ' of ' + allData.length + ' observations (filtered), ' + metadata.total_variables + ' variables';
                    }

                    dataStatsEl.textContent = 'Showing ' + filteredData.length + ' rows';
                }

                function getVariableDisplayText(variable) {
                    const mode = document.getElementById('variable-display-mode').value;
                    const icon = getVariableTypeIcon(variable.name);

                    switch (mode) {
                        case 'name':
                            return icon + ' ' + variable.name;
                        case 'label':
                            return icon + ' ' + (variable.label || variable.name);
                        case 'both':
                        default:
                            if (variable.label && variable.label !== variable.name) {
                                return icon + ' ' + variable.name + ' (' + variable.label + ')';
                            } else {
                                return icon + ' ' + variable.name;
                            }
                    }
                }

                function updateVariableDisplay() {
                    const displayMode = document.getElementById('variable-display-mode').value;
                    const sidebar = document.querySelector('.sidebar');

                    // Adjust sidebar width based on display mode
                    if (displayMode === 'name') {
                        sidebar.className = 'sidebar compact';
                    } else if (displayMode === 'both') {
                        sidebar.className = 'sidebar expanded';
                    } else {
                        sidebar.className = 'sidebar';
                    }

                    // Update sidebar variable list
                    const variablesList = document.querySelector('.variables-container');
                    variablesList.innerHTML = '';

                    metadata.variables.forEach((variable, index) => {
                        const item = document.createElement('div');
                        item.className = 'variable-item';

                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.id = 'var-' + index;
                        checkbox.checked = selectedColumns.includes(variable.name);
                        checkbox.addEventListener('change', (e) => {
                            toggleColumn(variable.name, e.target.checked);
                        });

                        const textElement = document.createElement('span');
                        textElement.className = displayMode === 'both' ? 'variable-text show-both' : 'variable-text';
                        textElement.innerHTML = getVariableDisplayText(variable);
                        textElement.title = getVariableTooltip(variable.name);

                        item.appendChild(checkbox);
                        item.appendChild(textElement);
                        variablesList.appendChild(item);
                    });

                    // Update table headers
                    renderTable();
                }

                function showVariableMetadata() {
                    let metadataHTML = '<div style="max-height: 400px; overflow-y: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 11px;">';
                    metadataHTML += '<tr style="background: var(--vscode-editor-background); font-weight: bold;"><th style="border: 1px solid var(--vscode-panel-border); padding: 4px;">Name</th><th style="border: 1px solid var(--vscode-panel-border); padding: 4px;">Type</th><th style="border: 1px solid var(--vscode-panel-border); padding: 4px;">Label</th><th style="border: 1px solid var(--vscode-panel-border); padding: 4px;">Format</th><th style="border: 1px solid var(--vscode-panel-border); padding: 4px;">Length</th></tr>';

                    metadata.variables.forEach(variable => {
                        metadataHTML += '<tr>';
                        metadataHTML += '<td style="border: 1px solid var(--vscode-panel-border); padding: 4px;">' + getVariableTypeIcon(variable.name) + ' ' + variable.name + '</td>';
                        metadataHTML += '<td style="border: 1px solid var(--vscode-panel-border); padding: 4px;">' + variable.type + '</td>';
                        metadataHTML += '<td style="border: 1px solid var(--vscode-panel-border); padding: 4px;">' + (variable.label || '') + '</td>';
                        metadataHTML += '<td style="border: 1px solid var(--vscode-panel-border); padding: 4px;">' + (variable.format || '') + '</td>';
                        metadataHTML += '<td style="border: 1px solid var(--vscode-panel-border); padding: 4px;">' + (variable.length || '') + '</td>';
                        metadataHTML += '</tr>';
                    });

                    metadataHTML += '</table></div>';

                    // Create a modal-like overlay
                    const overlay = document.createElement('div');
                    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;';

                    const modal = document.createElement('div');
                    modal.style.cssText = 'background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border); padding: 20px; border-radius: 4px; max-width: 80%; max-height: 80%;';

                    modal.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;"><h3 style="margin: 0;">Variable Metadata</h3><button onclick="document.body.removeChild(document.body.lastElementChild)" style="padding: 4px 12px;">Close</button></div>' + metadataHTML;

                    overlay.appendChild(modal);
                    document.body.appendChild(overlay);

                    // Close on overlay click
                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) {
                            overlay.remove();
                        }
                    });
                }
            </script>
        </body>
        </html>`;
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>SAS Dataset Viewer</title>
            <style>
                body { font-family: var(--vscode-font-family); background: var(--vscode-editor-background); color: var(--vscode-foreground); padding: 20px; text-align: center; }
            </style>
        </head>
        <body>
            <h2>Loading SAS Dataset...</h2>
            <p>Please wait while we load your data.</p>
        </body>
        </html>`;
    }

    public dispose(): void {
        console.log('SASWebviewPanel: Disposing');
        this.disposed = true;
    }
}