const fs = require("fs-extra");

class Config {
    /**
     * @param {string} path
     * @param {{ [key: string]: { [key: string]: string }}} data 
     */
    constructor(path, data) {
        this.path = path;
        this.data = data;
    }

    get(group, config) {
        if(!config) {
            config = group;
            group = "_default";
        }
        if(!this.data[group]) return undefined;
        return this.data[group][config];
    }

    static async loadConfig(path) {
        const file = await fs.readFileSync(path, { encoding: "utf-8" });
        var data = {};
        var group = "_default";
        for(let line of file.split("\n")) {
            line = line.trim();
            if(line.startsWith("[")) {
                group = line.substr(1, line.length - 2);
                if(!line.endsWith("]")) {
                    console.warn("[WARN] Invalid config contents (unclosed group)", path);
                }
                continue;
            } else if(line.startsWith(";") || line.startsWith("#")) continue;
            var key = line.substr(0, line.indexOf("="));
            var value = line.substr(key.length + 1);
            if(!data[group]) data[group] = {};
            data[group][key] = value;
        }
        return new Config(path, data);
    }
}

module.exports = Config;