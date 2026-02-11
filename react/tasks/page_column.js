import {observer} from "mobx-react";
import React from "react";

import actions from "../state_management/saved_actions";
import navigate from "../navigation/navigate";
import taskState from "../state_management/state";
import TaskList from "./task_list";
import AutoSizeTextarea from "./textarea";


@observer export default class PageColumn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            field_contents: "",
        }
    }

    addChild(event) {
        event.preventDefault();

        // TODO: This causes an edit view to open, and focuses it with the cursor, which
        //   at least on desktop Chrome causes it to scroll into view. Is this consistent
        //   on mobile?
        actions.addTask("", this.props.task);
    }

    handleEnter(event) {
        if(event.key === 'Enter'){
            this.addChild(event);
        }
    }

    close() {
        navigate.toTask(this.props.task.parent);
    }

    render() {
        const task = this.props.task;

        return (
            <div className="task-column">
                <div className="heading-wrapper">
                    {this.props.task.parent &&
                        <button key="close" className="close-button" onClick={this.close.bind(this)}>
                            &#10094;
                        </button>
                    }

                    <div key="heading" className="heading">
                        {this.props.task.text || "All Tasks"}
                    </div>
                </div>

                <div key="children" ref={this.children_container_ref} className="child-task-list-wrapper">
                    <TaskList key="subtasks" task={task} />
                </div>


                {this.props.task == taskState.active_task &&
                    <div key="add-new" className="add-new-task-wrapper">
                        <button className="submit" onClick={this.addChild.bind(this)}>+ Add</button>
                    </div>                    
                }
            </div>
        );
    }
}
