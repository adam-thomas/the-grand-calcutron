import $ from "jquery";
import {observer} from "mobx-react";
import React from "react";

import actions from "./actions";
import taskState from "./state";


@observer class TabList extends React.Component {
    showTab(id) {
        taskState.active_tab = id;

        if (this.props.extra_show_callback) {
            this.props.extra_show_callback();
        }
    }

    renderTab(tab) {
        let activeClass = (tab.id === taskState.active_tab) ? "active" : "";

        return (
            <button key={tab.id} className={activeClass} onClick={this.showTab.bind(this, tab.id)}>
                <span>{tab.title}</span>
            </button>
        );
    }

    render() {
        let tabs = Object.values(taskState.tasks);
        return tabs.map(tab => this.renderTab(tab));
    }
}


@observer class TabContainer extends React.Component {
    render() {
        let task = this.props.task;

        return (
            <div className="tab-contents-container">
                <SubtaskList task={task} />
            </div>
        );
    }
}


@observer class SubtaskList extends React.Component {
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
        let children = Object.values(task.children);

        return (
            <ul className="child-tasks">
                {children.map(child => (
                    <li key={child.id} className="task-wrapper">
                        <Task task={child} />
                    </li>
                ))}

                <li key="add-form" className="task-form-wrapper">
                    <input ref={this.title_field_ref} type="text" className="task-title" name="title" onKeyPress={this.handleEnter.bind(this)}/>
                    <button className="submit" onClick={this.addChild.bind(this)}>Add</button>
                </li>
            </ul>
        );
    }
}


@observer class Task extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show_children: false,
        }
    }

    delete() {
        actions.deleteTask(this.props.task);
    }

    toggleChildren() {
        this.setState({show_children: !this.state.show_children});
    }

    showAddForm() {
        this.setState({show_children: true});
        // todo: Focus the add form
    }

    render() {
        let caret_class = "caret";
        if (this.state.show_children) {
            caret_class = "open " + caret_class;
        }

        let main_row = (
            <div key="main-row" className="main-row">
                <div key="title" className="title" onClick={this.toggleChildren.bind(this)}>
                    <span>{this.props.task.title}</span>
                    {Object.keys(this.props.task.children).length > 0 &&
                        <div className={caret_class} />
                    }
                </div>

                <div key="extra-buttons" className="extra-buttons">
                    <button key="show-add" onClick={this.showAddForm.bind(this)}>+</button>
                    <button key="delete" onClick={this.delete.bind(this)}>x</button>
                </div>
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


export default {
    TabList,
    TabContainer,
}
