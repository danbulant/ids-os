const x11 = require('x11');
const { internAtom, getAtomName, getContents } = require("./util");
const Window = require("./window");

const barHeight = 26;
const barWidth = 8;
const events = x11.eventMask.Button1Motion | x11.eventMask.ButtonPress | x11.eventMask.ButtonRelease | x11.eventMask.SubstructureNotify | x11.eventMask.SubstructureRedirect | x11.eventMask.Exposure | x11.eventMask.FocusChange;

module.exports = class ApplicationWindow extends Window {
    constructor(wid, X, screen) {
        super(wid, X, screen);
        console.log("App created", this.wid);
        this.title = "";
        /**
         * @type {Window}
         */
        this.frame = null;
        /**
         * @type {{ keycode: number, rootx: number, rooty: number, x: number, y: number, winX: number, winY: number, width: number, height: number } | null}
         */
        this.dragStart = null;
        this.changeAttributes({
            eventMask: x11.eventMask.PropertyChange | x11.eventMask.FocusChange | x11.eventMask.StructureNotify
        }).catch(e => console.warn(e));
        
        this.on("event", async (/** @type {import("x11").Event */ev) => {
            if(ev.name === "ButtonPress" || ev.name === "FocusIn") {
                this.frame.raise();
                this.focusInput();
            } else if(ev.name === "UnmapNotify") {
                this.unmap();
            } else if(ev.name === "MapNotify") {
                this.map();
            } else if(ev.name === "DestroyNotify") {
                this.frame.destroy().catch(e => console.warn("fid", e));
                this.X.Render.FreePicture(framepic);
                delete this.X.event_consumers[this.wid];
            } else if(ev.name === "PropertyNotify") {
                const atom = ev.atom;
                try {
                    const val = await this.X.GetProperty(false, this.wid, atom, 0, 0, 512);
                    console.log(`${this.title} | CHANGED ATOM:${atom} TYPE:${await getAtomName(val.type)} ${await getAtomName(atom)} =`, await getContents(this.wid, atom));
                } catch(e) {
                    console.warn(e);
                }

                if(atom === await internAtom("WM_NAME")) {
                    this.title = await this.getProperty("_NET_WM_NAME");
                    if(!this.title) {
                        this.title = await this.getProperty("WM_NAME");
                        this.render();
                    }
                } else if(atom === await internAtom("_NET_WM_NAME")) {
                    this.title = await this.getProperty("_NET_WM_NAME");
                    this.render();
                }
            }
        });

        this.on("doubleclick", () => {
            if(this.maximized) {
                this.unmaximize();
            } else {
                this.maximize();
            }
        });
    }

    maximized = false;
    lastClick = 0;

    async createFrame(winY, winX) {
        console.log("Fetching geometry", this.X.seq_num + 1);
        var clientGeom = await this.getGeometry();
        var fid = this.X.AllocID();
        var width = clientGeom.width + barWidth;
        var height = clientGeom.height + barHeight + barWidth / 2;
        console.log(clientGeom);
        console.log("Creating frame", fid, this.X.seq_num + 1);
        this.X.CreateWindow(fid, this.screen.root, winX, winY, width, height, 0, 0, 0, 0, {
            backgroundPixel: this.screen.white_pixel,
            eventMask: events
        });
        console.log("Frame created", fid);

        this.title = await this.getProperty("_NET_WM_NAME");
        if(!this.title) {
            this.title = await this.getProperty("WM_NAME");
            render();
        }
        console.log("Window title", this.title);
        this.frame = new Window(fid, this.X, this.screen);
        await this.frame.getGeometry();

        this.headerImage = this.X.AllocID();

        this.X.Render.LinearGradient(this.headerImage, [0, 0], [0, barHeight], [
            [0,   [ 0.078   , 0.078 , 0.078 , 1 ]],
            [1,   [ 0.078   , 0.078 , 0.078 , 1 ]]
        ]);

        this.framepic = this.X.AllocID();
        this.text = this.X.AllocID();
        this.X.Render.CreatePicture(this.framepic, fid, this.X.Render.rgb24);
        this.X.CreateGC(this.text, fid, { foreground: this.screen.white_pixel });

        this.frame.on('event', async (/** @type {import("x11").Event */ev) => {
            if (ev.name === "DestroyNotify") {
                console.log(ev);
                console.log(`#\n# DESTROYED WINDOW ${this.title}\n#`);
                this.frame.destroy().catch(e => console.warn(e));
                this.destroy().catch(e => console.warn(e));
                this.X.Render.FreePicture(framepic);
            } else if(ev.name === "UnmapNotify") {
                this.unmap()
                this.frame.unmap();
            } else if(ev.name === "MapRequest" || ev.name === "MapNotify") {
                this.frame.map();
                this.map();
            } else if(ev.name === "FocusIn") {
                this.frame.raise();
                this.focusInput();
            } else if(ev.name === "ButtonPress" && ev.keycode === 1) {
                await this.frame.getGeometry();
                var relativeX = ev.rootx - this.frame.x;
                var relativeY = ev.rooty - this.frame.y;
                if(
                    width - relativeX < 20 &&
                    width - relativeX > barWidth &&
                    relativeY < 20 &&
                    relativeY > barWidth) {
                        this.close();
                } else {
                    this.frame.raise();
                    this.focusInput();
                    if(Date.now() - this.lastClick < 300) {
                        this.emit("doubleclick");
                        console.log("Title double clicked", this.lastClick, Date.now());
                    }
                    this.lastClick = Date.now();
                    this.dragStart = { keycode: ev.keycode, rootx: ev.rootx, rooty: ev.rooty, x: ev.x, y: ev.y, winX: this.frame.x, winY: this.frame.y, width: this.frame.width, height: this.frame.height };
                }
            } else if("ButtonPress" && ev.keycode === 2) {
                this.close();
            } else if (ev.name === "ButtonRelease") {
                this.dragStart = null;
            } else if (ev.name === "MotionNotify") {
                if(!this.dragStart) return;
                var xDiff = ev.rootx - this.dragStart.rootx;
                var yDiff = ev.rooty - this.dragStart.rooty;
                var relativeX = this.dragStart.rootx - this.dragStart.winX;
                var relativeY = this.dragStart.rooty - this.dragStart.winY;
                var width = this.frame.width;
                var height = this.frame.height;
                var winX = this.frame.x;
                var winY = this.frame.y;

                var rootGeom = await this.root.getGeometry();
                const snappiness = 10;

                if(relativeX <= barWidth) {
                    width = this.dragStart.width - xDiff;
                    winX = this.dragStart.winX + xDiff;

                    if(Math.abs(rootGeom.xPos - winX) <= snappiness) {
                        width = this.dragStart.width + this.dragStart.winX;
                        winX = rootGeom.xPos;
                    }
                }
                if(relativeY <= barWidth) {
                    height = this.dragStart.height - yDiff;
                    winY = this.dragStart.winY + yDiff;

                    if(Math.abs(rootGeom.yPos - winY) <= snappiness) {
                        height = this.dragStart.height + this.dragStart.winY;
                        winY = rootGeom.yPos;
                    }
                }
                if(this.dragStart.width - relativeX <= barWidth) {
                    width = this.dragStart.width + xDiff;

                    if(Math.abs(rootGeom.width + rootGeom.yPos - width - winY) <= snappiness) {
                        width = rootGeom.width + rootGeom.yPos - winY;
                    }
                }
                if(this.dragStart.height - relativeY <= barWidth) {
                    height = this.dragStart.height + yDiff;

                    if(Math.abs(rootGeom.height + rootGeom.xPos - height - winX) <= snappiness) {
                        height = rootGeom.height + rootGeom.xPos - winX;
                    }
                }
                if(!((relativeX <= barWidth) || (relativeY <= barWidth) || (this.dragStart.width - relativeX <= barWidth) || (this.dragStart.height - relativeY <= barWidth))) {
                    winY = this.dragStart.winY + yDiff;
                    winX = this.dragStart.winX + xDiff;

                    // Snap to edges
                    if(Math.abs(rootGeom.xPos - winX) <= snappiness) winX = rootGeom.xPos;
                    if(Math.abs(rootGeom.yPos - winY) <= snappiness) winY = rootGeom.yPos;
                    if(Math.abs(rootGeom.xPos + rootGeom.width - winX - width) <= snappiness) winX = rootGeom.xPos + rootGeom.width - width;
                    if(Math.abs(rootGeom.yPos + rootGeom.height - winY - height) <= snappiness) winY = rootGeom.yPos + rootGeom.height - height;
                }

                console.log(`${this.title} M ${this.dragStart.rootx}/${this.dragStart.winX} ${this.dragStart.rooty}/${this.dragStart.winY} ${relativeX}/${this.dragStart.width} ${relativeY}/${this.dragStart.height} MoveResize ${fid} ${winX} ${winY} ${width} ${height}`);
                this.moveResize(winX, winY, width, height);
            } else if (ev.name === "Expose") {
                this.render();
            } else console.log(ev);
        });

        this.X.ChangeSaveSet(1, this.wid);
        this.reparent(this.frame.wid, barWidth / 2, barHeight);
    }

    render() {
        if(!this.frame) return;
        this.X.Render.Composite(3, this.headerImage, 0, this.framepic, 0, 0, 0, 0, 0, 0, this.frame.width, this.frame.height);
        this.X.PolyText8(this.frame.wid, this.text, 10, 20, [this.title]);
        this.X.PolyText8(this.frame.wid, this.text, this.frame.width - 20, 20, ["X"]);
    }

    async close() {
        const protocols = await this.getProperty("WM_PROTOCOLS");
        if(protocols && typeof protocols === "string" && protocols.includes("WM_DELETE_WINDOW")) {
            const data = Buffer.alloc(32);
            data.writeInt8(33);
            data.writeInt8(32, 1);
            data.writeInt16LE(++X.seq_num, 2);
            data.writeInt32LE(wid, 4);
            data.writeInt32LE(await internAtom("WM_PROTOCOLS"), 8);
            data.writeInt32LE(await internAtom("WM_DELETE_WINDOW", false), 12);
            data.writeInt32LE(Math.floor(Date.now() / 1000), 16);
            this.X.SendEvent(wid, false, 0, data).catch(e => console.warn(e));
        } else {
            this.destroy().catch(e => console.warn(e));
        }
    }

    /** @type {import("x11").WindowGeometry} */
    unmaximizedGeometry = null;
    async maximize() {
        await this.root.getGeometry();
        this.maximized = true;
        this.unmaximizedGeometry = await this.getGeometry();
        console.log(this.unmaximizedGeometry);

        this.moveResize(this.root.x, this.root.y, this.root.width, this.root.height);
    }
    unmaximize() {
        this.maximized = false;
        var og = this.unmaximizedGeometry;
        this.unmaximizedGeometry = null;
        this.moveResize(og.xPos, og.yPos, og.width, og.height);
    }

    moveResize(x, y, width, height) {
        this.frame.moveResize(x, y, width, height);
        var res = super.moveResize(barWidth / 2, barHeight, width - barWidth, height - barHeight - barWidth / 2);
        return res;
    }
    move(x, y) {
        this.frame.move(x, y);
        return super.move(barWidth / 2, barHeight); // not moving it at all results in weird popup behavior
    }
    resize(width, height) {
        this.frame.resize(width, height);
        var res = super.moveResize(barWidth / 2, barHeight, width - barWidth, height - barHeight - barWidth / 2);
        return res;
    }

    getGeometry() {
        if(!this.frame) return this.getInnerGeometry();
        return this.frame.getGeometry();
    }

    getInnerGeometry() {
        return super.getGeometry();
    }

    map() {
        if(this.frame) this.frame.map();
        return super.map();
    }
    unmap() {
        if(this.frame) this.frame.unmap();
        return super.unmap();
    }
}