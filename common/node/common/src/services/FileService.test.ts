import fs from "fs";
import path from "path";
import FileService from "./FileService.js";

describe("FileService", () => {
    let tmpDir: string;
    let subject: FileService;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync("powerpi");
        subject = new FileService();
    });

    afterEach(() => fs.rmSync(tmpDir, { recursive: true }));

    test("read", async () => {
        const file = path.join(tmpDir, "file");
        fs.writeFileSync(file, "test");

        const result = await subject.read(file);

        expect(result).toBeDefined();

        const str = new TextDecoder().decode(result);
        expect(str).toContain("test");
    });

    test("touch", async () => {
        const file = path.join(tmpDir, "touchy");

        expect(fs.existsSync(file)).toBeFalsy();

        await subject.touch(file);

        expect(fs.existsSync(file)).toBeTruthy();
    });
});
