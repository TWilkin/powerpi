import { LogParameter } from "@powerpi/common";

export default function toContainLogMessage(received: LogParameter[][], expected: string) {
    const asStrings = received.map((message) =>
        (message.reduce((str, part) => `${str} ${part}`, "") as string).trim(),
    );

    const pass = asStrings.findIndex((message) => message === expected) !== -1;

    return {
        message: () =>
            `expected ["${asStrings.join('", "')}"] to contain log message "${expected}"`,
        pass,
    };
}
