import Link from "next/link";
import Image from "next/image";
import SideBar from "@/components/SideBar/SideBar";
import Navbar from "@/components/Navbar/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex">
      {/* Left side  */}
      <div className="w-[14%] md:w-[8%] lg:w-[14%] xl:w-[16%] border-r  ">
        <Link href="/" className=" flex items-center gap-2 p-2 lg:p-4 ">
          <span className="">
            <Image
              src={"/images/logo.jpg"}
              alt=""
              width={100}
              height={100}
              className="w-10 rounded-md "
            />
          </span>
          <span className="hidden lg:block font-bold font-Inter ">
            Zero Dimensions
          </span>
        </Link>
        <SideBar />
      </div>

      {/* right side  */}
      <div className=" w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] ">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
