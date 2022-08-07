import { FileDb } from "@jovotech/db-filedb";
import { JovoDebugger } from "@jovotech/plugin-debugger";
import app from "./app";

app.configure({
    plugins: [
        new FileDb({
            pathToFile: "../db/db.json",
        }),
        new JovoDebugger(),
    ],
});

export * from "./index";
