import MainForm from "@/components/LoginSignupForm/MainForm";
import React from "react";

const Home = () => {

  



  return (
    <div className=" h-screen w-full flex justify-center items-center">
      <div className=" bg-gray-100 w-[80%] sm:w-[60%] md:w-[50%] xl:w-[40%] min-h-[60%] p-4">
        <MainForm />
      </div>
    </div>
  );
};

export default Home;
