import { clearAuthSession } from "@/lib/auth"
import { userLogout, userMe } from "@/services/user"
import useUser from "@/stores/useUser"
import { LogoutOutlined } from "@ant-design/icons"
import { useRequest } from "ahooks"
import { Avatar, Dropdown, Skeleton, type MenuProps } from "antd"
import { useNavigate } from "react-router"

/**
 * 表示下拉菜单项的类型。
 */
type MenuItem = Required<MenuProps>["items"][number]

/**
 * 用户头像下拉菜单的选项列表。
 */
const items: MenuItem[] = [
  {
    type: "divider",
  },
  {
    key: "logout",
    label: "登出",
    icon: <LogoutOutlined />,
    danger: true,
  },
]

/**
 * 渲染用户Info组件。
 * @returns 返回组件渲染结果。
 */
const UserInfo = () => {
  const { setUser } = useUser()
  const navigate = useNavigate()

  const { data: user, loading } = useRequest(userMe, {
    onSuccess: (data) => setUser(data),
  })

  const { runAsync: userLogoutAsync } = useRequest(userLogout, {
    manual: true,
    onSuccess: () => {
      clearAuthSession()
      navigate("/login")
    },
  })

  const handleMenuClick: MenuProps["onClick"] = async ({ key }) => {
    if (key === "logout") {
      await userLogoutAsync()
    }
  }

  return (
    <Dropdown
      menu={{
        items,
        onClick: handleMenuClick,
      }}
      popupRender={(menus) => {
        return (
          <>
            <div className="flex flex-row items-center justify-center gap-2 px-(--ant-control-padding-horizontal) py-(--ant-dropdown-padding-block)">
              <Avatar className="cursor-default bg-(--ant-color-primary)">
                {user?.username}
              </Avatar>
              <div className="flex flex-col">
                <div>{user?.username}</div>
                <div className="text-sm text-black/45">{user?.email}</div>
              </div>
            </div>
            {menus}
          </>
        )
      }}
    >
      {loading ? (
        <Skeleton.Avatar active className="flex items-center justify-center" />
      ) : (
        <Avatar className="cursor-default bg-(--ant-color-primary)">
          {user?.username}
        </Avatar>
      )}
    </Dropdown>
  )
}

export default UserInfo
