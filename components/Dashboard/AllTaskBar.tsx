"use client";

import { Eye, Table, User } from "lucide-react";
import { FaEllipsisH } from "react-icons/fa";
import { Button } from "../ui/button";
import { useAppContext } from "@/context/AppContext";
import Popup from "../Modal/Popup";
import AddTaskForm from "./AllTaskComponents/AddTaskForm";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CgBoard } from "react-icons/cg";

const DashboardBar = () => {
  const {
    open,
    setViewOfData,
  } = useAppContext();

  return (
    <>
      <div className=" flex justify-between items-center px-8 sticky z-30 bg-white py-4 top-0">
        {/*------------------- left side section ------------------  */}
        <div className=" flex items-center gap-8">
          {/*--------------- dropdown-----------------  */}
          <div>
            <span className="text-xl  font-bold">All Tasks</span>
          </div>

         
        </div>

        {/*------------------- right side section ------------------  */}
        <div className=" flex items-center justify-between gap-4">
          {/*------------------ tickets ------------ */}

          <Button className="  !bg-transparent hover:bg-transparent text-text hover:scale-95 hover:cursor-pointer">
            <User />
            <span>My tickets</span>
          </Button>

          {/*------------------- Filters --------------------- */}

          {/* <Button className=" !bg-transparent hover:bg-transparent text-text hover:scale-95 hover:cursor-pointer">
            <Funnel />
            <span>Filter</span>
          </Button> */}

          {/*----------------- Sort -------------------------- */}
          {/* <Popover>
            <PopoverTrigger asChild>
              <Button className=" !bg-transparent hover:bg-transparent text-text hover:scale-95 hover:cursor-pointer">
                <SortDescIcon />
                <span>Sort</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit">
              <div className=" flex flex-col gap-2">
                <Button
                  onClick={() => setFilterPriority("Low-High")}
                  className=" !bg-transparent hover:bg-transparent text-text hover:scale-95 hover:cursor-pointer"
                >
                  <span>Low-High Priority</span>
                </Button>
                <Button
                  onClick={() => setFilterPriority("High-Low")}
                  className=" !bg-transparent hover:bg-transparent text-text hover:scale-95 hover:cursor-pointer"
                >
                  <span>High-Low Priority</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover> */}

          {/*----------------- View -------------------------- */}
          <Popover>
            <PopoverTrigger asChild>
              <Button className=" !bg-transparent hover:bg-transparent text-text hover:scale-95 hover:cursor-pointer">
                <Eye />
                <span>View</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit">
              <div className=" flex flex-col gap-2">
                <Button
                  onClick={() => setViewOfData("Table")}
                  className=" !bg-transparent hover:bg-transparent text-text hover:scale-95 hover:cursor-pointer"
                >
                  <Table />
                  <span>Table View</span>
                </Button>
                <Button
                  onClick={() => setViewOfData("Board")}
                  className=" !bg-transparent hover:bg-transparent text-text hover:scale-95 hover:cursor-pointer"
                >
                  <CgBoard />
                  <span>Board View</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>

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
