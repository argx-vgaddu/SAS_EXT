"use strict";
/**
 * Compare js-stream-sas7bdat with Python implementation
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
var path = require("path");
var child_process_1 = require("child_process");
var DatasetSas7BDat = require('js-stream-sas7bdat').DatasetSas7BDat;
function runPythonCommand(command, filePath) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var pythonScript = path.join(__dirname, '..', 'python', 'sas_reader.py');
                    var fullArgs = __spreadArray([pythonScript, command, filePath], args, true);
                    var pythonProcess = (0, child_process_1.spawn)('py', fullArgs);
                    var stdout = '';
                    var stderr = '';
                    pythonProcess.stdout.on('data', function (data) {
                        stdout += data.toString();
                    });
                    pythonProcess.stderr.on('data', function (data) {
                        stderr += data.toString();
                    });
                    pythonProcess.on('close', function (code) {
                        if (code !== 0) {
                            reject(new Error("Python process exited with code ".concat(code, ": ").concat(stderr)));
                            return;
                        }
                        try {
                            var result = JSON.parse(stdout);
                            if (result.error) {
                                reject(new Error(result.error));
                            }
                            else {
                                resolve(result.metadata || result);
                            }
                        }
                        catch (parseError) {
                            reject(new Error("Failed to parse Python output: ".concat(parseError)));
                        }
                    });
                    pythonProcess.on('error', function (error) {
                        reject(new Error("Failed to spawn Python process: ".concat(error.message)));
                    });
                })];
        });
    });
}
function compareImplementations(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var results, startPython, pythonMeta, pythonMetaTime, startJS, dataset, jsMeta, jsMetaTime, pythonColNames, jsColNames, pythonHasLabels, jsHasLabels, pythonHasFormats, jsHasFormats, startPythonData, pythonData, pythonDataTime, startJSData, jsData, jsDataTime, jsUniqueWorks, uniqueResult, e_1, maxFeatureLen_1, maxPythonLen_1, maxJsLen_1, matchCount, totalCount, matchPercent, error_1;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    console.log('\n' + '='.repeat(60));
                    console.log('📊 PYTHON vs JAVASCRIPT COMPARISON');
                    console.log('='.repeat(60));
                    console.log('File:', filePath);
                    results = [];
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 11, , 12]);
                    // Get Python metadata
                    console.log('\n⏳ Getting Python metadata...');
                    startPython = Date.now();
                    return [4 /*yield*/, runPythonCommand('metadata', filePath)];
                case 2:
                    pythonMeta = _f.sent();
                    pythonMetaTime = Date.now() - startPython;
                    // Get JavaScript metadata
                    console.log('⏳ Getting JavaScript metadata...');
                    startJS = Date.now();
                    dataset = new DatasetSas7BDat(filePath);
                    return [4 /*yield*/, dataset.getMetadata()];
                case 3:
                    jsMeta = _f.sent();
                    jsMetaTime = Date.now() - startJS;
                    // Compare metadata extraction time
                    results.push({
                        feature: 'Metadata Extraction Speed',
                        python: "".concat(pythonMetaTime, "ms"),
                        javascript: "".concat(jsMetaTime, "ms"),
                        match: jsMetaTime < pythonMetaTime,
                        notes: jsMetaTime < pythonMetaTime ? 'JS faster ✅' : 'Python faster'
                    });
                    // Compare row count
                    results.push({
                        feature: 'Row Count',
                        python: pythonMeta.total_rows,
                        javascript: jsMeta.records,
                        match: pythonMeta.total_rows === jsMeta.records,
                        notes: ''
                    });
                    // Compare column count
                    results.push({
                        feature: 'Column Count',
                        python: pythonMeta.total_variables,
                        javascript: (_a = jsMeta.columns) === null || _a === void 0 ? void 0 : _a.length,
                        match: pythonMeta.total_variables === ((_b = jsMeta.columns) === null || _b === void 0 ? void 0 : _b.length),
                        notes: ''
                    });
                    pythonColNames = pythonMeta.variables.map(function (v) { return v.name; });
                    jsColNames = ((_c = jsMeta.columns) === null || _c === void 0 ? void 0 : _c.map(function (c) { return c.name; })) || [];
                    results.push({
                        feature: 'Column Names',
                        python: pythonColNames.join(', '),
                        javascript: jsColNames.join(', '),
                        match: JSON.stringify(pythonColNames) === JSON.stringify(jsColNames),
                        notes: ''
                    });
                    pythonHasLabels = pythonMeta.variables.some(function (v) { return v.label && v.label !== v.name; });
                    jsHasLabels = ((_d = jsMeta.columns) === null || _d === void 0 ? void 0 : _d.some(function (c) { return c.label && c.label !== c.name; })) || false;
                    results.push({
                        feature: 'Variable Labels',
                        python: pythonHasLabels ? '✅ Available' : '❌ Not found',
                        javascript: jsHasLabels ? '✅ Available' : '❌ Not found',
                        match: pythonHasLabels === jsHasLabels,
                        notes: 'JS only has label same as name'
                    });
                    pythonHasFormats = pythonMeta.variables.some(function (v) { return v.format && v.format !== ''; });
                    jsHasFormats = ((_e = jsMeta.columns) === null || _e === void 0 ? void 0 : _e.some(function (c) { return c.displayFormat || c.format; })) || false;
                    results.push({
                        feature: 'Variable Formats',
                        python: pythonHasFormats ? '✅ Available' : '❌ Not found',
                        javascript: jsHasFormats ? '✅ Available' : '❌ Not found',
                        match: pythonHasFormats === jsHasFormats,
                        notes: 'JS missing format info'
                    });
                    // Compare dataset label
                    results.push({
                        feature: 'Dataset Label',
                        python: pythonMeta.dataset_label || 'None',
                        javascript: jsMeta.label || jsMeta.name || 'None',
                        match: false,
                        notes: 'Different structure'
                    });
                    // Compare data reading
                    console.log('\n⏳ Reading sample data...');
                    startPythonData = Date.now();
                    return [4 /*yield*/, runPythonCommand('data', filePath, '0', '5')];
                case 4:
                    pythonData = _f.sent();
                    pythonDataTime = Date.now() - startPythonData;
                    startJSData = Date.now();
                    return [4 /*yield*/, dataset.getData({ filterColumns: [] })];
                case 5:
                    jsData = _f.sent();
                    jsDataTime = Date.now() - startJSData;
                    results.push({
                        feature: 'Data Reading Speed',
                        python: "".concat(pythonDataTime, "ms"),
                        javascript: "".concat(jsDataTime, "ms"),
                        match: jsDataTime < pythonDataTime,
                        notes: jsDataTime < pythonDataTime ? 'JS faster ✅' : 'Python faster'
                    });
                    results.push({
                        feature: 'Data Format',
                        python: 'Array of objects',
                        javascript: 'Array of arrays',
                        match: false,
                        notes: 'Different output format'
                    });
                    // Test unique values capability
                    console.log('\n⏳ Testing unique values...');
                    jsUniqueWorks = false;
                    _f.label = 6;
                case 6:
                    _f.trys.push([6, 9, , 10]);
                    if (!(jsColNames.length > 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, dataset.getUniqueValues([jsColNames[0]])];
                case 7:
                    uniqueResult = _f.sent();
                    jsUniqueWorks = uniqueResult && uniqueResult.length > 0;
                    _f.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    e_1 = _f.sent();
                    jsUniqueWorks = false;
                    return [3 /*break*/, 10];
                case 10:
                    results.push({
                        feature: 'Unique Values Support',
                        python: '✅ Manual implementation',
                        javascript: jsUniqueWorks ? '✅ Built-in' : '❌ Not working',
                        match: false,
                        notes: 'JS getUniqueValues has issues'
                    });
                    // Print results table
                    console.log('\n' + '='.repeat(60));
                    console.log('📊 COMPARISON RESULTS');
                    console.log('='.repeat(60));
                    maxFeatureLen_1 = Math.max.apply(Math, __spreadArray(__spreadArray([], results.map(function (r) { return r.feature.length; }), false), [20], false));
                    maxPythonLen_1 = Math.max.apply(Math, __spreadArray(__spreadArray([], results.map(function (r) { return String(r.python).length; }), false), [15], false));
                    maxJsLen_1 = Math.max.apply(Math, __spreadArray(__spreadArray([], results.map(function (r) { return String(r.javascript).length; }), false), [15], false));
                    // Print header
                    console.log('\n' +
                        'Feature'.padEnd(maxFeatureLen_1) + ' | ' +
                        'Python'.padEnd(maxPythonLen_1) + ' | ' +
                        'JavaScript'.padEnd(maxJsLen_1) + ' | ' +
                        'Match' + ' | ' +
                        'Notes');
                    console.log('-'.repeat(maxFeatureLen_1 + maxPythonLen_1 + maxJsLen_1 + 50));
                    // Print rows
                    results.forEach(function (r) {
                        var match = r.match ? '✅' : '❌';
                        console.log(r.feature.padEnd(maxFeatureLen_1) + ' | ' +
                            String(r.python).padEnd(maxPythonLen_1) + ' | ' +
                            String(r.javascript).padEnd(maxJsLen_1) + ' | ' +
                            match.padEnd(5) + ' | ' +
                            r.notes);
                    });
                    matchCount = results.filter(function (r) { return r.match; }).length;
                    totalCount = results.length;
                    matchPercent = Math.round((matchCount / totalCount) * 100);
                    console.log('\n' + '='.repeat(60));
                    console.log('📈 SUMMARY');
                    console.log('='.repeat(60));
                    console.log("  Matching features: ".concat(matchCount, "/").concat(totalCount, " (").concat(matchPercent, "%)"));
                    console.log('\n✅ JavaScript Advantages:');
                    console.log('  - No Python dependency required');
                    console.log('  - Native speed (no subprocess overhead)');
                    console.log('  - Direct integration with TypeScript');
                    console.log('  - Simpler deployment');
                    console.log('\n❌ JavaScript Limitations:');
                    console.log('  - Missing variable formats');
                    console.log('  - Limited metadata (no true labels)');
                    console.log('  - Unique values method not working properly');
                    console.log('  - Different data output format');
                    console.log('\n💡 Recommendation:');
                    if (matchPercent >= 80) {
                        console.log('  ✅ JavaScript implementation is sufficient for basic needs');
                    }
                    else if (matchPercent >= 50) {
                        console.log('  ⚠️ JavaScript needs enhancements for full functionality');
                        console.log('  Consider hybrid approach or forking the library');
                    }
                    else {
                        console.log('  ❌ Stay with Python for now - too many missing features');
                        console.log('  Or implement custom TypeScript solution');
                    }
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _f.sent();
                    console.error('❌ Comparison failed:', error_1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
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
                    return [4 /*yield*/, compareImplementations(filePath)];
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
