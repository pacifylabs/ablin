'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { createContext, useContext } from 'react';
import styles from './admin.module.css';

type HandleProps = ReturnType<typeof useSortable>['attributes'] &
  NonNullable<ReturnType<typeof useSortable>['listeners']>;

const HandleContext = createContext<HandleProps | null>(null);

/**
 * Drag-and-drop and keyboard reordering for any list (blocks, services). Keyboard: focus the handle, Space to pick
 * up, arrow keys to move, Space to drop, Escape to cancel — dnd-kit announces each step to screen readers.
 */
export function SortableList<T>({
  items,
  getId,
  onReorder,
  children,
}: {
  items: readonly T[];
  getId: (item: T) => string;
  onReorder: (items: T[]) => void;
  children: (item: T, index: number) => React.ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = items.map(getId);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onReorder(arrayMove([...items], from, to));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ol className={styles.blockList}>
          {items.map((item, i) => (
            <SortableRow key={ids[i]} id={ids[i]!}>
              {children(item, i)}
            </SortableRow>
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 2 : undefined,
    position: 'relative',
  };
  return (
    <li ref={setNodeRef} style={style} data-dragging={isDragging || undefined}>
      <HandleContext.Provider value={{ ...attributes, ...listeners } as HandleProps}>
        {children}
      </HandleContext.Provider>
    </li>
  );
}

/** The drag handle for the row it sits in. */
export function DragHandle({ label }: { label: string }) {
  const props = useContext(HandleContext);
  return (
    <button type="button" className={styles.dragHandle} aria-label={label} {...props}>
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">
        <circle cx="5" cy="4" r="1.3" />
        <circle cx="11" cy="4" r="1.3" />
        <circle cx="5" cy="8" r="1.3" />
        <circle cx="11" cy="8" r="1.3" />
        <circle cx="5" cy="12" r="1.3" />
        <circle cx="11" cy="12" r="1.3" />
      </svg>
    </button>
  );
}
