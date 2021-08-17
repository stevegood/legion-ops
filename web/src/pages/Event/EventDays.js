import React, { Fragment, useState } from "react"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import {
  Accordion as MuiAccordion,
  AccordionDetails as MuiAccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  Button,
  Typography,
} from "@material-ui/core"
import { compareDateStrings, parseDate } from "utility/time"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import EventDayRounds from "./EventDayRounds"

function dateIsBetween(middle, left, right) {
  return middle >= left && middle <= right
}

const Accordion = withStyles({
  root: {
    border: "1px solid rgba(0, 0, 0, .125)",
    boxShadow: "none",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: "auto",
    },
  },
  expanded: {},
})(MuiAccordion)

const AccordionSummary = withStyles({
  root: {
    backgroundColor: "rgba(0, 0, 0, .03)",
    borderBottom: "1px solid rgba(0, 0, 0, .125)",
    marginBottom: -1,
    minHeight: 56,
    "&$expanded": {
      minHeight: 56,
    },
  },
  content: {
    "&$expanded": {
      margin: "12px 0",
    },
  },
  expanded: {},
})(MuiAccordionSummary)

const AccordionDetails = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiAccordionDetails)

const useStyles = makeStyles(theme => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}))

export default function EventDays({
  canModifyEvent,
  days,
  onAddDay,
  onAddRound,
  onAddMatch,
}) {
  const classes = useStyles()
  const [sortedDays] = useState(
    [...days].sort((a, b) => compareDateStrings(a.startAt, b.startAt))
  )
  const [expanded, setExpanded] = useState(
    sortedDays.length ? sortedDays[0].id : ""
  )
  const now = parseDate(new Date().toISOString())

  return (
    <Fragment>
      {canModifyEvent && days.length === 0 && (
        <Fragment>
          No days scheduled. <Button onClick={onAddDay}>Add one?</Button>
        </Fragment>
      )}
      {sortedDays.map((day, i) => {
        const startAt = parseDate(day.startAt)
        const startDate = new Date(startAt).toLocaleDateString()
        const startTime = new Date(startAt).toLocaleTimeString()
        const startDateTime = `${startDate} @ ${startTime}`

        const endAt = parseDate(day.endAt)
        const endDate = new Date(endAt).toLocaleDateString()
        const endTime = new Date(endAt).toLocaleTimeString()
        const endDateTime = `${endDate} @ ${endTime}`

        if (expanded === "" && dateIsBetween(now, startAt, endAt)) {
          setExpanded(day.id)
        }

        return (
          <Accordion
            square
            key={day.id}
            expanded={expanded === day.id}
            onChange={() => {
              if (day.id === expanded) {
                setExpanded("none")
              } else {
                setExpanded(day.id)
              }
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={classes.heading}>
                Day {i + 1}: {startDateTime} - {endDateTime}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <EventDayRounds
                rounds={day.rounds}
                canModifyEvent={canModifyEvent}
                onAddRound={() => onAddRound({ day })}
                onAddMatch={({ round }) => onAddMatch({ round })}
              />
            </AccordionDetails>
          </Accordion>
        )
      })}
    </Fragment>
  )
}
