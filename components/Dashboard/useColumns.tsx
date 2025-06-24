import { useAppContext } from "@/context/AppContext";

interface columnsProps {
  header: string;
  accessor: string;
  classes?: string;
} 
 
 const useColumns = () => {

  const { cookieData,  } = useAppContext();

  

  const CreatedColumns: columnsProps[] = [
    {
      header: "",
      accessor: "status",
      classes: "hidden md:table-cell text-center",
    },
    {
      header: "Name",
      accessor: "name",
      classes: "font-bold text-md text-text",
    },
    {
      header: "Assign To",
      accessor: "assignBy",
      classes: "hidden md:table-cell font-bold text-md text-text text-center",
    },
    {
      header: "Action",
      accessor: "action",
      classes: "hidden lg:table-cell font-bold text-md text-text text-center",
    },
    {
      header: "Time",
      accessor: "time",
      classes: "hidden lg:table-cell font-bold text-md text-text text-center",
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      classes: "font-bold text-md text-text text-center",
    },
    {
      header: "Tags",
      accessor: "tags",
      classes: "font-bold text-md text-text text-center",
    },
    ...(cookieData?.role === "Admin"
      ? [
          {
            header: "Actions",
            accessor: "actions",
            classes: "font-bold text-md text-text text-center",
          },
        ]
      : []),
  ];

  const AssignedColumns: columnsProps[] = [
    {
      header: "",
      accessor: "status",
      classes: "hidden md:table-cell text-center",
    },
    {
      header: "Name",
      accessor: "name",
      classes: "font-bold text-md text-text",
    },
    {
      header: "Assign To",
      accessor: "assignBy",
      classes: "hidden md:table-cell font-bold text-md text-text text-center",
    },
    {
      header: "Action",
      accessor: "action",
      classes: "hidden lg:table-cell font-bold text-md text-text text-center",
    },
     {
      header: "Time",
      accessor: "time",
      classes: "hidden lg:table-cell font-bold text-md text-text text-center",
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      classes: "font-bold text-md text-text text-center",
    },
    {
      header: "Tags",
      accessor: "tags",
      classes: "font-bold text-md text-text text-center",
    },
    ...(cookieData?.role === "Admin"
      ? [
          {
            header: "Actions",
            accessor: "actions",
            classes: "font-bold text-md text-text text-center",
          },
        ]
      : []),
  ];

   return {
CreatedColumns,AssignedColumns
   }
 }
 
 export default useColumns
 


 
 
 