import { observer } from "mobx-react";
import React from "react";

import taskState from "../state";
import TaskDropzone from "./dropzone";
import Task from "./task";


@observer export default class TaskList extends React.Component {
    render() {
        let task = this.props.task;

        let children = Object.values(task.children);
        children.sort((c1, c2) => c1.sort_order - c2.sort_order);

        return (
            <ul className="child-tasks">
                {children[0] && (
                    <li key={`dropzone-beginning`} className="dropzone-wrapper">
                        <TaskDropzone zoneType="before" task={children[0]} />
                    </li>
                )}

                {children.map((child) => {
                    const is_active = taskState.columns.includes(child);

                    return (
                        <>
                            <li key={child.id} className={`${is_active ? "active" : ""} task-wrapper`}>
                                <Task task={child} is_active={is_active} />
                            </li>

                            <li key={`dropzone-${child.id}`} className="dropzone-wrapper">
                                <TaskDropzone zoneType="after" task={child} />
                            </li>
                        </>
                    );
                })}
            </ul>
        );
    }
}

