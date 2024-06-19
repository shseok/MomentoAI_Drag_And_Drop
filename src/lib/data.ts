import type { Task, TaskMap, Column, Entities, Id } from "../types";

const tasks: Task[] = Array.from({ length: 20 }, (v, k) => k).map(
  (val: number): Task => ({
    id: `task-${val}`,
    content: `Task ${val}`,
  })
);

const taskMap: TaskMap = tasks.reduce(
  (previous: TaskMap, current: Task): TaskMap => {
    previous[current.id] = current;
    return previous;
  },
  {}
);

const backlog: Column = {
  id: "backlog",
  title: "Backlog",
  taskIds: tasks.map((task: Task): Id => task.id),
};

const todo: Column = {
  id: "todo",
  title: "To do",
  taskIds: [],
};

const inProgress: Column = {
  id: "inProgress",
  title: "in Progress",
  taskIds: [],
};

const done: Column = {
  id: "done",
  title: "Done",
  taskIds: [],
};

const entities: Entities = {
  columnOrder: [backlog.id, todo.id, inProgress.id, done.id],
  columns: {
    [backlog.id]: backlog,
    [todo.id]: todo,
    [inProgress.id]: inProgress,
    [done.id]: done,
  },
  tasks: taskMap,
};

export default entities;
