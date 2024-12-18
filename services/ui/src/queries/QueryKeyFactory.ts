export default class QueryKeyFactory {
    static readonly base = ["powerpi"];

    static readonly config = [...this.base, "config"];

    static readonly devices = [...this.base, "devices"];

    static readonly sensors = [...this.base, "sensors"];

    static readonly floorplan = [...this.base, "floor-plan"];

    static readonly history = [...this.base, "history"];
}
