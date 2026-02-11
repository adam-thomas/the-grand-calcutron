import { observer } from "mobx-react";
import React from "react";
import { ContextMenuTrigger } from "react-contextmenu";

import actions from "../api_requests/actions";
import navigate from "../navigation/navigate";
import taskState from "../state";
import AutoSizeTextarea from "./textarea";
import TaskDropzone from "./dropzone";


@observer export default class Task extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            is_new: this.props.task.text === "",
            edit_mode: this.props.task.text === "",
            edit_field_contents: this.props.task.text,
            
            previous_contents: this.props.task.text,
            saving_promise: null,
            text_to_save_buffer: null,
            delete_buffered: false,
        }
    }

    dragStart() {
        taskState.dragged_item = this.props.task;
    }

    dragEnd() {
        taskState.dragged_item = null;
    }

    activate() {
        navigate.toTask(this.props.task);
    }

    showEditMode() {
        this.setState({
            edit_mode: true,
            edit_field_contents: this.props.task.text,
            previous_contents: this.props.task.text,
        });
    }

    delete() {
        actions.deleteTask(this.props.task);
    }
    
    clearEditState() {
        this.setState({
            edit_mode: false,
            is_new: false,
            saving_promise: false,
            text_to_save_buffer: null,
            edit_field_contents: this.props.task.text,
            previous_contents: this.props.task.text,
        });
    }

    runSave(new_contents=null) {
        // Deletes take priority over anything in the buffer, and will naturally clean up
        // any remaining data by erasing this React component instance entirely after the
        // delete finishes resolving.
        if (this.state.delete_buffered) {
            return actions.deleteTask(this.props.task);
        }

        const text = new_contents !== null
            ? new_contents
            : this.state.text_to_save_buffer;

        // If no new text has been supplied or buffered, we're done with the save action,
        // so clear the stored promise and return.
        if (text === null) {
            this.setState({saving_promise: null});
            return;
        }

        // Clear the buffer now that we've consumed it.
        this.setState({
            text_to_save_buffer: null
        });

        // Kick off the save action, asynchronously. Chain it into another runSave
        // in case more operations are buffered in-between.
        const new_saving_promise = actions.setTaskText(this.props.task, text).then(() => {
            return this.runSave();
        });
        
        // If the state doesn't already have a saving_promise on it, set it to our
        // newly-constructed one.
        if (!this.state.saving_promise) {
            this.setState({saving_promise: new_saving_promise});
        }

        // Return the new promise so we can chain off it elsewhere.
        return new_saving_promise;
    }

    autosave(new_contents) {
        // Buffer the changes if a save is already in progress; otherwise, start one.
        if (this.state.saving_promise) {
            this.setState({text_to_save_buffer: new_contents});
            return this.state.saving_promise;
        }

        return this.runSave(new_contents);
    }

    delete_this_task() {
        // Buffer a deletion if a save is already in progress; otherwise, delete the
        // task immediately.
        if (this.state.saving_promise) {
            this.setState({delete_buffered: true});
            return;
        }
        
        actions.deleteTask(this.props.task);
    }

    handleSaveEditButton() {
        // If the task is saved with empty contents, delete it. Otherwise, save the current
        // text and close the editing UI.
        let text = this.state.edit_field_contents;

        if (text === "") {
            this.delete_this_task();
            return;
        }

        this.autosave(text).then(() => {
            this.clearEditState();
        });
    }

    handleCancelEditButton() {
        // When a task has never been saved with nonempty contents, and the user closes
        // the edit UI, delete the task. Otherwise, restore it to the contents it had
        // before editing.
        if (this.state.is_new) {
            this.delete_this_task();
            return;
        }

        this.autosave(this.state.previous_contents).then(() => {
            this.clearEditState();
        });
    }

    handleEditTextInput(event) {
        const text = event.target.value;
        this.setState({edit_field_contents: text});
        this.autosave(text);
    }

    handleEscEnter(event) {
        if (event.key === "Enter") {
            // Block the onChange handler from also firing using event.preventDefault.
            event.preventDefault();
            this.handleSaveEditButton();
        } else if (event.key === "Escape") {
            event.preventDefault();
            this.handleCancelEditButton();
        }
    }

    toggleDone(event) {
        event.stopPropagation();
        actions.setTaskDone(this.props.task, !this.props.task.done);
    }

    parseTextForURLs(text) {
        // Look through the task's text for any URLs. Return a list of components -
        // either text or <a href> elements.
        const url_index = text.indexOf("http", url_index);

        if (url_index === -1) {
            return [text];
        }

        let result = [text.slice(0, url_index)];

        let space_index = text.indexOf(" ", url_index);
        if (space_index === -1) {
            space_index = text.length;
        }

        const url = text.slice(url_index, space_index);
        result.push(
            <a key={url} onClick={(e) => e.stopPropagation()} href={url} target="_blank">{url}</a>
        );

        // Recur to look for any other URLs.
        const rest_of_text = this.parseTextForURLs(text.slice(space_index));
        return result.concat(rest_of_text);
    }

    renderTaskText() {
        let checkbox_class = "imitation-checkbox";
        if (this.props.task.done) {
            checkbox_class = "checked " + checkbox_class;
        }

        return (
            <ContextMenuTrigger
                id="task-context-menu"
                key="task-text"
                disableIfShiftIsPressed={true}
                holdToDisplay={500}
                collect={(props) => {
                    // This function is called when the context menu is opened, in order to
                    // gather useful data about the thing that opened it. We can also use this
                    // to track that this is the open object.
                    taskState.context_menu_source_task = this.props.task;
                    return {
                        showEditCallback: this.showEditMode.bind(this),
                        deleteCallback: this.delete.bind(this),
                    }
                }}
                attributes={{
                    className: "task-entry",
                    onClick: this.activate.bind(this),
                }}
            >
                <div className="checkbox-wrapper" onClick={this.toggleDone.bind(this)}>
                    <div className={checkbox_class} />
                </div>

                <span className="task-text">{this.parseTextForURLs(this.props.task.text)}</span>

                {Object.keys(this.props.task.children).length > 0 &&
                    <div className="caret-wrapper">
                        <div className="caret" />
                    </div>
                }
            </ContextMenuTrigger>
        );
    }

    renderEditForm() {
        return (
            <div key="add-form" className="edit-form task-entry">
                <AutoSizeTextarea
                    autoFocus={true}
                    value={this.state.edit_field_contents}
                    onChange={this.handleEditTextInput.bind(this)}
                    onKeyDown={this.handleEscEnter.bind(this)}
                />

                <div className="actions">
                    <button className="submit" onClick={this.handleSaveEditButton.bind(this)}>&#128190;</button>
                    <button className="submit" onClick={this.handleCancelEditButton.bind(this)}>&#10006;</button>
                </div>
            </div>
        );
    }

    render() {
        const draggable = !this.state.edit_mode && !taskState.is_mobile;
        const is_context_menu_source = (taskState.context_menu_source_task === this.props.task);

        const className = [
            is_context_menu_source ? "hover-lock" : "",
            this.props.is_active ? "active" : "",
            "main-row",
        ].join(" ");

        return (
            <div
                key="main-row"
                className={className}
                draggable={draggable}
                onDragStart={draggable ? this.dragStart.bind(this) : null}
                onDragEnd={draggable ? this.dragEnd.bind(this) : null}
            >
                {this.state.edit_mode
                    ? this.renderEditForm()
                    : this.renderTaskText()
                }

                <TaskDropzone zoneType="in" task={this.props.task} />
            </div>
        );
    }
}

