// Helper function for variable icons in HTML generation
function getVariableIconString(variable: any): string {
    if (variable.type === 'character') {
        return '📝';
    } else if (variable.type === 'numeric') {
        if (variable.format === 'DATE' || variable.format === 'DATETIME') {
            return '📅';
        } else if (variable.format === 'TIME') {
            return '🕐';
        } else if (variable.format === 'DOLLAR') {
            return '💰';
        } else if (variable.format === 'PERCENT') {
            return '📊';
        } else {
            return '🔢';
        }
    } else {
        return '❓';
    }
}

export function getPaginationHTML(metadata: any): string {
    const fileName = metadata.file_path.split(/[\\/]/).pop();
    
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline' 'unsafe-eval';">
        <title>${fileName} - SAS Dataset Viewer</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                background: var(--vscode-editor-background);
                color: var(--vscode-foreground);
                margin: 0;
                padding: 10px;
                height: 100vh;
                display: flex;
                flex-direction: column;
                /* Performance optimization */
                contain: layout style;
            }

            .main-container {
                display: flex;
                gap: 15px;
                flex: 1;
                min-height: 0;
            }

            .sidebar {
                width: 320px;
                min-width: 280px;
                flex-shrink: 0;
                background: var(--vscode-sideBar-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                position: relative;
                /* Performance: isolate sidebar rendering */
                contain: layout style paint;
                will-change: transform;
            }

            .sidebar-header {
                padding: 15px;
                background: var(--vscode-sideBarSectionHeader-background);
                border-bottom: 1px solid var(--vscode-panel-border);
            }

            .sidebar-title {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 8px;
            }

            .dataset-label {
                font-size: 13px;
                color: var(--vscode-descriptionForeground);
                margin-bottom: 10px;
                font-style: italic;
            }

            .variable-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .selected-count {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
            }

            .display-mode {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 11px;
            }

            .display-select {
                padding: 2px 6px;
                background: var(--vscode-dropdown-background);
                color: var(--vscode-dropdown-foreground);
                border: 1px solid var(--vscode-dropdown-border);
                border-radius: 2px;
                font-size: 11px;
            }

            .variables-container {
                flex: 1;
                overflow-y: auto;
                overflow-x: visible;
                padding: 8px;
                position: relative;
                /* Performance: optimize scrolling */
                will-change: scroll-position;
                contain: layout style paint;
            }

            .variable-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 8px;
                border-radius: 3px;
                font-size: 12px;
                cursor: pointer;
                user-select: none;
                margin-bottom: 2px;
                position: relative;
            }

            .variable-item:hover {
                background: var(--vscode-list-hoverBackground);
            }

            .variable-item input[type="checkbox"] {
                cursor: pointer;
                flex-shrink: 0;
                z-index: 2;
                width: 14px !important;
                height: 14px !important;
                margin: 0;
                margin-right: 4px;
                vertical-align: middle;
                opacity: 1 !important;
                visibility: visible !important;
                display: inline-block !important;
            }

            .variable-text {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                cursor: help;
                position: relative;
                display: inline-block;
            }

            /* Simplified tooltip for better performance */
            .variable-text[data-tooltip]:hover::after {
                content: attr(data-tooltip);
                position: absolute;
                background: var(--vscode-editorHoverWidget-background);
                color: var(--vscode-editorHoverWidget-foreground);
                border: 1px solid var(--vscode-editorHoverWidget-border);
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                white-space: pre-line;
                z-index: 10000;
                max-width: 400px;
                pointer-events: none;
                top: 100%;
                left: 0;
                margin-top: 5px;
                /* Performance: use transform for GPU acceleration */
                transform: translateZ(0);
            }

            /* Arrow indicator for tooltip */
            .variable-text[data-tooltip]:hover::before {
                content: '';
                position: absolute;
                top: 100%;
                left: 10px;
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-bottom: 6px solid var(--vscode-editorHoverWidget-border);
                z-index: 10001;
                margin-top: -1px;
            }

            .variable-type {
                font-size: 10px;
                color: var(--vscode-descriptionForeground);
                padding: 2px 6px;
                background: var(--vscode-badge-background);
                border-radius: 10px;
                min-width: 20px;
                text-align: center;
                flex-shrink: 0;
                margin-left: auto;
                z-index: 1;
            }

            .content-area {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-width: 0;
            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: var(--vscode-sideBar-background);
                border-radius: 6px;
                border: 1px solid var(--vscode-panel-border);
                margin-bottom: 15px;
            }

            .dataset-info {
                font-size: 14px;
                font-weight: 600;
            }

            .pagination-info {
                font-size: 12px;
                color: var(--vscode-descriptionForeground);
            }

            .table-container {
                flex: 1;
                overflow: auto;
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                margin-bottom: 15px;
                /* Performance: isolate table rendering */
                contain: layout style paint;
                will-change: contents;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
                min-width: max-content;
            }

            thead {
                position: sticky;
                top: 0;
                z-index: 10;
                background: var(--vscode-editor-background);
            }

            th {
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                padding: 8px;
                text-align: left;
                font-weight: 600;
                white-space: nowrap;
                cursor: help;
                position: relative;
            }

            /* Table header tooltips */
            th[data-tooltip]:hover::after {
                content: attr(data-tooltip);
                position: absolute;
                background: var(--vscode-editorHoverWidget-background);
                color: var(--vscode-editorHoverWidget-foreground);
                border: 1px solid var(--vscode-editorHoverWidget-border);
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                white-space: pre-line;
                z-index: 10000;
                min-width: 250px;
                max-width: 400px;
                width: max-content;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                pointer-events: none;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                margin-top: 5px;
            }
            
            /* Ensure tooltip doesn't go off-screen on the left */
            th:first-child[data-tooltip]:hover::after,
            th:nth-child(2)[data-tooltip]:hover::after,
            th:nth-child(3)[data-tooltip]:hover::after {
                left: 0;
                transform: translateX(0);
            }
            
            /* Ensure tooltip doesn't go off-screen on the right */
            th:nth-last-child(1)[data-tooltip]:hover::after,
            th:nth-last-child(2)[data-tooltip]:hover::after,
            th:nth-last-child(3)[data-tooltip]:hover::after {
                left: auto;
                right: 0;
                transform: translateX(0);
            }
            
            /* Arrow indicator for table header tooltips */
            th[data-tooltip]:hover::before {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-bottom: 6px solid var(--vscode-editorHoverWidget-border);
                z-index: 10001;
                margin-top: -1px;
            }
            
            /* Adjust arrow for left-aligned tooltips */
            th:first-child[data-tooltip]:hover::before,
            th:nth-child(2)[data-tooltip]:hover::before,
            th:nth-child(3)[data-tooltip]:hover::before {
                left: 20px;
                transform: translateX(0);
            }
            
            /* Adjust arrow for right-aligned tooltips */
            th:nth-last-child(1)[data-tooltip]:hover::before,
            th:nth-last-child(2)[data-tooltip]:hover::before,
            th:nth-last-child(3)[data-tooltip]:hover::before {
                left: auto;
                right: 20px;
                transform: translateX(0);
            }

            td {
                border: 1px solid var(--vscode-panel-border);
                padding: 6px 8px;
                max-width: 300px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            tr:hover {
                background: var(--vscode-list-hoverBackground);
            }

            .filter-section {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: var(--vscode-sideBar-background);
                border-radius: 6px;
                border: 1px solid var(--vscode-panel-border);
                margin-bottom: 15px;
            }

            .where-input {
                flex: 1;
                padding: 6px 12px;
                background: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
                border-radius: 3px;
                margin-right: 10px;
                font-size: 13px;
            }

            .where-input:focus {
                outline: 1px solid var(--vscode-focusBorder);
            }

            .filter-info {
                font-size: 12px;
                color: var(--vscode-descriptionForeground);
                font-style: italic;
            }

            .pagination-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: var(--vscode-sideBar-background);
                border-radius: 6px;
                border: 1px solid var(--vscode-panel-border);
            }

            .page-info {
                display: flex;
                align-items: center;
                gap: 15px;
                font-size: 13px;
            }

            .page-size-control {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .btn {
                padding: 6px 12px;
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
                min-width: 80px;
            }

            .btn:hover {
                background: var(--vscode-button-hoverBackground);
            }

            .btn:disabled {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
                cursor: not-allowed;
                opacity: 0.6;
            }

            .btn-nav {
                min-width: 100px;
            }

            .page-input {
                width: 60px;
                padding: 4px 8px;
                background: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
                border-radius: 2px;
                text-align: center;
            }

            .page-size-select {
                padding: 4px 8px;
                background: var(--vscode-dropdown-background);
                color: var(--vscode-dropdown-foreground);
                border: 1px solid var(--vscode-dropdown-border);
                border-radius: 2px;
            }

            .loading {
                text-align: center;
                padding: 40px;
                color: var(--vscode-descriptionForeground);
            }

            /* Custom spinner animation */
            .spinner {
                width: 40px;
                height: 40px;
                margin: 20px auto;
                border: 4px solid var(--vscode-panel-border);
                border-top: 4px solid var(--vscode-focusBorder);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Skeleton loader for table rows */
            .skeleton-row {
                display: table-row;
                animation: pulse 1.5s ease-in-out infinite;
            }

            .skeleton-cell {
                display: table-cell;
                padding: 8px;
                border: 1px solid var(--vscode-panel-border);
            }

            .skeleton-content {
                height: 14px;
                background: linear-gradient(90deg,
                    var(--vscode-panel-border) 25%,
                    var(--vscode-badge-background) 50%,
                    var(--vscode-panel-border) 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 2px;
            }

            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }

            /* Smooth fade transitions */
            .fade-in {
                animation: fadeIn 0.3s ease-in;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .error {
                text-align: center;
                padding: 40px;
                color: var(--vscode-errorForeground);
                background: var(--vscode-errorBackground);
                border-radius: 4px;
                margin: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="dataset-info">
                <strong>${fileName}</strong> - <span id="total-rows-display">${metadata.total_rows.toLocaleString()}</span> rows, ${metadata.total_variables} variables
            </div>
            <div class="pagination-info">
                <span id="current-range">Loading...</span>
            </div>
        </div>

        <div class="main-container">
            <div class="sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-title">Dataset Variables</div>
                    <div class="dataset-label">${metadata.dataset_label || fileName}</div>
                    
                    <div class="variable-controls">
                        <div class="selected-count" id="selected-count">33 selected</div>
                        <div class="display-mode">
                            <label>Show:</label>
                            <select id="display-mode" class="display-select">
                                <option value="name" selected>Names</option>
                                <option value="label">Labels</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; margin-top: 8px;">
                        <button class="btn" id="select-all-btn" style="flex: 1; font-size: 11px;">Select All</button>
                        <button class="btn" id="deselect-all-btn" style="flex: 1; font-size: 11px;">Clear All</button>
                    </div>
                </div>
                
                <div class="variables-container" id="variables-container">
                    <!-- Variables will be populated by JavaScript -->
                </div>
            </div>

            <div class="content-area">
                <div class="filter-section">
                    <div style="display: flex; align-items: center; flex: 1; gap: 10px;">
                        <label for="where-input">WHERE:</label>
                        <input type="text" id="where-input" class="where-input" 
                               placeholder="e.g., AGE > 30 and COUNTRY = 'USA'" 
                               title="Filter the dataset using SAS-style WHERE conditions">
                        <button class="btn" id="apply-filter-btn">Apply Filter</button>
                        <button class="btn" id="clear-filter-btn">Clear</button>
                    </div>
                    <div class="filter-info" id="filter-info">
                        No filter applied - showing all rows
                    </div>
                </div>

                <div class="table-container">
                    <div id="loading-message" class="loading">
                        <div class="spinner"></div>
                        <div id="loading-text">Loading data...</div>
                    </div>
                    <div id="error-message" class="error" style="display: none;"></div>
                    <table id="data-table" style="display: none;">
                        <thead id="table-header">
                            <tr></tr>
                        </thead>
                        <tbody id="table-body"></tbody>
                    </table>
                </div>

                <div class="pagination-controls">
                    <div class="page-info">
                        <button class="btn btn-nav" id="first-btn" disabled>⏮️ First</button>
                        <button class="btn btn-nav" id="prev-btn" disabled>⬅️ Previous</button>
                        <span>Page <input type="number" id="page-input" class="page-input" value="1" min="1"> of <span id="total-pages">1</span></span>
                        <button class="btn btn-nav" id="next-btn">Next ➡️</button>
                        <button class="btn btn-nav" id="last-btn">Last ⏭️</button>
                    </div>
                    
                    <div class="page-size-control">
                        <label>Rows per page:</label>
                        <select id="page-size-select" class="page-size-select">
                            <option value="50">50</option>
                            <option value="100" selected>100</option>
                            <option value="200">200</option>
                            <option value="500">500</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // Helper function to get variable icons
            function getVariableIcon(variable) {
                if (variable.type === 'character') {
                    return '📝';
                } else if (variable.type === 'numeric') {
                    if (variable.format === 'DATE' || variable.format === 'DATETIME') {
                        return '📅';
                    } else if (variable.format === 'TIME') {
                        return '🕐';
                    } else if (variable.format === 'DOLLAR') {
                        return '💰';
                    } else if (variable.format === 'PERCENT') {
                        return '📊';
                    } else {
                        return '🔢';
                    }
                } else {
                    return '❓';
                }
            }
            // Acquire VS Code API
            const vscode = acquireVsCodeApi();

            // Pagination state
            let currentPage = 1;
            let pageSize = parseInt(document.getElementById('page-size-select')?.value || '100'); // Respect user preference
            let totalRows = ${metadata.total_rows};
            let filteredRows = totalRows; // Total rows after filtering
            let totalPages = Math.ceil(filteredRows / pageSize);
            let currentData = [];
            let columns = [];
            let selectedColumns = [];
            let allVariables = ${JSON.stringify(metadata.variables)};
            let displayMode = 'name';
            let isLoading = false;
            let currentWhereClause = '';

            // DOM elements
            const table = document.getElementById('data-table');
            const tbody = document.getElementById('table-body');
            const header = document.getElementById('table-header').querySelector('tr');
            const loadingMessage = document.getElementById('loading-message');
            const errorMessage = document.getElementById('error-message');
            
            const firstBtn = document.getElementById('first-btn');
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const lastBtn = document.getElementById('last-btn');
            const pageInput = document.getElementById('page-input');
            const totalPagesSpan = document.getElementById('total-pages');
            const pageSizeSelect = document.getElementById('page-size-select');
            const currentRangeSpan = document.getElementById('current-range');
            const totalRowsDisplay = document.getElementById('total-rows-display');
            
            // Filter elements
            const whereInput = document.getElementById('where-input');
            const applyFilterBtn = document.getElementById('apply-filter-btn');
            const clearFilterBtn = document.getElementById('clear-filter-btn');
            const filterInfo = document.getElementById('filter-info');
            
            // Variable selection elements
            const selectedCountSpan = document.getElementById('selected-count');
            const displayModeSelect = document.getElementById('display-mode');
            const selectAllBtn = document.getElementById('select-all-btn');
            const deselectAllBtn = document.getElementById('deselect-all-btn');
            const variablesContainer = document.getElementById('variables-container');

            // Initialize
            function init() {
                // Populate variables list dynamically
                populateVariablesList();

                // Initialize selected columns with all variables
                selectedColumns = allVariables.map(v => v.name);
                updateSelectedCount();

                // Get initial page size from dropdown
                pageSize = parseInt(pageSizeSelect.value);
                totalPages = Math.ceil(filteredRows / pageSize);
                updatePaginationInfo();
                setupEventListeners();

                // Set initial display mode explicitly
                displayMode = 'name';
                displayModeSelect.value = 'name';

                // Signal that webview is ready, then load first page
                vscode.postMessage({ command: 'webviewReady' });

                // Load first page after signaling ready
                setTimeout(() => loadPage(1), 100);
            }

            function populateVariablesList() {
                if (!variablesContainer) {
                    console.error('Variables container not found');
                    return;
                }
                
                variablesContainer.innerHTML = '';
                
                allVariables.forEach((variable, index) => {
                    const item = document.createElement('div');
                    item.className = 'variable-item';
                    item.setAttribute('data-variable', variable.name);
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'variable-checkbox';
                    checkbox.setAttribute('data-variable', variable.name);
                    checkbox.checked = true;
                    
                    
                    const span = document.createElement('span');
                    span.className = 'variable-text';
                    span.setAttribute('data-name', variable.name);
                    span.setAttribute('data-label', variable.label || '');
                    
                    // Create tooltip content with proper escaping
                    let tooltip = 'Variable: ' + variable.name;
                    if (variable.label && variable.label !== variable.name) {
                        tooltip += '\\nLabel: ' + variable.label;
                    }
                    tooltip += '\\nType: ' + variable.type;
                    if (variable.format) {
                        tooltip += '\\nFormat: ' + variable.format;
                    }
                    if (variable.length) {
                        tooltip += '\\nLength: ' + variable.length;
                    }
                    
                    // Use both title attribute (for native tooltip) and data-tooltip (for CSS tooltip)
                    span.setAttribute('title', tooltip);
                    span.setAttribute('data-tooltip', tooltip);
                    span.innerHTML = getVariableIcon(variable) + ' ' + variable.name;
                    
                    // Ensure span is interactive
                    span.style.pointerEvents = 'auto';
                    span.style.cursor = 'help';
                    
                    const typeSpan = document.createElement('span');
                    typeSpan.className = 'variable-type';
                    typeSpan.textContent = variable.type.charAt(0).toUpperCase();
                    
                    item.appendChild(checkbox);
                    item.appendChild(span);
                    item.appendChild(typeSpan);
                    
                    variablesContainer.appendChild(item);
                    
                });
            }

            function setupEventListeners() {
                firstBtn.addEventListener('click', () => goToPage(1));
                prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
                nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
                lastBtn.addEventListener('click', () => goToPage(totalPages));
                
                pageInput.addEventListener('change', () => {
                    const page = parseInt(pageInput.value);
                    if (page >= 1 && page <= totalPages) {
                        goToPage(page);
                    } else {
                        pageInput.value = currentPage;
                    }
                });
                
                pageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const page = parseInt(pageInput.value);
                        if (page >= 1 && page <= totalPages) {
                            goToPage(page);
                        } else {
                            pageInput.value = currentPage;
                        }
                    }
                });
                
                pageSizeSelect.addEventListener('change', () => {
                    pageSize = parseInt(pageSizeSelect.value);
                    totalPages = Math.ceil(filteredRows / pageSize);
                    currentPage = 1;
                    updatePaginationInfo();
                    loadPage(1);
                });
                
                // Filter event listeners
                applyFilterBtn.addEventListener('click', applyFilter);
                clearFilterBtn.addEventListener('click', clearFilter);
                whereInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        applyFilter();
                    }
                });
                
                // Variable selection event listeners
                selectAllBtn.addEventListener('click', () => {
                    selectAllVariables();
                });
                deselectAllBtn.addEventListener('click', () => {
                    deselectAllVariables();
                });
                displayModeSelect.addEventListener('change', () => {
                    updateDisplayMode();
                });
                
                // Variable checkbox listeners - use event delegation
                variablesContainer.addEventListener('change', (e) => {
                    if (e.target.classList.contains('variable-checkbox')) {
                        handleVariableSelection();
                    }
                });
                
                // Make variable items clickable
                variablesContainer.addEventListener('click', (e) => {
                    const item = e.target.closest('.variable-item');
                    if (item && e.target.type !== 'checkbox') {
                        const checkbox = item.querySelector('.variable-checkbox');
                        if (checkbox) {
                            checkbox.checked = !checkbox.checked;
                            handleVariableSelection();
                        }
                    }
                });
            }

            function goToPage(page) {
                if (page >= 1 && page <= totalPages && page !== currentPage && !isLoading) {
                    loadPage(page);
                }
            }

            function loadPage(page) {
                if (isLoading) return;

                isLoading = true;
                currentPage = page;

                showLoading();
                updatePaginationInfo();

                const startRow = (page - 1) * pageSize;

                // Request data from extension with current filter and selected variables
                vscode.postMessage({
                    command: 'loadData',
                    data: {
                        startRow: startRow,
                        numRows: pageSize,
                        whereClause: currentWhereClause,
                        selectedVars: selectedColumns
                    }
                });
            }

            function showLoading() {
                table.style.display = 'none';
                errorMessage.style.display = 'none';
                loadingMessage.style.display = 'block';
                const loadingText = document.getElementById('loading-text');
                if (loadingText) {
                    loadingText.textContent = 'Loading page ' + currentPage + '...';
                }

                // Show skeleton rows for better UX
                showSkeletonRows();
            }

            function showSkeletonRows() {
                // Create skeleton table while loading
                if (columns.length > 0 && table) {
                    table.style.display = 'table';
                    table.style.opacity = '0.5';
                    tbody.innerHTML = '';

                    // Create 5 skeleton rows
                    for (let i = 0; i < Math.min(5, pageSize); i++) {
                        const tr = document.createElement('tr');
                        tr.className = 'skeleton-row';

                        columns.forEach(() => {
                            const td = document.createElement('td');
                            td.className = 'skeleton-cell';
                            td.innerHTML = '<div class="skeleton-content"></div>';
                            tr.appendChild(td);
                        });

                        tbody.appendChild(tr);
                    }
                }
            }

            function showError(message) {
                table.style.display = 'none';
                loadingMessage.style.display = 'none';
                errorMessage.style.display = 'block';
                errorMessage.textContent = 'Error: ' + message;
                isLoading = false;
            }

            function showData() {
                loadingMessage.style.display = 'none';
                errorMessage.style.display = 'none';
                table.style.display = 'table';
                table.style.opacity = '1';
                table.classList.add('fade-in');
                isLoading = false;
            }

            function showNoColumnsMessage() {
                table.style.display = 'none';
                loadingMessage.style.display = 'none';
                errorMessage.style.display = 'block';
                errorMessage.textContent = 'No variables selected. Please select at least one variable to display data.';
                errorMessage.style.backgroundColor = 'var(--vscode-inputValidation-warningBackground)';
                errorMessage.style.color = 'var(--vscode-inputValidation-warningForeground)';
                isLoading = false;
            }

            function hideNoColumnsMessage() {
                if (errorMessage.textContent.includes('No variables selected')) {
                    errorMessage.style.display = 'none';
                    errorMessage.style.backgroundColor = 'var(--vscode-errorBackground)';
                    errorMessage.style.color = 'var(--vscode-errorForeground)';
                }
            }

            function applyFilter() {
                const whereClause = whereInput.value.trim();
                
                currentWhereClause = whereClause;
                currentPage = 1;
                
                // Update filter info
                if (whereClause) {
                    filterInfo.textContent = 'Filter: ' + whereClause;
                    filterInfo.style.fontWeight = 'bold';
                } else {
                    filterInfo.textContent = 'No filter applied - showing all rows';
                    filterInfo.style.fontWeight = 'normal';
                }
                
                // Request filtered data count first, then load page 1
                vscode.postMessage({
                    command: 'applyFilter',
                    data: {
                        whereClause: whereClause
                    }
                });
            }

            function clearFilter() {
                whereInput.value = '';
                currentWhereClause = '';
                filteredRows = totalRows;
                totalPages = Math.ceil(filteredRows / pageSize);
                currentPage = 1;
                
                filterInfo.textContent = 'No filter applied - showing all rows';
                filterInfo.style.fontWeight = 'normal';
                totalRowsDisplay.textContent = totalRows.toLocaleString();
                
                // Send clear filter command to backend
                vscode.postMessage({
                    command: 'applyFilter',
                    data: {
                        whereClause: '' // Empty where clause = no filter
                    }
                });
                
                updatePaginationInfo();
            }

            function updatePaginationInfo() {
                const startRow = (currentPage - 1) * pageSize + 1;
                const endRow = Math.min(currentPage * pageSize, filteredRows);
                
                currentRangeSpan.textContent = 'Showing ' + startRow.toLocaleString() + '-' + endRow.toLocaleString() + ' of ' + filteredRows.toLocaleString();
                pageInput.value = currentPage;
                totalPagesSpan.textContent = totalPages.toLocaleString();
                
                // Update button states
                firstBtn.disabled = currentPage === 1;
                prevBtn.disabled = currentPage === 1;
                nextBtn.disabled = currentPage === totalPages;
                lastBtn.disabled = currentPage === totalPages;
                
                pageInput.max = totalPages;
            }

            function renderTable(data, cols) {
                // Update columns - use selected columns if available, otherwise use all
                columns = selectedColumns.length > 0 ? selectedColumns : cols;
                
                // Update headers using the display mode
                updateTableHeaders();

                // Clear and rebuild body
                tbody.innerHTML = '';
                data.forEach((row, index) => {
                    const tr = document.createElement('tr');
                    
                    columns.forEach(col => {
                        const td = document.createElement('td');
                        let value = row[col];

                        // Format value based on variable metadata
                        const variable = allVariables.find(v => v.name === col);
                        if (value === null || value === undefined) {
                            td.textContent = '';
                            td.style.color = 'var(--vscode-disabledForeground)';
                        } else if (typeof value === 'number') {
                            // Format numbers based on variable metadata
                            if (variable && variable.format) {
                                if (variable.format === 'DOLLAR') {
                                    td.textContent = '$' + value.toLocaleString();
                                } else if (variable.format === 'PERCENT') {
                                    td.textContent = (value * 100).toFixed(2) + '%';
                                } else {
                                    td.textContent = value.toLocaleString();
                                }
                            } else {
                                td.textContent = value.toLocaleString();
                            }
                        } else {
                            td.textContent = String(value);
                        }

                        td.title = td.textContent; // Tooltip for truncated content
                        tr.appendChild(td);
                    });
                    
                    tbody.appendChild(tr);
                });

                showData();
            }

            // Handle messages from extension
            window.addEventListener('message', event => {
                const message = event.data;

                switch (message.type) {
                    case 'initialData':
                        renderTable(message.data, message.columns);
                        break;

                    case 'dataChunk':
                        renderTable(message.data, message.columns);
                        break;

                    case 'filterResult':
                        filteredRows = message.filteredRows;
                        totalPages = Math.ceil(filteredRows / pageSize);
                        currentPage = 1;
                        
                        // Update display
                        totalRowsDisplay.textContent = filteredRows.toLocaleString();
                        if (currentWhereClause) {
                            filterInfo.textContent = 'Filter: ' + currentWhereClause + ' (' + filteredRows.toLocaleString() + ' rows match)';
                        }
                        
                        updatePaginationInfo();
                        loadPage(1);
                        break;

                    case 'error':
                        console.error('Error:', message.message);
                        showError(message.message);
                        break;
                }
            });

            // Variable selection functions
            function handleVariableSelection() {
                updateSelectedColumns();
                updateSelectedCount();

                // Reload current page with new column selection
                if (selectedColumns.length > 0) {
                    loadPage(currentPage);
                }
            }

            function selectAllVariables() {
                document.querySelectorAll('.variable-checkbox').forEach(cb => cb.checked = true);
                updateSelectedColumns();
                updateSelectedCount();
                loadPage(currentPage);
            }

            function deselectAllVariables() {
                const checkboxes = document.querySelectorAll('.variable-checkbox');
                checkboxes.forEach((cb) => {
                    if (cb.dataset && cb.dataset.variable) {
                        cb.checked = false;
                    }
                });
                updateSelectedColumns();
                updateSelectedCount();
            }

            function updateSelectedColumns() {
                selectedColumns = [];
                document.querySelectorAll('.variable-checkbox:checked').forEach(cb => {
                    if (cb.dataset && cb.dataset.variable) {
                        selectedColumns.push(cb.dataset.variable);
                    }
                });

                // If no columns selected, show a message but don't auto-select
                if (selectedColumns.length === 0) {
                    showNoColumnsMessage();
                } else {
                    hideNoColumnsMessage();
                }
            }

            function updateSelectedCount() {
                const count = document.querySelectorAll('.variable-checkbox:checked').length;
                selectedCountSpan.textContent = count + ' selected';
            }

            function updateDisplayMode() {
                displayMode = displayModeSelect.value;
                
                // Update variable text display
                document.querySelectorAll('.variable-text').forEach((span, index) => {
                    const name = span.dataset.name;
                    const label = span.dataset.label;
                    const variable = allVariables.find(v => v.name === name);
                    
                    if (variable) {
                        const icon = getVariableIcon(variable);
                        let newText;
                        
                        if (displayMode === 'name') {
                            newText = icon + ' ' + name;
                        } else if (displayMode === 'label' && label) {
                            newText = icon + ' ' + label;
                        } else if (displayMode === 'both' && label && label !== name) {
                            newText = icon + ' ' + name + ' (' + label + ')';
                        } else {
                            newText = icon + ' ' + name;
                        }
                        
                        span.innerHTML = newText;
                        
                        // Add comprehensive tooltip
                        let tooltip = 'Variable: ' + name;
                        if (label && label !== name) {
                            tooltip += '\\nLabel: ' + label;
                        }
                        tooltip += '\\nType: ' + variable.type;
                        if (variable.format) {
                            tooltip += '\\nFormat: ' + variable.format;
                        }
                        if (variable.length) {
                            tooltip += '\\nLength: ' + variable.length;
                        }
                        
                        // Use both attributes for better compatibility
                        span.setAttribute('title', tooltip);
                        span.setAttribute('data-tooltip', tooltip);
                        
                    }
                });
                
                // Update table headers
                updateTableHeaders();
            }

            function updateTableHeaders() {
                if (selectedColumns.length === 0) return;
                
                header.innerHTML = '';
                selectedColumns.forEach(colName => {
                    const variable = allVariables.find(v => v.name === colName);
                    const th = document.createElement('th');
                    
                    if (variable) {
                        if (displayMode === 'name') {
                            th.textContent = variable.name;
                        } else if (displayMode === 'label' && variable.label) {
                            th.textContent = variable.label;
                        } else if (displayMode === 'both' && variable.label && variable.label !== variable.name) {
                            th.textContent = variable.name + ' (' + variable.label + ')';
                        } else {
                            th.textContent = variable.name;
                        }
                        // Create comprehensive tooltip for table headers
                        let headerTooltip = 'Variable: ' + variable.name;
                        if (variable.label && variable.label !== variable.name) {
                            headerTooltip += '\\nLabel: ' + variable.label;
                        }
                        headerTooltip += '\\nType: ' + variable.type;
                        if (variable.format) {
                            headerTooltip += '\\nFormat: ' + variable.format;
                        }
                        if (variable.length) {
                            headerTooltip += '\\nLength: ' + variable.length;
                        }
                        // Only use data-tooltip for CSS styling (no native title tooltip)
                        th.setAttribute('data-tooltip', headerTooltip);
                    } else {
                        th.textContent = colName;
                    }
                    
                    header.appendChild(th);
                });
            }

            // Initialize when DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    init();
                });
            } else {
                init();
            }
        </script>
    </body>
    </html>`;
}
