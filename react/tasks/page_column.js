import {observer} from "mobx-react";
import React from "react";

import actions from "../api_requests/actions";
import navigate from "../navigation/navigate";
import taskState from "../state";
import TaskList from "./task_list";
import AutoSizeTextarea from "./textarea";


@observer export default class PageColumn extends React.Component {
    constructor(props) {
        super(props);

        this.children_container_ref = React.createRef();

        this.state = {
            field_contents: "",
        }
    }

    addChild(event) {
        event.preventDefault();
        actions.addTask("", this.props.task, this.children_container_ref.current);
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
