"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useTransition } from "react";

const UserPage = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      router.push("/admin/dashboard");
    });
  }, [router]);

  return (
    <div className=" flex justify-center items-center h-screen">
      {isPending && <div className=" text-4xl text-black">Loading...</div>}
    </div>
  );
};

export default UserPage;
