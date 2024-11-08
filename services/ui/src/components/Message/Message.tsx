import { useTranslation } from "react-i18next";
import Icon, { IconType } from "../Icon";

type MessageSimpleProps = {
    type: "empty";
};

type MessageCountProps = {
    type: "filtered";

    count: number;
};

type MessageProps = {
    page: string;
} & (MessageSimpleProps | MessageCountProps);

const Message = (props: MessageProps) => {
    const message = useMessage(props);

    return (
        <div>
            <Icon icon={getIcon(props.type)} /> {message}
        </div>
    );
};
export default Message;

function getIcon(type: MessageProps["type"]): IconType {
    switch (type) {
        case "empty":
            return "info";

        case "filtered":
            return "search";

        default:
            throw Error("Unknown type");
    }
}

function useMessage(props: MessageProps) {
    const { t } = useTranslation();

    switch (props.type) {
        case "empty":
            return t(`${props.page}.${props.type}`);

        case "filtered":
            return t(`${props.page}.${props.type}`, { count: props.count });

        default:
            throw Error("Unknown type");
    }
}
