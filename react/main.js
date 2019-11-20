import DjangoCSRFToken from 'django-react-csrftoken';
import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";

class App extends React.Component {
    render() {
        return (<h1>hooray, it worked, part 2!</h1>);
    }
}

const wrapper = document.getElementById("app");
if (wrapper) {
    ReactDOM.render(<App />, wrapper);
}


function getFieldValue(form_element, field_name) {
    return $(form_element).find("input[name=" + field_name + "]").val();
}


function parseForm(form_element) {
    results = {};
    let input_elements = $(form_element).find("input");

    for (let input of input_elements) {
        results[$(input).attr("name")] = $(input).val();
    }
    return results;
}



class TabBar extends React.Component {

}

/*
{% if task.parent is None %}
    <div class="tab-contents-container" id="container-of-{{ task.id }}">
{% endif %}

{% if task.parent is not None %}
    <div class="main-row">
        <span class="title">{{ child.title }}</span>

        {% comment %} Show children and add/delete buttons {% endcomment %}
        <button class="show-children" onclick="toggleChildren(this, {{ task.id }})">v</button>

        {% comment %} Show Add form {% endcomment %}
        <button class="show-add-form" onclick="showAddForm({{ task.id }})">+</button>

        {% comment %} Delete button {% endcomment %}
        {% url "delete" as delete_url %}
        <form class="delete-task" method="post" action="#" onsubmit="submitAjaxForm(event, this, '{{ delete_url }}')">
            {% csrf_token %}
            <input type="hidden" name="parent" value="{{ task.parent.id }}" />
            <input type="hidden" name="id" value="{{ task.id }}" />
            <button type="submit" class="submit">x</button>
        </form>
    </div>

    {% if child.long_text %}<div class="long-text">{{ child.long_text }}</div>{% endif %}
{% endif %}

<ul class="{% if depth == 0 %}show{% endif %} child-tasks" id="children-of-{{ task.id }}">
    {% for child in task.children.all %}
        <li class="task-wrapper" id="wrapper-of-{{ child.id }}">
            {% include "calcutron/task.html" with task=child depth=depth|add:1 %}
        </li>
    {% endfor %}

    <li class="{% if task.parent is None %}show{% endif %} task-form-wrapper" id="add-form-of-{{ task.id }}">
        {% url "new" as new_url %}
        <form class="new-task" method="post" action="#" onsubmit="submitAjaxForm(event, this, '{{ new_url }}')">
            {% csrf_token %}
            <input type="hidden" name="parent" value="{{ task.id }}" />
            <input type="text" class="task-title" name="title" />
            <button type="submit" class="submit">Add</button>
        </form>
    </li>
</ul>

{% if task.parent is None %}
    </div>
{% endif %}

*/

class TabContainer extends React.Component {
    render() {
        let task = this.props.task;

        child_tasks = task.children.map((child) => (
            <li key={child.id} className="task-wrapper">
                <Task task={child} />
            </li>
        ));

        return (
            <ul className="tab-contents-container child-tasks">
                {task.children.map((child) => (
                    <li key={child.id} className="task-wrapper">
                        <Task task={child} />
                    </li>
                ))}


            </ul>
        );
    }
}


class AddTaskForm extends React.Component {
    constructor(props) {
        super(props);
        this.form_ref = React.createRef();
    }

    submitAjaxForm(event) {
        event.preventDefault();
        data = {
            parent: this.props.task.id,
            title: getFieldValue(this.form_ref.current, "title"),
        };

        $.post("/new", data, (return_data, status) => {
            children_element = $("#children-of-" + data.parent);
            children_element.replaceWith(return_data);

            showAddInner(children_element, children_element.parent().children(".main-row"));
            showAddForm(data.parent);
        });
    }

    render() {
        return (
            <li className="task-form-wrapper">
                <form ref={this.form_ref} className="new-task" method="post" action="#" onsubmit={this.submitAjaxForm}>
                    <DjangoCSRFToken />
                    <input type="hidden" name="parent" value={this.props.task.id} />
                    <input type="text" class="task-title" name="title" />
                    <button type="submit" class="submit">Add</button>
                </form>
            </li>
        );
    }
}


class SubtaskList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: props.visible || false,
        };
    }

    render() {
        if (!this.state.visible) {
            return null;
        }

        let task = this.props.task;

        return (
            <ul class="child-tasks" id="children-of-{{ task.id }}">
                {% for child in task.children.all %}
                    <li class="task-wrapper" id="wrapper-of-{{ child.id }}">
                        {% include "calcutron/task.html" with task=child depth=depth|add:1 %}
                    </li>
                {% endfor %}

                <li class="{% if task.parent is None %}show{% endif %} task-form-wrapper" id="add-form-of-{{ task.id }}">
                    {% url "new" as new_url %}
                    <form class="new-task" method="post" action="#" onsubmit="submitAjaxForm(event, this, '{{ new_url }}')">
                        {% csrf_token %}
                        <input type="hidden" name="parent" value="{{ task.id }}" />
                        <input type="text" class="task-title" name="title" />
                        <button type="submit" class="submit">Add</button>
                    </form>
                </li>
            </ul>
        );
    }
}


class Task extends React.Component {
    render() {

    }
}
