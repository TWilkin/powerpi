export default function isDefined<TValueType>(
    argument: TValueType | undefined | null,
): argument is TValueType {
    return argument != null;
}
