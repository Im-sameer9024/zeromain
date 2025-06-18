import AllTask from "@/components/Dashboard/AllTask";
import AllTaskBar from "@/components/Dashboard/AllTaskBar";
import React from "react";

const AdminDashboardPage = () => {
  return (
    <div className=" px-4 overflow-y-scroll h-[500px] relative">
      {/*----------------------- dashboard bar ----------------------------- */}

      <AllTaskBar />

      {/*-------------------- user's information table ----------------------------- */}

      <AllTask />
    </div>
  );
};

export default AdminDashboardPage;
