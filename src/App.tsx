import { useState, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DragUpdate,
} from "react-beautiful-dnd";

const recipes = [
  { id: "0", title: "기획" },
  { id: "1", title: "디자인" },
  { id: "2", title: "프론트엔드 개발" },
  { id: "3", title: "백엔드 개발" },
  { id: "4", title: "배포" },
];

type RecipeStatus = {
  [key: string]: {
    name: string;
    items: { id: string; title: string }[];
  };
};

const initialRecipeStatus: RecipeStatus = {
  planning: {
    name: "계획",
    items: recipes,
  },
  preparation: {
    name: "준비",
    items: [],
  },
  action: {
    name: "실행",
    items: [],
  },
  completed: {
    name: "완료",
    items: [],
  },
};

const isEven = (id: string) => parseInt(id, 10) % 2 === 0;

export default function App() {
  const [columns, setColumns] = useState<RecipeStatus>(initialRecipeStatus);
  const [isInvalidMove, setIsInvalidMove] = useState(false);

  // 열 내 또는 열 간에 항목을 재정렬하는 함수
  const reorder = (
    status: RecipeStatus,
    startDroppableId: string,
    endDroppableId: string,
    startIndex: number,
    endIndex: number
  ): RecipeStatus => {
    const sourceColumn = status[startDroppableId];
    const copiedStartItems = [...sourceColumn.items];
    const [removed] = copiedStartItems.splice(startIndex, 1);
    // 같은 열 내부에서 드롭할 경우
    if (startDroppableId === endDroppableId) {
      // 두 번째 제약:짝수 항목이 다른 짝수 항목 앞으로 이동하는 것을 방지합니다.
      if (
        isEven(removed.id) &&
        endIndex < copiedStartItems.length &&
        isEven(copiedStartItems[endIndex].id) &&
        endIndex < startIndex
      ) {
        return status;
      }

      copiedStartItems.splice(endIndex, 0, removed);
      return {
        ...status,
        [startDroppableId]: {
          ...sourceColumn,
          items: copiedStartItems,
        },
      };
    }
    // 다른 열로 드롭할 경우

    // 첫 번째 제약: 첫 번째 칼럼에서 세 번째 칼럼으로는 아이템 이동이 불가능
    if (startDroppableId === "planning" && endDroppableId === "action") {
      return status;
    }
    const destColumn = status[endDroppableId];
    const copiedEndItems = [...destColumn.items];
    // 두 번째 제약:짝수 항목이 다른 짝수 항목 앞으로 이동하는 것을 방지합니다.
    if (
      isEven(removed.id) &&
      endIndex < copiedEndItems.length &&
      isEven(copiedEndItems[endIndex].id)
    ) {
      return status;
    }
    copiedEndItems.splice(endIndex, 0, removed);
    return {
      ...status,
      [startDroppableId]: {
        ...sourceColumn,
        items: copiedStartItems,
      },
      [endDroppableId]: {
        ...destColumn,
        items: copiedEndItems,
      },
    };
  };
  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return; // 드롭할 수 있는 영역 밖인지

    const { droppableId: sourceDroppableId, index: startIndex } = source;
    const { droppableId: destinationDroppableId, index: endIndex } =
      destination;

    // 드래그 결과에 따라 재정렬 수행
    setColumns((prevColumns) =>
      reorder(
        prevColumns,
        sourceDroppableId,
        destinationDroppableId,
        startIndex,
        endIndex
      )
    );
    setIsInvalidMove(false);
  }, []);

  const onDragUpdate = useCallback(
    (update: DragUpdate) => {
      const { destination, source, draggableId } = update;

      if (!destination) {
        return;
      }
      const { droppableId: sourceDroppableId, index: startIndex } = source;
      const { droppableId: destinationDroppableId, index: endIndex } =
        destination;

      const isEvenInvalidMove =
        isEven(draggableId) &&
        endIndex < columns[destinationDroppableId].items.length &&
        isEven(columns[destinationDroppableId].items[endIndex].id);

      if (
        sourceDroppableId === "planning" &&
        destinationDroppableId === "action"
      ) {
        setIsInvalidMove(true);
      } else if (
        // 같은 열 혹은 다른 열에로 짝수아이템이 짝수 아이템 앞으로 이동할 경우
        (sourceDroppableId === destinationDroppableId &&
          isEvenInvalidMove &&
          endIndex < startIndex) ||
        (sourceDroppableId !== destinationDroppableId && isEvenInvalidMove)
      ) {
        setIsInvalidMove(true);
      } else {
        setIsInvalidMove(false);
      }
    },
    [columns]
  );

  return (
    <div className="bg-blue-300">
      <h1 className="text-center text-3xl font-bold py-4">프로젝트 현황</h1>
      <div className="flex justify-center h-full">
        <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
          {Object.entries(columns).map(([columnId, column], index) => (
            <div className="flex flex-col items-center" key={columnId}>
              <h2 className="text-center text-xl font-semibold py-2">
                {column.name}
              </h2>
              <div className="m-2">
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`p-1 w-[250px] min-h-[500px] ${
                        snapshot.isDraggingOver ? "bg-slate-500" : "bg-gray-300"
                      }`}
                    >
                      {column.items.map((item, index) => {
                        return (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`select-none p-4 mb-2 min-h-[50px] text-white ${
                                  snapshot.isDragging
                                    ? isInvalidMove
                                      ? "bg-red-500"
                                      : "bg-green-500"
                                    : "bg-black"
                                }`}
                                style={provided.draggableProps.style}
                              >
                                {`${item.id}. ${item.title}`}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}
