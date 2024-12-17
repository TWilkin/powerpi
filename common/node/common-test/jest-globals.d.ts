declare namespace jest {
    interface Matchers<R> {
        toContainLogMessage(expected: string): R;
    }
}
