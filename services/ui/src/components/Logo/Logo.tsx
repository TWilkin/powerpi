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
                "flex flex-row gap-sm items-center text-xs rotate-180 vertical-writing-lr",
            )}
        >
            <Icon
                icon="logo"
                className={classNames("rotate-90", { "animate-spin": fetching > 0 })}
            />
            {/*eslint-disable-next-line i18next/no-literal-string*/ "PowerPi"}
        </a>
    );
};
export default Logo;
