import React, { Fragment, useEffect, useState } from "react"
import {
  Grid,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core"
import { useHistory } from "react-router-dom"
import { useMutation, useQuery } from "urql"
import { EVENT_QUERY } from "constants/EventQueries"
import { ADD_PLAYER } from "constants/EventMutations"
import LoadingWidget from "common/LoadingWidget"
import ErrorFallback from "common/ErrorFallback"
import SaveCancelButtons from "common/SaveCancelButtons"

const useStyles = makeStyles(() => ({
  paper: {
    padding: "1rem",
  },
}))

export default function AddPlayer({
  match: {
    params: { id },
  },
}) {
  const history = useHistory()
  const classes = useStyles()
  const [playerName, setPlayerName] = useState("")
  const [addPlayerResult, addPlayer] = useMutation(ADD_PLAYER)

  const [result] = useQuery({
    query: EVENT_QUERY,
    variables: {
      id,
    },
  })

  useEffect(() => {
    if (addPlayerResult.error) return console.error(addPlayerResult.error)
    if (addPlayerResult.fetching || !addPlayerResult.data) return

    history.push(`/event/${id}`)
  }, [addPlayerResult, id, history])

  if (result.fetching) {
    return <LoadingWidget />
  }

  if (result.error) {
    return <ErrorFallback error={result.error} message={result.error.message} />
  }

  const handleSave = () => {
    addPlayer({
      input: {
        name: playerName,
        eventID: id,
      },
    })
  }

  const {
    event: { name },
  } = result.data

  return (
    <Fragment>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h2" component="h1">
            <em>{name}</em> - Add a Player
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container justify="space-between">
              <TextField
                id="p-name"
                label="Player's Name"
                fullWidth
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
              />
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Grid
            container
            direction="row"
            spacing={3}
            justify="flex-end"
            alignItems="center"
          >
            <Grid item>
              <SaveCancelButtons
                onSave={handleSave}
                onCancel={() => history.push(`/event/${id}`)}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Fragment>
  )
}
