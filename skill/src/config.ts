const config = {
  logging: {
    request: true,
    requestObjects: ["request", "context.System.user"]
  },

  intentMap: {
    "AMAZON.StopIntent": "END"
  },

  db: {
    FileDb: {
      pathToFile: "../db/db.json"
    }
  }
};
export = config;
