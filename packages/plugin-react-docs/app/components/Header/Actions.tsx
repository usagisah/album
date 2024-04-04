import { useTheme } from "@emotion/react"
import styled from "@emotion/styled"
import { usePage } from "album.docs"
import { Dropdown } from "antd"
import { Fragment, useRef } from "react"
import { Divider } from "./Divider"

const PCActionsContainer = styled.div`
  display: flex;
  align-items: center;
  height: 64px;

  .item {
    font-size: 14px;
    color: ${({ theme }) => theme.text[1]};
    fill: ${({ theme }) => theme.text[1]};
    cursor: pointer;
    &:hover {
      color: ${({ theme }) => theme.primary.hover};
      fill: ${({ theme }) => theme.primary.hover};
    }
  }
  svg {
    width: 18px;
    height: 18px;
  }
  .icon-down {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 1024px) {
    display: none;
  }
`
export function PCActions() {
  const { components, search, lang, theme, actions } = usePage()
  const NavSearch = components["NavSearch"]
  const Lang = components["Lang"]
  const SelectMenu = components["SelectMenu"]
  const ThemeAction = components["ThemeAction"]
  const children = [
    search !== false && (
      <div className="item" key="search">
        <NavSearch />
      </div>
    ),
    ...actions.map((item, index) => (
      <SelectMenu key={index} linkItems={item.children ?? []}>
        <a className="item" href={item.link}>
          {item.icon && <div dangerouslySetInnerHTML={{ __html: item.icon }}></div>}
          {item.label && <div dangerouslySetInnerHTML={{ __html: item.label }}></div>}
        </a>
      </SelectMenu>
    )),
    theme.list.length > 0 && (
      <div className="item" key="theme">
        <ThemeAction />
      </div>
    ),
    lang.locales.length > 0 && (
      <div className="item" key="lang">
        <Lang />
      </div>
    )
  ].filter(Boolean)
  return (
    <PCActionsContainer className="pc-actions">
      {children.map((item, index) => {
        if (children.length > 1 && index <= children.length - 2) {
          return (
            <Fragment key={index}>
              {item}
              <Divider />
            </Fragment>
          )
        }
        return item
      })}
    </PCActionsContainer>
  )
}

const IpadActionsContainer = styled.div`
  display: none;
  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    height: 64px;
  }
`
export function IpadActions() {
  const { components, lang, search, theme: albumTheme } = usePage()
  const { locales } = lang
  const NavSearch = components["NavSearch"]
  const theme = useTheme()

  const menuItems = useRef<any[]>([])
  if (!menuItems.current) {
    const items: any[] = (menuItems.current = [])
    if (locales.length > 0) {
      items.push({
        type: "group",
        key: 1,
        label: "lang",
        children: locales.map(item => ({
          key: item.link,
          label: <a href={item.link}>{item.label}</a>
        }))
      })
      items.push({ type: "divider" })
    }
    items.push({
      type: "group",
      key: 2,
      label: "theme",
      children: albumTheme.list.map((item, index) => ({ key: item + index, label: item }))
    })
    items.push({ type: "divider" })
  }
  return (
    <IpadActionsContainer className="ipad-actions">
      {search !== false && <NavSearch mobile />}
      {search !== false && menuItems.current.length > 0 && <NavSearch mobile />}
      {menuItems.current.length > 0 && (
        <Dropdown placement="bottomRight" arrow menu={{ items: menuItems.current }}>
          <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4200" width="14" height="14" style={{ cursor: "pointer" }}>
            <path
              d="M213.333333 512a85.333333 85.333333 0 1 1-85.333333-85.333333 85.333333 85.333333 0 0 1 85.333333 85.333333z m298.666667-85.333333a85.333333 85.333333 0 1 0 85.333333 85.333333 85.333333 85.333333 0 0 0-85.333333-85.333333z m384 0a85.333333 85.333333 0 1 0 85.333333 85.333333 85.333333 85.333333 0 0 0-85.333333-85.333333z"
              fill={theme.text[1]}
              p-id="4201"
            ></path>
          </svg>
        </Dropdown>
      )}
    </IpadActionsContainer>
  )
}
