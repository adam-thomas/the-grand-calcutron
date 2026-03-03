import React from "react";
import { ContextMenu, MenuItem } from "react-contextmenu";
import { observer } from "mobx-react";

import taskState, { INTERACTION_MODES } from "../state_management/state";


function cleanEvent(event) {
    event.stopPropagation();
    event.preventDefault();
}


@observer export default class ContextMenus extends React.Component {
    constructor(props) {
        super(props);
        this.onHideAnyMenu = this.onHideAnyMenu.bind(this);
    }

    onHideAnyMenu() {
        taskState.context_menu_source_task = null;
    }

    render() {
        return (
            <>
                <ContextMenu id="task-context-menu" onShow={this.onShowAnyMenu} onHide={this.onHideAnyMenu}>
                    <MenuItem disabled={taskState.isInteracting(INTERACTION_MODES.EDIT)} onClick={(event, data) => {
                        cleanEvent(event);
                        data.showEditCallback();
                    }}>
                        Edit
                    </MenuItem>

                    <MenuItem divider />

                    <MenuItem onClick={(event, data) => {
                        cleanEvent(event);
                        data.deleteCallback();
                    }}>
                        Delete
                    </MenuItem>
                </ContextMenu>
            </>
        );
    }
}
