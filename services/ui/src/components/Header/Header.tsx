import useConfig from "../../queries/useConfig";

export const Header = () => {
    const { data } = useConfig();

    return (
        <header className="bg-sky-400 dark:bg-purple-950">
            PowerPi
            {JSON.stringify(data)}
        </header>
    );
};
