const path = require("path");

class Paths {
    code = "/app/code";
    resources = "/app/resources";
    db = "/app/resources/db";
    config = "/app/resources/config";

    getCode(code) {
        return path.join(this.code, code);
    }
    getResource(resource) {
        return path.join(this.resources, resource);
    }
    getDb(db) {
        return path.join(this.db, db);
    }
    getConfig(config) {
        return path.join(this.config, config);
    }
}

class FileData {
    static path = new Paths();
}

module.exports = FileData;