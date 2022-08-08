import { writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export default function mockFile(fileName: string, envVar: string, content: object) {
    process.env["USE_CONFIG_FILE"] = "true";

    const tempFile = join(tmpdir(), fileName);

    writeFileSync(tempFile, JSON.stringify(content));

    process.env[envVar] = tempFile;
}
