import { useIsFetching } from "@tanstack/react-query";
import classNames from "classnames";
import RouteBuilder from "../../routing/RouteBuilder";
import { buttonStyles } from "../Button";
import Icon from "../Icon";

const Logo = () => {
    const fetching = useIsFetching();

    return (
        <a
            href={RouteBuilder.build()}
            className={classNames(
                buttonStyles("clear"),
                "flex flex-row gap-1 items-center text-xs rotate-180 vertical-writing-lr",
            )}
        >
            <Icon icon="logo" spin={fetching > 0} className="rotate-90" />
            PowerPi
        </a>
    );
};
export default Logo;
