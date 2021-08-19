import React, { createContext, useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import Axios from "axios"
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
} from "@material-ui/icons"
import DateRangeIcon from "@material-ui/icons/DateRange"
import Icon from "@mdi/react"
import { mdiTournament } from "@mdi/js"
import auth0Client from "utility/Auth"
import settings from "constants/settings"

const DataContext = createContext()
const httpClient = Axios.create()
httpClient.defaults.timeout = 10000

const fontSize = 26

const routes = {
  "/": {
    name: "Home",
    path: "/",
    icon: <HomeIcon style={{ fontSize }} />,
  },
  "/tournaments": {
    name: "Tournaments",
    path: "/tournaments",
    icon: <Icon path={mdiTournament} size={1} />,
  },
  "/my-events": {
    name: "My Events",
    path: "/my-events",
    icon: <DateRangeIcon style={{ fontSize }} />,
  },
  "/settings": {
    name: "Settings",
    path: "/settings",
    icon: <SettingsIcon style={{ fontSize }} />,
  },
  "/info": {
    name: "Info",
    path: "/info",
    icon: <InfoIcon style={{ fontSize }} />,
  },
}

function initializeLocalSettings() {
  if (typeof Storage !== "undefined") {
    const localSettings = JSON.parse(window.localStorage.getItem("settings"))
    return {
      ...settings.default,
      ...localSettings,
    }
  }
  return settings.default
}

export function DataProvider({ children }) {
  const history = useHistory()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [auth, setAuth] = useState()
  const [userLists, setUserLists] = useState([])
  const [userSettings, setUserSettings] = useState(initializeLocalSettings())

  useEffect(() => {
    const asyncSilentAuth = async () => {
      try {
        await auth0Client.silentAuth()
        setAuth(auth0Client)
      } catch {
        setAuth(auth0Client)
      }
    }
    asyncSilentAuth()
  }, [])

  const setUserSettingsValue = (key, value) => {
    if (typeof Storage !== "undefined") {
      const newSettings = {
        ...userSettings,
        [key]: value,
      }
      window.localStorage.setItem("settings", JSON.stringify(newSettings))
      setUserSettings(newSettings)
    }
  }
  const goToPage = newRoute => history.push(newRoute)

  return (
    <DataContext.Provider
      value={{
        isDrawerOpen,
        auth,
        routes,
        userLists,
        userSettings,
        goToPage,
        setUserLists,
        setUserSettingsValue,
        setIsDrawerOpen,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export default DataContext
