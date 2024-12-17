const globals = require("@jest/globals");
const extensions = require("./dist/src/expect");

globals.expect.extend(extensions);
