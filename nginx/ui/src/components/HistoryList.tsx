import React from "react";
import Moment from "react-moment";

import { Api, History } from "../api";

interface HistoryListProps {
    api: Api;
}

interface HistoryListModel {
    history: History[];
}

export default class HistoryList 
        extends React.Component<HistoryListProps, HistoryListModel>
{

    constructor(props: HistoryListProps) {
        super(props);

        this.state = {
            history: []
        };
    }

    async componentDidMount() {
        this.setState({
            history: await this.props.api.getHistory()
        });
    }

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
        return (
            <div id='history-list'>
                <table>
                    <thead>
                        <th>Type</th>
                        <th>Entity</th>
                        <th>Action</th>
                        <th>Timestamp</th>
                        <th>Message</th>
                    </thead>

                    {this.state.history
                    .map((history, i) => 
                        <tr key={i}>
                            <td>{history.type}</td>
                            <td>{history.entity}</td>
                            <td>{history.action}</td>
                            <td><Moment date={history.timestamp} format="L LT" /></td>
                            <td>{JSON.stringify(history.message)}</td>
                        </tr>
                    )}
                </table>
            </div>
        );
    }
}
