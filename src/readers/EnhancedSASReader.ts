/**
 * Enhanced SAS7BDAT Reader
 * Wrapper around js-stream-sas7bdat with fixes and additional features
 */

import { DatasetSas7BDat } from 'js-stream-sas7bdat';
import * as path from 'path';

export interface VariableMetadata {
    name: string;
    label: string;
    type: string;
    length: number;
    format?: string;
}

export interface DatasetMetadata {
    rowCount: number;
    columnCount: number;
    variables: VariableMetadata[];
    encoding?: string;
    createdDate?: Date;
    modifiedDate?: Date;
    label?: string;
}

export interface UniqueValueResult {
    value: any;
    count: number;
}

export interface DataRow {
    [key: string]: any;
}

export class EnhancedSASReader {
    private dataset: any;
    private metadata: any;
    private filePath: string;
    private dataCache: any[][] | null = null;

    constructor(filePath: string) {
        this.filePath = filePath;
        this.dataset = new DatasetSas7BDat(filePath);
    }

    /**
     * Get enhanced metadata with proper structure
     */
    async getMetadata(): Promise<DatasetMetadata> {
        if (!this.metadata) {
            this.metadata = await this.dataset.getMetadata();
        }

        return {
            rowCount: this.metadata.records || 0,
            columnCount: this.metadata.columns?.length || 0,
            variables: this.metadata.columns?.map((col: any) => ({
                name: col.name,
                label: col.label || col.name, // Use name if label not available
                type: col.dataType,
                length: col.length,
                format: col.displayFormat || col.format // Try to get format
            })) || [],
            encoding: this.metadata.encoding,
            createdDate: this.metadata.datasetJSONCreationDateTime ?
                new Date(this.metadata.datasetJSONCreationDateTime) : undefined,
            modifiedDate: this.metadata.dbLastModifiedDateTime ?
                new Date(this.metadata.dbLastModifiedDateTime) : undefined,
            label: this.metadata.label || this.metadata.name || path.basename(this.filePath, '.sas7bdat')
        };
    }

    /**
     * Get data as array of objects (like Python implementation)
     */
    async getData(options?: {
        startRow?: number;
        numRows?: number;
        variables?: string[];
    }): Promise<DataRow[]> {
        // Get raw data (array of arrays)
        const rawData = await this.dataset.getData({ filterColumns: [] });

        if (!this.metadata) {
            this.metadata = await this.dataset.getMetadata();
        }

        const columns = this.metadata.columns;
        let result: DataRow[] = [];

        // Convert array of arrays to array of objects
        for (let i = 0; i < rawData.length; i++) {
            const row: DataRow = {};
            for (let j = 0; j < columns.length; j++) {
                row[columns[j].name] = rawData[i][j];
            }
            result.push(row);
        }

        // Apply filtering
        if (options) {
            // Variable selection
            if (options.variables && options.variables.length > 0) {
                result = result.map(row => {
                    const filteredRow: DataRow = {};
                    options.variables!.forEach(varName => {
                        if (varName in row) {
                            filteredRow[varName] = row[varName];
                        }
                    });
                    return filteredRow;
                });
            }

            // Row selection
            const startRow = options.startRow || 0;
            const endRow = options.numRows ?
                Math.min(startRow + options.numRows, result.length) :
                result.length;

            result = result.slice(startRow, endRow);
        }

        return result;
    }

    /**
     * Get raw data (array of arrays) for performance
     */
    async getRawData(): Promise<any[][]> {
        if (!this.dataCache) {
            this.dataCache = await this.dataset.getData({ filterColumns: [] });
        }
        return this.dataCache || [];
    }

    /**
     * Get unique values for a single column (FIXED)
     */
    async getUniqueValues(
        columnName: string,
        includeCount: boolean = false
    ): Promise<any[] | UniqueValueResult[]> {

        if (!this.metadata) {
            this.metadata = await this.dataset.getMetadata();
        }

        // Find column index
        const colIndex = this.metadata.columns.findIndex(
            (col: any) => col.name === columnName
        );

        if (colIndex === -1) {
            throw new Error(`Column '${columnName}' not found`);
        }

        // Get data
        const data = await this.getRawData();

        if (includeCount) {
            // Count occurrences
            const countMap = new Map<any, number>();
            for (const row of data) {
                const value = row[colIndex];
                countMap.set(value, (countMap.get(value) || 0) + 1);
            }

            // Convert to array with counts
            return Array.from(countMap.entries()).map(([value, count]) => ({
                value,
                count
            }));
        } else {
            // Just unique values
            const uniqueSet = new Set(data.map(row => row[colIndex]));
            return Array.from(uniqueSet);
        }
    }

