"use client";

import { Input } from "../ui/input";
import { Bell, Clock, Search, CheckCheck } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import useNavbar from "./Hooks/useNavbar";
import { useAppContext } from "@/context/AppContext";
import useLogout from "../LoginSignupForm/Hooks/useLogout";

const Navbar = () => {
  const { cookieData } = useAppContext();

  const {
    notifications,
    handleBellClick,
    handleNotificationClick,
    unreadCount,
    isModalOpen,
    markAllAsRead,
    loadMore,
    formatDate,
    error,
    markAsRead,
    loading,
    modalRef,
    pagination,
  } = useNavbar();

  const { LogOut } = useLogout();

  return (
    <>
      <div className="bg-white py-4 px-4 flex justify-between items-center border-b">
        <div className="w-3/12 relative ml-12">
          <Search
            size={18}
            className="absolute top-1/2 -translate-y-1/2 left-4 text-black"
          />
          <Input
            type="text"
            placeholder="Search..."
            className="bg-[#F3F4F6FF] pl-10 text-black"
          />
        </div>

        <div className="flex items-center gap-14">
          <Button className="bg-lightBtn hover:bg-darkBlueBtn hover:scale-95 hover:cursor-pointer">
            <Clock />
            Clock In
          </Button>
          <div className="flex items-center gap-4">
            <button
              onClick={handleBellClick}
              className="relative hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <Bell size={20} />
              <span
                className={`absolute top-4 right-1 text-white text-[8px] font-semibold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-1 ${
                  unreadCount > 0 ? "bg-lightBtn" : "bg-lightBtn"
                }`}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </button>
            <span className="bg-[#CED0F8FF] group rounded-full p-1">
              <Image
                src={"/images/user.jpg"}
                alt="userImage"
                width={40}
                height={40}
                className="rounded-full"
              />
              {cookieData && (
                <div className=" group-hover:block hidden absolute right-6 top-14 w-fit  bg-white z-40 space-y-2  shadow-lg rounded-lg p-3">
                  <p className=" text-center">{cookieData?.role}</p>
                  <Button onClick={LogOut} className=" hover:cursor-pointer ">
                    LogOut
                  </Button>
                </div>
              )}
            </span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0  bg-opacity-20 z-50 flex items-start justify-end pt-16 pr-4">
          <div
            ref={modalRef}
            className="bg-gray-100 rounded-lg shadow-2xl w-140 max-h-[80vh] flex flex-col border border-gray-200"
          >
            {unreadCount > 0 && (
              <div className="p-4 flex justify-end">
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  size="sm"
                  className="text-xs hover:bg-blue-50 bg-white"
                >
                  <CheckCheck size={14} className="mr-1" />
                  Mark All Read
                </Button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && notifications.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  Loading notifications...
                </div>
              ) : error ? (
                <div className="bg-white rounded-lg p-6 text-center text-red-500">
                  <div className="bg-red-50 p-4 rounded-lg">{error}</div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                  <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                      !notification.isRead ? "border-l-4 border-l-blue-500" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center">
                        <span className="w-6 h-6 rounded-full bg-gray-400"></span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p
                              className={`text-sm text-gray-800 leading-relaxed ${
                                !notification.isRead
                                  ? "font-medium"
                                  : "font-normal"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 text-end">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>

                          {!notification.isRead && (
                            <div className="ml-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                                title="Mark as read"
                              >
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {pagination.page < pagination.totalPages && (
              <div className="p-4">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  variant="outline"
                  className="w-full hover:bg-blue-50 bg-white"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      Loading...
                    </div>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
