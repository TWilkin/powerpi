import fs from "fs";
import path from "path";
import { FileService } from "../../src";

describe("FileService", () => {
    let subject: FileService;

    beforeEach(() => (subject = new FileService()));

    test("read", async () => {
        const result = await subject.read(__filename);

        expect(result).toBeDefined();

        const str = new TextDecoder().decode(result);
        expect(str).toContain('test("read",');
    });

    test("touch", async () => {
        const tmpDir = fs.mkdtempSync(__filename);
        const file = path.join(tmpDir, "touchy");

        expect(fs.existsSync(file)).toBeFalsy();

        await subject.touch(file);

        expect(fs.existsSync(file)).toBeTruthy();
    });
});
