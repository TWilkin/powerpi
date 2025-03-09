import { FileDb } from "@jovotech/db-filedb";
import app from "./app.js";

app.configure({
    plugins: [
        new FileDb({
            pathToFile: "../db/db.json",
        }),
    ],
});

export * from "./index.js";
