import React, { Fragment } from "react"
import { useHistory } from "react-router-dom"
import { useQuery } from "urql"
import { Divider, Grid, Typography } from "@material-ui/core"
import LoadingWidget from "common/LoadingWidget"
import ErrorFallback from "common/ErrorFallback"
import { MY_PROFILE } from "constants/UserQueries"
import EventList from "common/Event/EventList"
import { eventDaySort, sortByName } from "utility/sort"

export default function MyEvents() {
  const history = useHistory()

  const [result] = useQuery({ query: MY_PROFILE })
  const { fetching, data, error } = result

  // show the loading screen
  if (fetching) {
    return <LoadingWidget />
  }

  // handle errors getting event
  if (error) {
    return <ErrorFallback error={error} message={error.message} />
  }

  const navigateToEvent = id => {
    history.push(`/event/${id}`)
  }

  const organizedUnscheduledEvents = data.myProfile.organizedEvents
    .filter(event => event.days.length === 0)
    .sort(sortByName)

  const organizedEventsWithDays = data.myProfile.organizedEvents
    .filter(event => event.days.length > 0)
    .sort(eventDaySort)

  const judgingEvents = data.myProfile.judgingEvents
    .filter(event => event.days.length > 0)
    .sort(eventDaySort)

  const playingEvents = data.myProfile.participatingEvents
    .filter(event => event.days.length > 0)
    .sort(eventDaySort)

  const totalNumEvents =
    organizedUnscheduledEvents.length +
    organizedEventsWithDays.length +
    judgingEvents.length +
    playingEvents.length

  return (
    <Grid container direction="column" justify="space-around">
      <Grid item xs={12}>
        <Typography variant="h3" component="h1">
          My Events
        </Typography>
        <Divider />
      </Grid>

      {totalNumEvents === 0 && (
        <Fragment>
          <Typography variant="body1">You have no events</Typography>
        </Fragment>
      )}

      {organizedUnscheduledEvents.length > 0 && (
        <Fragment>
          <Grid item xs={12}>
            <EventList
              unscheduled
              title="Organizer - Unscheduled"
              events={organizedUnscheduledEvents}
              onItemClick={event => navigateToEvent(event.id)}
            />
          </Grid>
        </Fragment>
      )}

      {organizedEventsWithDays.length > 0 && (
        <Fragment>
          <Divider />

          <Grid item xs={12}>
            <EventList
              title="Organizer - Scheduled"
              events={organizedEventsWithDays}
              onItemClick={event => navigateToEvent(event.id)}
            />
          </Grid>
        </Fragment>
      )}

      {judgingEvents.length > 0 && (
        <Fragment>
          <Divider />

          <Grid item xs={12}>
            <EventList
              title="Judging"
              events={judgingEvents}
              onItemClick={event => navigateToEvent(event.id)}
            />
          </Grid>
        </Fragment>
      )}

      {playingEvents.length > 0 && (
        <Fragment>
          <Divider />

          <Grid item xs={12}>
            <EventList
              title="Playing"
              events={playingEvents}
              onItemClick={event => navigateToEvent(event.id)}
            />
          </Grid>
        </Fragment>
      )}
    </Grid>
  )
}
