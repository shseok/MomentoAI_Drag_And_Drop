import { Draggable, DraggableStateSnapshot } from "react-beautiful-dnd";
import type { Id, Task as TaskType } from "../types";

type Props = {
  task: TaskType;
  index: number;
  isSelected: boolean;
  isGhosting: boolean;
  selectionCount: number;
  toggleSelection: (taskId: Id) => void;
  toggleSelectionInGroup: (taskId: Id) => void;
  multiSelectTo: (taskId: Id) => void;
  isDragRestricted: boolean;
};

const primaryButton = 0;

const keyCodes = {
  enter: "Enter",
  escape: "Escape",
  arrowDown: "ArrowDown",
  arrowUp: "ArrowUp",
  tab: "Tab",
};

export default function Task({
  task,
  index,
  isSelected,
  isGhosting,
  selectionCount,
  toggleSelection,
  toggleSelectionInGroup,
  multiSelectTo,
  isDragRestricted,
}: Props) {
  // 데스크톱 상호작용을 위한 마우스 클릭을 처리합니다.
  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.button !== primaryButton) {
      return;
    }
    event.preventDefault();

    performAction(event);
  };
  // 모바일 디바이스의 터치 상호작용을 처리합니다.
  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    toggleSelectionInGroup(task.id);
  };

  // ctrl 키가 사용되는지 확인합니다.
  const wasToggleInSelectionGroupKeyUsed = (
    event: React.MouseEvent | React.KeyboardEvent
  ) => {
    const isUsingWindows = navigator.userAgent.indexOf("Win") >= 0;
    return isUsingWindows ? event.ctrlKey : event.metaKey;
  };

  // shift 키가 사용되었는지 확인합니다.
  const wasMultiSelectKeyUsed = (
    event: React.MouseEvent | React.KeyboardEvent
  ) => event.shiftKey;

  const performAction = (event: React.MouseEvent | React.KeyboardEvent) => {
    if (wasToggleInSelectionGroupKeyUsed(event)) {
      toggleSelectionInGroup(task.id);
      return;
    }
    if (wasMultiSelectKeyUsed(event)) {
      multiSelectTo(task.id);
      return;
    }
    toggleSelection(task.id);
  };
  // 키보드 상호작용을 처리하며, 특히 엔터키가 동작을 수행하는지 확인합니다.
  const onKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    snapshot: DraggableStateSnapshot
  ) => {
    if (event.defaultPrevented) {
      return;
    }

    if (snapshot.isDragging) {
      return;
    }

    if (event.key !== keyCodes.enter) {
      return;
    }
    event.preventDefault();
    performAction(event);
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => {
        const shouldShowSelectedCount =
          snapshot.isDragging && selectionCount > 1;
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={onClick}
            onTouchEnd={onTouchEnd}
            onKeyDown={(event) => onKeyDown(event, snapshot)}
            className={`select-none p-4 mb-2 text-white rounded-md text-center text-lg relative focus:outline-none ${
              snapshot.isDragging && isDragRestricted
                ? "bg-red-500"
                : isSelected
                ? "bg-green-500"
                : "bg-gray-400"
            } ${snapshot.isDragging ? "shadow-task" : ""} ${
              isGhosting ? "opacity-80" : ""
            }`}
            // style={provided.draggableProps.style}
          >
            {task.content}
            {shouldShowSelectedCount ? (
              <div
                className={`absolute -right-2 -top-2 rounded-full size-[30px] text-center text-sm flex items-center justify-center ${
                  snapshot.isDragging && isDragRestricted
                    ? "bg-red-800"
                    : "bg-green-800"
                }`}
              >
                {selectionCount}
              </div>
            ) : null}
          </div>
        );
      }}
    </Draggable>
  );
}
