import { createBrowserRouter } from "react-router"

const router = createBrowserRouter([
  {
    path: "/login",
    lazy: async () => {
      const module = await import("@/pages/Login")

      return {
        Component: module.default,
      }
    },
  },
  {
    path: "/register",
    lazy: async () => {
      const module = await import("@/pages/Register")

      return {
        Component: module.default,
      }
    },
  },
  {
    path: "/",
    lazy: async () => {
      const module = await import("@/layouts")

      return {
        Component: module.default,
      }
    },
    children: [
      {
        index: true,
        lazy: async () => {
          const module = await import("@/pages/Home")

          return {
            Component: module.default,
          }
        },
      },
      {
        path: "documents",
        lazy: async () => {
          const module = await import("@/pages/Documents")

          return {
            Component: module.default,
          }
        },
      },
      {
        path: "knowledges/:id",
        lazy: async () => {
          const module = await import("@/pages/Knowledges")

          return {
            Component: module.default,
          }
        },
      },
      {
        path: "documents/:id",
        lazy: async () => {
          const module = await import("@/pages/Documents/Detail")

          return {
            Component: module.default,
          }
        },
      },
    ],
  },
  {
    path: "/ai",
    lazy: async () => {
      const module = await import("@/pages/AIChat")

      return {
        Component: module.default,
      }
    },
  },
])

export default router
