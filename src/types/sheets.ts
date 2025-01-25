export interface SheetData {
  range: string;
  values: any[][];
}

export interface SheetError {
  message: string;
  code?: number;
}