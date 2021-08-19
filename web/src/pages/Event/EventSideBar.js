import React, { Fragment, useEffect, useState } from "react"
import {
  Avatar,
  Container,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@material-ui/core"
import Icon from "@mdi/react"
import { mdiTournament } from "@mdi/js"
import { fmtEventType } from "utility/strings"
import UserList from "common/User/UserList"
import UserListItem from "common/User/UserListItem"
import { sortByName } from "utility/sort"
import { makeStyles } from "@material-ui/core/styles"
import IconButton from "@material-ui/core/IconButton"
import AddIcon from "@material-ui/icons/Add"
import AssignmentIcon from "@material-ui/icons/Assignment"
import { RegistrationTypes } from "constants/event"

const useStyles = makeStyles(theme => ({
  rightPanel: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    paddingTop: ".5rem",
  },
}))

export default function EventSideBar({
  event,
  onAddDay,
  onAddPlayer,
  onRegister,
  onLeave,
  onRegistrationChange,
  canModifyEvent,
  isAuthenticated,
  profile,
}) {
  const classes = useStyles()
  const [registration, setRegistration] = useState(event.registration)

  useEffect(() => {
    if (event.registration !== registration) {
      onRegistrationChange(registration)
    }
  }, [event, registration, onRegistrationChange])

  const handleRegistrationChange = ({ target: { value } }) => {
    setRegistration(value)
  }

  const profileIsOrganizer =
    profile && profile.account && event.organizer.id === profile.account.id

  const profileInJudges =
    profile &&
    profile.account &&
    event &&
    event.judges.filter(judge => judge.id === profile.account.id).length > 0

  const profileInPlayers =
    profile &&
    profile.account &&
    event &&
    event.players.filter(player => player.id === profile.account.id).length > 0

  const showRegisterButton =
    event.registration === "OPEN" &&
    isAuthenticated &&
    profile &&
    profile.account &&
    !profileIsOrganizer &&
    !profileInJudges &&
    !profileInPlayers
  const showLeaveButton = isAuthenticated && profile && profileInPlayers

  const isMe = player =>
    profile && profile.account ? player.id === profile.account.id : false

  return (
    <Fragment>
      <div className={classes.rightPanel}>
        <Container>
          <Typography variant="caption" color="textSecondary">
            Event Style
          </Typography>
        </Container>
        <List dense>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <AssignmentIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Registration"
              secondary={canModifyEvent ? "" : event.registration}
            />
            {canModifyEvent && (
              <Select
                value={event.registration}
                onChange={e => handleRegistrationChange(e)}
              >
                {Object.keys(RegistrationTypes).map(key => (
                  <MenuItem key={key} value={key}>
                    {RegistrationTypes[key]}
                  </MenuItem>
                ))}
              </Select>
            )}
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <Icon path={mdiTournament} size={1} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={fmtEventType(event.type)} />
          </ListItem>

          <ListItem>
            <ListItemAvatar>
              <Avatar>{event.days.length}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`Day${event.days.length === 1 ? "" : "s"}`}
            />
            {canModifyEvent && (
              <Tooltip title="Add a day">
                <IconButton onClick={onAddDay}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </ListItem>

          <ListItem>
            <ListItemAvatar>
              <Avatar>{event.players.length}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`Player${event.players.length === 1 ? "" : "s"}`}
            />
            {canModifyEvent && (
              <Tooltip title="Add a player">
                <IconButton onClick={onAddPlayer}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </ListItem>
        </List>
      </div>

      <Divider />

      <div className={classes.rightPanel}>
        <UserList label="Staff">
          <UserListItem
            name={event.organizer.name}
            picture={event.organizer.picture}
            label="Organizer"
            isMe={isMe(event.organizer)}
          />

          {event.headJudge && (
            <UserListItem
              name={event.headJudge.name}
              picture={event.headJudge.picture}
              label="Head Judge"
              isMe={isMe(event.headJudge)}
            />
          )}

          {[...event.judges].sort(sortByName).map(judge => (
            <UserListItem
              key={judge.id}
              name={judge.name}
              picture={judge.picture}
              label="Judge"
              isMe={isMe(judge)}
            />
          ))}
        </UserList>
      </div>

      <Divider />

      <div className={classes.rightPanel}>
        <UserList
          label="Players"
          showRegisterButton={showRegisterButton}
          showLeaveButton={showLeaveButton}
          onRegisterClick={onRegister}
          onLeaveClick={onLeave}
        >
          {[...event.players].sort(sortByName).map(player => (
            <UserListItem
              key={`player-${player.id}`}
              name={player.name}
              picture={player.picture}
              isMe={isMe(player)}
            />
          ))}
        </UserList>
      </div>
    </Fragment>
  )
}
