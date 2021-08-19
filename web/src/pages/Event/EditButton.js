import React from "react"
import { IconButton } from "@material-ui/core"
import EditIcon from "@material-ui/icons/Edit"

export default function EditButton({ onClick }) {
  return (
    <IconButton onClick={onClick}>
      <EditIcon />
    </IconButton>
  )
}
