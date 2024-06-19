import { useState, useEffect } from "react";
import {
  DragDropContext,
  type DropResult,
  type DragStart,
  type DragUpdate,
} from "react-beautiful-dnd";
import Column from "./components/Column";
import type { Id, Result as ReorderResult } from "./types";
import initialEntities from "./lib/data";
import {
  getTasks,
  isEven,
  multiSelectTo as multiSelect,
  mutliDragAwareReorder,
} from "./lib/utils";

export default function App() {
  const [entities, setEntities] = useState(initialEntities);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Id[]>([]);
  const [draggingTaskId, setdraggingTaskId] = useState<Id | null>(null);
  const [isDragRestricted, setIsDragRestricted] = useState(false);

  console.log(entities);
  const toggleSelection = (taskId: Id) => {
    const wasSelected = selectedTaskIds.includes(taskId);
    const newTaskIds: Id[] = (() => {
      // 작업이 이전에 선택되지 않았습니다. 이제 유일하게 선택된 항목이 됩니다.
      if (!wasSelected) {
        return [taskId];
      }

      // 작업이 선택했던 그룹의 일부였습니다. 이제 유일하게 선택된 항목이 됩니다.
      if (selectedTaskIds.length > 1) {
        return [taskId];
      }

      // 작업이 이전에 선택되었지만 그룹에 속하지 않았습니다. 선택을 취소합니다.
      return [];
    })();

    setSelectedTaskIds(newTaskIds);
  };

  const toggleSelectionInGroup = (taskId: Id) => {
    const index = selectedTaskIds.indexOf(taskId);
    // 선택하지 않은 경우 선택한 항목에 추가합니다.
    if (index === -1) {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
      return;
    }
    // 이전에 선택되었으므로 그룹에서 제거하는 과정입니다.
    const shallow: Id[] = [...selectedTaskIds];
    shallow.splice(index, 1);
    setSelectedTaskIds(shallow);
  };

  const multiSelectTo = (newTaskId: Id) => {
    const updated = multiSelect(entities, selectedTaskIds, newTaskId);
    if (updated == null) {
      return;
    }
    setSelectedTaskIds(updated);
  };

  const onDragStart = (start: DragStart) => {
    const id: string = start.draggableId;
    const selected = selectedTaskIds.find(
      (taskId: Id): boolean => taskId === id
    );
    // 선택되지 않은 항목을 드래그하는 경우 모든 항목 선택 취소합니다.
    if (!selected) {
      unselectAll();
    }
    setIsDragRestricted(false);
    setdraggingTaskId(start.draggableId);
  };

  const onDragUpdate = (update: DragUpdate) => {
    const { source, destination, draggableId } = update;
    if (!destination) {
      setdraggingTaskId(null);
      return;
    }
    const { droppableId: sourceDroppableId, index: startIndex } = source;
    const { droppableId: destinationDroppableId, index: endIndex } =
      destination;
    const isEvenInvalidMove =
      isEven(draggableId.split("-")[1]) &&
      endIndex < entities.columns[destinationDroppableId].taskIds.length &&
      isEven(
        entities.columns[destinationDroppableId].taskIds[endIndex].split("-")[1]
      );
    if (
      sourceDroppableId === "backlog" &&
      destinationDroppableId === "inProgress"
    ) {
      setIsDragRestricted(true);
    } else if (
      (sourceDroppableId === destinationDroppableId &&
        isEvenInvalidMove &&
        endIndex < startIndex) ||
      (sourceDroppableId !== destinationDroppableId && isEvenInvalidMove)
    ) {
      setIsDragRestricted(true);
    } else {
      setIsDragRestricted(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    // 드롭할 수 있는 영역 밖인지
    if (!destination || result.reason === "CANCEL") {
      setdraggingTaskId(null);
      return;
    }
    // 첫 번째 열에서 세 번째 열로의 이동을 제한합니다.
    if (
      source.droppableId === "backlog" &&
      destination.droppableId === "inProgress"
    ) {
      setIsDragRestricted(false);
      setdraggingTaskId(null);
      return;
    }
    // 드래그 결과에 따라 재정렬 수행
    const processed: ReorderResult = mutliDragAwareReorder({
      entities,
      selectedTaskIds,
      source,
      destination,
    });
    setEntities(processed.entities);
    setSelectedTaskIds(processed.selectedTaskIds);
    setdraggingTaskId(null);
  };

  const onWindowKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "Escape") {
      unselectAll();
    }
  };

  const onWindowClick = (event: MouseEvent) => {
    if (event.defaultPrevented) {
      return;
    }
    unselectAll();
  };

  const onWindowTouchEnd = (event: TouchEvent) => {
    if (event.defaultPrevented) {
      return;
    }
    unselectAll();
  };

  const unselectAll = () => {
    setSelectedTaskIds([]);
  };

  useEffect(() => {
    window.addEventListener("click", onWindowClick);
    window.addEventListener("keydown", onWindowKeyDown);
    window.addEventListener("touchend", onWindowTouchEnd);
    return () => {
      window.removeEventListener("click", onWindowClick);
      window.removeEventListener("keydown", onWindowKeyDown);
      window.removeEventListener("touchend", onWindowTouchEnd);
    };
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center py-2">
      <h1 className="text-center text-3xl font-bold mb-8">Project</h1>
      <div className="flex justify-center w-[90%] max-w-[1000px] mb-4">
        <DragDropContext
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onDragUpdate={onDragUpdate}
        >
          {entities.columnOrder.map((columnId: Id) => (
            <Column
              key={columnId}
              column={entities.columns[columnId]}
              tasks={getTasks(entities, columnId)}
              selectedTaskIds={selectedTaskIds}
              draggingTaskId={draggingTaskId}
              toggleSelection={toggleSelection}
              toggleSelectionInGroup={toggleSelectionInGroup}
              multiSelectTo={multiSelectTo}
              isDragRestricted={isDragRestricted}
            />
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}
