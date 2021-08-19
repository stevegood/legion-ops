import React, { useState, useEffect } from "react"
import {
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  TextField,
  Typography,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import moment from "moment"
import SaveCancelButtons from "./SaveCancelButtons"
import { useMutation } from "urql"
import { UPDATE_MATCH } from "constants/EventMutations"

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
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

function playersAreDifferent(player, otherPlayer) {
  return player !== otherPlayer
}

function playerIsInRound(round, player) {
  let isInRound = false

  round.matches.forEach(({ player1, player2 }) => {
    if (!isInRound && (player1.id === player.id || player2.id === player.id)) {
      isInRound = true
    }
  })

  return isInRound
}

function playerIsValidForSelection(player, otherPlayer, round) {
  return (
    playersAreDifferent(player.id, otherPlayer) &&
    !playerIsInRound(round, player)
  )
}

export default function EditMatchModal({
  open,
  event,
  round,
  match,
  onCancel,
  onMatchChanged,
}) {
  const classes = useStyles()
  const [player1, setPlayer1] = useState("")
  const [player2, setPlayer2] = useState("")
  const [blue, setBlue] = useState("")
  const [bye, setBye] = useState("")
  const [winner, setWinner] = useState("")
  const [p1VP, setP1VP] = useState(0)
  const [p2VP, setP2VP] = useState(0)
  const [p1MOV, setP1MOV] = useState(0)
  const [p2MOV, setP2MOV] = useState(0)

  const [updateMatchResult, updateMatch] = useMutation(UPDATE_MATCH)

  useEffect(() => {
    if (match?.player1?.name && match?.player2?.name) {
      setPlayer1(match.player1.id)
      setPlayer2(match.player2.id)
      setP1VP(match.player1VictoryPoints)
      setP2VP(match.player2VictoryPoints)
      setP1MOV(match.player1MarginOfVictory)
      setP2MOV(match.player2MarginOfVictory)
      if (match?.blue?.id) {
        setBlue(match.blue.id)
      }
      if (match?.bye?.id) {
        setBye(match.bye.id)
      }
      if (match?.winner?.id) {
        setWinner(match.winner.id)
      }
    }
  }, [match, setPlayer1, setPlayer2])

  useEffect(() => {
    if (updateMatchResult.fetching) return
    if (updateMatchResult.error) return console.error(updateMatchResult.error)
    if (!updateMatchResult.data) return

    onMatchChanged({ match: updateMatchResult.data })
  }, [updateMatchResult, onMatchChanged])

  const calcMOV = () => {
    const totalVP = parseInt(p1VP) + parseInt(p2VP)
    if (totalVP > 0) {
      const p1MOVPct = p1VP / totalVP
      const p2MOVPct = p2VP / totalVP
      setP1MOV(Math.round(p1MOVPct * 100))
      setP2MOV(Math.round(p2MOVPct * 100))
    }
  }

  const handlePlayerChange = setter => ({ target: { value } }) => {
    setter(value)
  }

  const handleSave = () => {
    console.log("time to save!")

    // handle bad state
    if (player1 === player2)
      return console.error("Players 1 and 2 cannot be the same person...")
    if (player1 === "" || player2 === "")
      return console.error("Player IDs cannot be blank")

    // update the match
    const variables = {
      eventID: event.id,
      input: {
        id: match.id,
        player1: match.player1.id,
        player1VictoryPoints: parseInt(p1VP),
        player1MarginOfVictory: parseInt(p1MOV),
        player2: match.player2.id,
        player2VictoryPoints: parseInt(p2VP),
        player2MarginOfVictory: parseInt(p2MOV),
        bye: bye === "" ? null : bye,
        blue: blue === "" ? null : blue,
        winner: winner === "" ? null : winner,
      },
    }

    console.log(variables)

    updateMatch(variables)
  }

  let day = null
  event.days.forEach(eDay => {
    eDay.rounds.forEach(dRound => {
      if (dRound.id === round.id) {
        day = eDay
      }
    })
  })

  if (!match || !round) {
    return <></>
  }

  const players = [match.player1, match.player2]

  return (
    <Modal
      open={open && match !== null && round !== null}
      onEscapeKeyDown={onCancel}
      className={classes.modal}
    >
      <Container>
        <Paper className={classes.paper}>
          <Typography variant="h2">
            {match.player1.name} vs {match.player2.name}
          </Typography>
          <Typography variant="h4">
            Round {round.counter} on {moment(day.startAt).toLocaleString()}
          </Typography>

          <div className={classes.container}>
            <FormControl className={classes.formControl} disabled>
              <InputLabel>Player 1</InputLabel>
              <Select value={player1} onChange={handlePlayerChange(setPlayer1)}>
                {event.players.map(player => (
                  <MenuItem
                    key={`player1-${player.id}`}
                    value={player.id}
                    disabled={
                      !playerIsValidForSelection(player, player2, round)
                    }
                  >
                    {player.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              className={classes.formControl}
              label="Player 1 Victory Points"
              type="number"
              value={p1VP}
              onChange={e => setP1VP(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              className={classes.formControl}
              label="Player 1 MOV"
              type="number"
              value={p1MOV}
              onChange={e => setP1MOV(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>
          <div className={classes.container}>
            <FormControl className={classes.formControl} disabled>
              <InputLabel>Player 2</InputLabel>
              <Select value={player2} onChange={handlePlayerChange(setPlayer2)}>
                {event.players.map(player => (
                  <MenuItem
                    key={`player2-${player.id}`}
                    value={player.id}
                    disabled={
                      !playerIsValidForSelection(player, player1, round)
                    }
                  >
                    {player.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              className={classes.formControl}
              label="Player 2 Victory Points"
              type="number"
              value={p2VP}
              onChange={e => setP2VP(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              className={classes.formControl}
              label="Player 2 MOV"
              type="number"
              value={p2MOV}
              onChange={e => setP2MOV(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Button onClick={calcMOV} color="primary">
              Calculate MOV
            </Button>
          </div>

          <div className={classes.container}>
            <FormControl className={classes.formControl}>
              <InputLabel>Blue Player</InputLabel>
              <Select value={blue} onChange={e => setBlue(e.target.value)}>
                {players.map(player => (
                  <MenuItem key={`blue-player-${player.id}`} value={player.id}>
                    {player.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl className={classes.formControl}>
              <InputLabel>Bye</InputLabel>
              <Select value={bye} onChange={e => setBye(e.target.value)}>
                {players.map(player => (
                  <MenuItem key={`bye-${player.id}`} value={player.id}>
                    {player.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl className={classes.formControl}>
              <InputLabel>Winner</InputLabel>
              <Select value={winner} onChange={e => setWinner(e.target.value)}>
                {players.map(player => (
                  <MenuItem key={`winner-${player.id}`} value={player.id}>
                    {player.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <SaveCancelButtons
            onSave={handleSave}
            onCancel={onCancel}
            saveDisabled={false}
          />
        </Paper>
      </Container>
    </Modal>
  )
}
