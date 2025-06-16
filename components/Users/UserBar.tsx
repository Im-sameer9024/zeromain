"use client";


import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AddUserForm from "./AddUserForm";
import Popup from "@/components/Modal/Popup";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAppContext } from "@/context/AppContext";
// import Popup from '@/components/Modal/Popup';

const UserBar = () => {
  const { open, setOpen } = useAppContext();

  return (
    <>
      <div className=" sticky z-30 bg-white top-0 py-4 flex justify-between items-center px-8 ">
        {/*------------------- left side section ------------------  */}
        <div className=" flex items-center gap-2">
          {/*--------------- dropdown-----------------  */}
          <div>
            <Select>
              <SelectTrigger className="w-[180px] hover:cursor-pointer">
                <SelectValue
                  placeholder="Select Task"
                  className="text-black text-xl"
                />
              </SelectTrigger>
              <SelectContent className=" hover:cursor-pointer">
                <SelectGroup>
                  <SelectItem value="Created Task">Created Task</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
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
            Add User
          </Button>
        </div>

        {/*------------------- right side section ------------------  */}
        <div className=" flex relative">
          <Search className=" absolute top-1/2 -translate-y-1/2 left-2 text-text" />
          <Input
            placeholder="Search by email"
            type="email"
            className=" !border rounded-md p-2 pl-10 w-full"
          />
        </div>
      </div>

      {/*------------------Add task Pop up -------------------  */}

      <Popup openModal={open} content={<AddUserForm />} />
    </>
  );
};

export default UserBar;
