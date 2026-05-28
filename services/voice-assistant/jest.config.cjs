module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        "^.+\\.ts?$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^uuid$": "<rootDir>/test/uuid-shim.cjs",
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};
