import {observable} from "mobx";


export default class Task {
    @observable text = "";
    @observable sort_order = undefined;
    @observable children = {};
    @observable done = false;
    @observable to_delete = false;

    id = null;
    parent = null;

    // The parent_id isn't meant to be used as a representative field, but we do need to cache it
    // when retrieving tasks from the backend, so that we can attach the task to its actual parent
    // later on.
    _parent_id = null;

    // Use a temporary ID while the task doesn't exist in the backend.
    temporary_id = null;

    constructor({ text="", sort_order=undefined, done=false, id=null, parent_id=null, parent=null }) {
        this.text = text;
        this.sort_order = sort_order;
        this.done = done;
        this.id = id;

        if (parent) {
            this.parent = parent;
        } else {
            this._parent_id = parent_id;
        }

        if (id === null) {
            this.temporary_id = Date.now();
        }
    }
}
