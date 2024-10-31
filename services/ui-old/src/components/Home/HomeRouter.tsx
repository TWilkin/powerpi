import { useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useGetFloorplan } from "../../hooks/useGetFloorplan";
import NotFound from "../NotFound";
import Home from "./Home";

const HomeRouter = () => {
    const { floorplan } = useGetFloorplan();

    const defaultFloor = useMemo(() => {
        if ((floorplan?.floors?.length ?? 0) > 0) {
            return floorplan?.floors[0].name;
        }

        return undefined;
    }, [floorplan]);

    return (
        <Routes>
            {defaultFloor && <Route index element={<Navigate to={defaultFloor} replace />} />}
            <Route path=":floor" element={<Home floorplan={floorplan} />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};
export default HomeRouter;
