import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddRoom from "./pages/AddRoom";
import MyListings from "./pages/MyListings";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "rooms",
        element: <Rooms />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "add-room",
        element: <AddRoom />,
      },
      {
        path: "my-listings",
        element: <MyListings />,
      },
      {
        path: "my-bookings",
        element: <MyBookings />,
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;