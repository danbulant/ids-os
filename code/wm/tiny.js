const x11 = require('x11');
const { exec } = require('child_process');
const { promisify } = require("util");
const ApplicationWindow = require('./applicationWindow');
const { internAtom, setX } = require('./util');

exec("konsole", (err, stdout, stderr) => {
    if (err) console.log("Error", err);
    console.log("Out", stdout);
    console.log("Err", stderr);
});

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION", err);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("UNHANDLED REJECTION", reason);
});

var /** @type {import("x11").XPromisifiedClient} */X, /** @type {number} */root, /** @type {number} */white;
var screen;

var windows = {};
async function ManageWindow(wid, shouldMap = false) {
    try {
        const attrs = await X.GetWindowAttributes(wid);
        if (attrs[8] || attrs.overrideRedirect) // override-redirect flag
        {
            // don't manage
            if(shouldMap) X.MapWindow(wid).catch(e => console.warn(e));
            return;
        }
    } catch(e) {
        console.warn("Attribute fetch", e);
        return;
    }
    console.log("Starting to manage window", wid);
    var window = new ApplicationWindow(wid, X, screen);
    windows[window.wid] = window;
    var winX, winY;
    winX = parseInt(Math.random() * 300);
    winY = parseInt(Math.random() * 300);
    await window.createFrame(winX, winY);

    if(shouldMap) {
        console.log("Mapping window", wid, X.seq_num + 1);
        window.map();
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
    setX(X);

    X.Render = await X.require("render");
    X.Composite = await X.require("composite");
    X.hasCompositor = false;

    screen = display.screen[X.screenNum];
    root = screen.root;

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
            if(!X.hasCompositor) console.log("Compositor started");
            X.hasCompositor = true;
        } else {
            if(X.hasCompositor) console.log("Compositor stopped");
            X.hasCompositor = false;
        }
    }
    setInterval(check, 1000);
    await check();
    
    const tree = await X.QueryTree(root);
    tree.children.forEach((win) => ManageWindow(win, false));
}).on('error', function (err) {
    console.error(err);
}).on('event', function (ev) {
    if (ev.name === "MapRequest") // MapRequest
    {
        if (!windows[ev.wid])
            ManageWindow(ev.wid, true).catch(e => console.warn(e));
        return;
    } else if (ev.name === "ConfigureRequest") // ConfigureRequest
    {
        X.ResizeWindow(ev.wid, ev.width, ev.height);
    }
});