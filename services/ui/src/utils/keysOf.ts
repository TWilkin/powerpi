export default function keysOf<TObjectType extends object>(obj: TObjectType) {
    return Object.keys(obj) as (keyof TObjectType)[];
}
