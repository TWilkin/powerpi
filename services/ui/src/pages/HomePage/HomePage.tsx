import { useUser } from "../../hooks/useUser";

const HomePage = () => {
    const user = useUser();

    return <div>Hello {user}!</div>;
};
export default HomePage;
