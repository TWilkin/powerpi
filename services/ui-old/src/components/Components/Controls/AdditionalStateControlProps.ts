import { AdditionalState } from "@powerpi/common-api";

type AdditionalStateControlsProps = {
    disabled: boolean;
    onChange: (newAdditionalState: AdditionalState) => void;
};
export default AdditionalStateControlsProps;
