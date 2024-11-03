import Route from "./Route";

/** Class to handle building URLs for links. */
export default class RouteBuilder {
    /** Build the URL for the specified Route.
     * @param route The route to build a URL for.
     * @return The URL for the specified Route.
     */
    public static build(route?: Route) {
        return [Route.Root, route].filter((route) => route).join("/");
    }
}
