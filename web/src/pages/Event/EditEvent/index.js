import React, { Fragment, useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { useMutation, useQuery } from "urql"
import {
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core"
import ReactMarkdown from "react-markdown"
import LoadingWidget from "common/LoadingWidget"
import ErrorFallback from "common/ErrorFallback"
import { MarkdownRenderer } from "common/renderer"
import { EVENT_QUERY } from "constants/EventQueries"
import { UPDATE_EVENT } from "constants/EventMutations"
import { useCanModifyEvent } from "hooks/auth"
import SaveCancelButtons from "../../../common/SaveCancelButtons"

export default function EditEvent({
  match: {
    params: { id },
  },
}) {
  const history = useHistory()

  const [updateEventResult, updateEvent] = useMutation(UPDATE_EVENT)
  const [canModifyEvent, canModifyEventLoading] = useCanModifyEvent(id)

  const [eventResult] = useQuery({
    query: EVENT_QUERY,
    variables: {
      id: id,
    },
  })

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (eventResult.data && eventResult.data.event) {
      if (eventResult.data.event.name) {
        setName(eventResult.data.event.name)
      }

      if (eventResult.data.event.description) {
        setDescription(eventResult.data.event.description)
      }
    }
  }, [eventResult])

  useEffect(() => {
    if (updateEventResult.data) history.push(`/event/${id}`)
  }, [updateEventResult, history, id])

  // if user is not authorized to edit, then send them back to the event page
  if (!canModifyEventLoading && !canModifyEvent) {
    history.push(`/event/${id}`)
  }

  // show the loading screen
  if (eventResult.fetching) {
    return <LoadingWidget />
  }

  // handle errors getting event
  if (eventResult.error) {
    return (
      <ErrorFallback
        error={eventResult.error}
        message={eventResult.error.message}
      />
    )
  }

  const { event } = eventResult.data

  const handleSaveClick = () => {
    const eventInput = {
      id,
      name,
      description,
      type: event.type,
    }

    updateEvent({
      input: eventInput,
    })
    // .then(({ data: { updateEvent } }) =>
    //   history.push(`/event/${updateEvent.id}`)
    // )
    // .catch(err => console.error(err))
  }

  return (
    <Fragment>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <Typography variant="h2" component="h2">
            Edit Event
          </Typography>
        </Grid>

        <Grid item>
          <Paper>
            <Container>
              <Grid
                container
                direction="column"
                spacing={5}
                justify="space-between"
              >
                <form noValidate autoComplete="off">
                  <Grid item xs={12}>
                    <Grid container direction="row" spacing={3}>
                      <Grid item xs={9}>
                        <TextField
                          id="t-name"
                          label="Tournament Name"
                          value={name}
                          onChange={({ target: { value } }) => setName(value)}
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={3}>
                        <TextField
                          id="o-name"
                          label="Organizer"
                          fullWidth
                          value={event.organizer.name}
                          disabled
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container direction="row" spacing={3}>
                      <Grid item xs={6}>
                        <TextField
                          multiline
                          id="e-description"
                          label="Description"
                          fullWidth
                          rows={10}
                          value={description}
                          onChange={({ target: { value } }) =>
                            setDescription(value)
                          }
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography color="textSecondary" variant="caption">
                          Preview
                        </Typography>
                        <ReactMarkdown
                          source={description}
                          renderers={MarkdownRenderer}
                        />
                      </Grid>
                    </Grid>
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
                          onCancel={() => history.push(`/event/${id}`)}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </form>
              </Grid>
            </Container>
          </Paper>
        </Grid>
      </Grid>
    </Fragment>
  )
}
