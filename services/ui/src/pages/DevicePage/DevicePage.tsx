import Search from "../../components/Search";
import useDevices from "../../queries/useDevices";

const DevicePage = () => {
    const { data } = useDevices();

    return (
        <>
            <Search placeholder="Search for devices" onSearch={() => {}} />

            {JSON.stringify(data)}
        </>
    );
};
export default DevicePage;
