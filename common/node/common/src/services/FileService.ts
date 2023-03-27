import { open, readFile, utimes } from "fs/promises";
import { Service } from "typedi";

@Service()
export default class FileService {
    public async read(path: string) {
        return await readFile(path);
    }

    public async touch(path: string) {
        const now = new Date();

        try {
            await utimes(path, now, now);
        } catch (e) {
            const handle = await open(path, "a");
            await handle.close();
        }
    }
}
