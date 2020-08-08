import {observer} from "mobx-react";
import React from "react";

import taskState from "./state";
import SubtaskList from "./task";


@observer class TaskColumn extends React.Component {
    close() {
        taskState.active_task = this.props.task.parent;
    }


    render() {
        let task = this.props.task;

        return (
            <div className="task-column">
                {this.props.task.parent &&
                    <div class="back-link-wrapper" onClick={this.close.bind(this)}>
                        &lt; {this.props.task.parent.title || "Close"}
                    </div>
                }

                <SubtaskList task={task} />
            </div>
        );
    }
}


export default {
    TaskColumn,
}
