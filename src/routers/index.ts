import BaseLayout from "@/layouts"
import Home from "@/pages/Home"
import Documents from "@/pages/Documents"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import { createBrowserRouter } from "react-router"
import Knowledges from "@/pages/Knowledges"

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
        path: "documents",
        Component: Documents,
      },
      {
        path: "knowledges/:id",
        Component: Knowledges,
      },
    ],
  },
])

export default router
