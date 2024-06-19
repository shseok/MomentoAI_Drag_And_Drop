import { type DraggableLocation } from "react-beautiful-dnd";

export type Id = string;
export type TaskId = Id;

export type Task = {
  id: Id;
  content: string;
};

export type Column = {
  id: Id;
  title: string;
  taskIds: Id[];
};

export type ColumnMap = {
  [columnId: Id]: Column;
};

export type TaskMap = {
  [taskId: Id]: Task;
};

export type Entities = {
  columnOrder: Id[];
  columns: ColumnMap;
  tasks: TaskMap;
};

export type Result = {
  entities: Entities;
  // a drop operations can change the order of the selected task array
  selectedTaskIds: Id[];
};

export type Args = {
  entities: Entities;
  selectedTaskIds: Id[];
  source: DraggableLocation;
  destination: DraggableLocation;
};

export type AuthorColors = {
  soft: string;
  hard: string;
};

export type Author = {
  id: Id;
  name: string;
  avatarUrl: string;
  url: string;
  colors: AuthorColors;
};
