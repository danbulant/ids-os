const { getAtomName, getContents } = require("./util");
const { EventEmitter } = require("events");

module.exports = class Window extends EventEmitter {
    /**
     * @param {number} wid 
     * @param {import("x11").XPromisifiedClient} X 
     * @param {import("x11").Screen} screen
     */
    constructor(wid, X, screen) {
        super();
        if(wid === screen.root) {
            /** @type {Window} */
            this.root = this;
        } else {
            this.root = Window.getRootWindow(screen, X);
        }
        this.screen = screen;
        this.wid = wid;
        console.log("Window created", this.wid);
        this.X = X;
        this.X.event_consumers[wid] = this;

        this.width = -1;
        this.height = -1;
        this.x = -1;
        this.y = -1;
        this.depth = -1;

        this.on("event", (/** @type {import("x11").Event} */ev) => {
            switch(ev.name) {
                case "DestroyNotify":
                    delete this.X.event_consumers[wid];
                    break;
            }
        });
    }

    reparent(parent, x, y) {
        return this.X.ReparentWindow(this.wid, parent, x, y);
    }

    raise() {
        return this.X.RaiseWindow(this.wid);
    }

    focusInput() {
        return this.X.SetInputFocus(this.wid);
    }

    /**
     * Listens for X events.
     * @param {"event"} event 
     * @param {(ev: import("x11").Event) => void} cb 
     * @returns 
     *//**
     * Listens for event
     * @param {string} event 
     * @param {Function} cb 
     */
    on(event, cb) {
        return super.on(event, cb);
    }

    map() {
        return this.X.MapWindow(this.wid);
    }
    unmap() {
        return this.X.UnmapWindow(this.wid);
    }

    destroy() {
        return this.X.DestroyWindow(this.wid);
    }

    /**
     * @param {import("x11").XWindowAttributes} attrs
     */
    changeAttributes(attrs) {
        console.log("Changing attributes", this.wid, attrs, this.X.seq_num + 1);
        return this.X.ChangeWindowAttributes(this.wid, attrs);
    }

    getAttributes() {
        return this.X.GetWindowAttributes(this.wid);
    }

    /**
     * Lists available properties
     */
    async listProperties() {
        const props = await this.X.ListProperties(this.wid);
        return await Promise.all(props.map(t => getAtomName(t)));
    }

    /**
     * Gets the value of specific property
     * @param {number | string} atom
     */
    getProperty(atom) {
        console.log("Getting property from", atom);
        if(typeof atom === "number") getAtomName(atom).then(name => console.log("Property name", name)).catch(e => console.warn("Error getting atom name", e));
        return getContents(this.wid, atom);
    }

    async getGeometry() {
        const geo = await this.X.GetGeometry(this.wid);
        this.width = geo.width;
        this.height = geo.height;
        this.x = geo.xPos;
        this.y = geo.yPos;
        this.depth = geo.depth;
        return geo;
    }

    move(x, y) {
        this.x = x;
        this.y = y;
        return this.X.MoveWindow(this.wid, x, y);
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        return this.X.ResizeWindow(this.wid, width, height);
    }

    moveResize(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this.X.MoveResizeWindow(this.wid, x, y, width, height);
    }

    /** @type {{ [index: number]: Window }} */
    static roots = {};
    /**
     * @param {import("x11").Screen} screen
     * @param {import("x11").XPromisifiedClient} X
     */
    static getRootWindow(screen, X) {
        if(!this.roots[screen.root]) {
            this.roots[screen.root] = new Window(screen.root, X, screen);
        }
        return this.roots[screen.root];
    }
}