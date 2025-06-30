/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useGetTeamMembers.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useGetTeamMembers = (userId: string) => {
  const fetchTeamMembers = async () => {
    if (!userId) return null;

    const response = await axios.get(
      `https://task-management-server-rouge-tau.vercel.app/api/auth/getTeamMembers/${userId}`
    );
    return response.data;
  };

  const {
    data: teamMembersData,
    isLoading: isLoadingTeamMembers,
    error: teamMembersError,
    refetch: refetchTeamMembers,
  } = useQuery({
    queryKey: ["teamMembers", userId],
    queryFn: fetchTeamMembers,
    enabled: !!userId,
  });

  console.log("teamMembersData", teamMembersData);

  return {
    teamMembersData,
    isLoadingTeamMembers,
    teamMembersError,
    refetchTeamMembers,
    // Extract specific data for easier access
    existingTeamMembers: teamMembersData?.data?.teamMembers?.users || [],
    existingAdminMembers: teamMembersData?.data?.teamMembers?.admins || [],
    allTeamMembers: teamMembersData?.data?.teamMembers?.all || [],
    teamMembersCounts: teamMembersData?.data?.counts || {},
  };
};

export default useGetTeamMembers;
