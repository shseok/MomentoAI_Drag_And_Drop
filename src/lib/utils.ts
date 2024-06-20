import type {
  Column,
  ColumnMap,
  Id,
  Entities,
  TaskId,
  Result,
  Args,
  Task,
} from "../types";
import reorder from "./reorder";

const withNewTaskIds = (column: Column, taskIds: Id[]): Column => ({
  id: column.id,
  title: column.title,
  taskIds,
});

export const isEven = (id: string) => parseInt(id, 10) % 2 === 0;

const reorderSingleDrag = ({
  entities,
  selectedTaskIds,
  source,
  destination,
}: Args): Result => {
  // 같은 목록에서 이동
  if (source.droppableId === destination.droppableId) {
    const column: Column = entities.columns[source.droppableId];
    const reordered: Id[] = reorder(
      column.taskIds,
      source.index,
      destination.index
    );
    const sourceId = column.taskIds[source.index];
    const destinationId = column.taskIds[destination.index];

    // 두 번째 제약:짝수 항목이 다른 짝수 항목 앞으로 이동하는 것을 방지합니다.
    if (
      isEven(sourceId.split("-")[1]) &&
      isEven(destinationId.split("-")[1]) &&
      destination.index < source.index
    ) {
      return {
        entities,
        selectedTaskIds,
      };
    }
    const updated: Entities = {
      ...entities,
      columns: {
        ...entities.columns,
        [column.id]: withNewTaskIds(column, reordered),
      },
    };

    return {
      entities: updated,
      selectedTaskIds,
    };
  }

  // 다른(새로운) 목록으로 이동
  const home: Column = entities.columns[source.droppableId];
  const foreign: Column = entities.columns[destination.droppableId];

  // 이동할 task의 ID
  const taskId: Id = home.taskIds[source.index];
  // 두 번째 제약:짝수 항목이 다른 짝수 항목 앞으로 이동하는 것을 방지합니다.
  if (
    isEven(taskId.split("-")[1]) &&
    destination.index < foreign.taskIds.length &&
    isEven(foreign.taskIds[destination.index].split("-")[1])
  ) {
    return {
      entities,
      selectedTaskIds,
    };
  }

  // 홈 열에서 제거
  const newHomeTaskIds: Id[] = [...home.taskIds];
  newHomeTaskIds.splice(source.index, 1);

  // 이동할 목록에 추가
  const newForeignTaskIds: Id[] = [...foreign.taskIds];
  newForeignTaskIds.splice(destination.index, 0, taskId);

  const updated: Entities = {
    ...entities,
    columns: {
      ...entities.columns,
      [home.id]: withNewTaskIds(home, newHomeTaskIds),
      [foreign.id]: withNewTaskIds(foreign, newForeignTaskIds),
    },
  };

  return {
    entities: updated,
    selectedTaskIds,
  };
};

export const getHomeColumn = (entities: Entities, taskId: TaskId): Column => {
  const columnId = entities.columnOrder.find((id: Id) => {
    const column: Column = entities.columns[id];
    return column.taskIds.includes(taskId);
  });

  if (!columnId) {
    throw new Error("getHomeColumn test");
  }

  return entities.columns[columnId];
};

