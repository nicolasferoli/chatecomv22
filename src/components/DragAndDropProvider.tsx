import React from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

interface DragAndDropProviderProps {
  children: React.ReactNode
  droppableId: string
  draggableId: string
  index: number
  isDragDisabled: boolean
}

export function DragAndDropProvider({
  children,
  droppableId,
  draggableId,
  index,
  isDragDisabled,
}: DragAndDropProviderProps) {
  return (
    <div>
      <Droppable
        droppableId={droppableId}
        isDropDisabled={false}
        isCombineEnabled={false}
        ignoreContainerClipping={false}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className='max-w-full'
          >
            {!snapshot.isDraggingOver ? (
              <div className='h-full max-w-full'>
                <Draggable
                  draggableId={draggableId}
                  index={index}
                  isDropDisabled={true}
                  isCombineEnabled={false}
                  ignoreContainerClipping={false}
                  isDragDisabled={isDragDisabled}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className='max-w-full'
                    >
                      {children}
                    </div>
                  )}
                </Draggable>
              </div>
            ) : (
              <>{children}</>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
