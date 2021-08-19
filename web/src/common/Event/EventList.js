import React, { Fragment } from "react"
import { List, ListItem, ListItemText, Typography } from "@material-ui/core"
import { fmtMonth, fmtYear, parseDate } from "utility/time"
import { EventListItem } from "common/Event/EventListItem"

function EventListUnscheduled({ events, title, onClick }) {
  return (
    <Fragment>
      {events.map(event => {
        return (
          <EventListItem
            key={event.id}
            event={event}
            onClick={() => onClick(event)}
          />
        )
      })}
    </Fragment>
  )
}

function EventListScheduled({ events, title, onClick }) {
  let curMonth = ""
  return (
    <Fragment>
      {events.map(event => {
        const startDate = parseDate(event.days[0].startAt)
        const month = fmtMonth(startDate)
        const year = fmtYear(startDate)
        const fmtMonthYear = `${month} - ${year}`
        let printMonth = false

        if (fmtMonthYear !== curMonth) {
          curMonth = fmtMonthYear
          printMonth = true
        }

        return (
          <Fragment key={event.id}>
            {printMonth && (
              <ListItem>
                <ListItemText primary={fmtMonthYear} />
              </ListItem>
            )}
            <EventListItem event={event} onClick={() => onClick(event)} />
          </Fragment>
        )
      })}
    </Fragment>
  )
}

export default function EventList({ events, title, onItemClick, unscheduled }) {
  return (
    <List>
      {title && title !== "" && (
        <ListItem selected>
          <ListItemText>{title}</ListItemText>
          <Typography variant="caption">Last Updated</Typography>
        </ListItem>
      )}

      {unscheduled ? (
        <EventListUnscheduled
          events={events}
          title={title}
          onClick={onItemClick}
        />
      ) : (
        <EventListScheduled
          events={events}
          title={title}
          onClick={onItemClick}
        />
      )}
    </List>
  )
}
