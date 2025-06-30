/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useGetTeamMembers.ts
"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const useGetTeamMembers = (userId: string) => {
  const [teamMembersData, setTeamMembersData] = useState<any>(null);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] =
    useState<boolean>(false);
  const [teamMembersError, setTeamMembersError] = useState<any>(null);

  const fetchTeamMembers = async () => {
    if (!userId) {
      setTeamMembersData(null);
      return;
    }

    setIsLoadingTeamMembers(true);
    setTeamMembersError(null);

    try {
      const response = await axios.get(
        `https://task-management-server-rouge-tau.vercel.app/api/auth/getTeamMembers/${userId}`
      );
      setTeamMembersData(response.data);
    } catch (error) {
      setTeamMembersError(error);
    } finally {
      setIsLoadingTeamMembers(false);
    }
  };

  // Fetch team members when userId changes
  useEffect(() => {
    fetchTeamMembers();
  }, [userId]);

  // Function to manually refetch team members
  const refetchTeamMembers = () => {
    fetchTeamMembers();
  };

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
