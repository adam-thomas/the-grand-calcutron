import { observer } from "mobx-react";
import React, { Fragment } from "react";

import taskState from "../state_management/state";
import TaskDropzone from "./dropzone";
import SingleTask from "./task";


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

                    // Use the temporary ID generated for a newly-created task preferentially as
                    // its key, over the actual database ID. This is so that when the task gets
                    // its ID from the database, the React component isn't removed and recreated.
                    const task_key = child.temporary_id || child.id;

                    return (
                        <Fragment key={task_key}>
                            <li key="task" className={`${is_active ? "active" : ""} task-wrapper`}>
                                <SingleTask task={child} is_active={is_active} />
                            </li>

                            <li key="dropzone" className="dropzone-wrapper">
                                <TaskDropzone zoneType="after" task={child} />
                            </li>
                        </Fragment>
                    );
                })}
            </ul>
        );
    }
}

