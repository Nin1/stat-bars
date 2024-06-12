import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from "@hello-pangea/dnd";
import { NeedConfig } from "../definitions";
import StatPanel from "./stat-panel";
import { useOptimistic } from "react";

type StatListProps = {
    configs: NeedConfig[],
    onEdit: (config : NeedConfig) => void,
    onReorder: OnDragEndResponder
}

export default function StatList(props: StatListProps) {
    return (
        <DragDropContext onDragEnd={props.onReorder}>
            <Droppable droppableId={"stats"}>
                {(droppableProvider) => (
                    <ul
                        ref={droppableProvider.innerRef}
                        {...droppableProvider.droppableProps}
                        className="flex-grow flex flex-col"
                    >
                        {props.configs.map((config, index) => {
                            return (
                                <Draggable
                                    key={config.uuid}
                                    draggableId={config.uuid}
                                    index={index}
                                >
                                    {(provider) => (
                                        <li ref={provider.innerRef} {...provider.draggableProps}>
                                            <StatPanel
                                                config={config}
                                                onEdit={props.onEdit}
                                                dragHandleProps={provider.dragHandleProps}
                                                />
                                        </li>
                                    )}
                                </Draggable>
                            )
                        })}
                        {droppableProvider.placeholder}
                    </ul>
                )}
            </Droppable>
        </DragDropContext>
  );
}