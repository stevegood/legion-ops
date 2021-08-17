import React from "react"
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@material-ui/core"
import FaceIcon from "@material-ui/icons/Face"

export default function UserListItem({ name, picture, label, isMe }) {
  return (
    <ListItem selected={isMe}>
      <ListItemAvatar>
        {picture ? <Avatar src={picture} /> : <FaceIcon />}
      </ListItemAvatar>
      <ListItemText primary={name} secondary={label ? label : ""} />
    </ListItem>
  )
}
