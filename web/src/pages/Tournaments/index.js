import React, { useState } from "react"
import { useHistory } from "react-router-dom"
import { useQuery } from "urql"
import { Divider, Grid, IconButton, Typography } from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import { compareDateStrings } from "utility/time"
import EventList from "common/Event/EventList"
import LoadingWidget from "common/LoadingWidget"
import ErrorFallback from "common/ErrorFallback"
import LargerTooltip from "common/LargerTooltip"
import CreateEventModal from "common/CreateEventModal"
import { ALL_EVENTS_QUERY } from "constants/EventQueries"
import { useIsAuthenticated, useProfile } from "hooks/auth"

const now = new Date()

export default function Tournaments() {
  const [isAuthenticated] = useIsAuthenticated()
  const [profile] = useProfile()
  const history = useHistory()
  const [open, setOpen] = useState(false)

  const startsAfter = new Date(now)
  startsAfter.setDate(startsAfter.getDate() - 15)

  const endsBefore = new Date(now)
  endsBefore.setDate(endsBefore.getDate() + 180)

  const [result] = useQuery({
    query: ALL_EVENTS_QUERY,
    pollInterval: 60000,
    variables: {
      eventType: "FFGOP",
      startsAfter: startsAfter.toISOString(),
      endsBefore: endsBefore.toISOString(),
    },
  })

  if (result.fetching) {
    return <LoadingWidget />
  }

  if (result.error) {
    return <ErrorFallback error={result.error} message={result.error.message} />
  }

  const events = result.data.events
    .filter(event => event.type === "FFGOP" && event.days.length > 0)
    .sort((a, b) => compareDateStrings(a.days[0].startAt, b.days[0].startAt))

  const navigateToEvent = id => {
    history.push(`/event/${id}`)
  }

  const handleSaved = event => {
    console.log(event)
    setOpen(false)
    navigateToEvent(event.id)
  }

  return (
    <Grid container direction="column" justify="space-around">
      <Grid item>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <Grid item xs={11}>
            <Typography variant="h3" component="h1">
              Tournaments
            </Typography>
          </Grid>
          <Grid item>
            {isAuthenticated && (
              <LargerTooltip arrow title="Create a tournament">
                <IconButton
                  color="primary"
                  aria-label="create a tournament"
                  onClick={() => setOpen(true)}
                >
                  <AddIcon />
                </IconButton>
              </LargerTooltip>
            )}
            <CreateEventModal
              isAuthenticated={isAuthenticated}
              profile={profile}
              title="Create a Tournament"
              eventType="FFGOP"
              open={open}
              onSaved={handleSaved}
              onCancel={() => setOpen(false)}
            />
          </Grid>
        </Grid>
        <Divider />
      </Grid>

      <Grid item>
        <EventList
          events={events}
          onItemClick={event => navigateToEvent(event.id)}
        />
      </Grid>
    </Grid>
  )
}
