/**
 * XPT (SAS XPORT) File Reader
 * Wrapper around xport-js library for reading SAS Transport files
 */

import * as fs from 'fs';
import * as path from 'path';

// Type definitions for xport-js (since it doesn't have official types)
interface XportVariable {
    name: string;
    label: string;
    type: number;  // 1 = numeric, 2 = character
    length: number;
    format?: string;
    position: number;
}

interface XportMember {
    name: string;
    label?: string;
    type: string;
    created: Date;
    modified: Date;
    sasVersion: string;
    osType: string;
    variables: XportVariable[];
}

interface XportMetadata {
    version: number;
    osType: string;
    created: Date;
    modified: Date;
    members: XportMember[];
}

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

export interface DataRow {
    [key: string]: any;
}

export class XPTReader {
    private filePath: string;
    private metadata: DatasetMetadata | null = null;
    private allData: DataRow[] | null = null;
    private xportJs: any;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    /**
     * Load the xport-js library dynamically
     */
    private async loadXportJs(): Promise<any> {
        if (!this.xportJs) {
            try {
                this.xportJs = await import('xport-js');
            } catch (error) {
                throw new Error(`Failed to load xport-js library: ${error}`);
            }
        }
        return this.xportJs;
    }

    /**
     * Get metadata for the XPT file
     */
    async getMetadata(): Promise<DatasetMetadata> {
        if (this.metadata) {
            return this.metadata;
        }

        const xport = await this.loadXportJs();
        const fileBuffer = fs.readFileSync(this.filePath);

        try {
            // Parse the XPT file metadata
            const xptMetadata: XportMetadata = xport.getMetadata(fileBuffer);

            // XPT files can contain multiple members (datasets), we'll use the first one
            const member = xptMetadata.members[0];

            if (!member) {
                throw new Error('No datasets found in XPT file');
            }

            // Count rows by reading the data (XPT files are typically smaller)
            const records = await this.readAllRecords();

            this.metadata = {
                rowCount: records.length,
                columnCount: member.variables.length,
                variables: member.variables.map(v => ({
                    name: v.name,
                    label: v.label || v.name,
                    type: v.type === 1 ? 'number' : 'string',
                    length: v.length,
                    format: v.format
                })),
                createdDate: member.created,
                modifiedDate: member.modified,
                label: member.label || member.name
            };

            return this.metadata;
        } catch (error) {
            throw new Error(`Failed to read XPT metadata: ${error}`);
        }
    }

    /**
     * Read all records from the XPT file
     */
    private async readAllRecords(): Promise<DataRow[]> {
        if (this.allData) {
            return this.allData;
        }

        const xport = await this.loadXportJs();
        const fileBuffer = fs.readFileSync(this.filePath);

        try {
            const records: DataRow[] = [];

            // Use async iterator to read records
            for await (const record of xport.readRecords(fileBuffer)) {
                records.push(record);
            }

            this.allData = records;
            return records;
        } catch (error) {
            throw new Error(`Failed to read XPT records: ${error}`);
        }
    }

    /**
     * Get data with optional filtering and pagination
     */
    async getData(options?: {
        startRow?: number;
        numRows?: number;
        variables?: string[];
        whereClause?: string;
    }): Promise<DataRow[]> {
        const startRow = options?.startRow ?? 0;
        const numRows = options?.numRows ?? 100;
        const variables = options?.variables;
        const whereClause = options?.whereClause;

        // Read all records
        let records = await this.readAllRecords();

        // Apply WHERE clause filter if provided
        if (whereClause && whereClause.trim()) {
            records = this.applyFilter(records, whereClause);
        }

        // Apply pagination
        const paginatedRecords = records.slice(startRow, startRow + numRows);

        // Apply variable selection if provided
        if (variables && variables.length > 0) {
            return paginatedRecords.map(record => {
                const filtered: DataRow = {};
                for (const varName of variables) {
                    if (varName in record) {
                        filtered[varName] = record[varName];
                    }
                }
                return filtered;
            });
        }

        return paginatedRecords;
    }

    /**
     * Get count of rows matching a filter
     */
    async getFilteredRowCount(whereClause: string): Promise<number> {
        if (!whereClause || !whereClause.trim()) {
            const metadata = await this.getMetadata();
            return metadata.rowCount;
        }

        const records = await this.readAllRecords();
        const filtered = this.applyFilter(records, whereClause);
        return filtered.length;
    }

