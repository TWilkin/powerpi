import Route from "./Route";

/** Class to handle building URLs for links. */
export default class RouteBuilder {
    /** Build the URL for the specified Route.
     * @param parts The route, or string to build a URL for.
     * @return The URL for the specified Route.
     */
    public static build(...parts: (Route | string | undefined)[]) {
        let filtered = parts.filter((part): part is string => part != null && part.trim() !== "");

        if (filtered.length === 0) {
            filtered = [Route.Root];
        }

        return filtered
            .map((part) => encodeURI(part))
            .join("/")
            .replace("//", "/");
    }

    /** Build the URL for the home (floorplan) links.
     * @param floor The floor to generate the URL for.
     * @return The URL for the specified Route.
     */
    public static home(floor: string) {
        return this.build(Route.Home, floor);
    }
}
