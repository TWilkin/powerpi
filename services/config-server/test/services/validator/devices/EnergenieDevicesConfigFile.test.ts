import commonDeviceTests from "./commonDeviceTests";

describe("Energenie Devices", () => {
    describe("Energenie Pairing", () => {
        const { testValid, testInvalid } = commonDeviceTests({
            devices: [{ type: "energenie_pairing", name: "Pairing", timeout: 1 }],
        });

        [1, 10].forEach((timeout) =>
            test(`Good timeout ${timeout}`, () =>
                testValid({
                    devices: [{ type: "energenie_pairing", name: "Pairing", timeout }],
                }))
        );

        [-1, 0].forEach((timeout) =>
            test(`Bad timeout ${timeout}`, () =>
                testInvalid({
                    devices: [{ type: "energenie_pairing", name: "Pairing", timeout }],
                }))
        );
    });

    describe("Energenie Socket", () => {
        const { testValid, testInvalid } = commonDeviceTests({
            devices: [{ type: "energenie_socket", name: "Socket" }],
        });

        [0, 4].forEach((device_id) =>
            test(`Good device id ${device_id}`, () =>
                testValid({
                    devices: [{ type: "energenie_socket", name: "Socket", device_id }],
                }))
        );

        [-1, 5].forEach((device_id) =>
            test(`Bad device id ${device_id}`, () =>
                testInvalid({
                    devices: [{ type: "energenie_socket", name: "Socket", device_id }],
                }))
        );
    });

    describe("Energenie Socket Group", () => {
        const { testValid, testInvalid } = commonDeviceTests({
            devices: [
                {
                    type: "energenie_socket_group",
                    name: "SocketGroup",
                    home_id: 1,
                    devices: ["Socket"],
                },
            ],
        });

        [0, 15].forEach((home_id) =>
            test(`Good home id ${home_id}`, () =>
                testValid({
                    devices: [
                        {
                            type: "energenie_socket_group",
                            name: "SocketGroup",
                            home_id,
                            devices: ["Socket"],
                        },
                    ],
                }))
        );

        [-1, 16].forEach((home_id) =>
            test(`Bad home id ${home_id}`, () =>
                testInvalid({
                    devices: [
                        {
                            type: "energenie_socket_group",
                            name: "SocketGroup",
                            home_id,
                            devices: ["Socket"],
                        },
                    ],
                }))
        );
    });
});