    /**
     * Get unique combinations for multiple columns (NODUPKEY equivalent)
     */
    async getUniqueCombinations(
        columnNames: string[],
        includeCount: boolean = false
    ): Promise<any[][]> {

        if (!this.metadata) {
            this.metadata = await this.dataset.getMetadata();
        }

        // Find column indices
        const indices = columnNames.map(name => {
            const idx = this.metadata.columns.findIndex(
                (col: any) => col.name === name
            );
            if (idx === -1) {
                throw new Error(`Column '${name}' not found`);
            }
            return idx;
        });

        // Get data
        const data = await this.getRawData();

        if (includeCount) {
            // Count occurrences of combinations
            const countMap = new Map<string, { values: any[], count: number }>();

            for (const row of data) {
                const values = indices.map(i => row[i]);
                const key = JSON.stringify(values);

                if (countMap.has(key)) {
                    countMap.get(key)!.count++;
                } else {
                    countMap.set(key, { values, count: 1 });
                }
            }

            // Return with column names and counts
            const result = Array.from(countMap.values()).map(item => {
                const row: any = {};
                columnNames.forEach((name, i) => {
                    row[name] = item.values[i];
                });
                row['_count'] = item.count;
                return row;
            });

            return result;
        } else {
            // Just unique combinations
            const uniqueSet = new Set<string>();
            const uniqueValues: any[][] = [];

            for (const row of data) {
                const values = indices.map(i => row[i]);
                const key = JSON.stringify(values);

                if (!uniqueSet.has(key)) {
                    uniqueSet.add(key);
                    uniqueValues.push(values);
                }
            }

            return uniqueValues;
        }
    }

    /**
     * Apply WHERE clause filtering (basic implementation)
     */
    async getFilteredData(whereClause: string): Promise<DataRow[]> {
        const data = await this.getData();

        // Basic WHERE clause parser (enhance as needed)
        // Examples: "age > 30", "name = 'John'", "age > 30 AND gender = 'M'"

        // This is a simple implementation - enhance based on needs
        const condition = this.parseWhereClause(whereClause);

        return data.filter(row => this.evaluateCondition(row, condition));
    }

    private parseWhereClause(where: string): any {
        // Simple parser - extend as needed
        // For now, handle basic comparisons
        const match = where.match(/(\w+)\s*([><=!]+)\s*(.+)/);
        if (match) {
            const [, field, operator, value] = match;
            return { field, operator, value: this.parseValue(value.trim()) };
        }
        return null;
    }

    private parseValue(value: string): any {
        // Remove quotes if string
        if (value.startsWith("'") && value.endsWith("'")) {
            return value.slice(1, -1);
        }
        // Try to parse as number
        const num = Number(value);
        return isNaN(num) ? value : num;
    }

    private evaluateCondition(row: DataRow, condition: any): boolean {
        if (!condition) return true;

        const { field, operator, value } = condition;
        const fieldValue = row[field];

        switch (operator) {
            case '=':
            case '==':
                return fieldValue == value;
            case '!=':
            case '<>':
                return fieldValue != value;
            case '>':
                return fieldValue > value;
            case '<':
                return fieldValue < value;
            case '>=':
                return fieldValue >= value;
            case '<=':
                return fieldValue <= value;
            default:
                return true;
        }
    }

    /**
     * Get column info for UI display
     */
    async getColumnInfo(columnName: string): Promise<{
        name: string;
        type: string;
        uniqueCount: number;
        sampleValues: any[];
        isNumeric: boolean;
        isCategorical: boolean;
    }> {
        const metadata = await this.getMetadata();
        const variable = metadata.variables.find(v => v.name === columnName);

        if (!variable) {
            throw new Error(`Column '${columnName}' not found`);
        }

        const uniqueValues = await this.getUniqueValues(columnName);
        const isNumeric = variable.type === 'double' || variable.type === 'float' || variable.type === 'integer';

        // Consider categorical if string or if numeric with few unique values
        const isCategorical = !isNumeric || (isNumeric && uniqueValues.length < 20);

        return {
            name: columnName,
            type: variable.type,
            uniqueCount: uniqueValues.length,
            sampleValues: uniqueValues.slice(0, 10),
            isNumeric,
            isCategorical
        };
    }

    /**
     * Close and cleanup
     */
    dispose(): void {
        this.dataCache = null;
        this.metadata = null;
    }
}