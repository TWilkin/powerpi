import { Controller, Get } from "@tsed/common";

@Controller("/health")
export default class HealthController {
    @Get("/")
    getHealth() {
        return true;
    }
}
