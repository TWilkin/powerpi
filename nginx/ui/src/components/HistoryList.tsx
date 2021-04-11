import React, { useEffect, useState } from "react";
import ReactTimeAgo from "react-time-ago";

import { Api, History } from "../api";
import HistoryFilter, { Filters } from "./HistoryFilter";

interface HistoryListProps {
  api: Api;
  query: string | undefined;
}

const HistoryList = ({ api, query }: HistoryListProps) => {
  const [filters, setFilters] = useState<Filters>({
    type: undefined,
    entity: undefined,
    action: undefined
  });
  const [history, setHistory] = useState<History[]>([]);

  useEffect(() => {
    (async () => {
      const result = await getHistory(api, filters);
      setHistory(result);
    })();
  }, [filters]);

  return (
    <>
      <HistoryFilter api={api} query={query} updateFilter={setFilters} />
      <br />
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
            {history.map((row, i) => (
              <tr key={i}>
                <td>{row.type}</td>
                <td>{row.entity}</td>
                <td>{row.action}</td>
                <td>
                  <ReactTimeAgo date={row.timestamp} locale="en-GB" />
                </td>
                <td>{JSON.stringify(row.message)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default HistoryList;

async function getHistory(api: Api, filters: Filters): Promise<History[]> {
  const type = filters.type !== "" ? filters.type : undefined;
  const entity = filters.entity !== "" ? filters.entity : undefined;
  const action = filters.action !== "" ? filters.action : undefined;

  if (!type && !entity && !action) {
    return [];
  }

  return await api.getHistory(type, entity, action);
}
