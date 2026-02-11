import { observer } from "mobx-react";
import React from "react";

import taskState from "../state_management/state";


@observer export default class TaskDropzone extends React.Component {
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
        this.setState({highlight: false});
    }


    dragOver(event) {
        event.preventDefault();
        this.setState({highlight: true});
    }


    dragLeave() {
        this.setState({highlight: false});
    }


    render() {
        if (taskState.is_mobile || taskState.dragged_item === null) {
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
