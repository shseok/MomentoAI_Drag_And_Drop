import { useState, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "react-beautiful-dnd";

const recipes = [
  { id: "1", title: "이탈리안 파스타" },
  { id: "2", title: "멕시칸 타코" },
  { id: "3", title: "일본 초밥" },
  { id: "4", title: "인도 카레" },
  { id: "5", title: "프랑스 디저트" },
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
  cooking: {
    name: "요리",
    items: [],
  },
  completed: {
    name: "완성",
    items: [],
  },
};

export default function App() {
  const [columns, setColumns] = useState<RecipeStatus>(initialRecipeStatus);
  // 열 내 또는 열 간에 항목을 재정렬하는 함수
  const reorder = (
    status: RecipeStatus,
    startDroppableId: string,
    endDroppableId: string,
    startIndex: number,
    endIndex: number
  ): RecipeStatus => {
    // 다른 열로 드롭할 경우
    if (startDroppableId !== endDroppableId) {
      const sourceColumn = status[startDroppableId];
      const destColumn = status[endDroppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(startIndex, 1);
      destItems.splice(endIndex, 0, removed);
      return {
        ...status,
        [startDroppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [endDroppableId]: {
          ...destColumn,
          items: destItems,
        },
      };
    }
    // 같은 열 내에서 드롭할 경우
    const column = status[startDroppableId];
    const copiedItems = [...column.items];
    const [removed] = copiedItems.splice(startIndex, 1);
    copiedItems.splice(endIndex, 0, removed);
    return {
      ...status,
      [startDroppableId]: {
        ...column,
        items: copiedItems,
      },
    };
  };
  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return; // 드롭할 수 있는 영역 밖인지

    const { droppableId: sourceDroppableId, index: startIndex } = source;
    const { droppableId: destinationDroppableId, index: endIndex } =
      destination;

    // Perform reordering based on drag result
    setColumns((prevColumns) =>
      reorder(
        prevColumns,
        sourceDroppableId,
        destinationDroppableId,
        startIndex,
        endIndex
      )
    );
  }, []);

  return (
    <div className="bg-blue-300">
      <h1 className="text-center text-3xl font-bold py-4">음식 현황</h1>
      <div className="flex justify-center h-full">
        <DragDropContext onDragEnd={onDragEnd}>
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
                      {column.items.map((item, index) => (
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
                                  ? "bg-green-500"
                                  : "bg-black"
                              }`}
                              style={provided.draggableProps.style}
                            >
                              {item.title}
                            </div>
                          )}
                        </Draggable>
                      ))}
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
