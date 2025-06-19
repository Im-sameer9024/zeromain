"use client";

import TableComponent from "@/components/TableComponent";
import { TableCell, TableRow } from "@/components/ui/table";
import { CiEdit } from "react-icons/ci";
import useGetTags from "../../Hooks/useGetTags";
import { useAppContext } from "@/context/AppContext";
import useDeleteTag from "../../Hooks/useDeleteTag";
import Popup from "@/components/Modal/Popup";
import UpdateTagForm from "./UpdateTagForm";
import { useEffect, useTransition } from "react";
import { TagDataProps } from "@/types/Task.types";

interface ColumnProps {
  header: string;
  accessor: string;
  classes?: string;
}

const columns: ColumnProps[] = [
  {
    header: "Tag name",
    accessor: "name",
    classes: "font-bold md:table-cell text-md text-text",
  },
  {
    header: "Color",
    accessor: "color",
    classes: "hidden md:table-cell font-bold text-md text-text",
  },
  {
    header: "Action",
    accessor: "action",
    classes: "hidden md:table-cell font-bold text-md text-text text-center",
  },
];

const TagsTable = () => {
 const { allTags, isLoading, isError, error,refetchTags } = useGetTags();
  const { setOpen, setTagId,open } = useAppContext();
  const { mutate: deleteTag } = useDeleteTag();

  const[isPending,startTransition] = useTransition()

  const handleEditTag = (id: string) => {
    setTagId(id);
    setOpen(true);
  };

  const handleDeleteTag = (id: string) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      deleteTag(id);
    }
  };

    useEffect(() => {
      startTransition(() => {
        refetchTags();
      });
    }, [refetchTags]);


    if(isPending){
     <div className="bg-[#fafafbe9] p-1 rounded-md mt-10 h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">Loading Tags...</div>
      </div>
  }


  if (isLoading) {
    return (
      <div className="bg-[#fafafbe9] p-1 rounded-md mt-10 h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">Loading Tags...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#fafafbe9] p-1 rounded-md mt-10 h-64 flex items-center justify-center">
        <div className="text-center text-red-500">{error instanceof Error ? error.message : String(error)}</div>
      </div>
    );
  }



  const renderRow = (item: TagDataProps) => (
    <TableRow
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <TableCell className="gap-4">{item.name}</TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex justify-center">
          <div
            style={{ backgroundColor: item.color }}
            className="w-8 h-8 rounded"
          ></div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell text-center">
        <div className="flex gap-2 justify-center">
          <button onClick={() => handleDeleteTag(item.id)} className="bg-transparent border border-[#513600FF] hover:bg-red-500 hover:text-white hover:cursor-pointer font-medium text-[#513600FF] text-xs rounded p-1">
            Delete
          </button>
          <button
            onClick={() => handleEditTag(item.id)}
            className="flex items-center gap-1 bg-transparent border border-[#513600FF] hover:bg-gray-500 hover:text-white hover:cursor-pointer font-medium text-[#513600FF] text-xs rounded p-1"
          >
            <CiEdit />
            Edit
          </button>
        </div>
      </TableCell>
    </TableRow>
  );



  if (isError) {
    return (
      <div className="bg-[#fafafbe9] p-1 rounded-md mt-2 w-1/2 h-64 flex items-center justify-center">
        <div className="text-center text-red-500">
          {error instanceof Error ? error.message : "Failed to load tags"}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafbe9] p-1 rounded-md mt-2 w-1/2">
      {allTags.length === 0 ? (
        <div className="text-center text-gray-500 h-64 flex items-center justify-center">
          No Tags Found
        </div>
      ) : (
        <div>
          <TableComponent
          columns={columns}
          data={allTags}
          renderRow={renderRow}
        />
        <Popup 
        openModal={open} 
        content={<UpdateTagForm />} 
      />
        </div>
      )}
    </div>
  );
};

export default TagsTable;
