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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.SASDatasetDocument = exports.SASDatasetProvider = void 0;
var path = __importStar(require("path"));
var child_process_1 = require("child_process");
var WebviewPanel_1 = require("./WebviewPanel");
var logger_1 = require("./utils/logger");
var EnhancedSASReader_1 = require("./readers/EnhancedSASReader");
/**
 * VS Code custom editor provider for SAS dataset files (.sas7bdat)
 * Handles the lifecycle of SAS dataset documents and their associated webview editors
 */
var SASDatasetProvider = /** @class */ (function () {
    function SASDatasetProvider(context) {
        this.context = context;
        this.logger = logger_1.Logger.createScoped('SASDatasetProvider');
        this.logger.debug('SASDatasetProvider V2 initialized - TypeScript mode');
    }
    /**
     * Creates a custom document for a SAS dataset file
     */
    SASDatasetProvider.prototype.openCustomDocument = function (uri, openContext, _token) {
        return __awaiter(this, void 0, void 0, function () {
            var document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info("Opening SAS dataset: ".concat(uri.fsPath));
                        return [4 /*yield*/, SASDatasetDocument.create(uri, this.context)];
                    case 1:
                        document = _a.sent();
                        return [2 /*return*/, document];
                }
            });
        });
    };
    /**
     * Resolves a custom editor for a SAS dataset document
     */
    SASDatasetProvider.prototype.resolveCustomEditor = function (document, webviewPanel, _token) {
        return __awaiter(this, void 0, void 0, function () {
            var sasWebviewPanel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.debug("Resolving custom editor for: ".concat(document.uri.fsPath));
                        sasWebviewPanel = new WebviewPanel_1.SASWebviewPanel(webviewPanel, document, this.context);
                        return [4 /*yield*/, sasWebviewPanel.initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SASDatasetProvider.viewType = 'sasDatasetViewer.sas7bdat';
    return SASDatasetProvider;
}());
exports.SASDatasetProvider = SASDatasetProvider;
/**
 * Represents a SAS dataset document with metadata and data access capabilities
 */
var SASDatasetDocument = /** @class */ (function () {
    function SASDatasetDocument(uri, metadata, context) {
        if (metadata === void 0) { metadata = null; }
        this.uri = uri;
        this.metadata = metadata;
        this.context = context;
        this.logger = logger_1.Logger.createScoped('SASDatasetDocument');
        this.reader = null;
        this.usePythonFallback = false;
    }
    /**
     * Factory method to create a SAS dataset document
     */
    SASDatasetDocument.create = function (uri, context) {
        return __awaiter(this, void 0, void 0, function () {
            var document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        document = new SASDatasetDocument(uri, null, context);
                        return [4 /*yield*/, document.loadMetadata()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, document];
                }
            });
        });
    };
    /**
     * Loads metadata for the SAS dataset file
     */
    SASDatasetDocument.prototype.loadMetadata = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tsMetadata, tsError_1, _a, error_1;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 6, , 7]);
                        this.logger.info("Loading metadata using TypeScript reader: ".concat(this.uri.fsPath));
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 3, , 5]);
                        this.reader = new EnhancedSASReader_1.EnhancedSASReader(this.uri.fsPath);
                        return [4 /*yield*/, this.reader.getMetadata()];
                    case 2:
                        tsMetadata = _f.sent();
                        // Convert to existing format for compatibility
                        this.metadata = this.convertMetadata(tsMetadata);
                        this.logger.info('Metadata loaded successfully with TypeScript reader', {
                            totalRows: (_b = this.metadata) === null || _b === void 0 ? void 0 : _b.total_rows,
                            totalVariables: (_c = this.metadata) === null || _c === void 0 ? void 0 : _c.total_variables,
                            mode: 'TypeScript'
                        });
                        return [3 /*break*/, 5];
                    case 3:
                        tsError_1 = _f.sent();
                        this.logger.warn('TypeScript reader failed, falling back to Python', tsError_1);
                        this.usePythonFallback = true;
                        // Fallback to Python
                        _a = this;
                        return [4 /*yield*/, this.executePythonCommand('metadata', this.uri.fsPath)];
                    case 4:
                        // Fallback to Python
                        _a.metadata = _f.sent();
                        this.logger.info('Metadata loaded successfully with Python fallback', {
                            totalRows: (_d = this.metadata) === null || _d === void 0 ? void 0 : _d.total_rows,
                            totalVariables: (_e = this.metadata) === null || _e === void 0 ? void 0 : _e.total_variables,
                            mode: 'Python'
                        });
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _f.sent();
                        this.logger.error('Failed to load metadata', error_1);
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Converts TypeScript reader metadata to existing format
     */
    SASDatasetDocument.prototype.convertMetadata = function (tsMetadata) {
        return {
            total_rows: tsMetadata.rowCount,
            total_variables: tsMetadata.columnCount,
            variables: tsMetadata.variables.map(function (v) { return ({
                name: v.name,
                type: v.type === 'string' ? 'character' : 'numeric',
                label: v.label,
                format: v.format || '',
                length: v.length,
                dtype: v.type
            }); }),
            file_path: this.uri.fsPath,
            dataset_label: tsMetadata.label || path.basename(this.uri.fsPath, '.sas7bdat')
        };
    };
    /**
     * Retrieves data from the SAS dataset based on the request parameters
     */
    SASDatasetDocument.prototype.getData = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, data, elapsed, tsError_2, args;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.logger.debug('Getting data', {
                            startRow: request.startRow,
                            numRows: request.numRows,
                            selectedVarsCount: ((_a = request.selectedVars) === null || _a === void 0 ? void 0 : _a.length) || 0,
                            hasWhereClause: !!request.whereClause,
                            mode: this.usePythonFallback ? 'Python' : 'TypeScript'
                        });
                        if (!(!this.usePythonFallback && this.reader)) return [3 /*break*/, 7];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, , 7]);
                        startTime = Date.now();
                        data = void 0;
                        if (!request.whereClause) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.reader.getFilteredData(request.whereClause)];
                    case 2:
                        // Apply WHERE clause filtering
                        data = _d.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.reader.getData({
                            startRow: request.startRow,
                            numRows: request.numRows,
                            variables: request.selectedVars
                        })];
                    case 4:
                        data = _d.sent();
                        _d.label = 5;
                    case 5:
                        elapsed = Date.now() - startTime;
                        this.logger.debug("Data retrieved in ".concat(elapsed, "ms using TypeScript reader"));
                        // Convert to existing response format
                        return [2 /*return*/, {
                                data: data,
                                total_rows: ((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.total_rows) || 0,
                                filtered_rows: data.length,
                                start_row: request.startRow,
                                returned_rows: data.length,
                                columns: request.selectedVars || ((_c = this.metadata) === null || _c === void 0 ? void 0 : _c.variables.map(function (v) { return v.name; })) || []
                            }];
                    case 6:
                        tsError_2 = _d.sent();
                        this.logger.warn('TypeScript reader failed for data, falling back to Python', tsError_2);
                        return [3 /*break*/, 7];
                    case 7:
                        args = [
                            'data',
                            request.filePath,
                            request.startRow.toString(),
                            request.numRows.toString(),
                            request.selectedVars ? request.selectedVars.join(',') : '',
                            request.whereClause || ''
                        ];
                        return [4 /*yield*/, this.executePythonCommand.apply(this, __spreadArray(['data'], args.slice(1), false))];
                    case 8: return [2 /*return*/, _d.sent()];
                }
            });
        });
    };
    /**
     * Gets unique values for a column (new feature)
     */
    SASDatasetDocument.prototype.getUniqueValues = function (columnName_1) {
        return __awaiter(this, arguments, void 0, function (columnName, includeCount) {
            var allData, uniqueMap, _i, _a, row, value;
            var _b;
            if (includeCount === void 0) { includeCount = false; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(!this.usePythonFallback && this.reader)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.reader.getUniqueValues(columnName, includeCount)];
                    case 1: return [2 /*return*/, _c.sent()];
                    case 2: return [4 /*yield*/, this.getData({
                            filePath: this.uri.fsPath,
                            startRow: 0,
                            numRows: ((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.total_rows) || 10000,
                            selectedVars: [columnName]
                        })];
                    case 3:
                        allData = _c.sent();
                        uniqueMap = new Map();
                        for (_i = 0, _a = allData.data; _i < _a.length; _i++) {
                            row = _a[_i];
                            value = row[columnName];
                            uniqueMap.set(value, (uniqueMap.get(value) || 0) + 1);
                        }
                        if (includeCount) {
                            return [2 /*return*/, Array.from(uniqueMap.entries()).map(function (_a) {
                                    var value = _a[0], count = _a[1];
                                    return ({ value: value, count: count });
                                })];
                        }
                        else {
                            return [2 /*return*/, Array.from(uniqueMap.keys())];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets unique combinations for multiple columns (new feature)
     */
    SASDatasetDocument.prototype.getUniqueCombinations = function (columnNames_1) {
        return __awaiter(this, arguments, void 0, function (columnNames, includeCount) {
            var allData, uniqueMap, _loop_1, _i, _a, row;
            var _b;
            if (includeCount === void 0) { includeCount = false; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(!this.usePythonFallback && this.reader)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.reader.getUniqueCombinations(columnNames, includeCount)];
                    case 1: return [2 /*return*/, _c.sent()];
                    case 2: return [4 /*yield*/, this.getData({
                            filePath: this.uri.fsPath,
                            startRow: 0,
                            numRows: ((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.total_rows) || 10000,
                            selectedVars: columnNames
                        })];
                    case 3:
                        allData = _c.sent();
                        uniqueMap = new Map();
                        _loop_1 = function (row) {
                            var values = columnNames.map(function (col) { return row[col]; });
                            var key = JSON.stringify(values);
                            if (!uniqueMap.has(key)) {
                                uniqueMap.set(key, includeCount ? __assign(__assign({}, row), { _count: 1 }) : row);
                            }
                            else if (includeCount) {
                                uniqueMap.get(key)._count++;
                            }
                        };
                        for (_i = 0, _a = allData.data; _i < _a.length; _i++) {
                            row = _a[_i];
                            _loop_1(row);
                        }
                        return [2 /*return*/, Array.from(uniqueMap.values())];
                }
            });
        });
    };
    /**
     * Executes a Python command and returns the parsed result
     */
    SASDatasetDocument.prototype.executePythonCommand = function (command) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var pythonScript = path.join(_this.context.extensionPath, 'python', 'sas_reader.py');
                        var fullArgs = __spreadArray([pythonScript, command], args, true);
                        _this.logger.debug("Executing Python fallback: py ".concat(fullArgs.join(' ')));
                        var pythonProcess = (0, child_process_1.spawn)('py', fullArgs, {
                            cwd: _this.context.extensionPath
                        });
                        var stdout = '';
                        var stderr = '';
                        pythonProcess.stdout.on('data', function (data) {
                            stdout += data.toString();
                        });
                        pythonProcess.stderr.on('data', function (data) {
                            stderr += data.toString();
                        });
                        pythonProcess.on('close', function (code) {
                            _this.logger.debug("Python process exited with code ".concat(code));
                            if (code !== 0) {
                                _this.logger.error('Python process failed', { code: code, stderr: stderr });
                                reject(new Error("Python process exited with code ".concat(code, ": ").concat(stderr)));
                                return;
                            }
                            try {
                                var result = JSON.parse(stdout);
                                if (result.error) {
                                    _this.logger.error('Python script returned error', result.error);
                                    reject(new Error(result.error));
                                }
                                else {
                                    resolve(result.metadata || result);
                                }
                            }
                            catch (parseError) {
                                _this.logger.error('Failed to parse Python output', {
                                    parseError: parseError instanceof Error ? parseError.message : parseError,
                                    stdout: stdout.substring(0, 500) // Limit output for logging
                                });
                                reject(new Error("Failed to parse Python output: ".concat(parseError, ". Output was: ").concat(stdout)));
                            }
                        });
                        pythonProcess.on('error', function (error) {
                            _this.logger.error('Failed to spawn Python process', error);
                            reject(new Error("Failed to spawn Python process: ".concat(error.message)));
                        });
                    })];
            });
        });
    };
    /**
     * Disposes of the document and cleans up resources
     */
    SASDatasetDocument.prototype.dispose = function () {
        this.logger.debug("Disposing document: ".concat(this.uri.fsPath));
        if (this.reader) {
            this.reader.dispose();
            this.reader = null;
        }
    };
    return SASDatasetDocument;
}());
exports.SASDatasetDocument = SASDatasetDocument;
