"use client";

import TableComponent from "@/components/TableComponent";
import { TableCell, TableRow } from "@/components/ui/table";
import { CiEdit } from "react-icons/ci";
import { useAppContext } from "@/context/AppContext";
import { TagDataProps } from "@/types/Task.types";
import useGetTags from "../Hooks/useGetTags";

interface ColumnProps {
  header: string;
  accessor: string;
  classes?: string;
}

const columns: ColumnProps[] = [
  {
    header: "Tag name",
    accessor: "name",
    classes: "font-bold md:table-cell  text-md text-text ",
  },
  {
    header: "Color",
    accessor: "color",
    classes: "hidden md:table-cell font-bold text-md text-text ",
  },
  {
    header: "Action",
    accessor: "action",
    classes: "hidden md:table-cell font-bold text-md text-text text-center ",
  },
];

const TagsTable = () => {
  const { allTags } = useGetTags();
  const { cookieData } = useAppContext();

  const renderRow = (item: TagDataProps) => (
    <TableRow
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <TableCell className=" gap-4">{item.name}</TableCell>
      <TableCell className="hidden md:table-cell ">
       <div className=" flex justify-center ">
         <div style={{backgroundColor: item.color}} className={`w-8 h-8 rounded ${item.color}`}></div>
       </div>
      </TableCell>
      <TableCell className="hidden md:table-cell text-center">
        <div className="flex gap-2  justify-center">
          <button className="bg-transparent border border-[#513600FF] hover:bg-red-500 hover:text-white hover:cursor-pointer font-medium text-[#513600FF] text-xs rounded p-1">
            Delete
          </button>
          <button className="flex items-center gap-1 bg-transparent border border-[#513600FF] hover:bg-gray-500 hover:text-white hover:cursor-pointer font-medium text-[#513600FF] text-xs rounded p-1">
            <CiEdit />
            Edit
          </button>
        </div>
      </TableCell>
    </TableRow>
  );

  if (!cookieData) {
    return <div className="text-center text-gray-500 h-64">Loading user data...</div>;
  }

  

  return (
    <div className="bg-[#fafafbe9] p-1 rounded-md mt-2 w-1/2">
      {allTags.length === 0 ? (
        <div className="text-center text-gray-500 h-64">No Tags Found</div>
      ) : (
        <TableComponent
          columns={columns}
          data={allTags}
          renderRow={renderRow}
        />
      )}
    </div>
  );
};

export default TagsTable;