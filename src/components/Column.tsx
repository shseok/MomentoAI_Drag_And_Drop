import { Droppable } from "react-beautiful-dnd";
import { Column as ColumnType, Task as TaskType, Id } from "../types";
import Task from "./Task";
import { getSelectedMap } from "../lib/utils";

type Props = {
  column: ColumnType;
  tasks: TaskType[];
  selectedTaskIds: Id[];
  draggingTaskId: Id | null;
  toggleSelection: (taskId: Id) => void;
  toggleSelectionInGroup: (taskId: Id) => void;
  multiSelectTo: (taskId: Id) => void;
  isDragRestricted: boolean;
};

export default function Column({
  column,
  tasks,
  selectedTaskIds,
  draggingTaskId,
  toggleSelection,
  toggleSelectionInGroup,
  multiSelectTo,
  isDragRestricted,
}: Props) {
  return (
    <div className="flex flex-col items-center m-2 w-[250px] h-[500px]">
      <h3 className="text-center text-xl font-semibold p-2">{column.title}</h3>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`p-1 size-full overflow-y-auto rounded-md ${
              snapshot.isDraggingOver ? "bg-slate-300" : "bg-gray-100"
            }`}
          >
            {tasks.map((task, index) => {
              const isSelected = Boolean(
                getSelectedMap(selectedTaskIds)[task.id]
              );
              const isGhosting =
                isSelected &&
                Boolean(draggingTaskId) &&
                draggingTaskId !== task.id;
              return (
                <Task
                  key={task.id}
                  task={task}
                  index={index}
                  isSelected={isSelected}
                  isGhosting={isGhosting}
                  selectionCount={selectedTaskIds.length}
                  toggleSelection={toggleSelection}
                  toggleSelectionInGroup={toggleSelectionInGroup}
                  multiSelectTo={multiSelectTo}
                  isDragRestricted={isDragRestricted}
                />
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
