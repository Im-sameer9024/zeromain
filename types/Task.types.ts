

export interface TagDataProps{
    id:string,
    name:string,
    color:string,

}



 interface TagTypePropsFor {
  id: string;
  name: string;
  color: string;
  createdBy:string | null;
  createdAt?: string;
  updatedAt?: string;
};

export interface TaskFormValuesProps {
  title: string;
  description: string;
  dueDate?: Date;
  tags: string[];
  attachments: File[];
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
}

interface Attachment {
  id: string;
  fileUrl: string;
  taskId: string;
  uploadedAt: string;
}



interface TaskTag {
  id: string;
  taskId: string;
  tagId: string;
  tag: TagTypePropsFor;
}

interface Subtask {
  // Define based on your subtask structure
  // Currently empty in the example
  id?: string;
  title?: string;
  completed?: boolean;
}

enum TaskStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  IN_PROGRESS = "IN_PROGRESS"
}

export interface TaskProps {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO format
  status: TaskStatus;
  adminId: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  createdByAdmin: User | null;
  createdByUser: User | null;
  attachments: Attachment[];
  subtasks: Subtask[];
  taskTags: TaskTag[];
}