const reorderMultiDrag = ({
  entities,
  selectedTaskIds,
  source,
  destination,
}: Args): Result => {
  const start: Column = entities.columns[source.droppableId];
  const dragged: TaskId = start.taskIds[source.index];

  const insertAtIndex: number = (() => {
    const destinationIndexOffset: number = selectedTaskIds.reduce(
      (previous: number, current: TaskId): number => {
        if (current === dragged) {
          return previous;
        }

        const final: Column = entities.columns[destination.droppableId];
        const column: Column = getHomeColumn(entities, current);

        if (column !== final) {
          return previous;
        }

        const index: number = column.taskIds.indexOf(current);

        if (index >= destination.index) {
          return previous;
        }

        // 선택한 항목이 대상 인덱스 앞에 있습니다.
        // 새 위치에 삽입할 때 이를 고려해야 합니다.
        return previous + 1;
      },
      0
    );

    const result: number = destination.index - destinationIndexOffset;
    return result;
  })();

  // 열을 조회해야 하므로 지금 정렬을 수행합니다.
  // 원래 순서를 알고 있습니다.
  const orderedSelectedTaskIds: TaskId[] = [...selectedTaskIds];
  orderedSelectedTaskIds.sort((a: TaskId, b: TaskId): number => {
    // moving the dragged item to the top of the list
    if (a === dragged) {
      return -1;
    }
    if (b === dragged) {
      return 1;
    }

    // natural indexes의해 정렬
    const columnForA: Column = getHomeColumn(entities, a);
    const indexOfA: number = columnForA.taskIds.indexOf(a);
    const columnForB: Column = getHomeColumn(entities, b);
    const indexOfB: number = columnForB.taskIds.indexOf(b);

    if (indexOfA !== indexOfB) {
      return indexOfA - indexOfB;
    }

    // selectedTaskIds 목록의 순서대로 정렬
    return -1;
  });

  // 해당 열에서 선택한 작업을 모두 제거해야 합니다.
  const withRemovedTasks: ColumnMap = entities.columnOrder.reduce(
    (previous: ColumnMap, columnId: Id): ColumnMap => {
      const column: Column = entities.columns[columnId];

      // 선택한 항목의 ID를 제거합니다.
      const remainingTaskIds: TaskId[] = column.taskIds.filter(
        (id: TaskId): boolean => !selectedTaskIds.includes(id)
      );

      previous[column.id] = withNewTaskIds(column, remainingTaskIds);
      return previous;
    },
    entities.columns
  );
  const final: Column = withRemovedTasks[destination.droppableId];
  const withInserted: TaskId[] = (() => {
    const base: TaskId[] = [...final.taskIds];
    base.splice(insertAtIndex, 0, ...orderedSelectedTaskIds);
    return base;
  })();

  // 선택한 모든 작업을 마지막 열에 삽입합니다.
  const withAddedTasks: ColumnMap = {
    ...withRemovedTasks,
    [final.id]: withNewTaskIds(final, withInserted),
  };

  const updated: Entities = {
    ...entities,
    columns: withAddedTasks,
  };

  return {
    entities: updated,
    selectedTaskIds: orderedSelectedTaskIds,
  };
};

export const mutliDragAwareReorder = (args: Args): Result => {
  if (args.selectedTaskIds.length > 1) {
    return reorderMultiDrag(args);
  }
  return reorderSingleDrag(args);
};

export const multiSelectTo = (
  entities: Entities,
  selectedTaskIds: Id[],
  newTaskId: TaskId
) => {
  // 선택된 항목이 없는 경우
  if (!selectedTaskIds.length) {
    return [newTaskId];
  }

  const columnOfNew: Column = getHomeColumn(entities, newTaskId);
  const indexOfNew: number = columnOfNew.taskIds.indexOf(newTaskId);

  const lastSelected: Id = selectedTaskIds[selectedTaskIds.length - 1];
  const columnOfLast: Column = getHomeColumn(entities, lastSelected);
  const indexOfLast: number = columnOfLast.taskIds.indexOf(lastSelected);

  // 다른 열을 다중 선택
  // 현재 항목의 인덱스까지 모든 것을 선택합니다.
  if (columnOfNew !== columnOfLast) {
    return columnOfNew.taskIds.slice(0, indexOfNew + 1);
  }

  // 같은 열에서 다중 선택
  // 마지막 인덱스와 현재 인덱스 사이의 모든 항목을 선택해야 합니다.

  // 같은 것을 중복 선택했을 때 로직 생략
  if (indexOfNew === indexOfLast) {
    return null;
  }

  const isSelectingForwards: boolean = indexOfNew > indexOfLast;
  const start: number = isSelectingForwards ? indexOfLast : indexOfNew;
  const end: number = isSelectingForwards ? indexOfNew : indexOfLast;

  const inBetween: Id[] = columnOfNew.taskIds.slice(start, end + 1);
  // 항상 선택되는 시작 및 끝 값을 제외하고 사이에 있는(inBetween) 모든 항목은 선택을 토글해야 합니다.

  const toAdd: Id[] = inBetween.filter((taskId: Id): boolean => {
    // 이미 선택한 경우: 다시 선택할 필요가 없습니다.
    if (selectedTaskIds.includes(taskId)) {
      return false;
    }
    return true;
  });

  const sorted: Id[] = isSelectingForwards ? toAdd : [...toAdd].reverse();
  const combined: Id[] = [...selectedTaskIds, ...sorted];

  return combined;
};

export const getTasks = (entities: Entities, columnId: Id): Task[] => {
  return entities.columns[columnId].taskIds.map(
    (taskId: Id): Task => entities.tasks[taskId]
  );
};

type TaskIdMap = {
  [taskId: Id]: true;
};

export const getSelectedMap = (selectedTaskIds: Id[]) => {
  return selectedTaskIds.reduce(
    (previous: TaskIdMap, current: Id): TaskIdMap => {
      previous[current] = true;
      return previous;
    },
    {}
  );
};
