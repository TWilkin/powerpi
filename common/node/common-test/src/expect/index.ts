import toContainLogMessage from "./toContainLogMessage";

type Global = {
    expect: {
        extend: (funcs: object) => void;
    };
};

const jestExpect = (global as unknown as Global).expect;

if (jestExpect !== undefined) {
    jestExpect.extend({ toContainLogMessage });
}
