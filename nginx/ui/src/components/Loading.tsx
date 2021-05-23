import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface LoadingProps {
  loading: boolean;
  children: JSX.Element | JSX.Element[] | undefined;
}

const Loading = ({ loading, children }: LoadingProps) =>
  loading ? (
    <span>
      <FontAwesomeIcon icon={faSpinner} spin={true} />
    </span>
  ) : (
    <>{children}</>
  );
export default Loading;
