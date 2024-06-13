import { MqttService } from "@powerpi/common";
import { Response } from "express";
import { QueryResult } from "pg";
import { anyNumber, instance, mock, resetCalls, verify, when } from "ts-mockito";
import { ConfigService, DatabaseService } from "../services";
import HealthController from "./HealthController";

const mockedConfigService = mock<ConfigService>();
const mockedDatabaseService = mock<DatabaseService>();
const mockedMqttService = mock<MqttService>();
const mockedResponse = mock<Response>();

describe("HealthController", () => {
    let subject: HealthController | undefined;

    beforeEach(() => {
        when(mockedResponse.status(anyNumber())).thenReturn(instance(mockedResponse));

        resetCalls(mockedResponse);

        subject = new HealthController(
            instance(mockedConfigService),
            instance(mockedDatabaseService),
            instance(mockedMqttService),
        );
    });

    describe("getHealth", () => {
        describe("database", () => {
            test("success", async () => {
                when(mockedConfigService.hasPersistence()).thenResolve(true);

                when(mockedMqttService.connected).thenReturn(true);

                when(mockedDatabaseService.isAlive()).thenResolve({
                    rows: [{ value: 1 }],
                } as QueryResult<{ value: number }>);

                await subject?.getHealth(instance(mockedResponse));

                verify(mockedResponse.status(200)).once();
            });

            test("failure", async () => {
                when(mockedConfigService.hasPersistence()).thenResolve(true);

                when(mockedMqttService.connected).thenReturn(true);

                when(mockedDatabaseService.isAlive()).thenResolve(undefined);

                await subject?.getHealth(instance(mockedResponse));

                verify(mockedResponse.status(500)).once();
            });
        });

        describe("no database", () => {
            test("success", async () => {
                when(mockedConfigService.hasPersistence()).thenResolve(false);

                when(mockedMqttService.connected).thenReturn(true);

                await subject?.getHealth(instance(mockedResponse));

                verify(mockedResponse.status(200)).once();
            });

            test("failure", async () => {
                when(mockedConfigService.hasPersistence()).thenResolve(false);

                when(mockedMqttService.connected).thenReturn(false);

                await subject?.getHealth(instance(mockedResponse));

                verify(mockedResponse.status(500)).once();
            });
        });
    });
});
