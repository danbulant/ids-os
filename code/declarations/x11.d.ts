
declare module "x11" {
    export function createClient(cb: (err: Error, display: Display) => void): XClient;

    interface Display {
        screen: Screen[]
        client: XClient
    }
    interface Screen {
        root: WindowNumber;
        white_pixel: number;
    }

    interface BaseEvent {
        name: string
    }
    interface WindowEvent extends BaseEvent {
        child: WindowNumber;
    }
    interface ConfigureRequestEvent extends WindowEvent {
        name: "ConfigureRequest";
        stackMode: number;
        parent: WindowNumber;
        wid: WindowNumber;
        sibling: WindowNumber;
        x: number;
        y: number;
        width: number;
        height: number;
        borderWidth: number;
        mask: number;
    }
    interface PropertyNotifyEvent extends WindowEvent {
        name: "PropertyNotify";
        wid: WindowNumber;
        atom: any;
        time: number;
        state: any;
    }
    interface SelectionClearEvent extends WindowEvent {
        name: "SelectionClear";
        time: number;
        owner;
        selection;
    }
    interface SelectionRequestEvent extends WindowEvent {
        name: "SelectionRequest";
        time: number;
        owner;
        requestor;
        selection;
        target;
        property;
    }
    interface SelectionNotifyEvent extends WindowEvent {
        name: "SelectionNotify";
        time: number;
        requestor;
        selection;
        target;
        property;
    }
    interface ClientMessageEvent extends WindowEvent {
        name: "ClientMessage";
        format: number;
        wid: WindowNumber;
        message_type: number;
        data: any;
    }
    interface MappingNotifyEvent extends WindowEvent {
        name: "MappingNotify";
        request;
        firstKeyCode: number;
        count: number;
    }
    interface ConfigureNotifyEvent extends WindowEvent {
        name: "ConfigureNotify";
        wid: WindowNumber;
        wid1: WindowNumber;
        aboveSibling: WindowNumber;
        x: number;
        y: number;
        width: number;
        height: number;
        borderWidth: number;
        overrideRedirect: boolean;
    }
    interface MapRequestEvent extends WindowEvent {
        name: "MapRequest";
        parent: WindowNumber;
        wid: WindowNumber;
    }
    interface DestroyNotifyEvent extends WindowEvent {
        name: "DestroyNotify";
        event: number;
        wid: WindowNumber;
    }
    interface CreateNotifyEvent extends WindowEvent {
        name: "CreateNotify";
        parent: WindowNumber;
        wid: WindowNumber;
        x: number;
        y: number;
        width: number;
        height: number;
        borderWidth: number;
        overrideRedirect: boolean;
    }
    interface MapNotifyEvent extends WindowEvent {
        name: "MapNotify";
        event: number;
        wid: WindowNumber;
        overrideRedirect: boolean;
    }
    interface UnmapNotifyEvent extends WindowEvent {
        name: "UnmapNotify";
        event: number;
        wid: WindowNumber;
        fromConfigure: boolean;
    }
    interface ExposeEvent extends WindowEvent {
        name: "Expose";
        wid: WindowNumber;
        x: number;
        y: number;
        width: number;
        height: number;
        count: number;
    }
    interface EnterLeaveEvent extends WindowEvent {
        root: number;
        wid: number;
        child: WindowNumber;
        rootx: number;
        rooty: number;
        x: number;
        y: number;
        values: number;
    }
    interface LeaveNotifyEvent extends EnterLeaveEvent {
        name: "LeaveNotify";
    }
    interface EnterNotifyEvent extends EnterLeaveEvent {
        name: "EnterNotify";
    }
    interface MotionEvent extends WindowEvent {
        time: number;
        keycode: number;
        root: number;
        wid: number;
        child: WindowNumber;
        rootx: number;
        rooty: number;
        x: number;
        y: number;
        buttons: number;
        sameScreen: boolean;
    }
    interface KeyPressEvent extends MotionEvent {
        name: "KeyPress";
    }
    interface KeyReleaseEvent extends MotionEvent {
        name: "KeyRelease";
    }
    interface ButtonReleaseEvent extends MotionEvent {
        name: "ButtonRelease";
    }
    interface ButtonPressEvent extends MotionEvent {
        name: "ButtonPress";
    }
    interface MotionNotifyEvent extends MotionEvent {
        name: "MotionNotify";
    }
    type Event = 
        ConfigureRequestEvent | PropertyNotifyEvent |
        SelectionClearEvent | SelectionRequestEvent | SelectionNotifyEvent |
        MappingNotifyEvent | MapRequestEvent | DestroyNotifyEvent | CreateNotifyEvent | MapNotifyEvent | UnmapNotifyEvent
        EXposeEvent | LeaveNotifyEvent | EnterNotifyEvent |
        KeyPressEvent | KeyReleaseEvent |
        ButtonReleaseEvent | ButtonPressEvent |
        MotionNotifyEvent | ClientMessageEvent;
    type WindowNumber = number;

    interface WindowGeometry {
        xPos: number;
        yPos: number;
        width: number;
        height: number;
        borderWidth: number;
        depth: number;
    }
    interface KeyList {}
    interface WindowAttributes {
        eventMask: EventMask;
        backgroundPixmap;
        backgroundPixel?: number;
        borderPixmap;
        borderPixel?: number;
        bitGravity;
        winGravity;
        backingStore;
        backingPlanes;
        backingPixel: number;
        saveUnder: boolean;
        doNotPropagateMask: EventMask;
        overrideRedirect: boolean;
        colormap;
        cursor;
    }

    export interface XClient {
        on(event: "event", cb: (event: Event) => void): XClient;
        on(event: string, cb: Function): XClient;
        AllocID(): WindowNumber;
        ReleaseID(): WindowNumber;

        RaiseWindow(window: WindowNumber);
        MoveResizeWindow(window: WindowNumber, x: number, y: number, width: number, height: number);
        GetGeometry(window: WindowNumber, cb: (err: Error, geometry: WindowGeometry) => void);
        
        GetKeyboardMapping(minKeycode: number, number: number, cb: (err: Error, list: KeyList) => void);
        SetInputFocus(window: WindowNumber);

        ChangeWindowAttributes(window: WindowNumber, attributes: any, cb?: (err: Error) => void);
        GetWindowAttributes(window: WindowNumber, cb: (err: Error, attributes: any) => void);

    }

    enum EventMask {
        KeyPress = 0x00000001,
        KeyRelease = 0x00000002,
        ButtonPress = 0x00000004,
        ButtonRelease = 0x00000008,
        EnterWindow = 0x00000010,
        LeaveWindow = 0x00000020,
        PointerMotion = 0x00000040,
        PointerMotionHint = 0x00000080,
        Button1Motion = 0x00000100,
        Button2Motion = 0x00000200,
        Button3Motion = 0x00000400,
        Button4Motion = 0x00000800,
        Button5Motion = 0x00001000,
        ButtonMotion = 0x00002000,
        KeymapState = 0x00004000,
        Exposure = 0x00008000,
        VisibilityChange = 0x00010000,
        StructureNotify = 0x00020000,
        ResizeRedirect = 0x00040000,
        SubstructureNotify = 0x00080000,
        SubstructureRedirect = 0x00100000,
        FocusChange = 0x00200000,
        PropertyChange = 0x00400000,
        ColormapChange = 0x00800000,
        OwnerGrabButton = 0x01000000
    };
}