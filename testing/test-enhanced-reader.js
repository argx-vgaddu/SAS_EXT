"use strict";
/**
 * Test Enhanced SAS Reader wrapper
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
var EnhancedSASReader_1 = require("../src/readers/EnhancedSASReader");
var fs = __importStar(require("fs"));
function testEnhancedReader(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var reader, metadata, data, firstCol, uniqueVals, uniqueWithCount, cols, combos, combosWithCount, colInfo, perfCol, start, time, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('\n' + '='.repeat(60));
                    console.log('🚀 TESTING ENHANCED SAS READER');
                    console.log('='.repeat(60));
                    console.log('File:', filePath);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 14, , 15]);
                    reader = new EnhancedSASReader_1.EnhancedSASReader(filePath);
                    // Test 1: Metadata
                    console.log('\n📊 METADATA TEST:');
                    return [4 /*yield*/, reader.getMetadata()];
                case 2:
                    metadata = _b.sent();
                    console.log('  Rows:', metadata.rowCount);
                    console.log('  Columns:', metadata.columnCount);
                    console.log('  Variables:');
                    metadata.variables.forEach(function (v) {
                        console.log("    - ".concat(v.name, " (").concat(v.type, ", length: ").concat(v.length, ")"));
                    });
                    // Test 2: Data reading (as objects)
                    console.log('\n📖 DATA READING TEST:');
                    return [4 /*yield*/, reader.getData({ numRows: 3 })];
                case 3:
                    data = _b.sent();
                    console.log('  First 3 rows:');
                    data.forEach(function (row, i) {
                        console.log("    Row ".concat(i + 1, ":"), row);
                    });
                    // Test 3: Unique values (FIXED!)
                    console.log('\n🔍 UNIQUE VALUES TEST:');
                    if (!(metadata.variables.length > 0)) return [3 /*break*/, 6];
                    firstCol = metadata.variables[0].name;
                    return [4 /*yield*/, reader.getUniqueValues(firstCol)];
                case 4:
                    uniqueVals = _b.sent();
                    console.log("  Unique values in '".concat(firstCol, "':"), uniqueVals);
                    return [4 /*yield*/, reader.getUniqueValues(firstCol, true)];
                case 5:
                    uniqueWithCount = _b.sent();
                    console.log("  With counts:", uniqueWithCount);
                    _b.label = 6;
                case 6:
                    // Test 4: Multi-column unique (NODUPKEY)
                    console.log('\n🔗 MULTI-COLUMN UNIQUE TEST:');
                    if (!(metadata.variables.length > 1)) return [3 /*break*/, 9];
                    cols = metadata.variables.slice(0, 2).map(function (v) { return v.name; });
                    return [4 /*yield*/, reader.getUniqueCombinations(cols)];
                case 7:
                    combos = _b.sent();
                    console.log("  Unique combinations of [".concat(cols.join(', '), "]:"), combos);
                    return [4 /*yield*/, reader.getUniqueCombinations(cols, true)];
                case 8:
                    combosWithCount = _b.sent();
                    console.log("  With counts:", combosWithCount);
                    _b.label = 9;
                case 9:
                    // Test 5: Column info (for UI)
                    console.log('\n📋 COLUMN INFO TEST:');
                    if (!(metadata.variables.length > 0)) return [3 /*break*/, 11];
                    return [4 /*yield*/, reader.getColumnInfo(metadata.variables[0].name)];
                case 10:
                    colInfo = _b.sent();
                    console.log('  Column info:', colInfo);
                    console.log("    Is categorical? ".concat(colInfo.isCategorical ? 'Yes' : 'No'));
                    _b.label = 11;
                case 11:
                    // Test 6: Performance comparison
                    console.log('\n⚡ PERFORMANCE TEST:');
                    perfCol = (_a = metadata.variables[0]) === null || _a === void 0 ? void 0 : _a.name;
                    if (!perfCol) return [3 /*break*/, 13];
                    start = Date.now();
                    return [4 /*yield*/, reader.getUniqueValues(perfCol)];
                case 12:
                    _b.sent();
                    time = Date.now() - start;
                    console.log("  Unique values extracted in: ".concat(time, "ms"));
                    _b.label = 13;
                case 13:
                    console.log('\n✅ ALL TESTS PASSED!');
                    // Cleanup
                    reader.dispose();
                    return [3 /*break*/, 15];
                case 14:
                    error_1 = _b.sent();
                    console.error('\n❌ Test failed:', error_1);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
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
                    return [4 /*yield*/, testEnhancedReader(filePath)];
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
