import Route from "./Route";
import RouteBuilder from "./RouteBuilder";

describe("RouteBuilder", () => {
    const cases: { route?: Route; expected: string }[] = [
        { expected: "/" },
        { route: Route.Login, expected: "login" },
        { route: Route.Home, expected: "home" },
        { route: Route.Device, expected: "device" },
        { route: Route.History, expected: "history" },
        { route: Route.Settings, expected: "settings" },
        { route: Route.Settings, expected: "settings" },
    ];
    test.each(cases)("builds $expected from $route", ({ route, expected }) => {
        const result = RouteBuilder.build(route);

        expect(result).toBe(expected);
    });

    test("from root", () => {
        const result = RouteBuilder.build(Route.Root, Route.History);

        expect(result).toBe("/history");
    });

    const homeCases: { floor: string; expected: string }[] = [
        { floor: "ground", expected: "home/ground" },
        { floor: "first floor", expected: "home/first%20floor" },
        { floor: " ", expected: "home" },
    ];
    test.each(homeCases)("home builds $expected from $floor", ({ floor, expected }) => {
        const result = RouteBuilder.home(floor);

        expect(result).toBe(expected);
    });
});
