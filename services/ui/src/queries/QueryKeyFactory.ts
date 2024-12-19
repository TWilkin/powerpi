export default class QueryKeyFactory {
    static readonly base = ["powerpi"];

    static readonly config = [...this.base, "config"];

    static readonly devices = [...this.base, "devices"];

    static readonly sensors = [...this.base, "sensors"];

    static readonly floorplan = [...this.base, "floor-plan"];

    static history(
        type: string | undefined,
        entity: string | undefined,
        action: string | undefined,
    ) {
        return [...this.base, "history", type, entity, action];
    }
}
