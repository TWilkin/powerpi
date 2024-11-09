import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/Header";
import Loader from "../../components/Loader";

const Layout = () => (
    <>
        <Header />

        <Suspense
            fallback={
                <div className="w-full flex justify-center">
                    <Loader />
                </div>
            }
        >
            <main className="px-2 flex-1 flex flex-col gap-1">
                <Outlet />
            </main>
        </Suspense>
    </>
);
export default Layout;
