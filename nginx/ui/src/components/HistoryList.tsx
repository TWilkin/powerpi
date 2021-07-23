import { PowerPiApi } from "powerpi-common-api";
import React, { useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { useGetHistory } from "../hooks/history";
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

  const { isHistoryLoading, isHistoryError, history } = useGetHistory(
    api,
    filters.type !== "" ? filters.type : undefined,
    filters.entity !== "" ? filters.entity : undefined,
    filters.action !== "" ? filters.action : undefined
  );

  return (
    <>
      <Filter>
        <HistoryFilter api={api} query={query} updateFilter={setFilters} />
      </Filter>

      <div id="history-list">
        <Loading loading={isHistoryLoading}>
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
                {history && history.length > 0 ? (
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
                    <td colSpan={5}>
                      {isHistoryError
                        ? `An error occured when loading the history list`
                        : `No data`}
                    </td>
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
