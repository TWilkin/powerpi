import { LogParameter } from "@powerpi/common";

export default function toContainLogMessage(received: LogParameter[], expected: string) {
    const message = (received.reduce((str, part) => `${str} ${part}`, "") as string).trim();

    const pass = message === expected;

    return {
        message: () => `expected "${message}" to contain log message "${expected}"`,
        pass,
    };
}
