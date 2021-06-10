const config = {
  logging: {
    request: true,
    requestObjects: ["request", "context.System.user"]
  },

  intentMap: {
    "AMAZON.StopIntent": "END"
  }
};
module.exports = config;
