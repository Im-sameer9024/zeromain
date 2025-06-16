import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./ui/table";

interface Column {
  header: string;
  accessor: string;
  classes?: string;
}

interface TableComponentProps<T> {
  columns: Column[];
  renderRow: (item: T) => React.ReactNode;
  data: T[];
}

const TableComponent = <T,>({
  columns,
  renderRow,
  data,
}: TableComponentProps<T>) => {
  return (
    <div className="grid grid-rows-auto h-[400px] overflow-hidden border rounded-lg">
      {/* Header */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.accessor} className={col.classes}>
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Scrollable Body */}
      <div className="overflow-y-auto">
        <Table>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => renderRow(item))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableComponent;