export default class QueryKeyFactory {
    static readonly base = ["powerpi"];

    static readonly config = [...this.base, "config"];

    static readonly devices = [...this.base, "devices"];

    static readonly floorplan = [...this.base, "floor-plan"];
}
