import "vitest";

interface CustomMatches<R = unknown> {
    toContainLogMessage: (expected: string) => R;
}

declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface Assertion<T = any> extends CustomMatches<T> {}

    interface AsymmetricMatchersContaining extends CustomMatches {}
}
