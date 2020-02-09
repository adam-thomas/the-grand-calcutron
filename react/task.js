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
                    <li key={child.id} className="task-wrapper">
                        <Task key="task" task={child} />
                    </li>
                ))}

                <li key="add-form" className="task-form-wrapper">
                    <input ref={this.title_field_ref} type="text" className="task-title" name="title" onKeyPress={this.handleEnter.bind(this)}/>
                    <button className="submit" onClick={this.addChild.bind(this)}>{button_text}</button>
                </li>
            </ul>
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

    dragStart() {
        taskState.dragged_item = this.props.task;
    }

    dragEnd() {
        taskState.dragged_item = null;
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

                <span>{this.props.task.sort_order} {this.props.task.title}</span>

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
        let main_row = (
            <div
                key="main-row"
                className="main-row"
                draggable={true}
                onDragStart={this.dragStart.bind(this)}
                onDragEnd={this.dragEnd.bind(this)}
            >
                {this.state.edit_mode
                    ? this.renderEditForm()
                    : this.renderTitle()
                }

                {this.state.show_options && this.renderOptions()}

                {this.renderDropzones()}
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
