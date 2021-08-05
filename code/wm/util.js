const parse = require("./parse");

/**
 * @type {import("x11").XPromisifiedClient}
 */
var X;

function setX(x) {
    X = x;
}

/**
 * Gets text from atom
 * @param {number} atom 
 * @returns {Promise<string>}
 */
async function getAtomName(atom) {
    if(X.atom_names[atom]) return X.atom_names[atom];
    var name = await X.GetAtomName(atom);
    X.atom_names[atom] = name;
    return name;
}
/**
 * Gets atom from text
 * @param {string} name 
 * @param {boolean} onlyExists when false will create new atom
 * @returns {Promise<number>}
 */
async function internAtom(name, onlyExists = true) {
    if(X.atoms[name]) return X.atoms[name];
    var atom = await X.InternAtom(onlyExists, name);
    X.atoms[name] = atom;
    return atom;
}

/**
 * @param {x11.AtomValue} property 
 * @param {string} name
 * @returns {Promise<any>} Depends on type
 */
async function parseContents(property, name) {
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
/**
 * Gets contents from given atom or it's name.
 * @param {number} wid 
 * @param {number | string} atom 
 * @returns {Promise<any>}
 */
async function getContents(wid, atom) {
    if(typeof atom === "string") atom = await internAtom(atom, true);
    const data = await X.GetProperty(false, wid, atom, 0, 0, 512);
    return parseContents(data, await getAtomName(atom));
}

module.exports = {
    getAtomName,
    internAtom,
    parseContents,
    getContents,
    setX
}