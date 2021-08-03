const cp = require('child_process');

/**
 * @typedef ExecOptions
 * @property {boolean} [strict] Whether strict mode is on (in strict mode, promise throws an error for non-zero results)
 * @property {boolean} [captureStdio] Whether to capture stdio as string or not
 */

/**
 * Executes given command with args (input is an array, first is the command then it's args)
 * @param {string[]} code The code to execute (array)
 * @param {ExecOptions} options
 * @returns {Promise<string>}
 */
module.exports = function exec(code, options = {}) {
    return new Promise((resolve, reject) => {
        const proc = cp.spawn("/bin/env", code, {});
        var out = "";
        var err = "";
        
        proc.on("exit", (code) => {
            if(code && options.strict) return reject(err);
            resolve(out);
        });

        if(options.captureStdio) {
            proc.stdout.on("data", (data) => {
                out += data;
            });
            proc.stderr.on("data", (data) => {
                err += data;
            });
        }
    });
}