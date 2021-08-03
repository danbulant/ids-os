const x11 = require('x11');
const { exec } = require('child_process');
const { promisify } = require("util");
var EventEmitter = require('events').EventEmitter;
const parse = require('./parse');

exec("konsole", (err, stdout, stderr) => {
    if (err) console.log("Error", err);
    console.log("Out", stdout);
    console.log("Err", stderr);
});

var /** @type {import("x11").XPromisifiedClient} */X, /** @type {number} */root, /** @type {number} */white;
var events = x11.eventMask.Button1Motion | x11.eventMask.ButtonPress | x11.eventMask.ButtonRelease | x11.eventMask.SubstructureNotify | x11.eventMask.SubstructureRedirect | x11.eventMask.Exposure | x11.eventMask.FocusChange;
var frames = {};
var hasCompositor = false;
/**
 * @type {{ keycode: number, rootx: number, rooty: number, x: number, y: number, winX: number, winY: number, width: number, height: number } | null}
 */
var dragStart = null;

async function getAtomName(atom) {
    if(X.atom_names[atom]) return X.atom_names[atom];
    var name = await X.GetAtomName(atom);
    X.atom_names[atom] = name;
    return name;
}
async function internAtom(name, onlyExists = true) {
    if(X.atoms[name]) return X.atoms[name];
    var atom = await X.InternAtom(onlyExists, name);
    X.atoms[name] = atom;
    return atom;
}
async function getPropertyString(wid, atom, encoding = "utf-8") {
    if(typeof atom === "string") atom = await internAtom(atom, true);
    const data = await X.GetProperty(false, wid, atom, 0, 0, 512);
    return data.data.toString(encoding || "utf-8");
}

/**
 * @param {x11.AtomValue} property 
 * @param {string} name
 * @returns 
 */
async function _dbgParseContents(property, name) {
    const type = await getAtomName(property.type);
    switch(type) {
        case "STRING":
        case "UTF8_STRING":
            if(name === "WM_CLASS") return parse.parseClass(property.data);
            return property.data.toString("utf-8");
        case "WINDOW":
        case "CARDINAL":
            return property.data.readUInt32LE();
        case "ATOM":
            return await getAtomName(property.data.readUInt32LE());
        case "WM_SIZE_HINTS":
            return parse.parseNormalHints(property.data);
        case "WM_HINTS":
            return parse.parseHints(property.data);
        default:
            return null;
    }
}

async function getContents(wid, atom) {
    if(typeof atom === "string") atom = await internAtom(atom, true);
    const data = await X.GetProperty(false, wid, atom, 0, 0, 512);
    return _dbgParseContents(data, await getAtomName(atom));
}

