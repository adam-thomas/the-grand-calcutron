import React from "react";
import { ContextMenu, MenuItem } from "react-contextmenu";


export default class ContextMenus extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            overlay: false,
        }

        this.enableOverlay = this.enableOverlay.bind(this);
        this.disableOverlay = this.disableOverlay.bind(this);
    }


    enableOverlay() {
        this.setState({overlay: true});
    }
    disableOverlay() {
        this.setState({overlay: false});
    }


    render() {
        return (
            <>
                {this.state.overlay && (
                    <div className="context-click-away-overlay" onClick={(event) => event.stopPropagation()} />
                )}

                <ContextMenu id="task-context-menu" onShow={this.enableOverlay} onHide={this.disableOverlay}>
                    <MenuItem data={{foo: 'bar'}} onClick={(event, data) => data.showEditCallback(event)}>
                        Edit
                    </MenuItem>
                    <MenuItem divider />
                    <MenuItem data={{foo: 'bar'}} onClick={(event, data) => data.deleteCallback(event)}>
                        Delete
                    </MenuItem>
                </ContextMenu>
            </>
        );
    }
}
