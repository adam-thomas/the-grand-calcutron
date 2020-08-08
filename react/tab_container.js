import {observer} from "mobx-react";
import React from "react";

import actions from "./actions";
import taskState from "./state";
import SubtaskList from "./task";



@observer class TaskColumn extends React.Component {
    constructor(props) {
        super(props);
        this.title_field_ref = React.createRef();
    }

    addChild(event) {
        event.preventDefault();
        let field_element = $(this.title_field_ref.current);

        actions.addTask(field_element.val(), this.props.task);
        field_element.val("");
        field_element.focus();
    }

    handleEnter(event) {
        if(event.key === 'Enter'){
            this.addChild(event);
        }
    }

    close() {
        taskState.active_task = this.props.task.parent;
    }

    render() {
        let task = this.props.task;
        let button_text = taskState.is_mobile ? "+" : "Add";

        return (
            <div className="task-column">
                {this.props.task.parent &&
                    <div key="back-link" className="back-link-wrapper" onClick={this.close.bind(this)}>
                        &lt; {this.props.task.parent.title || "Close"}
                    </div>
                }

                <SubtaskList key="subtasks" task={task} />

                <div key="add-form" className="task-form-wrapper">
                    <input ref={this.title_field_ref} type="text" className="task-title" name="title" onKeyPress={this.handleEnter.bind(this)}/>
                    <button className="submit" onClick={this.addChild.bind(this)}>{button_text}</button>
                </div>
            </div>
        );
    }
}


export default {
    TaskColumn,
}
