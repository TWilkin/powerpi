import { FileService } from "@powerpi/common";
import ConfigService from "./ConfigService.js";
import DbService from "./DbService.js";

vi.mock("sequelize-typescript", async () => ({
    ...(await vi.importActual("sequelize-typescript")),
    Sequelize: vi.fn().mockImplementation(() => ({
        addModels: vi.fn(),
        sync: vi.fn(),
        query: vi
            .fn()
            .mockReturnValueOnce(Promise.resolve([[{ value: 1 }], null]))
            .mockReturnValueOnce(Promise.resolve([[], null])),
    })),
}));

describe("DbService", () => {
    let subject: DbService;

    beforeEach(() => {
        const fs = new FileService();
        const config = new ConfigService(fs);

        vi.spyOn(ConfigService.prototype, "databaseURI", "get").mockReturnValue(
            Promise.resolve("uri"),
        );

        subject = new DbService(config);
    });

    describe("isAlive", () => {
        test("not connected", async () => {
            const result = await subject.isAlive();

            expect(result).toBeFalsy();
        });

        test("connected", async () => {
            await subject.connect();

            // the first call will return the value
            let result = await subject.isAlive();
            expect(result).toBeTruthy();

            // the second call will not
            result = await subject.isAlive();
            expect(result).toBeFalsy();
        });
    });
});
