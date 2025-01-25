import React from 'react';
import { SheetData } from '../types/sheets';
import { Table } from 'lucide-react';

interface SheetDisplayProps {
  data: SheetData | null;
  isLoading: boolean;
  error: string | null;
}

const SheetDisplay: React.FC<SheetDisplayProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data || !data.values || data.values.length === 0) {
    return (
      <div className="text-center p-8">
        <Table className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const [headers, ...rows] = data.values;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full table-fixed border-collapse">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header: string, index: number) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                style={{ width: `${100 / headers.length}%` }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {rows.map((row: any[], rowIndex: number) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell: any, cellIndex: number) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 text-sm text-gray-500 border-b border-gray-200 truncate"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SheetDisplay;