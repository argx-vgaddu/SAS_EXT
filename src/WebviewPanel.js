"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SASWebviewPanel = void 0;
var PaginationWebview_1 = require("./PaginationWebview");
var logger_1 = require("./utils/logger");
/**
 * Manages the webview panel for displaying SAS dataset data
 * Handles communication between VS Code and the webview UI
 */
var SASWebviewPanel = /** @class */ (function () {
    function SASWebviewPanel(panel, document, context) {
        var _this = this;
        this.panel = panel;
        this.document = document;
        this.context = context;
        this.logger = logger_1.Logger.createScoped('SASWebviewPanel');
        this.disposed = false;
        this.currentWhereClause = '';
        this.webviewReady = false;
        this.pendingInitialData = null;
        this.filterState = {
            selectedVariables: [],
            whereClause: '',
            variableOrder: []
        };
        this.logger.debug('WebviewPanel created');
        this.panel.onDidDispose(function () { return _this.dispose(); }, null, this.context.subscriptions);
        this.panel.webview.onDidReceiveMessage(this.onDidReceiveMessage, this, this.context.subscriptions);
    }
    /**
     * Initializes the webview panel and loads the initial UI
     */
    SASWebviewPanel.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.logger.debug('Initializing webview panel');
                        this.panel.webview.options = {
                            enableScripts: true,
                            localResourceRoots: []
                        };
                        return [4 /*yield*/, this.loadDataDirectly()];
                    case 1:
                        _a.sent();
                        this.logger.info('Webview panel initialized successfully');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Error during initialization', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets up the webview with pagination HTML and initial state
     */
    SASWebviewPanel.prototype.loadDataDirectly = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (!this.document.metadata) {
                        this.logger.error('No metadata available');
                        return [2 /*return*/];
                    }
                    this.logger.debug('Setting up pagination view', {
                        totalRows: this.document.metadata.total_rows,
                        totalVariables: this.document.metadata.total_variables
                    });
                    // Set HTML for pagination view
                    this.panel.webview.html = (0, PaginationWebview_1.getPaginationHTML)(this.document.metadata);
                    // Store selected variables for later use
                    this.filterState.selectedVariables = this.document.metadata.variables.map(function (v) { return v.name; });
                    // Let the pagination component handle data loading
                }
                catch (error) {
                    this.logger.error('Error during setup', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    SASWebviewPanel.prototype.sendMetadata = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.document.metadata)
                            return [2 /*return*/];
                        // Initialize filter state with all variables selected
                        this.filterState.selectedVariables = this.document.metadata.variables.map(function (v) { return v.name; });
                        this.filterState.variableOrder = __spreadArray([], this.filterState.selectedVariables, true);
                        return [4 /*yield*/, this.postMessage({
                                command: 'metadata',
                                data: {
                                    metadata: this.document.metadata,
                                    filterState: this.filterState
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SASWebviewPanel.prototype.loadInitialData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request, data, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = {
                            filePath: this.document.uri.fsPath,
                            startRow: 0,
                            numRows: 100,
                            selectedVars: this.filterState.selectedVariables,
                            whereClause: this.filterState.whereClause
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 6]);
                        return [4 /*yield*/, this.document.getData(request)];
                    case 2:
                        data = _a.sent();
                        return [4 /*yield*/, this.postMessage({
                                command: 'data',
                                data: data
                            })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        error_2 = _a.sent();
                        return [4 /*yield*/, this.postMessage({
                                command: 'error',
                                data: { message: "Failed to load data: ".concat(error_2) }
                            })];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SASWebviewPanel.prototype.onDidReceiveMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = message.command;
                        switch (_a) {
                            case 'loadData': return [3 /*break*/, 1];
                            case 'updateFilter': return [3 /*break*/, 3];
                            case 'toggleVariable': return [3 /*break*/, 5];
                            case 'reorderVariables': return [3 /*break*/, 7];
                            case 'searchVariables': return [3 /*break*/, 9];
                            case 'applyWhereClause': return [3 /*break*/, 11];
                            case 'applyFilter': return [3 /*break*/, 13];
                            case 'webviewReady': return [3 /*break*/, 15];
                        }
                        return [3 /*break*/, 18];
                    case 1: return [4 /*yield*/, this.handleLoadData(message.data)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 3: return [4 /*yield*/, this.handleUpdateFilter(message.data)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 5: return [4 /*yield*/, this.handleToggleVariable(message.data)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 7: return [4 /*yield*/, this.handleReorderVariables(message.data)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 9: return [4 /*yield*/, this.handleSearchVariables(message.data)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 11: return [4 /*yield*/, this.handleApplyWhereClause(message.data)];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 13: return [4 /*yield*/, this.handleApplyFilterPagination(message.data)];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 15:
                        this.webviewReady = true;
                        if (!this.pendingInitialData) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.panel.webview.postMessage(this.pendingInitialData)];
                    case 16:
                        _b.sent();
                        this.pendingInitialData = null;
                        _b.label = 17;
                    case 17: return [3 /*break*/, 19];
                    case 18: 
                    // Unknown command
                    return [3 /*break*/, 19];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handles data loading requests from the webview
     */
    SASWebviewPanel.prototype.handleLoadData = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var request, result, response, error_3;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        request = {
                            filePath: this.document.uri.fsPath,
                            startRow: data.startRow || 0,
                            numRows: data.numRows || 100,
                            selectedVars: data.selectedVars && data.selectedVars.length > 0 ?
                                data.selectedVars :
                                ((_a = this.document.metadata) === null || _a === void 0 ? void 0 : _a.variables.map(function (v) { return v.name; })) || [],
                            whereClause: data.whereClause || this.filterState.whereClause || ''
                        };
                        this.logger.debug('Handling load data request', {
                            startRow: request.startRow,
                            numRows: request.numRows,
                            varsCount: (_b = request.selectedVars) === null || _b === void 0 ? void 0 : _b.length
                        });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 6]);
                        return [4 /*yield*/, this.document.getData(request)];
                    case 2:
                        result = _c.sent();
                        response = {
                            type: 'dataChunk',
                            startRow: data.startRow,
                            data: result.data,
                            totalRows: result.total_rows,
                            columns: result.columns
                        };
                        return [4 /*yield*/, this.panel.webview.postMessage(response)];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        error_3 = _c.sent();
                        this.logger.error('Error loading data', error_3);
                        return [4 /*yield*/, this.panel.webview.postMessage({
                                type: 'error',
                                message: "Failed to load data: ".concat(error_3)
                            })];
                    case 5:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SASWebviewPanel.prototype.handleUpdateFilter = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.filterState = __assign(__assign({}, this.filterState), data);
                        return [4 /*yield*/, this.loadInitialData()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SASWebviewPanel.prototype.handleToggleVariable = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (data.selected) {
                            if (!this.filterState.selectedVariables.includes(data.variable)) {
                                this.filterState.selectedVariables.push(data.variable);
                                // Add to the end of variable order if not already there
                                if (!this.filterState.variableOrder.includes(data.variable)) {
                                    this.filterState.variableOrder.push(data.variable);
                                }
                            }
                        }
                        else {
                            this.filterState.selectedVariables = this.filterState.selectedVariables.filter(function (v) { return v !== data.variable; });
                        }
                        return [4 /*yield*/, this.loadInitialData()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SASWebviewPanel.prototype.handleReorderVariables = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.filterState.variableOrder = data.newOrder;
                        // Update selected variables to maintain the new order
                        this.filterState.selectedVariables = data.newOrder.filter(function (v) {
                            return _this.filterState.selectedVariables.includes(v);
                        });
                        return [4 /*yield*/, this.loadInitialData()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SASWebviewPanel.prototype.handleSearchVariables = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // This is handled on the frontend, but we could do server-side filtering here if needed
                    return [4 /*yield*/, this.postMessage({
                            command: 'variableSearchResult',
                            data: { searchTerm: data.searchTerm }
                        })];
                    case 1:
                        // This is handled on the frontend, but we could do server-side filtering here if needed
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SASWebviewPanel.prototype.handleApplyWhereClause = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.filterState.whereClause = data.whereClause;
                        return [4 /*yield*/, this.loadInitialData()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handles filter application for pagination mode
     */
    SASWebviewPanel.prototype.handleApplyFilterPagination = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, countRequest, result, filteredRowCount, error_4;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        whereClause = data.whereClause || '';
                        this.filterState.whereClause = whereClause;
                        this.logger.debug('Applying filter', { whereClause: whereClause.substring(0, 100) });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, , 8]);
                        if (!(whereClause.trim() === '')) return [3 /*break*/, 3];
                        // Clearing filter - return to full dataset
                        this.logger.debug('Clearing filter - returning to full dataset');
                        return [4 /*yield*/, this.panel.webview.postMessage({
                                type: 'filterResult',
                                filteredRows: ((_a = this.document.metadata) === null || _a === void 0 ? void 0 : _a.total_rows) || 0,
                                whereClause: ''
                            })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                    case 3:
                        countRequest = {
                            filePath: this.document.uri.fsPath,
                            startRow: 0,
                            numRows: 1, // Just get one row to get the total count
                            selectedVars: ((_b = this.document.metadata) === null || _b === void 0 ? void 0 : _b.variables.map(function (v) { return v.name; })) || [],
                            whereClause: whereClause
                        };
                        return [4 /*yield*/, this.document.getData(countRequest)];
                    case 4:
                        result = _c.sent();
                        filteredRowCount = result.filtered_rows || result.total_rows || 0;
                        this.logger.info("Filter applied: ".concat(filteredRowCount, " rows match the filter"));
                        // Send filter result back to webview
                        return [4 /*yield*/, this.panel.webview.postMessage({
                                type: 'filterResult',
                                filteredRows: filteredRowCount,
                                whereClause: whereClause
                            })];
                    case 5:
                        // Send filter result back to webview
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        error_4 = _c.sent();
                        this.logger.error('Filter error', error_4);
                        return [4 /*yield*/, this.panel.webview.postMessage({
                                type: 'error',
                                message: "Failed to apply filter: ".concat(error_4)
                            })];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Legacy filter handler (deprecated - client-side filtering)
     */
    SASWebviewPanel.prototype.handleApplyFilter = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Client-side filtering now, no need for this
                this.logger.debug('Legacy filter method called - client-side filtering used instead');
                return [2 /*return*/];
            });
        });
    };
    SASWebviewPanel.prototype.postMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.panel.webview.postMessage(message)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SASWebviewPanel.prototype.getDataStats = function (data, metadata) {
        var filtered = data.filtered_rows !== data.total_rows;
        if (filtered) {
            return "".concat(data.filtered_rows, " of ").concat(data.total_rows, " observations (filtered), ").concat(metadata.total_variables, " variables");
        }
        else {
            return "".concat(data.total_rows, " observations, ").concat(metadata.total_variables, " variables");
        }
    };
    SASWebviewPanel.prototype.getVariableIcon = function (variable) {
        // Only check for date/time formats on NUMERIC variables
        if (variable.type === 'numeric' && variable.format) {
            var format = variable.format.toUpperCase();
            if (format.includes('DATETIME'))
                return '🕐';
            if (format.includes('DATE'))
                return '📅';
            if (format.includes('TIME'))
                return '🕐';
            if (format.includes('DOLLAR') || format.includes('CURRENCY'))
                return '💰';
            if (format.includes('PERCENT'))
                return '%';
        }
        // For numeric variables without special formats, check name patterns
        if (variable.type === 'numeric') {
            var nameUpper = variable.name.toUpperCase();
            if (nameUpper.includes('DATETIME') || nameUpper.includes('DTTM'))
                return '🕐';
            if (nameUpper.includes('DATE') || nameUpper.includes('DT'))
                return '📅';
            if (nameUpper.includes('TIME') || nameUpper.includes('TM'))
                return '🕐';
            return '#'; // Default numeric icon
        }
        // Character variables are always shown as text, regardless of name
        if (variable.type === 'character')
            return '📝';
        return '?';
    };
    SASWebviewPanel.prototype.getVariableTooltipText = function (variable) {
        var tooltip = "".concat(variable.name, " (").concat(variable.type, ")");
        if (variable.label) {
            // Clean up label - remove problematic characters
            var cleanLabel = variable.label.replace(/[\n\r]/g, ' ').replace(/['"]/g, '');
            tooltip += " - ".concat(cleanLabel);
        }
        if (variable.format)
            tooltip += " [Format: ".concat(variable.format, "]");
        return tooltip;
    };
    SASWebviewPanel.prototype.escapeHtml = function (text) {
        if (!text)
            return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\//g, '&#x2F;');
    };
    // Removed unused methods - data loading handled by pagination component
    /**
     * Dispose of the webview panel and clean up resources
     */
    SASWebviewPanel.prototype.dispose = function () {
        this.logger.debug('Disposing webview panel');
        this.disposed = true;
    };
    return SASWebviewPanel;
}());
exports.SASWebviewPanel = SASWebviewPanel;
