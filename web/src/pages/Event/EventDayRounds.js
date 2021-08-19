import React, { useState } from "react"

import {
  Button,
  Container,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import DoneAllIcon from "@material-ui/icons/DoneAll"
import Matches from "./Matches"

export default function EventDayRounds({
  event,
  day,
  rounds,
  canModifyEvent,
  onAddRound,
  onAddMatch,
  onCloseRound,
  setSelectedMatch,
}) {
  const [sortedRounds] = useState(
    [...rounds].sort((a, b) => a.counter - b.counter)
  )

  return (
    <Grid container direction="column" spacing={5}>
      {canModifyEvent && (
        <Grid item>
          <Grid container direction="row" justify="flex-end">
            <Button size="small" onClick={onAddRound}>
              Add Round
            </Button>
          </Grid>
        </Grid>
      )}

      {sortedRounds.map((round, i) => (
        <Grid item key={round.id}>
          <Grid container direction="row" justify="flex-end">
            <Grid item xs={10}>
              <Typography
                variant="h6"
                component="h3"
                style={{ marginBottom: "0.5rem" }}
              >
                Round {i + 1}
              </Typography>
            </Grid>

            {canModifyEvent && (
              <>
                <Grid item>
                  <Tooltip title={`Create a match in Round ${i + 1}`}>
                    <IconButton
                      disabled={round.closed}
                      size="small"
                      onClick={() => onAddMatch({ round })}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>

                <Grid item>
                  <Tooltip title={`Close Round ${i + 1}`}>
                    <IconButton
                      disabled={round.closed}
                      size="small"
                      onClick={() => onCloseRound({ round })}
                    >
                      <DoneAllIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </>
            )}
          </Grid>

          <Container>
            <Matches
              round={round}
              matches={round.matches}
              setSelectedMatch={setSelectedMatch}
            />
          </Container>
        </Grid>
      ))}
    </Grid>
  )
}
