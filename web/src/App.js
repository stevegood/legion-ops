import React, { useContext } from "react"
import { Provider, createClient } from "urql"
import DataContext from "context/DataContext"
import ThemeWrapper from "utility/ThemeWrapper"
import ActionBar from "common/ActionBar"
import NavigationDrawer from "common/NavigationDrawer"
import Pages from "./Pages"
import urls from "./constants/urls"

function App() {
  const { auth, userSettings } = useContext(DataContext)

  const client = createClient({
    url: urls.graphql,
    fetchOptions: () => {
      if (!auth) return {}
      // get the authentication token from local storage if it exists
      const token = auth.idToken
      // return the authorization header
      return {
        headers: {
          authorization: token ? `Bearer ${token}` : "",
        },
      }
    },
  })

  return (
    <Provider value={client}>
      <ThemeWrapper themeColor={userSettings.themeColor}>
        <ActionBar />
        <NavigationDrawer />
        <Pages />
      </ThemeWrapper>
    </Provider>
  )
}

export default App
