"use client";

import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AddUserForm from "./AddUserForm";
import Popup from "@/components/Modal/Popup";
import { useAppContext } from "@/context/AppContext";
import { useEffect, useState } from "react";
import { useDebounce } from "./Hooks/useDebounce";

const UserBar = () => {
  const { openAddModal, setOpenAddModal, setSearchQuery } = useAppContext();
  const [inputValue, setInputValue] = useState("");

  // Using debounce to optimize search
  const debouncedSearchTerm = useDebounce(inputValue, 500);

  useEffect(() => {
    setSearchQuery(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchQuery]);

  return (
    <>
      <div className="sticky z-30 bg-white top-0 py-4 flex justify-between items-center px-8">
        {/* Left side section */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setOpenAddModal(true)}
            className="bg-lightBtn hover:bg-darkBlueBtn hover:scale-95 hover:cursor-pointer"
          >
            <Plus />
            Add User
          </Button>
        </div>

        {/* Right side section - Search bar */}
        <div className="flex relative">
          <Search className="absolute top-1/2 -translate-y-1/2 left-2 text-text" />
          <Input
            placeholder="Search by email"
            type="email"
            className="!border rounded-md p-2 pl-10 w-full"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
      </div>

      {/* Add task Pop up */}
      <Popup openModal={openAddModal} content={<AddUserForm />} />
    </>
  );
};

export default UserBar;