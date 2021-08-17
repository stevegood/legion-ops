import React from "react"
import { Grid, Typography, Fade } from "@material-ui/core"

function Privacy() {
  return (
    <Fade in={true}>
      <Grid container direction="column" alignItems="center">
        <Grid item>
          <Typography variant="h5">Privacy</Typography>
        </Grid>
        <Grid item></Grid>
      </Grid>
    </Fade>
  )
}

export default Privacy
