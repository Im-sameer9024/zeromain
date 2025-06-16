import DashboardBar from "@/components/Dashboard/DashboardBar";
import DashboardUsers from "@/components/Dashboard/DashboardUser";
import React from "react";

const AdminDashboardPage = () => {
  return (
    <div className=" px-4 overflow-y-scroll h-[500px] relative">
      {/*----------------------- dashboard bar ----------------------------- */}

      <DashboardBar />

       {/*-------------------- user's information table ----------------------------- */}

      <DashboardUsers />
    </div>
  );
};

export default AdminDashboardPage;
