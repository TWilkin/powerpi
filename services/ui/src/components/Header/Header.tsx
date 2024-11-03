import Logo from "../Logo";

const Header = () => {
    //const { data } = useConfig();

    return (
        <header className="flex flex-row gap-1 items-center bg-sky-400 dark:bg-purple-950">
            <Logo />
        </header>
    );
};
export default Header;
