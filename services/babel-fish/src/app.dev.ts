import { FileDb } from "@jovotech/db-filedb";
import app from "./app";

app.configure({
    plugins: [
        new FileDb({
            pathToFile: "../db/db.json",
        }),
    ],
});

export * from "./index";
