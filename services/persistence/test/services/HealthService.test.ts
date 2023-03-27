import { FileService, LoggerService, MqttService } from "@powerpi/common";
import { MockLoggerService } from "@powerpi/common-test";
import ConfigService from "../../src/services/ConfigService";
import DbService from "../../src/services/DbService";
import HealthService from "../../src/services/HealthService";

describe("HealthService", () => {
    let fs: FileService;

    let subject: HealthService;

    beforeEach(() => {
        fs = new FileService();
        const config = new ConfigService(fs);
        const logger = new MockLoggerService() as unknown as LoggerService;

        jest.spyOn(FileService.prototype, "touch").mockResolvedValue(Promise.resolve());

        jest.spyOn(MqttService.prototype, "connected", "get").mockReturnValue(true);

        jest.spyOn(DbService.prototype, "isAlive").mockReturnValue(Promise.resolve(true));

        subject = new HealthService(
            config,
            fs,
            new DbService(config),
            new MqttService(config, logger),
            logger
        );

        jest.clearAllMocks();
    });

    test("start", async () => {
        jest.useFakeTimers();

        await subject.start(2);

        expect(fs.touch).toHaveBeenCalledTimes(1);

        await jest.advanceTimersByTimeAsync(2 * 1000);

        expect(fs.touch).toHaveBeenCalledTimes(2);
    });

    describe("execute", () => {
        test("success", async () => {
            await subject.execute();

            expect(fs.touch).toHaveBeenCalledTimes(1);
        });

        [
            { mqtt: true, db: false },
            { mqtt: false, db: true },
            { mqtt: false, db: false },
        ].forEach((data) => {
            const { mqtt, db } = data;

            test(`fail mqtt: ${mqtt} db: ${db}`, async () => {
                jest.spyOn(MqttService.prototype, "connected", "get").mockReturnValue(mqtt);

                jest.spyOn(DbService.prototype, "isAlive").mockReturnValue(Promise.resolve(db));

                await subject.execute();

                expect(fs.touch).toHaveBeenCalledTimes(0);
            });
        });
    });
});
