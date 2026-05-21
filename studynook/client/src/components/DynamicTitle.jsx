import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const getTitle = (pathname) => {
  if (pathname === "/") return "StudyNook – Home";
  if (pathname === "/rooms") return "StudyNook – Available Rooms";
  if (pathname.startsWith("/rooms/")) return "StudyNook – Room Details";
  if (pathname === "/login") return "StudyNook – Login";
  if (pathname === "/register") return "StudyNook – Register";
  if (pathname === "/add-room") return "StudyNook – Add Room";
  if (pathname === "/my-listings") return "StudyNook – My Listings";
  if (pathname === "/my-bookings") return "StudyNook – My Bookings";

  return "StudyNook – Page Not Found";
};

const DynamicTitle = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = getTitle(location.pathname);
  }, [location.pathname]);

  return null;
};

export default DynamicTitle;