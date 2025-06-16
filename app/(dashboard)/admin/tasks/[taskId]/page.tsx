import SingleTask from "@/components/Dashboard/AllTaskComponents/SingleTask";
import React from "react";

type paramsProps = {
  params: Promise<{ taskId: string }>;
};

const page = async ({ params }: paramsProps) => {
  const { taskId } = await params;
  return (
    <div>
      <SingleTask taskId={taskId} />
    </div>
  )
}

export default page
