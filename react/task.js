import $ from "jquery";
import {transaction} from "mobx";
import {observer} from "mobx-react";
import React from "react";

import actions from "./actions";
import taskState from "./state";


@observer export default class SubtaskList extends React.Component {
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

    render() {
        let task = this.props.task;
        let button_text = taskState.is_mobile ? "+" : "Add";

        let children = Object.values(task.children);
        children.sort((c1, c2) => c1.sort_order - c2.sort_order);

        return (
            <ul className="child-tasks">
                {children.map(child => (
                    <TaskWrapper key={child.id} task={child} />
                ))}

                <li key="add-form" className="task-form-wrapper">
                    <input ref={this.title_field_ref} type="text" className="task-title" name="title" onKeyPress={this.handleEnter.bind(this)}/>
                    <button className="submit" onClick={this.addChild.bind(this)}>{button_text}</button>
                </li>
            </ul>
        );
    }
}


@observer class TaskWrapper extends React.Component {
    dragStart() {
        taskState.dragged_item = this.props.task;
    }

    dragEnd() {
        taskState.dragged_item = null;
    }

    drop(key) {
        let this_task = this.props.task;
        let dropped_task = taskState.dragged_item;

        transaction(() => {
            if (key === "before") {
                taskState.moveTaskBefore(dropped_task, this_task);
            }

            else if (key === "mid") {
                taskState.setTaskParent(dropped_task, this_task);
            }

            else {
                taskState.moveTaskAfter(dropped_task, this_task);
            }
        });

        taskState.dragged_item = null;
    }

    renderSingleDropzone(key) {
        return (
            <div
                className={"dropzone " + key}
                key={key}
                onDrop={this.drop.bind(this, key)}
                onDragOver={(event) => event.preventDefault()}
            />
        );
    }

    renderDropzones() {
        if (taskState.dragged_item === null) {
            return null;
        }

        return [
            this.renderSingleDropzone("before"),
            this.renderSingleDropzone("mid"),
            this.renderSingleDropzone("after"),
        ];
    }

    render() {
        let task = this.props.task;

        return (
            <li key={task.id}
                draggable={true}
                className="task-wrapper"
                onDragStart={this.dragStart.bind(this)}
                onDragEnd={this.dragEnd.bind(this)}
            >
                <Task key="task" task={task} />
                {this.renderDropzones()}
            </li>
        );
    }
}


@observer class Task extends React.Component {
    constructor(props) {
        super(props);

        this.edit_field_ref = React.createRef();

        this.state = {
            show_children: false,
            show_options: false,
            edit_mode: false,
        }
    }

    toggleChildren() {
        this.setState({show_children: !this.state.show_children});
    }

    showOptions(event) {
        event.preventDefault();
        this.setState({show_options: true});
    }

    showEditMode() {
        this.setState({edit_mode: true});

        let field_element = $(this.edit_field_ref.current);
        field_element.val(this.props.task.title);
        field_element.focus();
    }

    closeOptionsAndEdit() {
        this.setState({
            show_options: false,
            edit_mode: false,
        });
    }

    delete() {
        actions.deleteTask(this.props.task);
    }

    edit() {
        let field_element = $(this.edit_field_ref.current);
        actions.updateTask(field_element.val(), this.props.task);
        this.closeOptionsAndEdit();
    }

    toggleDone(event) {
        event.stopPropagation();
        actions.setDoneTask(!this.props.task.done, this.props.task);
    }

    handleEnter(event) {
        if(event.key === 'Enter'){
            this.edit(event);
        }
    }

    renderTitle() {
        let caret_class = "caret";
        if (this.state.show_children) {
            caret_class = "open " + caret_class;
        }

        return (
            <div key="title" className="title" onClick={this.toggleChildren.bind(this)} onContextMenu={this.showOptions.bind(this)}>
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
                <button className="submit" onClick={this.edit.bind(this)}>Save</button>
            </div>
        );
    }

    renderOptions() {
        return (
            <div key="options" className="options-row">
                <button className="submit" onClick={this.showEditMode.bind(this)}>Edit</button>
                <button className="submit" onClick={this.delete.bind(this)}>Delete</button>
                <button className="submit" onClick={this.closeOptionsAndEdit.bind(this)}>Cancel</button>
            </div>
        );
    }

    render() {
        let main_row = (
            <div key="main-row" className="main-row">
                {this.state.edit_mode
                    ? this.renderEditForm()
                    : this.renderTitle()
                }

                {this.state.show_options && this.renderOptions()}
            </div>
        );

        if (!this.state.show_children) {
            return main_row;
        }

        return [
            main_row,
            <SubtaskList key="subtasks" task={this.props.task} />,
        ];
    }
}
