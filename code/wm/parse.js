
class Parser {
    normalHintsFlags = {
        USPosition: 1,
        USSize: 2,
        PPosition: 4,
        PSize: 8,
        PMinSize: 1,
        PMaxSize: 3,
        PResizeInc: 6,
        PAspect: 1,
        PBaseSize: 2,
        PWinGravity: 512
    };
    /**
     * @param {Buffer} buf 
     */
    parseNormalHints(buf) {
        const data = {
            flags: 0,
            minWidth: 0,
            minHeight: 0,
            maxWidth: 0,
            maxHeight: 0,
            widthInc: 0,
            heightInc: 0,
            minAspect: [0, 0],
            maxAspect: [0, 0],
            baseWidth: 0,
            baseHeight: 0,
            winGravity: 0
        };
        data.flags = buf.readUInt32LE();
        data.minWidth = buf.readUInt32LE(4 * 4); // 4 * CARD32 padding LEfore this one
        data.minHeight = buf.readUInt32LE(5 * 4);
        data.maxWidth = buf.readUInt32LE(6 * 4);
        data.maxHeight = buf.readUInt32LE(7 * 4);
        data.widthInc = buf.readUInt32LE(8 * 4);
        data.heightInc = buf.readUInt32LE(9 * 4);
        data.minAspect = [buf.readUInt32LE(10 * 4), buf.readUInt32LE(11 * 4)];
        data.maxAspect = [buf.readUInt32LE(12 * 4), buf.readUInt32LE(13 * 4)];
        data.baseWidth = buf.readUInt32LE(14 * 4);
        data.baseHeight = buf.readUInt32LE(15 * 4);
        data.winGravity = buf.readUInt32LE(16 * 4);

        if(!data.minWidth) data.minWidth = data.baseWidth;
        if(!data.minHeight) data.minHeight = data.baseHeight;
        if(!data.baseWidth) data.baseWidth = data.minWidth;
        if(!data.baseHeight) data.baseHeight = data.minHeight;
        if(data.maxHeight < data.minHeight) data.maxHeight = 0;
        if(data.maxWidth < data.minWidth) data.minWidth = 0;

        return data;
    }

    hintsFlags = {
        InputHint: 1,
        StateHint: 2,
        IconPixmapHint: 4,
        IconWindowHint: 8,
        IconPositionHint: 16,
        IconMaskHint: 32,
        WindowGroupHint: 64,
        MessageHint: 128,
        UrgencyHint: 256
    };
    windowStates = {
        WithdrawnState: 0,
        NormalState: 1,
        IconicState: 3
    }
    /**
     * @param {Buffer} buf 
     */
    parseHints(buf) {
        const data = {
            flags: 0,
            input: 0,
            initialState: 0,
            iconPixmap: 0,
            iconWindow: 0,
            iconX: 0,
            iconY: 0,
            iconMask: 0,
            windowGroup: 0
        };
        data.flags = buf.readUInt32LE();
        data.input = buf.readUInt32LE(4);
        data.initialState = buf.readUInt32LE(2 * 4);
        data.iconPixmap = buf.readUInt32LE(3 * 4);
        data.iconWindow = buf.readUInt32LE(4 * 4);
        data.iconX = buf.readUInt32LE(5 * 4);
        data.iconY = buf.readUInt32LE(6 * 4);
        data.iconMask = buf.readUInt32LE(7 * 4);
        data.windowGroup = buf.readUInt32LE(8 * 4);

        return data;
    }

    /**
     * @param {Buffer} buf
     */
    parseClass(buf) {
        const str = buf.toString("utf-8");
        var [instance, applicationClass] = str.split("\0");
        return { instance, applicationClass };
    }

    /**
     * @param {Buffer} buf
     */
    parseState(buf) {
        const data = {
            state: buf.readUInt32LE(),
            icon: buf.readUInt32LE(4)
        };
        return data;
    }
}

module.exports = new Parser;