import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/Header";
import Loader from "../../components/Loader";

const Layout = () => (
    <>
        <Header />

        <main className="p-4">
            <Suspense
                fallback={
                    <div className="w-full flex justify-center">
                        <Loader />
                    </div>
                }
            >
                <Outlet />
            </Suspense>
        </main>
    </>
);
export default Layout;
