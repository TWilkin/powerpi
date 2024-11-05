import { useIsFetching } from "@tanstack/react-query";
import RouteBuilder from "../../routing/RouteBuilder";
import Icon from "../Icon";
import "./Logo.css";

const Logo = () => {
    const fetching = useIsFetching();

    return (
        <a
            href={RouteBuilder.build()}
            className="flex flex-row gap-1 items-center py-2 bg-black text-white text-xs rotate-180 logo"
        >
            <Icon icon="logo" spin={fetching > 0} className="rotate-90" />
            PowerPi
        </a>
    );
};
export default Logo;
