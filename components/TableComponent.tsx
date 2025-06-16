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
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableCell  key={col.accessor} className={col.classes}>
              {col.header}
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 && data.map((item) => renderRow(item))}
      </TableBody>
    </Table>
  );
};

export default TableComponent;
