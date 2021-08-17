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
import Matches from "./Matches"

export default function EventDayRounds({
  rounds,
  canModifyEvent,
  onAddRound,
  onAddMatch,
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
            <Grid item xs={11}>
              <Typography
                variant="h6"
                component="h3"
                style={{ marginBottom: "0.5rem" }}
              >
                Round {i + 1}
              </Typography>
            </Grid>

            {canModifyEvent && (
              <Grid item>
                <Tooltip title={`Create a match in Round ${i + 1}`}>
                  <IconButton
                    size="small"
                    onClick={() => onAddMatch({ round })}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
          </Grid>

          <Container>
            <Matches matches={round.matches} />
          </Container>
        </Grid>
      ))}
    </Grid>
  )
}
