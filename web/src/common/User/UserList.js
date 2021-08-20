import React, { Fragment } from "react"
import { Button, Grid, List, Typography } from "@material-ui/core"

export default function UserList({
  children,
  label,
  showRegisterButton,
  showLeaveButton,
  onRegisterClick,
  onLeaveClick,
  onShowStatsClick,
}) {
  return (
    <Fragment>
      <Grid container>
        <Grid item xs={9}>
          <Typography variant="caption" color="textSecondary">
            {label}
          </Typography>
        </Grid>

        {onShowStatsClick !== undefined && (
          <Grid item>
            <Button size="small" onClick={onShowStatsClick}>
              Show Stats
            </Button>
          </Grid>
        )}

        {showRegisterButton && (
          <Grid item>
            <Button size="small" onClick={onRegisterClick}>
              Sign Up
            </Button>
          </Grid>
        )}

        {showLeaveButton && (
          <Grid item>
            <Button size="small" onClick={onLeaveClick}>
              Leave
            </Button>
          </Grid>
        )}
      </Grid>
      <List dense>{children}</List>
    </Fragment>
  )
}
