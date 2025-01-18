import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/Header";
import Loader from "../../components/Loader";

const Layout = () => (
    <>
        <Header />

        <Suspense
            fallback={
                <div className="w-full flex justify-center flex-1">
                    <Loader />
                </div>
            }
        >
            <main className="flex-1 flex flex-col gap-sm overflow-hidden">
                <Outlet />
            </main>
        </Suspense>
    </>
);
export default Layout;
