import DjangoCSRFToken from 'django-react-csrftoken';
import $ from "jquery";
import {observer} from "mobx-react";
import {transaction} from "mobx";
import React from "react";
import ReactDOM from "react-dom";

import taskState from "./state";

class App extends React.Component {
    render() {
        let root_tasks = Object.values(taskState.tasks);

        return (root_tasks.map(task => (
            <TabContainer task={task} />
        )));
    }
}

const wrapper = document.getElementById("app");
if (wrapper) {
    taskState.initialise();
    ReactDOM.render(<App />, wrapper);
}


// class TabBar extends React.Component {
//
// }


class TabContainer extends React.Component {
    render() {
        let task = this.props.task;

        return (
            <div className="tab-contents-container">
                <SubtaskList task={task} />
            </div>
        );
    }
}


class SubtaskList extends React.Component {
    constructor(props) {
        super(props);
        this.title_field_ref = React.createRef();
        // this.csrf_ref = React.createRef();
    }

    addChild() {
        let data = {
            // TODO: Figure out a reasonable solution for CSRF
            //   (https://docs.djangoproject.com/en/2.2/ref/csrf/#ajax has some good hints)
            // csrfmiddlewaretoken: $(this.csrf_ref.current).val(),
            title: $(this.title_field_ref.current).val(),
            parent: this.props.task.id,
        };

        // TODO: add Ajax and make those endpoints return json
        // $.post("/new", data, (return_data, status) => {
        // });

        // Use a fake testing id for now
        data.id = 99;
        taskState.addTask(this.props.task.id, data);
    }

    render() {
        let task = this.props.task;
        let children = Object.values(task.children);

        return (
            <ul className="child-tasks">
                {children.map(child => (
                    <li className="task-wrapper">
                        <Task task={child} />
                    </li>
                ))}

                <li className="task-form-wrapper">
                    <div className="new-task">
                        {/*<DjangoCSRFToken ref={this.csrf_ref} />*/}
                        <input ref={this.title_field_ref} type="text" className="task-title" name="title" />
                        <button className="submit" onClick={this.addChild}>Add</button>
                    </div>
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
        this.setState(!this.state.show_children);
    }


    render() {
        let main_row = (
            <div className="main-row">
                <span className="title">{this.props.task.title}</span>

                <button className="show-children" onClick={this.toggleChildren}>
                    {this.state.show_children ? "-" : "v"}
                </button>

                <button className="delete-task" onClick={this.delete}>x</button>
            </div>
        );

        if (!this.state.show_children) {
            return main_row;
        }

        return [
            main_row,
            <SubtaskList task={this.props.task} />,
        ];
    }
}
