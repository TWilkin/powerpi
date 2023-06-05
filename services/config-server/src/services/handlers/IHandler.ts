export default interface IHandler<TConfigFile> {
    handle: (config: TConfigFile) => void;
}
