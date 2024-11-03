import { faHome, faPlug } from "@fortawesome/free-solid-svg-icons";
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

                {enabled?.home && (
                    <HeaderLink route={Route.Home} icon={faHome}>
                        Home
                    </HeaderLink>
                )}

                <HeaderLink route={Route.Device} icon={faPlug}>
                    Devices
                </HeaderLink>
            </nav>
        </header>
    );
};
export default Header;
