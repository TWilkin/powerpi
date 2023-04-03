import { FileService } from "@powerpi/common";
import ConfigService from "../../src/services/ConfigService";
import DbService from "../../src/services/DbService";

jest.mock("sequelize-typescript", () => ({
    ...jest.requireActual("sequelize-typescript"),
    Sequelize: jest.fn().mockImplementation(() => ({
        addModels: jest.fn(),
        sync: jest.fn(),
        query: jest
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

        jest.spyOn(ConfigService.prototype, "databaseURI", "get").mockReturnValue(
            Promise.resolve("uri")
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
