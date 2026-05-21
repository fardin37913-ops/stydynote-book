import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="min-h-[70vh]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;