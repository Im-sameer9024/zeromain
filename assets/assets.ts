import { TagDataProps } from "@/types/Task.types";
export interface userTableDataProps {
  id: number;
  name: string;
  email: string;
  priority: string;
  teamMembers: string;
}


export const tagsTableData:TagDataProps[] = [
  {
    id: "1",
    name: "#tag1",
    color: "#EA916EFF",
  },
  {
    id: "2",
    name: "#tag2",
    color: "#22CCB2FF",
  }
]



export const userTableData: userTableDataProps[] = [
  {
    id: 1,
    name: "John Doe",
    email: "johndoe@gmail.com",
    priority: "1",
    teamMembers: "3",
  },
  {
    id: 2,
    name: "John Doe",
    email: "johndoe@gmail.com",
    priority: "1",
    teamMembers: "3",
  },
  {
    id: 3,
    name: "John Doe",
    email: "johndoe@gmail.com",
    priority: "1",
    teamMembers: "3",
  },
];
