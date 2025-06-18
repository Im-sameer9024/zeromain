"use client";


import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Popup from "@/components/Modal/Popup";
import { useAppContext } from "@/context/AppContext";
import AddTagForm from "./AddTagForm";

const TagBar = () => {

    const{openAddModal,setOpenAddModal} = useAppContext()


  return (
    <>
      <div className=" flex sticky z-30 bg-white top-0 py-4 justify-between items-center px-8 ">
        {/*------------------- left side section ------------------  */}
        <div className=" flex items-center gap-8">
          <h2 className=" font-bold text-xl text-center">Tag Management</h2>

          {/* -------------- Add task btn ------------------  */}
          <Button
            onClick={() => setOpenAddModal(true)}
            className=" bg-lightBtn hover:bg-darkBlueBtn hover:scale-95 hover:cursor-pointer"
          >
            <Plus />
            Add Tag
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

      <Popup openModal={openAddModal} content={<AddTagForm />} />

    
    </>
  );
};

export default TagBar;
