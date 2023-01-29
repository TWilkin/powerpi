export default class QueryKeyFactory {
    static base = () => ["powerpi"];

    static config = () => [...this.base(), "config"];

    static devices = () => [...this.base(), "devices"];

    static floorplan = () => [...this.base(), "floorplan"];

    static history = () => HistoryQueryKeyFactory;

    static sensors = () => [...this.base(), "sensors"];
}

export class HistoryQueryKeyFactory {
    static base = () => [...QueryKeyFactory.base(), "history"];

    static actions = () => [...this.base(), "actions"];

    static entities = () => [...this.base(), "entities"];

    static types = () => [...this.base(), "types"];

    static page = (type?: string, entity?: string, action?: string, start?: Date, end?: Date) => [
        ...this.base(),
        "page",
        [type, entity, action, start, end].filter((option) => option !== undefined),
    ];
}
