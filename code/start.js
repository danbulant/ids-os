#!/usr/bin/env node
require("./wm/tiny");
const xStore = require("./data/x");

xStore.init().then(() => console.log("[X STORE] initialized")).catch(e => console.warn(e));