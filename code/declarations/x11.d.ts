
declare module "x11" {
    export function createClient(cb: (err: Error, display: Display) => void): XClient;

    interface Display {
        screen: Screen[]
        client: XClient
    }
    interface Screen {
        root: WindowNumber;
        white_pixel: number;
        black_pixel: number;
    }

    interface BaseEvent {
        name: string;
        type: number;
        rawData: Buffer;
    }
    interface WindowEvent extends BaseEvent {
        wid: WindowNumber;
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
    interface ConfigureNotifyEvent extends WindowEVent {
        wid1: WindowNumber;
        aboveSibling: number;
        x: number;
        y: number;
        width: number;
        height: number;
        borderWidth: number;
        overrideRedirect: boolean;
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
    interface PropertyNotifyEvent extends WindowEvent {
        name: "PropertyNotify";
        window: WindowNumber;
        atom: Atom;
        state: 0 | 1;
        time: number;
    }
    interface FocusEvent extends WindowEvent {
        event: WindowNumber;
        mode: FocusMode,
        detail: FocusDetail
    }
    enum FocusMode {
        Normal = 0,
        WhileGrabbed,
        Grab,
        Ungrab
    }
    enum FocusDetail {
        Ancestor = 0,
        Virtual,
        Inferior,
        Nonlinear,
        NonlinearVirtual,
        Pointer,
        PointerRoot,
        None
    }
    interface FocusInEvent extends FocusEvent {
        name: "FocusIn";
    }
    interface FocusOutEvent extends FocusEvent {
        name: "FocusOut";
    }
    export type Event = 
        ConfigureRequestEvent | ConfigureNotifyEvent | PropertyNotifyEvent |
        SelectionClearEvent | SelectionRequestEvent | SelectionNotifyEvent |
        MappingNotifyEvent | MapRequestEvent | DestroyNotifyEvent | CreateNotifyEvent | MapNotifyEvent | UnmapNotifyEvent |
        ExposeEvent | LeaveNotifyEvent | EnterNotifyEvent |
        KeyPressEvent | KeyReleaseEvent |
        ButtonReleaseEvent | ButtonPressEvent |
        MotionNotifyEvent | ClientMessageEvent | PropertyNotifyEvent |
        FocusInEvent | FocusOutEvent;
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
    interface XWindowAttributes {
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

    interface WindowAttributes {
        backingStore: 0;
        visual: number;
        klass: number;
        bitGravity: number;
        winGravity: number;
        backingPlanes: number;
        backingPixel: number;
        saveUnder: boolean;
        mapIsInstalled: boolean;
        mapState: number;
        overrideRedirect: boolean;
        colormap: number;
        allEventMasks: number;
        myEventMasks: number;
        doNotPropagateMask: number;
    }

    type Atom = number;

    export interface XClient {
        Composite: CompositeExtension;
        Render: RenderExtension;
        hasCompositor: boolean;
        displayNum: number;
        screenNum: number;
        atoms: {
            [key: string]: Atom | undefined
        };
        atom_names: {
            [key: Atom]: string | undefined
        };
        seq_num: number;
        on(event: "event", cb: (event: Event) => void): XClient;
        on(event: string, cb: Function): XClient;
        AllocID(): WindowNumber;
        ReleaseID(): WindowNumber;

        require(ext: "render", cb: (err: Error, ext: Render) => void);
        require(ext: string, cb: (err: Error, ext: any) => void);

        CreateWindow(window: WindowNumber, x: number, y: number, width: number, height: number, borderWidth: number, depth: number, winclass: number, visual: number, valuemask: number, attributes: WindowAttributes)
        RaiseWindow(window: WindowNumber);
        ResizeWindow(window: WindowNumber, width: number, height: number);
        MoveResizeWindow(window: WindowNumber, x: number, y: number, width: number, height: number);
        MoveWindow(window: WindowNumber, x: number, y: number);
        DestroyWindow(window: WindowNumber);
        GetGeometry(window: WindowNumber, cb: (err: Error | null, geometry: WindowGeometry) => void);
        
