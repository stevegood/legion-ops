import { useContext, useEffect, useState } from "react"
import DataContext from "context/DataContext"
import { useQuery } from "urql"
import { CAN_MODIFY_QUERY } from "constants/EventQueries"

export function useIsAuthenticated() {
  const { auth } = useContext(DataContext)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  useEffect(() => {
    if (!auth) return

    if (!auth.isAuthenticated()) {
      auth
        .silentAuth()
        .then(() => {
          setIsAuthenticated(auth.isAuthenticated())
        })
        .catch(err => {
          if (err.code !== "login_required") {
            console.error(err)
          }
          setIsAuthenticated(false)
        })
    }

    setIsAuthenticated(auth.isAuthenticated())
  }, [auth])
  return [isAuthenticated]
}

export function useProfile() {
  const { auth } = useContext(DataContext)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!auth) return

    if (!auth.isAuthenticated()) {
      auth
        .silentAuth()
        .then(() => {
          setProfile(auth.getProfile())
        })
        .catch(err => {
          if (err.code !== "login_required") {
            console.error(err)
          }
          setProfile(null)
        })
    }

    setProfile(auth.getProfile())
  }, [auth])

  return [profile]
}

export function useCanModifyEvent(id) {
  const [canModifyEvent, setCanModifyEvent] = useState(false)
  const [loading, setLoading] = useState(true)

  // get event edit permissions
  const [canModifyResult] = useQuery({
    query: CAN_MODIFY_QUERY,
    variables: {
      id,
    },
  })

  useEffect(() => {
    const { fetching, data, error } = canModifyResult
    if (fetching || !data) return

    if (error) return console.error(error)

    setCanModifyEvent(data.canModifyEvent)
  }, [canModifyResult])

  useEffect(() => {
    if (loading && canModifyResult.data) setLoading(false)
  }, [canModifyEvent, canModifyResult, loading])

  return [canModifyEvent, loading]
}