var seq = 0;
async function ManageWindow(wid, shouldMap = false) {
    var title = await getPropertyString(wid, "_NET_WM_NAME") || await getPropertyString(wid, "WM_NAME");
    console.log("MANAGE WINDOW: " + wid, title);

    const atoms = await X.ListProperties(wid);
    for(const atom of atoms) {
        getAtomName(atom).then(async name => {
            const val = await X.GetProperty(false, wid, atom, 0, 0, 512);
            console.log(`${title} | ATOM:${atom} TYPE:${await getAtomName(val.type)} ${name} =`, await _dbgParseContents(val, name));
        }).catch(e => console.warn(e));
    }

    const attrs = await X.GetWindowAttributes(wid);
    if (attrs[8] || attrs.overrideRedirect) // override-redirect flag
    {
        // don't manage
        if(shouldMap) X.MapWindow(wid);
        return;
    }

    var fid = X.AllocID();
    frames[fid] = 1;
    var winX, winY;
    winX = parseInt(Math.random() * 300);
    winY = parseInt(Math.random() * 300);
    const barHeight = 26;
    const barWidth = 8;

    const clientGeom = await X.GetGeometry(wid);
    var width = clientGeom.width + barWidth;
    var height = clientGeom.height + barHeight + barWidth / 2;
    X.CreateWindow(fid, root, winX, winY, width, height, 0, 0, 0, 0, {
        backgroundPixel: white,
        eventMask: events
    });

    var headerImage = X.AllocID();

    X.Render.LinearGradient(headerImage, [0, 0], [0, barHeight], [
        [0,   [ 0.078   , 0.078 , 0.078 , 1 ]],
        [1,   [ 0.078   , 0.078 , 0.078 , 1 ]]
    ]);

    var framepic = X.AllocID();
    var text = X.AllocID();
    X.Render.CreatePicture(framepic, fid, X.Render.rgb24);
    X.CreateGC(text, fid, { foreground: white });

    async function close() {
        const protocols = await getContents(wid, "WM_PROTOCOLS");
        if(protocols && typeof protocols === "string" && protocols.includes("WM_DELETE_WINDOW")) {
            const data = Buffer.alloc(32);
            data.writeInt8(33);
            data.writeInt8(32, 1);
            data.writeInt16LE(++X.seq_num, 2);
            data.writeInt32LE(wid, 4);
            data.writeInt32LE(await internAtom("WM_PROTOCOLS"), 8);
            data.writeInt32LE(await internAtom("WM_DELETE_WINDOW", false), 12);
            data.writeInt32LE(Math.floor(Date.now() / 1000), 16);
            console.log(data);
            X.SendEvent(wid, false, 0, data).catch(e => console.warn(e));
        } else {
            X.DestroyWindow(wid).catch(e => console.warn(e));
        }
    }

    function render() {
        X.Render.Composite(3, headerImage, 0, framepic, 0, 0, 0, 0, 0, 0, width, height);
        X.PolyText8(fid, text, 10, 20, [title]);
        X.PolyText8(fid, text, width - 20, 20, ["X"]);
    }
    render();

    X.ChangeWindowAttributes(wid, {
        eventMask: x11.eventMask.PropertyChange | x11.eventMask.FocusChange | x11.eventMask.SubstructureNotify
    });
    const winEvents = new EventEmitter();
    X.event_consumers[wid] = winEvents;
    winEvents.on("event", async (/** @type {import("x11").Event */ev) => {
        if(ev.name === "ButtonPress" || ev.name === "FocusIn") {
            X.RaiseWindow(fid);
            X.SetInputFocus(wid);
            console.log("Window focus");
        } else if(ev.name === "UnmapNotify") {
            X.UnmapWindow(fid);
            X.UnmapWindow(wid);
        } else if(ev.name === "MapNotify") {
            X.MapWindow(fid);
            X.MapWindow(wid);
        } else if(ev.name === "DestroyNotify") {
            X.DestroyWindow(fid).catch(e => console.warn("fid", e));
            X.Render.FreePicture(framepic);
            delete X.event_consumers[wid];
        } else if(ev.name === "PropertyNotify") {
            const atom = ev.atom;
            const val = await X.GetProperty(false, wid, atom, 0, 0, 512);
            console.log(`${title} | CHANGED ATOM:${atom} TYPE:${await getAtomName(val.type)} ${await getAtomName(atom)} =`, await _dbgParseContents(val, await getAtomName(val.type)));

            if(ev.atom === await internAtom("WM_NAME")) {
                title = await getPropertyString(wid, "_NET_WM_NAME");
                if(!title) {
                    title = await getPropertyString(wid, "WM_NAME");
                    render();
                }
            } else if(ev.atom === await internAtom("_NET_WM_NAME")) {
                title = await getPropertyString(wid, "_NET_WM_NAME");
                render();
            }
        }
    });

    var ee = new EventEmitter();
    X.event_consumers[fid] = ee;
    ee.on('event', function (/** @type {import("x11").Event */ev) {
        if (ev.name === "DestroyNotify") {
            console.log(ev);
            console.log(`#\n# DESTROYED WINDOW ${title}\n#`);
            X.DestroyWindow(fid).catch(e => console.warn("fid", e));
            X.DestroyWindow(wid).catch(e => console.warn("wid", e));
            X.Render.FreePicture(framepic);
            delete X.event_consumers[fid];
        } else if(ev.name === "UnmapNotify") {
            X.UnmapWindow(fid);
            X.UnmapWindow(wid);
        } else if(ev.name === "MapRequest" || ev.name === "MapNotify") {
            X.MapWindow(fid);
            X.MapWindow(wid);
        } else if(ev.name === "FocusIn") {
            X.RaiseWindow(fid);
            X.SetInputFocus(wid);
        } else if("ButtonPress" && ev.keycode === 1) {
            var relativeX = ev.rootx - winX;
            var relativeY = ev.rooty - winY;
            if(
                width - relativeX < 20 &&
                width - relativeX > barWidth &&
                relativeY < 20 &&
                relativeY > barWidth) {
                    close();
            } else {
                X.RaiseWindow(fid);
                X.SetInputFocus(wid);
                dragStart = { keycode: ev.keycode, rootx: ev.rootx, rooty: ev.rooty, x: ev.x, y: ev.y, winX, winY, width, height };
            }
        } else if("ButtonPress" && ev.keycode === 2) {
            close();
        } else if (ev.name === "ButtonRelease") {
            dragStart = null;
        } else if (ev.name === "MotionNotify") {
            if(!dragStart) return;
            var xDiff = ev.rootx - dragStart.rootx;
            var yDiff = ev.rooty - dragStart.rooty;
            var relativeX = dragStart.rootx - dragStart.winX;
            var relativeY = dragStart.rooty - dragStart.winY;

            if(relativeX <= barWidth) {
                width = dragStart.width - xDiff;
                winX = dragStart.winX + xDiff;
            }
            if(relativeY <= barWidth) {
                height = dragStart.height - yDiff;
                winY = dragStart.winY + yDiff;
            }
            if(dragStart.width - relativeX <= barWidth) {
                width = dragStart.width + xDiff;
            }
            if(dragStart.height - relativeY <= barWidth) {
                height = dragStart.height + yDiff;
            }
            if(!((relativeX <= barWidth) || (relativeY <= barWidth) || (dragStart.width - relativeX <= barWidth) || (dragStart.height - relativeY <= barWidth))) {
                winY = dragStart.winY + yDiff;
                winX = dragStart.winX + xDiff;
            }

            console.log(`${title} M ${dragStart.rootx}/${dragStart.winX} ${dragStart.rooty}/${dragStart.winY} ${relativeX}/${dragStart.width} ${relativeY}/${dragStart.height} MoveResize ${fid} ${winX} ${winY} ${width} ${height}`);
            X.MoveResizeWindow(fid, winX, winY, width, height);
            X.MoveResizeWindow(wid, barWidth / 2, barHeight, width - barWidth, height - barHeight - barWidth / 2);
        } else if (ev.name === "Expose") {
            render();
        } else console.log(ev);
    });

    X.ChangeSaveSet(1, wid);
    X.ReparentWindow(wid, fid, barWidth / 2, barHeight);

    if(shouldMap) {
        X.MapWindow(fid);
        X.MapWindow(wid);
    }
}

