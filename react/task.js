import $ from "jquery";
import {observer} from "mobx-react";
import React from "react";

import actions from "./actions";
import taskState from "./state";


@observer export default class SubtaskList extends React.Component {
    render() {
        let task = this.props.task;

        let children = Object.values(task.children);
        children.sort((c1, c2) => c1.sort_order - c2.sort_order);

        return (
            <ul className="child-tasks">
                {children.map(child => (
                    <li key={child.id} className="task-wrapper">
                        <Task key="task" task={child} />
                    </li>
                ))}
            </ul>
        );
    }
}


@observer class Task extends React.Component {
    constructor(props) {
        super(props);

        this.edit_field_ref = React.createRef();

        this.state = {
            edit_mode: false,
        }
    }

    dragStart() {
        taskState.dragged_item = this.props.task;
    }

    dragEnd() {
        taskState.dragged_item = null;
    }

    activate() {
        taskState.active_task = this.props.task;
    }

    showEditMode(event) {
        event.preventDefault();
        this.setState({edit_mode: true});

        let field_element = $(this.edit_field_ref.current);
        field_element.val(this.props.task.title);
        field_element.focus();
    }

    delete() {
        actions.deleteTask(this.props.task);
    }

    saveEdit() {
        let field_element = $(this.edit_field_ref.current);
        let title = field_element.val();

        if (title === "") {
            actions.deleteTask(this.props.task);
        } else {
            actions.setTaskTitle(this.props.task, field_element.val());
        }

        this.setState({edit_mode: false});
    }

    toggleDone(event) {
        event.stopPropagation();
        actions.setTaskDone(this.props.task, !this.props.task.done);
    }

    handleEnter(event) {
        if(event.key === 'Enter'){
            this.saveEdit(event);
        }
    }

    renderTitle() {
        let caret_class = "caret";
        if (taskState.columns.includes(this.props.task)) {
            caret_class = "open " + caret_class;
        }

        return (
            <div key="title" className="title" onClick={this.activate.bind(this)} onContextMenu={this.showEditMode.bind(this)}>
                <div className="checkbox-wrapper" onClick={this.toggleDone.bind(this)}>
                    <input type="checkbox" checked={this.props.task.done} readOnly={true} />
                </div>

                <span>{this.props.task.title}</span>

                {Object.keys(this.props.task.children).length > 0 &&
                    <div className="caret-wrapper">
                        <div className={caret_class} />
                    </div>
                }
            </div>
        );
    }

    renderEditForm() {
        return (
            <div key="add-form" className="edit-form title">
                <input
                    ref={this.edit_field_ref} type="text"
                    className="task-title" name="title"
                    autoFocus={true}
                    defaultValue={this.props.task.title}
                    onKeyPress={this.handleEnter.bind(this)}
                />
                <button className="submit" onClick={this.saveEdit.bind(this)}>Save</button>
            </div>
        );
    }

    renderDropzones() {
        if (taskState.dragged_item === null) {
            return null;
        }

        return (
            <div className="dropzone-container">
                <TaskDropzone key="before" zoneType="before" task={this.props.task} />
                <TaskDropzone key="in" zoneType="in" task={this.props.task} />
                <TaskDropzone key="after" zoneType="after" task={this.props.task} />
            </div>
        );
    }

    render() {
        return (
            <div
                key="main-row"
                className="main-row"
                draggable={!this.state.edit_mode}
                onDragStart={this.state.edit_mode ? null : this.dragStart.bind(this)}
                onDragEnd={this.state.edit_mode ? null : this.dragEnd.bind(this)}
            >
                {this.state.edit_mode
                    ? this.renderEditForm()
                    : this.renderTitle()
                }

                {this.renderDropzones()}
            </div>
        );
    }
}


@observer class TaskDropzone extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            highlight: false,
        };
    }


    drop() {
        let operations = {
            "before": taskState.moveTaskBefore,
            "in": taskState.setTaskParent,
            "after": taskState.moveTaskAfter,
        }

        operations[this.props.zoneType](taskState.dragged_item, this.props.task);
        taskState.dragged_item = null;
    }


    dragOver(event) {
        event.preventDefault();
        this.setState({highlight: true});
    }


    dragLeave() {
        this.setState({highlight: false});
    }


    render() {
        if (taskState.dragged_item === null) {
            return null;
        }

        let baseClass = "dropzone " + this.props.zoneType;
        let highlightClass = this.state.highlight ? " highlight" : "";

        return (
            <div
                className={baseClass + highlightClass}
                key={this.props.zoneType}
                onDrop={this.drop.bind(this)}
                onDragOver={this.dragOver.bind(this)}
                onDragLeave={this.dragLeave.bind(this)}
            />
        );
    }
}
