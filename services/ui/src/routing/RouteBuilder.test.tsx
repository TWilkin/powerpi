import Route from "./Route";
import RouteBuilder from "./RouteBuilder";

describe("RouteBuilder", () => {
    const cases: { route?: Route; expected: string }[] = [
        { expected: "/" },
        { route: Route.Login, expected: "login" },
        { route: Route.Home, expected: "home" },
    ];
    test.each(cases)("builds $expected from $route", ({ route, expected }) => {
        const result = RouteBuilder.build(route);

        expect(result).toBe(expected);
    });
});
