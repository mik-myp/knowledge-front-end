import BaseLayout from "@/layouts"
import Home from "@/pages/Home"
import Knowledge from "@/pages/Knowledge"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import { createBrowserRouter } from "react-router"

const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: BaseLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "knowledge",
        Component: Knowledge,
      },
    ],
  },
])

export default router
