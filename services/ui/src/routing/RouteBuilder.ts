import Route from "./Route";

/** Class to handle building URLs for links. */
export default class RouteBuilder {
    /** Build the URL for the specified Route.
     * @param route The route to build a URL for.
     * @return The URL for the specified Route.
     */
    public static build(route?: Route) {
        return this._build(route ?? Route.Root);
    }

    /** Build the URL for the home (floorplan) links.
     * @param floor The floor to generate the URL for.
     * @return The URL for the specified Route.
     */
    public static home(floor: string) {
        return this._build(Route.Home, floor);
    }

    private static _build(...parts: (Route | string | undefined)[]) {
        return parts
            .filter((part): part is string => part?.trim() !== "")
            .map((part) => encodeURI(part))
            .join("/");
    }
}
