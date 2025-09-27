"use strict";
/**
 * Explore js-stream-sas7bdat API
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
var fs = require("fs");
var DatasetSas7BDat = require('js-stream-sas7bdat').DatasetSas7BDat;
function exploreAPI(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var dataset, metadata, count, _a, dataset_1, dataset_1_1, row, e_1_1, error_1, possibleDataMethods, _i, possibleDataMethods_1, method, result, error_2, firstCol, attempts, _b, attempts_1, params, unique, e_2, error_3, cols, multiUnique, error_4, instance, _c, _d, prop, value, type, error_5;
        var _e, e_1, _f, _g;
        var _h, _j, _k, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    console.log('\n🔍 EXPLORING js-stream-sas7bdat API\n');
                    console.log('File:', filePath);
                    console.log('='.repeat(60));
                    _m.label = 1;
                case 1:
                    _m.trys.push([1, 39, , 40]);
                    dataset = new DatasetSas7BDat(filePath);
                    console.log('\n✅ Dataset instance created');
                    console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(dataset)));
                    // Test metadata
                    console.log('\n📊 METADATA:');
                    return [4 /*yield*/, dataset.getMetadata()];
                case 2:
                    metadata = _m.sent();
                    console.log('Full metadata structure:');
                    console.log(JSON.stringify(metadata, null, 2));
                    // Check for row/column count
                    console.log('\n📈 Dataset Info:');
                    console.log('  Row count property names:', Object.keys(metadata).filter(function (k) { return k.toLowerCase().includes('row'); }));
                    console.log('  Column count property names:', Object.keys(metadata).filter(function (k) { return k.toLowerCase().includes('col'); }));
                    // Analyze column/variable structure
                    console.log('\n📋 Variables/Columns:');
                    if (metadata.columns && Array.isArray(metadata.columns)) {
                        console.log("  Found ".concat(metadata.columns.length, " columns"));
                        metadata.columns.forEach(function (col, idx) {
                            console.log("\n  Column ".concat(idx + 1, ":"));
                            console.log("    Name: ".concat(col.name));
                            console.log("    Label: ".concat(col.label || 'Not available'));
                            console.log("    Type: ".concat(col.dataType));
                            console.log("    Length: ".concat(col.length));
                            console.log("    Format: ".concat(col.displayFormat || 'Not available'));
                            console.log("    All properties: ".concat(Object.keys(col).join(', ')));
                        });
                    }
                    // Test reading data
                    console.log('\n📖 DATA READING:');
                    _m.label = 3;
                case 3:
                    _m.trys.push([3, 16, , 17]);
                    console.log('\n  Testing async iterator...');
                    count = 0;
                    _m.label = 4;
                case 4:
                    _m.trys.push([4, 9, 10, 15]);
                    _a = true, dataset_1 = __asyncValues(dataset);
                    _m.label = 5;
                case 5: return [4 /*yield*/, dataset_1.next()];
                case 6:
                    if (!(dataset_1_1 = _m.sent(), _e = dataset_1_1.done, !_e)) return [3 /*break*/, 8];
                    _g = dataset_1_1.value;
                    _a = false;
                    row = _g;
                    console.log("    Row ".concat(count + 1, ":"), row);
                    count++;
                    if (count >= 3)
                        return [3 /*break*/, 8];
                    _m.label = 7;
                case 7:
                    _a = true;
                    return [3 /*break*/, 5];
                case 8: return [3 /*break*/, 15];
                case 9:
                    e_1_1 = _m.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 15];
                case 10:
                    _m.trys.push([10, , 13, 14]);
                    if (!(!_a && !_e && (_f = dataset_1.return))) return [3 /*break*/, 12];
                    return [4 /*yield*/, _f.call(dataset_1)];
                case 11:
                    _m.sent();
                    _m.label = 12;
                case 12: return [3 /*break*/, 14];
                case 13:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 14: return [7 /*endfinally*/];
                case 15: return [3 /*break*/, 17];
                case 16:
                    error_1 = _m.sent();
                    console.log('    ❌ Async iterator error:', error_1.message);
                    return [3 /*break*/, 17];
                case 17:
                    possibleDataMethods = ['getData', 'getRows', 'read', 'readRows', 'getObservations'];
                    _i = 0, possibleDataMethods_1 = possibleDataMethods;
                    _m.label = 18;
                case 18:
                    if (!(_i < possibleDataMethods_1.length)) return [3 /*break*/, 23];
                    method = possibleDataMethods_1[_i];
                    if (!(typeof dataset[method] === 'function')) return [3 /*break*/, 22];
                    console.log("\n  Found method: ".concat(method, "()"));
                    _m.label = 19;
                case 19:
                    _m.trys.push([19, 21, , 22]);
                    return [4 /*yield*/, dataset[method]({ start: 0, length: 3 })];
                case 20:
                    result = _m.sent();
                    console.log('    Result:', result);
                    return [3 /*break*/, 22];
                case 21:
                    error_2 = _m.sent();
                    console.log('    Error:', error_2.message);
                    return [3 /*break*/, 22];
                case 22:
                    _i++;
                    return [3 /*break*/, 18];
                case 23:
                    // Test unique values
                    console.log('\n🔍 UNIQUE VALUES:');
                    if (!(typeof dataset.getUniqueValues === 'function')) return [3 /*break*/, 37];
                    console.log('  ✅ getUniqueValues method found!');
                    firstCol = (_j = (_h = metadata.columns) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.name;
                    if (!firstCol) return [3 /*break*/, 32];
                    console.log("\n  Testing unique values for column: ".concat(firstCol));
                    _m.label = 24;
                case 24:
                    _m.trys.push([24, 31, , 32]);
                    attempts = [
                        { column: firstCol },
                        { columnName: firstCol },
                        { variable: firstCol },
                        { col: firstCol },
                        firstCol // Just the column name
                    ];
                    _b = 0, attempts_1 = attempts;
                    _m.label = 25;
                case 25:
                    if (!(_b < attempts_1.length)) return [3 /*break*/, 30];
                    params = attempts_1[_b];
                    _m.label = 26;
                case 26:
                    _m.trys.push([26, 28, , 29]);
                    console.log("    Trying params:", params);
                    return [4 /*yield*/, dataset.getUniqueValues(params)];
                case 27:
                    unique = _m.sent();
                    console.log("    \u2705 Success! Found ".concat((unique === null || unique === void 0 ? void 0 : unique.length) || 0, " unique values"));
                    if (unique && unique.length > 0) {
                        console.log('    First few values:', unique.slice(0, 5));
                    }
                    return [3 /*break*/, 30];
                case 28:
                    e_2 = _m.sent();
                    console.log("    \u274C Failed:", e_2.message);
                    return [3 /*break*/, 29];
                case 29:
                    _b++;
                    return [3 /*break*/, 25];
                case 30: return [3 /*break*/, 32];
                case 31:
                    error_3 = _m.sent();
                    console.log('  ❌ Error getting unique values:', error_3.message);
                    return [3 /*break*/, 32];
                case 32:
                    if (!(((_k = metadata.columns) === null || _k === void 0 ? void 0 : _k.length) > 1)) return [3 /*break*/, 36];
                    cols = metadata.columns.slice(0, 2).map(function (c) { return c.name; });
                    console.log("\n  Testing multi-column unique for: ".concat(cols.join(', ')));
                    _m.label = 33;
                case 33:
                    _m.trys.push([33, 35, , 36]);
                    return [4 /*yield*/, dataset.getUniqueValues({ columns: cols })];
                case 34:
                    multiUnique = _m.sent();
                    console.log("    Found ".concat((multiUnique === null || multiUnique === void 0 ? void 0 : multiUnique.length) || 0, " unique combinations"));
                    return [3 /*break*/, 36];
                case 35:
                    error_4 = _m.sent();
                    console.log('    Error:', error_4.message);
                    return [3 /*break*/, 36];
                case 36: return [3 /*break*/, 38];
                case 37:
                    console.log('  ❌ getUniqueValues method not found');
                    _m.label = 38;
                case 38:
                    // Explore other properties
                    console.log('\n🔧 OTHER PROPERTIES:');
                    instance = dataset;
                    for (_c = 0, _d = Object.keys(instance); _c < _d.length; _c++) {
                        prop = _d[_c];
                        value = instance[prop];
                        type = typeof value;
                        if (type !== 'function') {
                            console.log("  ".concat(prop, ": ").concat(type === 'object' ? ((_l = JSON.stringify(value)) === null || _l === void 0 ? void 0 : _l.substring(0, 100)) + '...' : value));
                        }
                    }
                    return [3 /*break*/, 40];
                case 39:
                    error_5 = _m.sent();
                    console.error('❌ Error:', error_5);
                    return [3 /*break*/, 40];
                case 40: return [2 /*return*/];
            }
        });
    });
}
// Main
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var filePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = process.argv[2] || 'C:/sas/Test_Ext/test.sas7bdat';
                    if (!fs.existsSync(filePath)) {
                        console.error('❌ File not found:', filePath);
                        process.exit(1);
                    }
                    return [4 /*yield*/, exploreAPI(filePath)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    main().catch(console.error);
}
