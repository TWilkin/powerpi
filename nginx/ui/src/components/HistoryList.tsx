import { History, PowerPiApi } from "powerpi-common-api";
import React, { useEffect, useState } from "react";
import ReactTimeAgo from "react-time-ago";
import Filter from "./Filter";
import HistoryFilter, { Filters } from "./HistoryFilter";
import Loading from "./Loading";

interface HistoryListProps {
  api: PowerPiApi;
  query: string | undefined;
}

const HistoryList = ({ api, query }: HistoryListProps) => {
  const [filters, setFilters] = useState<Filters>({
    type: undefined,
    entity: undefined,
    action: undefined
  });
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (filters.action || filters.entity || filters.type) {
        try {
          setLoading(true);

          const result = await getHistory(api, filters);
          setHistory(result);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [filters]);

  return (
    <>
      <Filter>
        <HistoryFilter api={api} query={query} updateFilter={setFilters} />
      </Filter>

      <div id="history-list">
        <Loading loading={loading}>
          <div className="list">
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
                {history.length > 0 ? (
                  history.map((row, i) => (
                    <tr key={i}>
                      <td>{row.type}</td>
                      <td>{row.entity}</td>
                      <td>{row.action}</td>
                      <td>
                        <ReactTimeAgo date={row.timestamp} locale="en-GB" />
                      </td>
                      <td>{JSON.stringify(row.message)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Loading>
      </div>
    </>
  );
};
export default HistoryList;

async function getHistory(
  api: PowerPiApi,
  filters: Filters
): Promise<History[]> {
  const type = filters.type !== "" ? filters.type : undefined;
  const entity = filters.entity !== "" ? filters.entity : undefined;
  const action = filters.action !== "" ? filters.action : undefined;

  if (!type && !entity && !action) {
    return [];
  }

  return await api.getHistory(type, entity, action);
}
