import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Icon, { IconType } from "../Icon";

type MessageEmptyProps = {
    type: "empty";

    translation: "pages.devices" | "pages.home";
};

type MessageUnknownProps = {
    type: "unknown";

    translation: "pages.home";

    value: string;
};

type MessageCountProps = {
    type: "filtered";

    translation: "pages.devices";

    count: number;
};

type MessageProps = MessageEmptyProps | MessageUnknownProps | MessageCountProps;

/** Component to display a message when the user has done something that is preventing things
 * being shown.
 * e.g. filtered everything away, used a bad URL or failed to setup a configuration file.
 */
const Message = (props: MessageProps) => {
    const { t } = useTranslation();

    const message = useMemo(() => {
        switch (props.type) {
            case "empty":
                return t(`${props.translation}.${props.type}`);

            case "unknown":
                return t(`${props.translation}.${props.type}`, { value: props.value });

            case "filtered":
                return t(`${props.translation}.${props.type}`, { count: props.count });

            default:
                throw Error("Unknown type");
        }
    }, [props, t]);

    return (
        <div className="flex flex-row gap-2 items-center">
            <Icon icon={getIcon(props.type)} /> {message}
        </div>
    );
};
export default Message;

function getIcon(type: MessageProps["type"]): IconType {
    switch (type) {
        case "empty":
        case "unknown":
            return "info";

        case "filtered":
            return "search";

        default:
            throw Error("Unknown type");
    }
}