var originalX;
x11.createClient(async function (err, display) {
    console.log("Intializing");
    X = Object.assign({}, display.client);
    originalX = display.client;
    for(const method in X) {
        if(typeof X[method] !== "function") continue;
        X[method] = promisify(X[method]).bind(originalX);
    }
    X.require = promisify(originalX.require).bind(originalX);
    X.AllocID = originalX.AllocID.bind(originalX);

    X.Render = await X.require("render");
    X.Composite = await X.require("composite");

    root = display.screen[0].root;
    white = display.screen[0].white_pixel;

    console.log('root = ' + root);
    X.ChangeWindowAttributes(root, { eventMask: x11.eventMask.Exposure | x11.eventMask.SubstructureRedirect }).catch(e => {
        if (e.error == 10) {
            console.error('Error: another window manager already running.');
            process.exit(1);
        }
    });
    async function check() {
        const owner = await X.GetSelectionOwner(await internAtom("_NET_WM_CM_S" + X.screenNum));
        if(owner) {
            if(!hasCompositor) console.log("Compositor started");
            hasCompositor = true;
        } else {
            if(hasCompositor) console.log("Compositor stopped");
            hasCompositor = false;
        }
    }
    setInterval(check, 1000);
    await check();
    
    const tree = await X.QueryTree(root);
    tree.children.forEach((win) => ManageWindow(win, false));
}).on('error', function (err) {
    console.error(err);
}).on('event', function (ev) {
    if (ev.name === "MapRequest")        // MapRequest
    {
        if (!frames[ev.wid])
            ManageWindow(ev.wid, true);
        return;
    } else if (ev.name === "ConfigureRequest") // ConfigureRequest
    {
        X.ResizeWindow(ev.wid, ev.width, ev.height);
    }
});