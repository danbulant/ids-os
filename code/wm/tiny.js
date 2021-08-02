const x11 = require('x11');
const { exec } = require('child_process');
var EventEmitter = require('events').EventEmitter;

const GrabMode = {
    SYNC: 0,
    ASYNC: 1
};
const NONE = 0;

exec("konsole", (err, stdout, stderr) => {
    if (err) console.log("Error", err);
    console.log("Out", stdout);
    console.log("Err", stderr);
});

var /** @type {import("x11").XClient} */X, /** @type {number} */root, /** @type {number} */white;
var events = x11.eventMask.Button1Motion | x11.eventMask.Button3Motion | x11.eventMask.ButtonPress | x11.eventMask.ButtonRelease | x11.eventMask.SubstructureNotify | x11.eventMask.SubstructureRedirect | x11.eventMask.Exposure;
var frames = {};
/**
 * @type {{ keycode: number, rootx: number, rooty: number, x: number, y: number, winX: number, winY: number, width: number, height: number } | null}
 */
var dragStart = null;

var bggradient, rootpic;

function ManageWindow(wid) {
    console.log("MANAGE WINDOW: " + wid);
    X.GetWindowAttributes(wid, function (err, attrs) {
        if (attrs[8]) // override-redirect flag
        {
            // don't manage
            X.MapWindow(wid);
            return;
        }

        var fid = X.AllocID();
        frames[fid] = 1;
        var winX, winY;
        winX = parseInt(Math.random() * 300);
        winY = parseInt(Math.random() * 300);
        const barHeight = 24;
        const barWidth = 4;

        X.GetGeometry(wid, function (err, clientGeom) {
            var width = clientGeom.width + barWidth;
            var height = clientGeom.height + barHeight;
            console.log("CreateWindow", fid, root, winX, winY, width, height);
            X.CreateWindow(fid, root, winX, winY, width, height, 0, 0, 0, 0,
                {
                    backgroundPixel: white,
                    eventMask: events
                });

            var bggrad = X.AllocID();
            X.Render.LinearGradient(bggrad, [0, 0], [0, 24],
                [
                    [0, [0, 0, 0xffff, 0xffffff]],
                    [1, [0x00ff, 0xff00, 0, 0xffffff]]
                ]);

            console.log("Create picture");
            var framepic = X.AllocID();
            X.Render.CreatePicture(framepic, fid, X.Render.rgb24);
            X.GrabButton(wid, true, x11.eventMask.ButtonPress | x11.eventMask.ButtonRelease | x11.eventMask.PointerMotion,
                GrabMode.SYNC, GrabMode.ASYNC, NONE, NONE, 1, 1 << 3);
            const winEvents = new EventEmitter();
            X.event_consumers[wid] = winEvents;
            winEvents.on("event", (ev) => {
                console.log("Window event", ev);
                if(ev.name === "ButtonPress") {
                    X.RaiseWindow(fid);
                    X.SetInputFocus(wid);
                    console.log("Window clicked");
                } else if(ev.name === "DestroyNotify") {
                    X.DestroyWindow(wid);
                    X.DestroyWindow(fid);
                    X.UngrabButton(wid, 1);
                    delete X.event_consumers[wid];
                }
            });

            var ee = new EventEmitter();
            X.event_consumers[fid] = ee;
            ee.on("child-event", (ev) => {
                console.log("Child event", ev);
            });
            ee.on('event', function (/** @type {import("x11").Event */ev) {
                console.log('event', ev);
                if (ev.name === "DestroyNotify") {
                    X.DestroyWindow(fid);
                    X.DestroyWindow(wid);
                    delete X.event_consumers[fid];
                } else if (ev.name === "ButtonPress") {
                    X.RaiseWindow(fid);
                    X.SetInputFocus(wid);
                    dragStart = { keycode: ev.keycode, rootx: ev.rootx, rooty: ev.rooty, x: ev.x, y: ev.y, winX, winY, width, height };
                } else if (ev.name === "ButtonRelease") {
                    dragStart = null;
                } else if (ev.name === "MotionNotify") {
                    if(!dragStart) return console.log("Bad event");
                    var xDiff = ev.rootx - dragStart.rootx;
                    var yDiff = ev.rooty - dragStart.rooty;
                    if(dragStart.keycode === 1) {
                        winX = dragStart.winX + xDiff;
                        winY = dragStart.winY + yDiff;
                        console.log("Moving window", winX, winY);
                        X.MoveWindow(fid, winX, winY);
                    } else if(dragStart.keycode === 3) {
                        width = dragStart.width + xDiff;
                        height = dragStart.height + yDiff;
                        console.log("Resizing window", width, height, dragStart.width, dragStart.height);
                        X.ResizeWindow(fid,
                            Math.max(10, width),
                            Math.max(10, height)
                        );
                        X.ResizeWindow(wid,
                            Math.max(10, width - barWidth),
                            Math.max(10, height - barHeight)
                        );
                    }

                } else if (ev.name === "Expose") {
                    console.log("Exposing");
                    X.Render.Composite(3, bggrad, 0, framepic, 0, 0, 0, 0, 0, 0, width, height);
                }
            });
            X.ChangeSaveSet(1, wid);
            X.ReparentWindow(wid, fid, 1, 21);
            console.log("MapWindow", fid);
            X.MapWindow(fid);
            X.MapWindow(wid);
        });

    });
}

x11.createClient(function (err, display) {
    X = display.client;
    X.require('render', function (err, Render) {
        X.Render = Render;

        root = display.screen[0].root;
        white = display.screen[0].white_pixel;
        console.log('root = ' + root);
        X.ChangeWindowAttributes(root, { eventMask: x11.eventMask.Exposure | x11.eventMask.SubstructureRedirect }, function (err) {
            if (err.error == 10) {
                console.error('Error: another window manager already running.');
                process.exit(1);
            }
        });
        X.QueryTree(root, function (err, tree) {
            tree.children.forEach(ManageWindow);
        });
    })

}).on('error', function (err) {
    console.error(err);
}).on('event', function (ev) {
    if (ev.type === 20)        // MapRequest
    {
        if (!frames[ev.wid])
            ManageWindow(ev.wid);
        return;
    } else if (ev.type === 23) // ConfigureRequest
    {
        X.ResizeWindow(ev.wid, ev.width, ev.height);
    } else if (ev.type === 12) {
        console.log('EXPOSE', ev);
        X.Render.Composite(3, bggradient, 0, rootpic, 0, 0, 0, 0, 0, 0, 1000, 1000);
    }
});