import TagBar from "@/components/Dashboard/AllTaskComponents/TagComponents/TagBar";
import TagsTable from "@/components/Dashboard/AllTaskComponents/TagComponents/TagsTable";
import React from "react";

const TagsPage = () => {
  return (
    <div className=" px-4 overflow-y-scroll h-[500px] relative">
      {/*------------------- Tag Bar ------------------------------ */}
      <TagBar />

      {/*-------------------- user's information table ----------------------------- */}
      <div className=" mt-8">
        <h2 className=" font-bold text-2xl ">Tags</h2>
        <TagsTable />
      </div>
    </div>
  );
};

export default TagsPage;
