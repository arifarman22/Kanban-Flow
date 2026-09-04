export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string | null;
  label?: string | null;
  position: number;
  columnId: string;
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId: string;
  tasks: Task[];
}

export interface BoardMember {
  id: string;
  userId: string;
  user: User;
}

export interface Board {
  id: string;
  slug: string;
  title: string;
  ownerId: string;
  owner: User;
  members: BoardMember[];
  columns: Column[];
  createdAt: string;
}
