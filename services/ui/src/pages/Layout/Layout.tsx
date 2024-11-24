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
            <main className="px flex-1 flex flex-col gap-sm">
                <Outlet />
            </main>
        </Suspense>
    </>
);
export default Layout;
