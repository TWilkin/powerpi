import React from "react";

import { Api } from "../api";

interface HistoryProps {
    api: Api;
}

export default class History extends React.Component<HistoryProps> {
    render() {
        return (
            <>
                {this.renderFilters()}
                <br />
                {this.renderHistory()}
            </>
        );
    }

    renderFilters() {
        return (<></>);
    }

    renderHistory() {
        return (<></>);
    }
}