        GetKeyboardMapping(minKeycode: number, number: number, cb: (err: Error, list: KeyList) => void);
        SetInputFocus(window: WindowNumber);

        ChangeWindowAttributes(window: WindowNumber, attributes: XWindowAttributes, cb?: (err: Error | null) => void);
        GetWindowAttributes(window: WindowNumber, cb: (err: Error | null, attributes: WindowAttributes) => void);

        ChangeSaveSet(changeMode: number, window: WindowNumber);

        ReparentWindow(window: WindowNumber, parent: WindowNumber, x: number, y: number);

        MapWindow(window: WindowNumber);
        UnmapWindow(window: WindowNumber);

        GrabButton(window: WindowNumber, ownerEvents: boolean, mask: number, pointerMode: GrabMode, keybMode: GrabMode, confineTo: WindowNumber, cursor, button: number, modifiers: number);
        UngrabButton(window: WindowNumber, button: number, modifiers: number);

        GetProperty(deleteProperty: boolean, window: WindowNumber, name: Atom, type: Atom, offset: number, length: number, cb: (err: Error | null, data: AtomValue) => void);
        ChangeProperty(mode: PropertyChangeMode, window: WindowNumber, property: Atom, type: Atom, units: 8 | 16 | 32, value: any);
        DeleteProperty(window: WindowNumber, property: Atom);
        ListProperties(window: WindowNumber, cb: (err: Error | null, properties: Atom[]) => void);

        GetAtomName(atom: Atom, cb: (err: Error, name: string) => void);
        InternAtom(name: string, cb: (err: Error, atom: Atom) => void);

        GetSelectionOwner(selection: Atom, cb: (err: Error | null, owner: WindowNumber) => void);
        SetSelectionOwner(selection: Atom, owner: WindowNumber, time: number, cb: (err: Error | null) => void);

        CreateGC(id: number, drawable: Drawable, components: {
            foreground: number,
            background: number
        });
        PolyText8(drawable: Drawable, context: number, x: number, y: number, text: string[]);

        SendEvent(destination: WindowNumber, propagate: boolean, eventMask: number, event: CustomData);
    }

    type CustomData = Buffer | String | number[];

    interface AtomValue {
        type: Atom,
        bytesAfter: number,
        data: Buffer
    }

    export interface XPromisifiedClient extends XClient {
        require(ext: "render"): Promise<Render>;
        require(ext: string): Promise<any>;

        CreateWindow(
            window: WindowNumber, x: number, y: number, width: number, height: number,
            borderWidth: number, depth: number, winclass: number, visual: number,
            valuemask: number, attributes: WindowAttributes
        ): Promise<void>;
        RaiseWindow(window: WindowNumber): Promise<void>;
        ResizeWindow(window: WindowNumber, width: number, height: number): Promise<void>;
        MoveResizeWindow(window: WindowNumber, x: number, y: number, width: number, height: number): Promise<void>;
        MoveWindow(window: WindowNumber, x: number, y: number): Promise<void>;
        DestroyWindow(window: WindowNumber): Promise<void>;
        GetGeometry(window: WindowNumber): Promise<WindowGeometry>;
        
        GetKeyboardMapping(minKeycode: number, number: number): Promise<KeyList>;
        SetInputFocus(window: WindowNumber): Promise<void>;

        ChangeWindowAttributes(window: WindowNumber, attributes: XWindowAttributes): Promise<void>;
        GetWindowAttributes(window: WindowNumber): Promise<WindowAttributes>;

        ChangeSaveSet(changeMode: number, window: WindowNumber): Promise<void>;

        ReparentWindow(window: WindowNumber, parent: WindowNumber, x: number, y: number): Promise<void>;

        MapWindow(window: WindowNumber): Promise<void>;
        UnmapWindow(window: WindowNumber): Promise<void>;

        GrabButton(window: WindowNumber, ownerEvents: boolean, mask: number, pointerMode: GrabMode, keybMode: GrabMode, confineTo: WindowNumber, cursor, button: number, modifiers: number): Promise<void>;
        UngrabButton(window: WindowNumber, button: number, modifiers: number): Promise<void>;

