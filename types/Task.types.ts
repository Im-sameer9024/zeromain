export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TagDataProps {
  id: string;
  name: string;
  color: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileUrl: string;
  taskId: string;
  uploadedAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  userId: string | null;
  adminId: string | null;
  expectedTime: number;
  requiresFeedback: boolean;
  completedAt: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
  totalTimeInSeconds: 0;
  assignedToUser:User |null
  assignedToAdmin:Admin | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TaskDataProps {
  id: string;
  title: string;
  description: string;
  dueDate: string; // or use Date if you'll parse it
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"; // enum for possible statuses
  adminId: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  totalTimeInSeconds: number;
  createdByAdmin: Admin | null;
  createdByUser: User | null;
  attachments: Attachment[];
  subtasks: Subtask[];
  tags: Tag[];
}
