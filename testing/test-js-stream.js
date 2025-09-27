"use strict";
/**
 * Test file for js-stream-sas7bdat library
 * Testing metadata extraction, data reading, and unique values functionality
 */
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAS7BDATTester = void 0;
var path = require("path");
var fs = require("fs");
// Try to import js-stream-sas7bdat
var SAS7BDAT;
try {
    var module_1 = require('js-stream-sas7bdat');
    SAS7BDAT = module_1.DatasetSas7BDat || module_1.default || module_1;
    console.log('✅ js-stream-sas7bdat loaded successfully');
    console.log('  Module structure:', Object.keys(module_1));
}
catch (error) {
    console.error('❌ Failed to load js-stream-sas7bdat:', error);
    process.exit(1);
}
var SAS7BDATTester = /** @class */ (function () {
    function SAS7BDATTester(filePath) {
        this.filePath = filePath;
        this.results = {
            metadata: null,
            sampleData: [],
            uniqueValues: null,
            multiVariableUnique: null,
            performance: {
                metadataTime: 0,
                dataReadTime: 0,
                uniqueValueTime: 0
            }
        };
    }
    SAS7BDATTester.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    console.log("\n\uD83D\uDCC2 Initializing reader for: ".concat(path.basename(this.filePath)));
                    this.reader = new SAS7BDAT(this.filePath);
                    console.log('✅ Reader initialized');
                }
                catch (error) {
                    console.error('❌ Failed to initialize reader:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    SAS7BDATTester.prototype.testMetadata = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, _a, meta, vars, firstVar, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('\n📊 Testing Metadata Extraction...');
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        if (!(typeof this.reader.getMetadata === 'function')) return [3 /*break*/, 3];
                        _a = this.results;
                        return [4 /*yield*/, this.reader.getMetadata()];
                    case 2:
                        _a.metadata = _b.sent();
                        this.results.performance.metadataTime = Date.now() - startTime;
                        console.log('✅ Metadata extracted successfully');
                        console.log('\n📋 Metadata Overview:');
                        meta = this.results.metadata;
                        console.log("  - Rows: ".concat(meta.rowCount || meta.rows || meta.number_rows || 'Not available'));
                        console.log("  - Columns: ".concat(meta.columnCount || meta.columns || meta.number_columns || 'Not available'));
                        console.log("  - Encoding: ".concat(meta.encoding || meta.file_encoding || 'Not available'));
                        // Check for variable information
                        if (meta.variables || meta.columns || meta.column_names) {
                            vars = meta.variables || meta.columns || meta.column_names;
                            console.log("  - Variables: ".concat(Array.isArray(vars) ? vars.length : 'Structure unclear'));
                            // Sample first variable to check structure
                            if (Array.isArray(vars) && vars.length > 0) {
                                console.log('\n  📌 First Variable Structure:');
                                firstVar = vars[0];
                                console.log('    ', JSON.stringify(firstVar, null, 2).split('\n').join('\n    '));
                            }
                        }
                        // Check for variable labels
                        if (meta.column_labels || meta.variable_labels) {
                            console.log('  ✅ Variable labels found!');
                        }
                        else {
                            console.log('  ⚠️ Variable labels not found');
                        }
                        // Check for variable formats
                        if (meta.column_formats || meta.variable_formats || meta.original_variable_types) {
                            console.log('  ✅ Variable formats found!');
                        }
                        else {
                            console.log('  ⚠️ Variable formats not found');
                        }
                        // Check for dataset label
                        if (meta.dataset_label || meta.table_name || meta.label) {
                            console.log("  \u2705 Dataset label: ".concat(meta.dataset_label || meta.table_name || meta.label));
                        }
                        else {
                            console.log('  ⚠️ Dataset label not found');
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        console.log('⚠️ getMetadata method not found');
                        // Try alternative metadata access
                        if (this.reader.metadata) {
                            this.results.metadata = this.reader.metadata;
                            console.log('✅ Found metadata property directly');
                        }
                        _b.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _b.sent();
                        console.error('❌ Metadata extraction failed:', error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SAS7BDATTester.prototype.testDataReading = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, count, _a, _b, _c, row, e_1_1, data, stream, error_2;
            var _d, e_1, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        console.log('\n📖 Testing Data Reading...');
                        startTime = Date.now();
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 18, , 19]);
                        if (!(typeof this.reader[Symbol.asyncIterator] === 'function')) return [3 /*break*/, 14];
                        console.log('  Testing async iterator...');
                        count = 0;
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 7, 8, 13]);
                        _a = true, _b = __asyncValues(this.reader);
                        _g.label = 3;
                    case 3: return [4 /*yield*/, _b.next()];
                    case 4:
                        if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 6];
                        _f = _c.value;
                        _a = false;
                        row = _f;
                        if (count < 5) {
                            this.results.sampleData.push(row);
                        }
                        count++;
                        if (count >= 10)
                            return [3 /*break*/, 6]; // Read first 10 rows
                        _g.label = 5;
                    case 5:
                        _a = true;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_1_1 = _g.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _g.trys.push([8, , 11, 12]);
                        if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _e.call(_b)];
                    case 9:
                        _g.sent();
                        _g.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13:
                        console.log("  \u2705 Read ".concat(count, " rows using async iterator"));
                        return [3 /*break*/, 17];
                    case 14:
                        if (!(typeof this.reader.read === 'function')) return [3 /*break*/, 16];
                        console.log('  Testing read method...');
                        return [4 /*yield*/, this.reader.read({
                                start: 0,
                                length: 10
                            })];
                    case 15:
                        data = _g.sent();
                        this.results.sampleData = data.slice(0, 5);
                        console.log("  \u2705 Read ".concat(data.length, " rows using read method"));
                        return [3 /*break*/, 17];
                    case 16:
                        if (typeof this.reader.stream === 'function') {
                            console.log('  Testing stream method...');
                            stream = this.reader.stream();
                            // Handle stream...
                        }
                        _g.label = 17;
                    case 17:
                        this.results.performance.dataReadTime = Date.now() - startTime;
                        if (this.results.sampleData.length > 0) {
                            console.log('\n  📌 First Row Structure:');
                            console.log('    ', JSON.stringify(this.results.sampleData[0], null, 2).split('\n').join('\n    '));
                        }
                        return [3 /*break*/, 19];
                    case 18:
                        error_2 = _g.sent();
                        console.error('❌ Data reading failed:', error_2);
                        return [3 /*break*/, 19];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    SAS7BDATTester.prototype.testUniqueValues = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, meta, columnNames, firstColumn, _a, sample, testColumns, _b, error_3;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        console.log('\n🔍 Testing Unique Values Extraction...');
                        startTime = Date.now();
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 7, , 8]);
                        if (!(typeof this.reader.getUniqueValues === 'function')) return [3 /*break*/, 5];
                        meta = this.results.metadata;
                        columnNames = [];
                        if ((meta === null || meta === void 0 ? void 0 : meta.variables) && Array.isArray(meta.variables)) {
                            columnNames = meta.variables.map(function (v) { return v.name || v; });
                        }
                        else if ((meta === null || meta === void 0 ? void 0 : meta.column_names) && Array.isArray(meta.column_names)) {
                            columnNames = meta.column_names;
                        }
                        if (!(columnNames.length > 0)) return [3 /*break*/, 4];
                        firstColumn = columnNames[0];
                        console.log("  Testing unique values for: ".concat(firstColumn));
                        _a = this.results;
                        return [4 /*yield*/, this.reader.getUniqueValues({
                                column: firstColumn,
                                includeCount: true
                            })];
                    case 2:
                        _a.uniqueValues = _e.sent();
                        console.log("  \u2705 Found ".concat(((_c = this.results.uniqueValues) === null || _c === void 0 ? void 0 : _c.length) || 0, " unique values"));
                        // Show sample unique values
                        if (this.results.uniqueValues && this.results.uniqueValues.length > 0) {
                            console.log('  📌 Sample unique values:');
                            sample = this.results.uniqueValues.slice(0, 5);
                            sample.forEach(function (val) {
                                console.log("    - ".concat(JSON.stringify(val)));
                            });
                        }
                        if (!(columnNames.length > 1)) return [3 /*break*/, 4];
                        console.log("\n  Testing multi-variable unique combinations...");
                        testColumns = columnNames.slice(0, 2);
                        console.log("  Columns: ".concat(testColumns.join(', ')));
                        _b = this.results;
                        return [4 /*yield*/, this.reader.getUniqueValues({
                                columns: testColumns,
                                includeCount: true
                            })];
                    case 3:
                        _b.multiVariableUnique = _e.sent();
                        console.log("  \u2705 Found ".concat(((_d = this.results.multiVariableUnique) === null || _d === void 0 ? void 0 : _d.length) || 0, " unique combinations"));
                        _e.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        console.log('  ⚠️ getUniqueValues method not found');
                        // Try alternative approach
                        console.log('  Attempting manual unique value extraction...');
                        _e.label = 6;
                    case 6:
                        this.results.performance.uniqueValueTime = Date.now() - startTime;
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _e.sent();
                        console.error('❌ Unique values extraction failed:', error_3);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    SAS7BDATTester.prototype.runAllTests = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('='
                            .repeat(60));
                        console.log('🧪 JS-STREAM-SAS7BDAT TEST SUITE');
                        console.log('='.repeat(60));
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.testMetadata()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.testDataReading()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.testUniqueValues()];
                    case 4:
                        _a.sent();
                        this.printSummary();
                        return [2 /*return*/];
                }
            });
        });
    };
    SAS7BDATTester.prototype.printSummary = function () {
        var _a, _b, _c, _d;
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log('\n✅ Features Available:');
        if (this.results.metadata)
            console.log('  - Metadata extraction');
        if (this.results.sampleData.length > 0)
            console.log('  - Data reading');
        if (this.results.uniqueValues)
            console.log('  - Single variable unique values');
        if (this.results.multiVariableUnique)
            console.log('  - Multi-variable unique combinations');
        console.log('\n⏱️ Performance:');
        console.log("  - Metadata extraction: ".concat(this.results.performance.metadataTime, "ms"));
        console.log("  - Data reading (10 rows): ".concat(this.results.performance.dataReadTime, "ms"));
        console.log("  - Unique values: ".concat(this.results.performance.uniqueValueTime, "ms"));
        console.log('\n📝 Recommendations:');
        var hasLabels = ((_a = this.results.metadata) === null || _a === void 0 ? void 0 : _a.column_labels) || ((_b = this.results.metadata) === null || _b === void 0 ? void 0 : _b.variable_labels);
        var hasFormats = ((_c = this.results.metadata) === null || _c === void 0 ? void 0 : _c.column_formats) || ((_d = this.results.metadata) === null || _d === void 0 ? void 0 : _d.variable_formats);
        var hasUnique = this.results.uniqueValues || this.results.multiVariableUnique;
        if (hasLabels && hasFormats && hasUnique) {
            console.log('  ✅ Library provides all required features!');
            console.log('  → Ready for migration from Python');
        }
        else {
            console.log('  ⚠️ Missing features:');
            if (!hasLabels)
                console.log('    - Variable labels');
            if (!hasFormats)
                console.log('    - Variable formats');
            if (!hasUnique)
                console.log('    - Unique value extraction');
            console.log('  → May need enhancement or hybrid approach');
        }
    };
    return SAS7BDATTester;
}());
exports.SAS7BDATTester = SAS7BDATTester;
// Main execution
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var args, testFile, possiblePaths, _i, possiblePaths_1, path_1, tester;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = process.argv.slice(2);
                    testFile = args[0];
                    if (!testFile) {
                        possiblePaths = [
                            'C:/sas/Test_Ext/ae.sas7bdat',
                            'C:/sas/Test_Ext/test.sas7bdat',
                            '../data/sample.sas7bdat',
                            './sample.sas7bdat'
                        ];
                        for (_i = 0, possiblePaths_1 = possiblePaths; _i < possiblePaths_1.length; _i++) {
                            path_1 = possiblePaths_1[_i];
                            if (fs.existsSync(path_1)) {
                                testFile = path_1;
                                console.log("\uD83D\uDCC1 Using test file: ".concat(path_1));
                                break;
                            }
                        }
                        if (!testFile) {
                            console.error('❌ No SAS7BDAT file found. Please provide a file path as argument.');
                            console.log('Usage: node test-js-stream.js <path-to-sas7bdat-file>');
                            process.exit(1);
                        }
                    }
                    tester = new SAS7BDATTester(testFile);
                    return [4 /*yield*/, tester.runAllTests()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Run if executed directly
if (require.main === module) {
    main().catch(console.error);
}
