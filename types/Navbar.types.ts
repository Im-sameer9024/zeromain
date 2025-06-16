export interface NotificationProps {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedTaskId?: string;
  relatedSubtaskId?: string;
  userId?: string;
  companyAdminId?: string;
  relatedTask?: {
    title: string;
    status: string;
  };
  relatedSubtask?: {
    title: string;
    status: string;
  };
}

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}