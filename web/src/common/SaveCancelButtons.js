import React, { Fragment } from "react"
import { IconButton } from "@material-ui/core"
import SaveIcon from "@material-ui/icons/Save"
import CancelIcon from "@material-ui/icons/Cancel"

export default function SaveCancelButtons({
  onSave,
  onCancel,
  saveDisabled,
  cancelDisabled,
}) {
  return (
    <Fragment>
      <IconButton onClick={onSave} disabled={saveDisabled}>
        <SaveIcon />
      </IconButton>

      <IconButton onClick={onCancel} disabled={cancelDisabled}>
        <CancelIcon />
      </IconButton>
    </Fragment>
  )
}
