import { useUser } from "../hooks/useUser";

const Home = () => {
    const user = useUser();
    return <div>Hello {user}!</div>;
};
export default Home;
