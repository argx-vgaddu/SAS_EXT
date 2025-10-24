/**
 * XPT (SAS XPORT) File Reader
 * Wrapper around xport-js library for reading SAS Transport files
 */

import * as path from 'path';

// Type definitions for xport-js Library class
interface XportVariable {
    name: string;
    label: string;
    type: number;  // 1 = numeric, 2 = character
    length: number;
    format?: string;
    informat?: string;
}

interface XportDataset {
    name: string;
    label?: string;
    type: string;
    created: Date;
    modified: Date;
    sasVersion?: string;
    osType?: string;
    variables: XportVariable[];
    records?: number;
}

interface XportLibraryMetadata {
    version: number;
    osType?: string;
    created: Date;
    modified: Date;
    datasets: XportDataset[];
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
    private library: any = null;
    private usePythonFallback: boolean = false;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    /**
     * Check if file is XPORT V8 (not supported by xport-js)
     */
    private async isXportV8(): Promise<boolean> {
        try {
            const fs = await import('fs');
            const buffer = fs.readFileSync(this.filePath);
            const header = buffer.toString('latin1', 0, 80);
            // Check if header contains LIBV8 or LIBV9
            return header.includes('LIBV8') || header.includes('LIBV9');
        } catch (error) {
            console.error('[XPTReader] Error checking XPT version:', error);
            return false;
        }
    }

    /**
     * Initialize the xport-js Library instance
     */
    private async getLibrary(): Promise<any> {
        if (!this.library) {
            try {
                const Library = (await import('xport-js')).default;
                this.library = new Library(this.filePath);
            } catch (error) {
                throw new Error(`Failed to initialize xport-js library: ${error}`);
            }
        }
        return this.library;
    }

    /**
     * Get metadata for the XPT file
     */
    async getMetadata(): Promise<DatasetMetadata> {
        if (this.metadata) {
            return this.metadata;
        }

        try {
            const lib = await this.getLibrary();

            // Get metadata from the library
            console.log('[XPTReader] Calling lib.getMetadata()...');
            const xptMetadata = await lib.getMetadata();
            console.log('[XPTReader] Metadata received:', JSON.stringify(xptMetadata, null, 2));

            if (!xptMetadata) {
                throw new Error('getMetadata() returned null or undefined');
            }

            // XPT metadata structure may vary - check for datasets property
            let dataset: any;
            if (xptMetadata.datasets && xptMetadata.datasets.length > 0) {
                dataset = xptMetadata.datasets[0];
            } else if (Array.isArray(xptMetadata) && xptMetadata.length > 0) {
                dataset = xptMetadata[0];
            } else {
                // Maybe the metadata IS the dataset
                dataset = xptMetadata;
            }

            if (!dataset) {
                throw new Error('No datasets found in XPT metadata structure');
            }

            console.log('[XPTReader] Using dataset:', JSON.stringify(dataset, null, 2));

            // Count rows by reading the data (XPT files are typically smaller)
            const records = await this.readAllRecords();

            this.metadata = {
                rowCount: records.length,
                columnCount: dataset.variables?.length || 0,
                variables: (dataset.variables || []).map((v: any) => ({
                    name: v.name,
                    label: v.label || v.name,
                    type: v.type === 1 ? 'number' : 'string',
                    length: v.length,
                    format: v.format
                })),
                createdDate: dataset.created,
                modifiedDate: dataset.modified,
                label: dataset.label || dataset.name || 'Unknown'
            };

            return this.metadata;
        } catch (error) {
            console.error('[XPTReader] Error in getMetadata:', error);
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

        try {
            const lib = await this.getLibrary();
            const records: DataRow[] = [];

            console.log('[XPTReader] Starting to read records...');

            // Use async iterator to read records as objects
            for await (const record of lib.read({ rowFormat: 'object' })) {
                records.push(record);
            }

            console.log(`[XPTReader] Read ${records.length} records`);
            if (records.length > 0) {
                console.log('[XPTReader] First record sample:', JSON.stringify(records[0], null, 2));
            }

            this.allData = records;
            return records;
        } catch (error) {
            console.error('[XPTReader] Error reading records:', error);
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
