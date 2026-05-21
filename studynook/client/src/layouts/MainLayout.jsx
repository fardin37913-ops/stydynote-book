import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DynamicTitle from "../components/DynamicTitle";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DynamicTitle />
      <Navbar />

      <main className="min-h-[calc(100vh-320px)]">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;