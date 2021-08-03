const Level = require("level");

module.exports = class Store {
    #level;
    constructor(name) {
        this.#level = Level(name);
    }

    async get(name, defaultValue) {
        try {
            return await this.#level.get(name);
        } catch(e) {
            if(e.notFound) return defaultValue;
            console.log("Unknown error", e.type, e);
            throw e;
        }
    }

    set(name, value) {
        return this.#level.put(name, value);
    }
}