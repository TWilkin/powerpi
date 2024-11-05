import Route from "../../routing/Route";
import useOptionalRoute from "../../routing/useOptionalRoute";
import HeaderLink from "../HeaderLink";
import Logo from "../Logo";

const Header = () => {
    const enabled = useOptionalRoute();

    return (
        <header>
            <nav className="flex flex-row items-center bg-black border-b-2 border-black divide-x-2 divide-black">
                <Logo />

                {enabled?.home && <HeaderLink route={Route.Home} icon="home" text="Home" />}

                <HeaderLink route={Route.Device} icon="device" text="Devices" />
            </nav>
        </header>
    );
};
export default Header;