        GetProperty(deleteProperty: boolean, window: WindowNumber, name: Atom, type: Atom, offset: number, length: number): Promise<AtomValue>;
        ChangeProperty(mode: PropertyChangeMode, window: WindowNumber, property: Atom, type: Atom, units: 8 | 16 | 32, value: any): Promise<void>;
        DeleteProperty(window: WindowNumber): Promise<Atom>;
        ListProperties(window: WindowNumber): Promise<Atom[]>;

        GetAtomName(atom: Atom): Promise<string>;
        InternAtom(name: string): Promise<Atom>;

        GetSelectionOwner(selection: Atom): Promise<WindowNumber>;
        SetSelectionOwner(selection: Atom, owner: WindowNumber, time: number): Promise<void>;
    }

    enum PropertyChangeMode {
        REPLACE = 0,
        PREPEND,
        APPEND
    }

    export interface CompositeExtension {
        Redirect: {
            Automatic: 0,
            Manual: 1
        }
        RedirectWindow(window: WindowNumber, update: 0 | 1);
        RedirectSubwindows(window: WindowNumber, update: 0 | 1);
        UnredirectWindow(window: WindowNumber);
        UnredirectWindows(window: WindowNumber);
    }
    export interface RenderExtension {
        PictOp: {
            Minimum: 0,
            Clear: 0,
            Src: 1,
            Dst: 2,
            Over: 3,
            OverReverse: 4,
            In: 5,
            InReverse: 6,
            Out: 7,
            OutReverse: 8,
            Atop: 9,
            AtopReverse: 10,
            Xor: 11,
            Add: 12,
            Saturate: 13,
            Maximum: 13,

            /*,
            * Operators only available in version 0.2,
            */
            DisjointMinimum: 0x10,
            DisjointClear: 0x10,
            DisjointSrc: 0x11,
            DisjointDst: 0x12,
            DisjointOver: 0x13,
            DisjointOverReverse: 0x14,
            DisjointIn: 0x15,
            DisjointInReverse: 0x16,
            DisjointOut: 0x17,
            DisjointOutReverse: 0x18,
            DisjointAtop: 0x19,
            DisjointAtopReverse: 0x1a,
            DisjointXor: 0x1b,
            DisjointMaximum: 0x1b,

            ConjointMinimum: 0x20,
            ConjointClear: 0x20,
            ConjointSrc: 0x21,
            ConjointDst: 0x22,
            ConjointOver: 0x23,
            ConjointOverReverse: 0x24,
            ConjointIn: 0x25,
            ConjointInReverse: 0x26,
            ConjointOut: 0x27,
            ConjointOutReverse: 0x28,
            ConjointAtop: 0x29,
            ConjointAtopReverse: 0x2a,
            ConjointXor: 0x2b,
            ConjointMaximum: 0x2b,

            /*,
            * Operators only available in version 0.11,
            */
            BlendMinimum: 0x30,
            Multiply: 0x30,
            Screen: 0x31,
            Overlay: 0x32,
            Darken: 0x33,
            Lighten: 0x34,
            ColorDodge: 0x35,
            ColorBurn: 0x36,
            HardLight: 0x37,
            SoftLight: 0x38,
            Difference: 0x39,
            Exclusion: 0x3a,
            HSLHue: 0x3b,
            HSLSaturation: 0x3c,
            HSLColor: 0x3d,
            HSLLuminosity: 0x3e,
            BlendMaximum: 0x3e
        }

        PolyEdge: {
            Sharp: 0,
            Smooth: 1
        }
        PolyMode: {
            Precise: 0,
            Imprecise: 1
        };
    
        Repeat: {
            None: 0,
            Normal: 1,
            Pad: 2,
            Reflect: 3
        };
    
        Subpixel: {
            Unknown: 0,
            HorizontalRGB: 1,
            HorizontalBGR: 2,
            VerticalRGB: 3,
            VerticalBGR: 4,
            None: 5
        };
    
