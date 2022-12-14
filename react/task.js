import $ from "jquery";
import {observer} from "mobx-react";
import React from "react";

import actions from "./actions";
import taskState from "./state";
import AutoSizeTextarea from "./textarea";


@observer export default class SubtaskList extends React.Component {
    render() {
        let task = this.props.task;

        let children = Object.values(task.children);
        children.sort((c1, c2) => c1.sort_order - c2.sort_order);

        return (
            <ul className="child-tasks">
                {children.map(child => {
                    let wrapper_class = "task-wrapper";
                    if (taskState.columns.includes(child)) {
                        wrapper_class = "active " + wrapper_class;
                    }

                    return (
                        <li key={child.id} className={wrapper_class}>
                            <Task key="task" task={child} />
                        </li>
                    );
                })}
            </ul>
        );
    }
}


@observer class Task extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            edit_mode: false,
            edit_field_contents: this.props.task.title,
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
        this.setState({edit_mode: true, edit_field_contents: this.props.task.title});
    }

    delete() {
        actions.deleteTask(this.props.task);
    }

    saveEdit() {
        let title = this.state.edit_field_contents;

        if (title === "") {
            actions.deleteTask(this.props.task);
        } else {
            actions.setTaskTitle(this.props.task, this.state.edit_field_contents);
        }

        this.setState({edit_mode: false});
    }

    toggleDone(event) {
        event.stopPropagation();
        actions.setTaskDone(this.props.task, !this.props.task.done);
    }

    handleEscEnter(event) {
        if (event.key === "Enter") {
            this.saveEdit(event);
        } else if (event.key === "Escape") {
            this.setState({edit_mode: false, edit_field_contents: this.props.task.title});
        }
    }

    parseTitleURLs(title) {
        // Look through the task title for any URLs. Return a list of components -
        // either text or <a href> elements.
        const url_index = title.indexOf("http", url_index);

        if (url_index === -1) {
            return [title];
        }

        let result = [title.slice(0, url_index)];

        let space_index = title.indexOf(" ", url_index);
        if (space_index === -1) {
            space_index = title.length;
        }

        const url = title.slice(url_index, space_index);
        result.push(
            <a key={url} onClick={(e) => e.stopPropagation()} href={url} target="_blank">{url}</a>
        );

        // Recur to look for any other URLs.
        const rest_of_title = this.parseTitleURLs(title.slice(space_index));
        return result.concat(rest_of_title);
    }

    renderTitle() {
        let checkbox_class = "imitation-checkbox";
        if (this.props.task.done) {
            checkbox_class = "checked " + checkbox_class;
        }

        return (
            <div key="title" className="title" onClick={this.activate.bind(this)} onContextMenu={this.showEditMode.bind(this)}>
                <div className="checkbox-wrapper" onClick={this.toggleDone.bind(this)}>
                    <div className={checkbox_class} />
                </div>

                <span>{this.parseTitleURLs(this.props.task.title)}</span>

                {Object.keys(this.props.task.children).length > 0 &&
                    <div className="caret-wrapper">
                        <div className="caret" />
                    </div>
                }
            </div>
        );
    }

    renderEditForm() {
        return (
            <div key="add-form" className="edit-form title">
                <AutoSizeTextarea
                    className="task-title" name="title"
                    autoFocus={true}
                    value={this.state.edit_field_contents}
                    onChange={(event) => this.setState({edit_field_contents: event.target.value})}
                    onKeyDown={this.handleEscEnter.bind(this)}
                />
                <button className="submit" onClick={this.saveEdit.bind(this)}>+</button>
                <button className="submit" onClick={this.delete.bind(this)}>-</button>
            </div>
        );
    }

    renderDropzones() {
        if (taskState.is_mobile || (taskState.dragged_item === null)) {
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
        const draggable = !this.state.edit_mode && !taskState.is_mobile;

        return (
            <div
                key="main-row"
                className="main-row"
                draggable={draggable}
                onDragStart={draggable ? this.dragStart.bind(this) : null}
                onDragEnd={draggable ? this.dragEnd.bind(this) : null}
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
