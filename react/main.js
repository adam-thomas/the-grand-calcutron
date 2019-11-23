import DjangoCSRFToken from 'django-react-csrftoken';
import $ from "jquery";
import {observer} from "mobx-react";
import {transaction} from "mobx";
import React from "react";
import ReactDOM from "react-dom";

import taskState from "./state";


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


@observer class SubtaskList extends React.Component {
    constructor(props) {
        super(props);
        this.title_field_ref = React.createRef();
        // this.csrf_ref = React.createRef();
    }

    addChild(event) {
        event.preventDefault();
        let field_element = $(this.title_field_ref.current);

        let data = {
            // TODO: Figure out a reasonable solution for CSRF
            //   (https://docs.djangoproject.com/en/2.2/ref/csrf/#ajax has some good hints)
            // csrfmiddlewaretoken: $(this.csrf_ref.current).val(),
            title: field_element.val(),
            parent: this.props.task.id,
        };

        // TODO: add Ajax and make those endpoints return json
        // $.post("/new", data, (return_data, status) => {
        // });

        // Use a fake testing id for now
        data.id = 99;
        taskState.addTask(this.props.task.id, data);
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
                        {/*<DjangoCSRFToken ref={this.csrf_ref} />*/}
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


class App extends React.Component {
    render() {
        let root_tasks = Object.values(taskState.tasks);
        return (
            <div className="task-container-wrapper">
                {root_tasks.map( task => (<TabContainer key={task.id} task={task} />) )}
            </div>
        );
    }
}

const wrapper = document.getElementById("app");
if (wrapper) {
    taskState.initialise();
    ReactDOM.render(<App />, wrapper);
}
