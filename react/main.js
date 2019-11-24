import DjangoCSRFToken from 'django-react-csrftoken';
import $ from "jquery";
import {observer} from "mobx-react";
import {transaction} from "mobx";
import React from "react";
import ReactDOM from "react-dom";

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

        let data = {
            csrfmiddlewaretoken: taskState.csrf,
            title: field_element.val(),
            parent: this.props.task.id,
        };

        $.post("/new", data, (return_data) => {
            if (return_data.errors) {
                alert(Object.values(return_data.errors));
            } else {
                taskState.addTask(this.props.task.id, return_data);
            }
        });

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
                    <form className="new-task" action="#" onSubmit={this.addChild.bind(this)}>
                        <DjangoCSRFToken />
                        <input ref={this.title_field_ref} type="text" className="task-title" name="title" />
                        <button className="submit">Add</button>
                    </form>
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
        let task = this.props.task;
        let data = {
            id: task.id,
            parent: task.parent.id,
        };

        // TODO Turn the Ajax interactions on
        // $.post("/delete", data, (return_data, status) => {});

        let parent_children = taskState.tasks_by_id[task.parent].children;
        transaction(() => {
            delete taskState.tasks_by_id[task.id];
            delete parent_children[task.id];
        });
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
            (
                <div key="contents" className="task-container-wrapper">
                    <TabContainer task={active_task} />
                </div>
            ),
        ];
    }
}

const wrapper = document.getElementById("app");
if (wrapper) {
    taskState.initialise();
    ReactDOM.render(<App />, wrapper);

    // Get the CSRF token we added, and store it in the state
    taskState.csrf = $(wrapper).children("input[name=csrfmiddlewaretoken]").val();
}
