import DjangoCSRFToken from 'django-react-csrftoken';
import {observer} from "mobx-react";
import React from "react";

import taskState from "../state";
import TaskColumn from "../tasks/task_column";
import ContextMenus from './context_menus';


@observer export default class App extends React.Component {
    renderColumn(task) {
        return (<TaskColumn task={task} key={"task_" + task.id} />);
    }


    render() {
        let task_columns = taskState.columns.map(this.renderColumn);

        return (
            <>
                <DjangoCSRFToken key="csrf" />

                <div key="ui" className="desktop-ui calcutron">
                    <ContextMenus />

                    <div key="contents" className="task-container-wrapper">
                        {task_columns}
                    </div>
                </div>
            </>
        );
    }
}
