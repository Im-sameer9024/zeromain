"use client";


import { Funnel, Plus, SortDescIcon, Table, User } from "lucide-react";
import { FaEllipsisH } from "react-icons/fa";
import { Button } from "../ui/button";
import { useAppContext } from "@/context/AppContext";
import Popup from "../Modal/Popup";
import AddTaskForm from "./AllTaskComponents/AddTaskForm";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const DashboardBar = () => {

    const{open,setOpen,selectedTasksType, setSelectedTasksType} = useAppContext()




  return (
    <>
      <div className=" flex justify-between items-center px-8 sticky z-30 bg-white py-4 top-0">
        {/*------------------- left side section ------------------  */}
        <div className=" flex items-center gap-8">
          {/*--------------- dropdown-----------------  */}
          <div>
            <Select value={selectedTasksType} onValueChange={(value: "Created" | "Assigned") => setSelectedTasksType(value)}>
              <SelectTrigger className=" !text-2xl font-bold hover:cursor-pointer border-none outline-none shadow-none">
                <SelectValue
                  className="text-black  "
                />
              </SelectTrigger>
              <SelectContent className=" hover:cursor-pointer ">
                <SelectGroup>
                  
                  <SelectItem value="Created">Created Task</SelectItem>
                  <SelectItem value="Assigned">Assigned Task</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* -------------- Add task btn ------------------  */}
          <Button
            onClick={() => setOpen(true)}
            className=" bg-lightBtn hover:bg-darkBlueBtn hover:scale-95 hover:cursor-pointer"
          >
            <Plus />
            Add task
          </Button>
        </div>

        {/*------------------- right side section ------------------  */}
        <div className=" flex items-center justify-between gap-4">
          {/*------------------ tickets ------------ */}

          <Button  className="  !bg-transparent hover:bg-transparent text-text hover:scale-95 hover:cursor-pointer">
            <User />
            <span>My tickets</span>
          </Button>

          {/*------------------- Filters --------------------- */}

          <Button className=" !bg-transparent hover:bg-transparent text-text hover:scale-95 hover:cursor-pointer">
            <Funnel />
            <span>Filter</span>
          </Button>

          {/*----------------- Sort -------------------------- */}
          <Button className=" !bg-transparent hover:bg-transparent text-text hover:scale-95 hover:cursor-pointer">
            <SortDescIcon />
            <span>Filter</span>
          </Button>

          {/*----------------- Table -------------------------- */}
          <Button className=" !bg-transparent hover:bg-transparent text-text hover:scale-95 hover:cursor-pointer">
            <Table />
            <span>Table</span>
          </Button>

          {/*----------------- Ellipsis -------------------------- */}
          <FaEllipsisH className=" text-2xl text-text hover:cursor-pointer" />
        </div>
      </div>

      {/*------------------Add task Pop up -------------------  */}

      <Popup openModal={open} content={<AddTaskForm />} />
    </>
  );
};

export default DashboardBar;
