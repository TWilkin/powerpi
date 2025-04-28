export default interface EnergyMonitorArguments {
    // whether to run energy-monitor as a daemon
    daemon?: boolean;

    // how many days to go back when retrieving the usage
    history?: number;

    // show the help
    help?: boolean;
}
