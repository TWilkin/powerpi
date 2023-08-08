import { DeviceState } from "@powerpi/common-api";
import { Response } from "@tsed/common";
import { QueryResult } from "pg";
import { anything, capture, instance, mock, resetCalls, verify, when } from "ts-mockito";
import Message from "../models/Message";
import { DatabaseService } from "../services";
import HistoryController from "./HistoryController";

const mockedDatabaseService = mock<DatabaseService>();
const mockedResponse = mock<Response>();

describe("HistoryController", () => {
    let subject: HistoryController | undefined;

    beforeEach(() => {
        resetCalls(mockedDatabaseService);
        resetCalls(mockedResponse);

        subject = new HistoryController(instance(mockedDatabaseService));
    });

    describe("getTypes", () => {
        test("success", async () => {
            when(mockedDatabaseService.getHistoryTypes()).thenResolve({
                rows: [{ type: "type1" }, { type: "type2" }],
            } as QueryResult<{ type: string }>);

            await subject?.getTypes(instance(mockedResponse));

            verify(mockedResponse.send(anything())).once();

            const result = capture(mockedResponse.send).first()[0];

            expect(result).toStrictEqual([{ type: "type1" }, { type: "type2" }]);
        });

        test("failure", async () => {
            when(mockedDatabaseService.getHistoryTypes()).thenThrow(new Error());

            await subject?.getTypes(instance(mockedResponse));

            verify(mockedResponse.sendStatus(500)).once();
        });

        test("no data", async () => {
            when(mockedDatabaseService.getHistoryTypes()).thenResolve(undefined);

            await subject?.getTypes(instance(mockedResponse));

            verify(mockedResponse.send(anything())).once();
        });
    });

    describe("getEntities", () => {
        test("success", async () => {
            when(mockedDatabaseService.getHistoryEntities("device")).thenResolve({
                rows: [{ entity: "entity1" }, { entity: "entity2" }],
            } as QueryResult<{ entity: string }>);

            await subject?.getEntities(instance(mockedResponse), "device");

            verify(mockedResponse.send(anything())).once();

            const result = capture(mockedResponse.send).first()[0];

            expect(result).toStrictEqual([{ entity: "entity1" }, { entity: "entity2" }]);
        });

        test("failure", async () => {
            when(mockedDatabaseService.getHistoryEntities("device")).thenThrow(new Error());

            await subject?.getEntities(instance(mockedResponse), "device");

            verify(mockedResponse.sendStatus(500)).once();
        });

        test("no data", async () => {
            when(mockedDatabaseService.getHistoryEntities("device")).thenResolve(undefined);

            await subject?.getEntities(instance(mockedResponse));

            verify(mockedResponse.send(anything())).once();
        });
    });

    describe("getActions", () => {
        test("success", async () => {
            when(mockedDatabaseService.getHistoryActions("device")).thenResolve({
                rows: [{ action: "action1" }, { action: "action2" }],
            } as QueryResult<{ action: string }>);

            await subject?.getActions(instance(mockedResponse), "device");

            verify(mockedResponse.send(anything())).once();

            const result = capture(mockedResponse.send).first()[0];

            expect(result).toStrictEqual([{ action: "action1" }, { action: "action2" }]);
        });

        test("failure", async () => {
            when(mockedDatabaseService.getHistoryActions("device")).thenThrow(new Error());

            await subject?.getActions(instance(mockedResponse), "device");

            verify(mockedResponse.sendStatus(500)).once();
        });

        test("no data", async () => {
            when(mockedDatabaseService.getHistoryActions("device")).thenResolve(undefined);

            await subject?.getActions(instance(mockedResponse));

            verify(mockedResponse.send(anything())).once();
        });
    });

    describe("getHistoryRange", () => {
        test("success", async () => {
            const start = new Date();
            const end = new Date();
            when(
                mockedDatabaseService.getHistoryRange(start, end, "device", "thing", "change"),
            ).thenResolve({
                rows: [
                    {
                        type: "device",
                        entity: "thing",
                        action: "change",
                        message: '{"state": "on"}',
                        timestamp: 1234,
                    },
                    {
                        type: "device",
                        entity: "thing",
                        action: "change",
                        message: { state: DeviceState.Off },
                        timestamp: 1235,
                    },
                ],
            } as QueryResult<Message>);

            await subject?.getHistoryRange(
                instance(mockedResponse),
                start,
                end,
                "device",
                "thing",
                "change",
            );

            verify(mockedResponse.send(anything())).once();

            const result = capture(mockedResponse.send).first()[0];

            expect(result).toStrictEqual([
                {
                    type: "device",
                    entity: "thing",
                    action: "change",
                    message: { state: DeviceState.On },
                    timestamp: 1234,
                },
                {
                    type: "device",
                    entity: "thing",
                    action: "change",
                    message: { state: DeviceState.Off },
                    timestamp: 1235,
                },
            ]);
        });

        test("no data", async () => {
            const start = new Date();
            const end = new Date();
            when(
                mockedDatabaseService.getHistoryRange(start, end, "device", "thing", "change"),
            ).thenResolve(undefined);

            await subject?.getHistoryRange(
                instance(mockedResponse),
                start,
                end,
                "device",
                "thing",
                "change",
            );

            verify(mockedResponse.send(anything())).once();
        });
    });

    describe("getHistory", () => {
        test("paged", async () => {
            const end = new Date();
            when(
                mockedDatabaseService.getHistory(30, undefined, end, "device", "thing", "change"),
            ).thenResolve({
                rows: [
                    {
                        type: "device",
                        entity: "thing",
                        action: "change",
                        message: '{"state": "on"}',
                        timestamp: 1234,
                    },
                    {
                        type: "device",
                        entity: "thing",
                        action: "change",
                        message: { state: DeviceState.Off },
                        timestamp: 1235,
                    },
                ],
            } as QueryResult<Message>);

            when(
                mockedDatabaseService.getHistoryCount(
                    undefined,
                    undefined,
                    "device",
                    "thing",
                    "change",
                ),
            ).thenResolve({ rows: [{ count: 12 }] } as QueryResult<{ count: number }>);

            await subject?.getHistory(
                instance(mockedResponse),
                undefined,
                undefined,
                end,
                "device",
                "thing",
                "change",
            );

            verify(mockedResponse.send(anything())).once();

            const result = capture(mockedResponse.send).first()[0];

            expect(result).toStrictEqual({
                records: 12,
                data: [
                    {
                        type: "device",
                        entity: "thing",
                        action: "change",
                        message: { state: DeviceState.On },
                        timestamp: 1234,
                    },
                    {
                        type: "device",
                        entity: "thing",
                        action: "change",
                        message: { state: DeviceState.Off },
                        timestamp: 1235,
                    },
                ],
            });
        });

        test("unpaged", async () => {
            const start = new Date();
            const end = new Date();
            when(
                mockedDatabaseService.getHistory(15, start, end, "device", "thing", "change"),
            ).thenResolve({
                rows: [
                    {
                        type: "device",
                        entity: "thing",
                        action: "change",
                        message: '{"state": "on"}',
                        timestamp: 1234,
                    },
                    {
                        type: "device",
                        entity: "thing",
                        action: "change",
                        message: { state: DeviceState.Off },
                        timestamp: 1235,
                    },
                ],
            } as QueryResult<Message>);

            when(
                mockedDatabaseService.getHistoryCount(start, end, "device", "thing", "change"),
            ).thenResolve({ rows: [{ count: 321 }] } as QueryResult<{ count: number }>);

            await subject?.getHistory(
                instance(mockedResponse),
                15,
                start,
                end,
                "device",
                "thing",
                "change",
            );

            verify(mockedResponse.send(anything())).once();

            const result = capture(mockedResponse.send).first()[0];

            expect(result).toStrictEqual({
                records: 321,
                data: [
                    {
                        type: "device",
                        entity: "thing",
                        action: "change",
                        message: { state: DeviceState.On },
                        timestamp: 1234,
                    },
                    {
                        type: "device",
                        entity: "thing",
                        action: "change",
                        message: { state: DeviceState.Off },
                        timestamp: 1235,
                    },
                ],
            });
        });

        test("no data", async () => {
            const end = new Date();
            when(
                mockedDatabaseService.getHistory(30, undefined, end, "device", "thing", "change"),
            ).thenResolve(undefined);

            when(
                mockedDatabaseService.getHistoryCount(
                    undefined,
                    undefined,
                    "device",
                    "thing",
                    "change",
                ),
            ).thenResolve(undefined);

            await subject?.getHistory(
                instance(mockedResponse),
                undefined,
                undefined,
                end,
                "device",
                "thing",
                "change",
            );

            verify(mockedResponse.send(anything())).once();

            const result = capture(mockedResponse.send).first()[0];

            expect(result).toStrictEqual({
                records: undefined,
                data: undefined,
            });
        });
    });
});
