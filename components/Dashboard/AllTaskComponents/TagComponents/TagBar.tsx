"use client";

import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Popup from "@/components/Modal/Popup";
import { useAppContext } from "@/context/AppContext";
import AddTagForm from "./AddTagForm";
import { useEffect, useState } from "react";
import { useDebounce } from "@/components/Users/Hooks/useDebounce";

const TagBar = () => {
  const { openAddModal, setOpenAddModal, setTagSearchQuery } = useAppContext();
  const [inputValue, setInputValue] = useState("");

  // Using debounce to optimize search (500ms delay)
  const debouncedSearchTerm = useDebounce(inputValue, 500);

  useEffect(() => {
    setTagSearchQuery(debouncedSearchTerm);
  }, [debouncedSearchTerm, setTagSearchQuery]);

  return (
    <>
      <div className="flex sticky z-30 bg-white top-0 py-4 justify-between items-center px-8">
        {/* Left side section */}
        <div className="flex items-center gap-8">
          <h2 className="font-bold text-xl text-center">Tag Management</h2>

          {/* Add tag button */}
          <Button
            onClick={() => setOpenAddModal(true)}
            className="bg-lightBtn hover:bg-darkBlueBtn hover:scale-95 hover:cursor-pointer"
          >
            <Plus />
            Add Tag
          </Button>
        </div>

        {/* Right side section - Search bar */}
        <div className="flex relative">
          <Search className="absolute top-1/2 -translate-y-1/2 left-2 text-text" />
          <Input
            placeholder="Search by tag name"
            className="!border rounded-md p-2 pl-10 w-full"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
      </div>

      {/* Add tag Pop up */}
      <Popup openModal={openAddModal} content={<AddTagForm />} />
    </>
  );
};

export default TagBar;