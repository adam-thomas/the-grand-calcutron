import { observer } from "mobx-react";
import React from "react";

import taskState, { INTERACTION_MODES } from "../state_management/state";


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

        if (taskState.interaction.mode !== INTERACTION_MODES.DRAG) {
            // Weird UI case. Do nothing.
            console.log("skipping")
            return;
        }

        operations[this.props.zoneType](taskState.interaction.task, this.props.task);
        taskState.setInteraction();
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
        if (taskState.is_mobile || taskState.interaction.mode !== INTERACTION_MODES.DRAG) {
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
