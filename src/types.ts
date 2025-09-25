export interface SASVariable {
    name: string;
    type: 'character' | 'numeric';
    label: string;
    format: string;
}

export interface SASMetadata {
    total_rows: number;
    total_variables: number;
    variables: SASVariable[];
    file_path: string;
}

export interface SASDataResponse {
    data: Array<Record<string, any>>;
    total_rows: number;
    filtered_rows: number;
    start_row: number;
    returned_rows: number;
    columns: string[];
}

export interface SASDataRequest {
    filePath: string;
    startRow: number;
    numRows: number;
    selectedVars?: string[];
    whereClause?: string;
}

export interface WebviewMessage {
    command: string;
    data?: any;
}

export interface FilterState {
    selectedVariables: string[];
    whereClause: string;
    variableOrder: string[];
}