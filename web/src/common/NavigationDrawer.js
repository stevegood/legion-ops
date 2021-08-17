import React, { useContext } from "react"
import { useLocation } from "react-router-dom"
import {
  SwipeableDrawer,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@material-ui/core"
import DataContext from "context/DataContext"

function NavDrawerLink({ selected, icon, text, handleClick }) {
  return (
    <ListItem button selected={selected} onClick={handleClick}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItem>
  )
}

function NavigationDrawer() {
  const location = useLocation()
  const { pathname } = location
  const { auth, isDrawerOpen, routes, goToPage, setIsDrawerOpen } = useContext(
    DataContext
  )
  return (
    <SwipeableDrawer
      open={isDrawerOpen}
      onOpen={() => setIsDrawerOpen(true)}
      onClose={() => setIsDrawerOpen(false)}
    >
      <div style={{ width: 250 }}>
        <List>
          <ListItem>
            <ListItemText primary="Legion Ops" secondary="The Fifth Trooper" />
          </ListItem>
        </List>
        <List dense={true}>
          <NavDrawerLink
            text="Home"
            selected={pathname === "/"}
            icon={routes["/"].icon}
            handleClick={() => {
              setIsDrawerOpen(false)
              goToPage("/")
            }}
          />
        </List>
        <Divider />
        <List dense={true}>
          <NavDrawerLink
            text="Tournaments"
            selected={pathname === "/tournaments"}
            icon={routes["/tournaments"].icon}
            handleClick={() => {
              setIsDrawerOpen(false)
              goToPage("/tournaments")
            }}
          />
          {auth && auth.isAuthenticated() && (
            <NavDrawerLink
              text="My Events"
              selected={pathname === "/my-events"}
              icon={routes["/my-events"].icon}
              handleClick={() => {
                setIsDrawerOpen(false)
                goToPage("/my-events")
              }}
            />
          )}
        </List>
        <Divider />
        <List dense={true}>
          <NavDrawerLink
            text="Settings"
            selected={pathname === "/settings"}
            icon={routes["/settings"].icon}
            handleClick={() => {
              setIsDrawerOpen(false)
              goToPage("/settings")
            }}
          />
          <NavDrawerLink
            text="Info"
            selected={pathname === "/info"}
            icon={routes["/info"].icon}
            handleClick={() => {
              setIsDrawerOpen(false)
              goToPage("/info")
            }}
          />
        </List>
      </div>
    </SwipeableDrawer>
  )
}

export default NavigationDrawer
