import UserBar from '@/components/Users/UserBar'
import UsersTable from '@/components/Users/UsersTable'
import React from 'react'

const page = () => {
  return (
    <div className=" p-4 overflow-y-scroll h-[500px] relative">
      {/*----------------------- User bar ----------------------------- */}
      <UserBar />

      {/*-------------------- user's information table ----------------------------- */}

      <UsersTable />
    </div>
  )
}

export default page
