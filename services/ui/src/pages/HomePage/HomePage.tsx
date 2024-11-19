import useFloor from "./useFloor";

const HomePage = () => {
    const floor = useFloor();

    return <>{floor}</>;
};
export default HomePage;
