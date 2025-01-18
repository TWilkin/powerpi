export default class QueryKeyFactory {
    static readonly base = ["powerpi"];

    static readonly config = [...this.base, "config"];

    static readonly devices = [...this.base, "devices"];

    static readonly sensors = [...this.base, "sensors"];

    static readonly floorplan = [...this.base, "floor-plan"];

    static readonly historyBase = [...this.base, "history"];

    static history(
        start: Date | undefined,
        type: string | undefined,
        entity: string | undefined,
        action: string | undefined,
    ) {
        return [...this.historyBase, start?.toISOString(), type, entity, action];
    }

    static readonly historyTypes = [...this.historyBase, "types"];

    static readonly historyEntities = [...this.historyBase, "entities"];

    static readonly historyActions = [...this.historyBase, "actions"];
}
