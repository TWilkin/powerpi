import { useParams } from "react-router";

/** Hook to retrieve the current entity from the URL. */
export default function useEntity() {
    const { entity } = useParams();

    return entity;
}