        Filters: {
            Nearest: 'nearest',
            Bilinear: 'bilinear',
            Convolution: 'convolution',
            Fast: 'fast',
            Good: 'good',
            Best: 'best'
        };

        monol: number;
        rgb24: number;
        rgba32: number;
        a8: number;

        CreatePicture(id: number, drawable: Drawable, format: number, values?: number[]): void;
        FreePicture(id: number): void;
        Composite(
            op: number,
            src: Drawable,
            mask: Drawable | 0,
            dst: Drawable | 0,
            srcX: number,
            srcY: number,
            maskX: number,
            maskY: number,
            dstX: number,
            dstY: number,
            width: number,
            height: number
        ): void;

        CreateSolidFill(id: number, r: number, g: number, b: number, a: number): void;
        RadialGradient(id: number, p1: Vector2D, p2: Vector2D, r1: number, r2: number, stops: GradientStops): void;
        /**
         * @param id Picture ID
         * @param p1 
         * @param p2 
         * @param stops [stopDist, [r, g, b, a]]
         */
        LinearGradient(id: number, p1: Vector2D, p2: Vector2D, stops: GradientStops): void;
        /**
         * @param id Picture ID
         * @param p1 center point
         * @param angle 0 - 1
         * @param stops 
         */
        ConicalGradient(id: number, p1: Vector2D, angle: number, stops: GradientStops): void;

        FillRectangles(op: number, id: number, color: ColorAlpha, rects: ColorAlpha[]): void;
    }

    type Vector2D = [number, number];
    type ColorAlpha = [number, number, number, number];
    type Color = [number, number, number];
    type GradientStops = [number, ColorAlpha][];
    type Drawable = WindowNumber | number;

    enum GrabMode {
        GrabModeSync = 0,
        GrabModeAsync = 1
    }

    enum XRenderPictOp {
        Minimum = 0,
        Clear = 0,
        Src = 1,
        Dst = 2,
        Over = 3,
        OverReverse = 4,
        In = 5,
        InReverse = 6,
        Out = 7,
        OutReverse = 8,
        Atop = 9,
        AtopReverse = 10,
        Xor = 11,
        Add = 12,
        Saturate = 13,
        Maximum = 13,

        DisjointMinimum = 0x10,
        DisjointClear = 0x10,
        DisjointSrc = 0x11,
        DisjointDst = 0x12,
        DisjointOver = 0x13,
        DisjointOverReverse = 0x14,
        DisjointIn = 0x15,
        DisjointInReverse = 0x16,
        DisjointOut = 0x17,
        DisjointOutReverse = 0x18,
        DisjointAtop = 0x19,
        DisjointAtopReverse = 0x1a,
        DisjointXor = 0x1b,
        DisjointMaximum = 0x1b,

        ConjointMinimum = 0x20,
        ConjointClear = 0x20,
        ConjointSrc = 0x21,
        ConjointDst = 0x22,
        ConjointOver = 0x23,
        ConjointOverReverse = 0x24,
        ConjointIn = 0x25,
        ConjointInReverse = 0x26,
        ConjointOut = 0x27,
        ConjointOutReverse = 0x28,
        ConjointAtop = 0x29,
        ConjointAtopReverse = 0x2a,
        ConjointXor = 0x2b,
        ConjointMaximum = 0x2b,

        BlendMinimum = 0x30,
        Multiply = 0x30,
        Screen = 0x31,
        Overlay = 0x32,
        Darken = 0x33,
        Lighten = 0x34,
        ColorDodge = 0x35,
        ColorBurn = 0x36,
        HardLight = 0x37,
        SoftLight = 0x38,
        Difference = 0x39,
        Exclusion = 0x3a,
        HSLHue = 0x3b,
        HSLSaturation = 0x3c,
        HSLColor = 0x3d,
        HSLLuminosity = 0x3e,
        BlendMaximum = 0x3e
    }

    export enum EventMask {
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
    // Typescript doesn't have enum aliases.
    export enum eventMask {
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