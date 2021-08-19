import React, { useEffect, useState } from "react"
import {
  Container,
  Divider,
  Grid,
  Modal,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import { useMutation } from "urql"
import { CREATE_EVENT } from "constants/EventMutations"
import SaveCancelButtons from "./SaveCancelButtons"

const useStyles = makeStyles(theme => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    width: "100%",
    position: "relative",
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}))

export default function CreateEventModal({
  isAuthenticated,
  profile,
  title,
  eventType,
  open,
  onSaved,
  onCancel,
}) {
  const [createEventResult, createEvent] = useMutation(CREATE_EVENT)
  const classes = useStyles()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  // when the open prop changes, reset the state
  useEffect(() => {
    setName("")
    setDescription("")
  }, [open])

  useEffect(() => {
    const { fetching, data, error } = createEventResult

    if (fetching || !data) return
    if (error) return console.error(error)

    onSaved(data.createEvent)
  }, [createEventResult, onSaved])

  const organizerName = isAuthenticated && profile ? profile.name : ""

  const handleSaveClick = () => {
    const eventInput = {
      name,
      description,
      type: eventType,
    }

    createEvent({
      input: eventInput,
    })
  }

  return (
    <Modal open={open} className={classes.modal}>
      <Container>
        <Paper className={classes.paper}>
          <Grid container direction="column" spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" component="h2">
                {title}
              </Typography>
              <Divider />
            </Grid>

            <form noValidate autoComplete="off">
              <Grid item xs={12}>
                <Grid container direction="row" spacing={3}>
                  <Grid item xs={9}>
                    <TextField
                      id="t-name"
                      label="Tournament Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={3}>
                    <TextField
                      id="o-name"
                      label="Organizer"
                      fullWidth
                      value={organizerName}
                      disabled
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  multiline
                  id="e-description"
                  label="Description"
                  fullWidth
                  rows={10}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
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
                      onSave={handleSaveClick}
                      onCancel={onCancel}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Paper>
      </Container>
    </Modal>
  )
}
