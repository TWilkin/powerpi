import useDevices from "../../queries/useDevices";

const DevicePage = () => {
    const { data } = useDevices();

    return <>{JSON.stringify(data)}</>;
};
export default DevicePage;
