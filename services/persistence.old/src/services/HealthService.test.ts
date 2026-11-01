import { FileService, LoggerService, MqttService } from "@powerpi/common";
import { MockLoggerService } from "@powerpi/common-test";
import ConfigService from "./ConfigService.js";
import DbService from "./DbService.js";
import HealthService from "./HealthService.js";

describe("HealthService", () => {
    let fs: FileService;

    let subject: HealthService;

    beforeEach(() => {
        fs = new FileService();
        const config = new ConfigService(fs);
        const logger = new MockLoggerService() as unknown as LoggerService;

        vi.spyOn(FileService.prototype, "touch").mockResolvedValue();

        vi.spyOn(MqttService.prototype, "connected", "get").mockReturnValue(true);

        vi.spyOn(DbService.prototype, "isAlive").mockReturnValue(Promise.resolve(true));

        subject = new HealthService(
            config,
            fs,
            new DbService(config),
            new MqttService(config, logger),
            logger,
        );

        vi.clearAllMocks();
    });

    test("start", async () => {
        vi.useFakeTimers();

        await subject.start(2);

        expect(fs.touch).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(2 * 1000);

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
                vi.spyOn(MqttService.prototype, "connected", "get").mockReturnValue(mqtt);

                vi.spyOn(DbService.prototype, "isAlive").mockReturnValue(Promise.resolve(db));

                await subject.execute();

                expect(fs.touch).toHaveBeenCalledTimes(0);
            });
        });
    });
});
