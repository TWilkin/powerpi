export default class QueryKeyFactory {
    static readonly base = () => ["powerpi"];

    static readonly config = () => [...this.base(), "config"];

    static readonly devices = () => [...this.base(), "devices"];

    static readonly floorplan = () => [...this.base(), "floorplan"];

    static readonly history = () => HistoryQueryKeyFactory;

    static readonly sensors = () => [...this.base(), "sensors"];
}

export class HistoryQueryKeyFactory {
    static readonly base = () => [...QueryKeyFactory.base(), "history"];

    static readonly actions = () => [...this.base(), "actions"];

    static readonly entities = () => [...this.base(), "entities"];

    static readonly types = () => [...this.base(), "types"];

    static readonly page = (
        type?: string,
        entity?: string,
        action?: string,
        start?: Date,
        end?: Date,
    ) => [
        ...this.base(),
        "page",
        [type, entity, action, start, end].filter((option) => option !== undefined),
    ];
}
