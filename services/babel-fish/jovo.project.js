const { ProjectConfig } = require("@jovotech/cli-core");
const { AlexaCli } = require("@jovotech/platform-alexa");

const project = new ProjectConfig({
    endpoint: "${JOVO_WEBHOOK_URL}",
    plugins: [
        new AlexaCli({
            files: {
                "skill-package/skill.json": {
                    manifest: {
                        publishingInformation: {
                            locales: {
                                "en-GB": {
                                    summary: "PowerPi Alexa Integration",
                                    examplePhrases: ["Alexa start PowerPi"],
                                    keywords: ["powerpi"],
                                    name: "PowerPI babel-fish",
                                    description: "PowerPi Alexa Integration",
                                    smallIconUri:
                                        "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15/svgs/solid/plug.svg",
                                    largeconUri:
                                        "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15/svgs/solid/plug.svg",
                                },
                            },
                        },
                        privacyAndCompliance: {
                            locales: {
                                "en-GB": {},
                            },
                        },
                    },
                },
            },
        }),
    ],
});

module.exports = project;
