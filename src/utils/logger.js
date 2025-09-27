"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
var vscode = __importStar(require("vscode"));
/**
 * Logging levels for the extension
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Centralized logging utility for the SAS Dataset Viewer extension
 * Provides proper VS Code output channel logging with configurable levels
 */
var Logger = /** @class */ (function () {
    function Logger() {
    }
    /**
     * Initialize the logger with an output channel
     * @param channelName - Name of the output channel
     */
    Logger.initialize = function (channelName) {
        if (!Logger.outputChannel) {
            Logger.outputChannel = vscode.window.createOutputChannel(channelName);
            Logger.instance = new Logger();
            // Check if debug logging is enabled via configuration
            var config = vscode.workspace.getConfiguration('sasDatasetViewer');
            var enableDebugLogging = config.get('enableDebugLogging', false);
            Logger.logLevel = enableDebugLogging ? LogLevel.DEBUG : LogLevel.INFO;
        }
    };
    /**
     * Set the minimum log level
     * @param level - Minimum log level to display
     */
    Logger.setLogLevel = function (level) {
        Logger.logLevel = level;
    };
    /**
     * Log a debug message (only shown when debug logging is enabled)
     * @param message - Message to log
     * @param data - Optional data to include
     */
    Logger.debug = function (message, data) {
        Logger.log(LogLevel.DEBUG, 'DEBUG', message, data);
    };
    /**
     * Log an info message
     * @param message - Message to log
     * @param data - Optional data to include
     */
    Logger.info = function (message, data) {
        Logger.log(LogLevel.INFO, 'INFO', message, data);
    };
    /**
     * Log a warning message
     * @param message - Message to log
     * @param data - Optional data to include
     */
    Logger.warn = function (message, data) {
        Logger.log(LogLevel.WARN, 'WARN', message, data);
    };
    /**
     * Log an error message
     * @param message - Message to log
     * @param data - Optional error data or Error object
     */
    Logger.error = function (message, data) {
        Logger.log(LogLevel.ERROR, 'ERROR', message, data);
        // Also show error notification for critical errors
        if (data instanceof Error) {
            vscode.window.showErrorMessage("SAS Dataset Viewer: ".concat(message));
        }
    };
    /**
     * Internal logging method
     * @param level - Log level
     * @param levelName - Log level name for display
     * @param message - Message to log
     * @param data - Optional data to include
     */
    Logger.log = function (level, levelName, message, data) {
        if (level < Logger.logLevel || !Logger.outputChannel) {
            return;
        }
        var timestamp = new Date().toISOString();
        var logMessage = "[".concat(timestamp, "] [").concat(levelName, "] ").concat(message);
        if (data !== undefined) {
            if (data instanceof Error) {
                logMessage += "\nError: ".concat(data.message, "\nStack: ").concat(data.stack);
            }
            else if (typeof data === 'object') {
                logMessage += "\nData: ".concat(JSON.stringify(data, null, 2));
            }
            else {
                logMessage += "\nData: ".concat(data);
            }
        }
        Logger.outputChannel.appendLine(logMessage);
    };
    /**
     * Show the output channel (useful for debugging)
     */
    Logger.show = function () {
        if (Logger.outputChannel) {
            Logger.outputChannel.show();
        }
    };
    /**
     * Clear the output channel
     */
    Logger.clear = function () {
        if (Logger.outputChannel) {
            Logger.outputChannel.clear();
        }
    };
    /**
     * Dispose of the logger and clean up resources
     */
    Logger.dispose = function () {
        if (Logger.outputChannel) {
            Logger.outputChannel.dispose();
        }
    };
    /**
     * Create a scoped logger for a specific component
     * @param scope - Component name or scope identifier
     * @returns Object with scoped logging methods
     */
    Logger.createScoped = function (scope) {
        return {
            debug: function (message, data) { return Logger.debug("[".concat(scope, "] ").concat(message), data); },
            info: function (message, data) { return Logger.info("[".concat(scope, "] ").concat(message), data); },
            warn: function (message, data) { return Logger.warn("[".concat(scope, "] ").concat(message), data); },
            error: function (message, data) { return Logger.error("[".concat(scope, "] ").concat(message), data); }
        };
    };
    Logger.logLevel = LogLevel.INFO;
    return Logger;
}());
exports.Logger = Logger;
