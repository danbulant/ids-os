const exec = require("../util/exec");
const Config = require("./config");
const FileData = require("./files");

class XData {
    /** @type {Config} */
    conf;
    async init() {
        this.conf = await Config.loadConfig(FileData.path.getConfig("style.conf"));
        console.log("Loaded config", this.conf);
        return await Promise.all([
            this.loadBg()
        ]);
    }
    
    async loadBg() {
        this.bg = this.conf.get("background", "location") || FileData.path.getResource("images/bg.png");
        console.log("Setting background", this.bg);
        await exec(["feh", "--bg-scale", this.bg]);
    }
}

module.exports = new XData();