/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useAppContext } from "@/context/AppContext";
import React, { useState } from "react";
import CommentsBox from "./CommentsBox";

interface CommentsWrapperProps {
  taskId: string;
}

const CommentsWrapper: React.FC<CommentsWrapperProps> = ({ taskId }) => {
  const { cookieData } = useAppContext();
  const [commentCount, setCommentCount] = useState(0);

  // Handle comment count changes
  const handleCommentChange = (count: number) => {
    setCommentCount(count);
  };

  // If no user data is available, show loading or login prompt
  if (!cookieData) {
    return (
      <div className="bg-white border rounded-lg p-4 max-w-4xl mx-auto">
        <div className="text-center py-8 text-gray-500">
          <p>Please log in to view and post comments.</p>
        </div>
      </div>
    );
  }

  // Transform cookieData to match CommentSystem's expected currentUser format
  const currentUser = {
    id: cookieData.id,
    name: cookieData?.name,
    email: cookieData?.email,
    role: cookieData.role?.toLowerCase() === "admin" ? "admin" : "user",
  };

  return (
    <div className="">
      <CommentsBox
        taskId={taskId}
        currentUser={currentUser}
        onCommentChange={handleCommentChange}
      />
    </div>
  );
};

export default CommentsWrapper;
