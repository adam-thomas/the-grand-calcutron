import {observable} from "mobx";


export default class Task {
    @observable text = "";
    @observable sort_order = 0;
    @observable children = {};
    @observable done = false;
    @observable to_delete = false;

    id = null;
    parent = null;
    parent_id = null;

    // Use a temporary ID while the task doesn't exist in the backend.
    temporary_id = null;

    constructor({ text="", sort_order=0, done=false, id=null, parent_id=null, parent=null }) {
        this.text = text;
        this.sort_order = sort_order;
        this.done = done;
        this.id = id;

        if (parent) {
            this.parent = parent;
            this.parent_id = parent.id;
        } else {
            this.parent_id = parent_id;
        }

        if (id === null) {
            this.temporary_id = Date.now();
        }
    }
}
