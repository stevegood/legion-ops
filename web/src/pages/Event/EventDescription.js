import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import ReactMarkdown from "react-markdown"

const useStyles = makeStyles(theme => ({
  hero: {
    paddingTop: theme.typography.pxToRem(7),
    paddingBottom: theme.typography.pxToRem(7),
    paddingRight: theme.typography.pxToRem(15),
    paddingLeft: theme.typography.pxToRem(15),
    marginBottom: "1rem",
    backgroundColor: theme.palette.background.paper,
  },
}))

export default function EventDescription({ description }) {
  const classes = useStyles()

  return (
    <div className={classes.hero}>
      <ReactMarkdown source={description} />
    </div>
  )
}
