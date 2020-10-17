import React, { ChangeEvent } from "react";
import Moment from "react-moment";

import { Api, History } from "../api";

interface Filter {
    type?: string;
    entity?: string;
    action?: string;
}

interface HistoryListProps {
    api: Api;
}

interface HistoryListModel {
    history: History[];
    filter: Filter;
}

export default class HistoryList 
        extends React.Component<HistoryListProps, HistoryListModel>
{

    constructor(props: HistoryListProps) {
        super(props);

        this.state = {
            history: [],
            filter: {}
        };

        this.handleFilterChange = this.handleFilterChange.bind(this);
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
        return (
            <div id="history-filters" className="filters">
                {this.renderFilter("Type")}
                {this.renderFilter("Entity")}
                {this.renderFilter("Action")}
            </div>
        );
    }

    renderFilter(name: string) {
        const lowerName = name.toLowerCase();

        return (
            <>
                <label htmlFor={`${lowerName}-filter`}>
                    {name}:
                </label>
                <input type="text" name={`${lowerName}-filter`} onChange={this.handleFilterChange} />
            </>
        )
    }

    renderHistory() {
        return (
            <div id="history-list" className="list">
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

    private async handleFilterChange(event: ChangeEvent<HTMLInputElement>) {
        let filter = this.state.filter;

        const [filterName, ] = event.target.name.split("-", 2);
        const value: string | undefined = isNullOrEmpty(event.target.value) ? undefined : event.target.value;

        switch(filterName) {
            case "type":
                filter.type = value;
                break;

            case "entity":
                filter.entity = value;
                break;

            case "action":
                filter.action = value;
                break;
        }

        if(!isNullOrEmpty(filter.type) || !isNullOrEmpty(filter.entity) || !isNullOrEmpty(filter.action)) {
            this.setState({
                history: await this.props.api.getHistory(
                    filter.type,
                    filter.entity,
                    filter.action
                ),
                filter
            });
        } else {
            this.setState({
                history: [],
                filter: {}
            });
        }
    }
}

function isNullOrEmpty(value: string | null | undefined) {
    return value === null || value === undefined || value?.trim() === "";
}
