// --- File: components/ui/GenericTable.jsx ---

import { TableLoader } from './Loading';

/**
 * Generic Table Component
 * Props:
 *  - columns: Array<{ label: string, accessor: string, className?: string }>
 *  - data: Array<object>
 *  - renderCell?: (row: object, accessor: string) => ReactNode
 *  - loading?: boolean
 *  - loadingRows?: number
 */

const GenericTable = ({ columns = [], data = [], renderCell, loading = false, loadingRows = 5 }) => {
  console.log(columns)
  
  if (loading) {
    return <TableLoader rows={loadingRows} columns={columns.length} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
      <table className="table-fixed min-w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap ${col.className || ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-gray-100 hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                      key={col.accessor}
                      className={`px-6 py-3 text-sm truncate max-w-[200px] ${col.cellClass || ""}`}
                    >
                      {col.accessor === "status" ? (
                        <span
                          className="inline-block px-3 py-1 rounded-[8px] text-center text-sm bg-[#EBE8F2] w-[120px] h-[32px]"
                          style={{ color: "#120F1A" }}
                        >
                          {renderCell ? renderCell(row, col.accessor) :
                            (typeof row[col.accessor] === 'object' && row[col.accessor] !== null
                              ? JSON.stringify(row[col.accessor])
                              : String(row[col.accessor] ?? ''))}
                        </span>
                      ) : (
                        <span
                          className={
                            ["time", "type", "date","items","creator", "procedure","actions","token","ageGender","dosage","frequency","duration","notes","section"].includes(col.accessor)
                              ? "text-[#69578F] text-400"
                              : "text-gray-900"
                          }
                        >
                          {renderCell ? renderCell(row, col.accessor) :
                            (typeof row[col.accessor] === 'object' && row[col.accessor] !== null
                              ? JSON.stringify(row[col.accessor])
                              : String(row[col.accessor] ?? ''))}
                        </span>
                      )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-400">
                No data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GenericTable;