    /**
     * Apply WHERE clause filter to records
     */
    private applyFilter(records: DataRow[], whereClause: string): DataRow[] {
        if (!whereClause || !whereClause.trim()) {
            return records;
        }

        try {
            // Simple WHERE clause parser (supports basic conditions)
            // This is a simplified implementation - you may want to enhance it
            const condition = this.parseWhereClause(whereClause);
            return records.filter(record => this.evaluateCondition(record, condition));
        } catch (error) {
            console.error('Error applying filter:', error);
            return records;
        }
    }

    /**
     * Parse WHERE clause into a condition object
     */
    private parseWhereClause(whereClause: string): any {
        // Remove "WHERE" keyword if present
        const clause = whereClause.replace(/^\s*where\s+/i, '').trim();

        // Simple parser for basic conditions
        // Supports: variable = value, variable > value, variable < value, etc.
        const patterns = [
            { regex: /(\w+)\s*=\s*['"]([^'"]+)['"]/i, op: '=' },
            { regex: /(\w+)\s*=\s*(\d+(?:\.\d+)?)/i, op: '=' },
            { regex: /(\w+)\s*>\s*(\d+(?:\.\d+)?)/i, op: '>' },
            { regex: /(\w+)\s*<\s*(\d+(?:\.\d+)?)/i, op: '<' },
            { regex: /(\w+)\s*>=\s*(\d+(?:\.\d+)?)/i, op: '>=' },
            { regex: /(\w+)\s*<=\s*(\d+(?:\.\d+)?)/i, op: '<=' },
            { regex: /(\w+)\s*!=\s*['"]([^'"]+)['"]/i, op: '!=' },
            { regex: /(\w+)\s*!=\s*(\d+(?:\.\d+)?)/i, op: '!=' }
        ];

        for (const pattern of patterns) {
            const match = clause.match(pattern.regex);
            if (match) {
                return {
                    variable: match[1],
                    operator: pattern.op,
                    value: isNaN(Number(match[2])) ? match[2] : Number(match[2])
                };
            }
        }

        throw new Error(`Unsupported WHERE clause: ${whereClause}`);
    }

    /**
     * Evaluate a condition against a record
     */
    private evaluateCondition(record: DataRow, condition: any): boolean {
        const value = record[condition.variable];
        const targetValue = condition.value;

        switch (condition.operator) {
            case '=':
                return value == targetValue;
            case '>':
                return value > targetValue;
            case '<':
                return value < targetValue;
            case '>=':
                return value >= targetValue;
            case '<=':
                return value <= targetValue;
            case '!=':
                return value != targetValue;
            default:
                return false;
        }
    }

    /**
     * Get unique values for a column
     */
    async getUniqueValues(columnName: string, includeCount: boolean = false): Promise<any[]> {
        const records = await this.readAllRecords();
        const uniqueMap = new Map<any, number>();

        for (const record of records) {
            const value = record[columnName];
            uniqueMap.set(value, (uniqueMap.get(value) || 0) + 1);
        }

        if (includeCount) {
            return Array.from(uniqueMap.entries()).map(([value, count]) => ({ value, count }));
        } else {
            return Array.from(uniqueMap.keys());
        }
    }

    /**
     * Get unique combinations for multiple columns
     */
    async getUniqueCombinations(columnNames: string[], includeCount: boolean = false): Promise<any[]> {
        const records = await this.readAllRecords();
        const uniqueMap = new Map<string, any>();

        for (const record of records) {
            const values = columnNames.map(col => record[col]);
            const key = JSON.stringify(values);

            if (!uniqueMap.has(key)) {
                const combination: any = {};
                columnNames.forEach(col => {
                    combination[col] = record[col];
                });
                if (includeCount) {
                    combination._count = 1;
                }
                uniqueMap.set(key, combination);
            } else if (includeCount) {
                uniqueMap.get(key)._count++;
            }
        }

        return Array.from(uniqueMap.values());
    }

    /**
     * Dispose and cleanup resources
     */
    dispose(): void {
        this.allData = null;
        this.metadata = null;
    }
}
