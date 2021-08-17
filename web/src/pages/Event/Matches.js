import React, { useState } from "react"
import { Grid, Typography } from "@material-ui/core"
import UserCard from "common/User/UserCard"
import { makeStyles } from "@material-ui/core/styles"
import { compareDateStrings } from "utility/time"

const useStyles = makeStyles(theme => ({
  vs: {
    textAlign: "center",
    padding: theme.spacing(2),
  },
}))

export default function Matches({ matches }) {
  const classes = useStyles()
  const [sortedMatches] = useState(
    [...matches].sort((a, b) => compareDateStrings(a.createdAt, b.createdAt))
  )
  return (
    <Grid container direction="column" spacing={2}>
      {sortedMatches.map(match => (
        <Grid item xs={12} key={match.id}>
          <Grid container direction="row" justify="space-between">
            <Grid item xs={5}>
              <UserCard
                user={match.player1}
                winner={match.winner}
                blue={match.blue}
                bye={match.bye}
                victoryPoints={match.player1VictoryPoints}
                mov={match.player1MarginOfVictory}
              />
            </Grid>

            <Grid item xs={2} className={classes.vs}>
              <Typography variant="caption">VS</Typography>
            </Grid>

            <Grid item xs={5}>
              <UserCard
                user={match.player2}
                winner={match.winner}
                blue={match.blue}
                bye={match.bye}
                victoryPoints={match.player2VictoryPoints}
                mov={match.player2MarginOfVictory}
              />
            </Grid>
          </Grid>
        </Grid>
      ))}
    </Grid>
  )
}
