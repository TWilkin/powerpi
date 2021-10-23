import { MqttService } from "powerpi-common";
import Container from "./container";
import GitHubConfigService from "./services/githubservice";

function start() {
    const mqtt = Container.get(MqttService);
    mqtt.connect();

    const github = Container.get(GitHubConfigService);
    github.start();
}

start();
