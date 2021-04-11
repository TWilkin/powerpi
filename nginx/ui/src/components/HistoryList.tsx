import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import queryString from "query-string";
import React, { FormEvent } from "react";
import Moment from "react-moment";

import { Api, History } from "../api";

interface Filter {
  type: string;
  entity: string;
  action: string;
}

interface HistoryListProps {
  api: Api;
}

interface HistoryListModel {
  history: History[];
  types: string[];
  entities: string[];
  actions: string[];
  filter: Filter;
}

export default class HistoryList extends React.Component<
  HistoryListProps,
  HistoryListModel
> {
  constructor(props: HistoryListProps) {
    super(props);

    const query = queryString.parse(window.location.search);
    const filter = {
      type: (query.type as string) ?? "",
      entity: (query.entity as string) ?? "",
      action: (query.action as string) ?? ""
    };

    this.state = {
      history: [],
      types: [],
      entities: [],
      actions: [],
      filter
    };

    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  async componentDidMount() {
    this.setState({
      history: await this.query(this.state.filter),
      types: (await this.props.api.getHistoryTypes()).map((row) => row.type),
      entities: (await this.props.api.getHistoryEntities()).map(
        (row) => row.entity
      ),
      actions: (await this.props.api.getHistoryActions()).map(
        (row) => row.action
      )
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
    return (
      <div id="history-filters" className="filters">
        <FontAwesomeIcon icon={faFilter} />
        {this.renderFilter("Type", this.state.types, this.state.filter.type)}
        {this.renderFilter(
          "Entity",
          this.state.entities,
          this.state.filter.entity
        )}
        {this.renderFilter(
          "Action",
          this.state.actions,
          this.state.filter.action
        )}
      </div>
    );
  }

  renderFilter(name: string, options: string[], selected: string) {
    const lowerName = name.toLowerCase();

    return (
      <>
        <label htmlFor={`${lowerName}-filter`}>{name}:</label>

        <select
          name={`${lowerName}-filter`}
          onChange={this.handleFilterChange}
          defaultValue={selected}
        >
          <option value="">-</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </>
    );
  }

  renderHistory() {
    return (
      <div id="history-list" className="list">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Entity</th>
              <th>Action</th>
              <th>Timestamp</th>
              <th>Message</th>
            </tr>
          </thead>

          <tbody>
            {this.state.history.map((history, i) => (
              <tr key={i}>
                <td>{history.type}</td>
                <td>{history.entity}</td>
                <td>{history.action}</td>
                <td>
                  <Moment date={history.timestamp} format="L LT" />
                </td>
                <td>{JSON.stringify(history.message)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  private async handleFilterChange(event: FormEvent<HTMLSelectElement>) {
    const filter = this.state.filter;

    const [filterName] = event.currentTarget.name.split("-", 2);
    const value = event.currentTarget.value ?? "";

    switch (filterName) {
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

    this.setState({
      history: await this.query(filter),
      filter
    });
  }

  private async query(filter: Filter) {
    if (filter.type || filter.entity || filter.action) {
      return await this.props.api.getHistory(
        filter.type === "" ? undefined : filter.type,
        filter.entity === "" ? undefined : filter.entity,
        filter.action === "" ? undefined : filter.action
      );
    }

    return [];
  }
}
