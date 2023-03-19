declare global {
    interface StringConstructor {
        isNullOrWhitespace(str: string | undefined | null): boolean;
    }
}

String.isNullOrWhitespace = (str: string | undefined | null) =>
    str === undefined || str === null || str.trim() === "";

export {};
