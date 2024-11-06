import { useState } from "react";
import Search from "../../components/Search";
import useDevices from "../../queries/useDevices";

const DevicePage = () => {
    const { data } = useDevices();

    const [search, setSearch] = useState("");
    console.log("search", search);

    return (
        <>
            <Search placeholder="Search for devices" value={search} onSearch={setSearch} />

            {JSON.stringify(data)}
        </>
    );
};
export default DevicePage;
