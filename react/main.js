import DjangoCSRFToken from 'django-react-csrftoken';
import $ from "jquery";
import {observer} from "mobx-react";
import {transaction} from "mobx";
import React from "react";
import ReactDOM from "react-dom";

import actions from "./actions";
import taskState from "./state";



@observer class TabBar extends React.Component {
    showTab(id) {
        taskState.active_tab = id;
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

        return (
            <nav className="top-tab-container">
                {tabs.map(tab => this.renderTab(tab))}
            </nav>
        );
    }
}


@observer class TabSettingsBar extends React.Component {
    constructor(props) {
        super(props);
        this.title_field_ref = React.createRef();
    }

    delete() {
        actions.deleteTask(taskState.tasks[taskState.active_tab]);
    }

    add() {
        let field_element = $(this.title_field_ref.current);

        actions.addTask(field_element.val(), null);
        field_element.val("");
    }

    update() {
        let field_element = $(this.title_field_ref.current);

        actions.updateTask(field_element.val(), taskState.tasks[taskState.active_tab]);
        field_element.val("");
    }

    toggleChildren() {
        this.setState({show_children: !this.state.show_children});
    }

    render() {
        let current_title = "";
        if (taskState.active_tab !== null) {
            current_title = taskState.tasks[taskState.active_tab].title
        }

        return (
            <footer key="tab-update-form" className="tab-options">
                <span class="title">Tab options</span>
                <input ref={this.title_field_ref} defaultValue={current_title} type="text" className="task-title" name="title" />
                <button className="submit" onClick={this.add.bind(this)}>Add</button>
                <button className="submit" onClick={this.update.bind(this)}>Update</button>
                <button className="submit" onClick={this.delete.bind(this)}>Delete</button>
            </footer>
        )
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
                    <input ref={this.title_field_ref} type="text" className="task-title" name="title" />
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

    render() {
        let main_row = (
            <div key="main-row" className="main-row">
                <span key="title" className="title">{this.props.task.title}</span>

                <button key="show-children" className="show-children" onClick={this.toggleChildren.bind(this)}>
                    {this.state.show_children ? "-" : "v"}
                </button>

                <button key="delete" className="delete-task" onClick={this.delete.bind(this)}>x</button>
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


@observer class App extends React.Component {
    render() {
        let active_task = taskState.tasks[taskState.active_tab];

        return [
            (<DjangoCSRFToken key="csrf" />),
            (<TabBar key="tabs" />),
            (active_task &&
                <div key="contents" className="task-container-wrapper">
                    <TabContainer task={active_task} />
                </div>
            ),
            (<TabSettingsBar key="settings" />),
        ];
    }
}


$(document).ready(() => {
    const wrapper = document.getElementById("app");
    if (wrapper) {
        // Get the tasks from the backend, and initialise the state with them.
        // (This will happen after the app is initially rendered.)
        $.get("/get_tasks", (return_data) => {
            taskState.initialise(return_data);
        });

        ReactDOM.render(<App />, wrapper);

        // Get the CSRF token we added, and store it in the state.
        taskState.csrf = $(wrapper).children("input[name=csrfmiddlewaretoken]").val();
    }
})
