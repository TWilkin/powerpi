const config = {
    logging: {
        request: true,
        requestObjects: ["request", "context.System.user"],
    },

    intentMap: {
        "AMAZON.CancelIntent": "CancelIntent",
        "AMAZON.StopIntent": "END",
    },
};
module.exports = config;
