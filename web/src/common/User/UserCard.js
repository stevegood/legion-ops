import React from "react"
import clsx from "clsx"
import { Card, CardContent, CardMedia, Typography } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import FaceIcon from "@material-ui/icons/Face"

const height = 55
const width = 55

const useStyles = makeStyles(theme => {
  return {
    root: {
      display: "flex",
      height,
    },
    winner: {
      backgroundColor: theme.palette.success[theme.palette.type],
    },
    details: {
      display: "flex",
      flexDirection: "column",
    },
    content: {
      flex: "1 0 auto",
      padding: "3px 10px 3px 10px",
    },
    cover: {
      width,
      height,
    },
    icon: {
      width,
      height,
    },
    bye: {
      color: theme.palette.text.disabled,
      textDecoration: "line-through",
    },
    byeMedia: {
      opacity: 0.5,
    },
    blueMedia: {
      border: "2px solid #3c6dcf",
    },
  }
})

export default function UserCard({
  user,
  blue,
  victoryPoints,
  mov,
  winner,
  bye,
}) {
  const classes = useStyles()
  const root =
    winner && winner.id === user.id
      ? clsx(classes.root, classes.winner)
      : bye && bye.id !== user.id
      ? clsx(classes.root, classes.bye)
      : classes.root

  let media =
    bye && bye.id !== user.id
      ? clsx(classes.cover, classes.byeMedia)
      : classes.cover

  if (blue && blue.id === user.id) {
    media = clsx(media, classes.blueMedia)
  }
  return (
    <Card
      className={root}
      variant={bye && bye.id !== user.id ? "outlined" : "elevation"}
    >
      <CardMedia className={media} image={user.picture}>
        {user.picture === "" && <FaceIcon className={classes.icon} />}
      </CardMedia>
      <div className={classes.details}>
        <CardContent className={classes.content}>
          <Typography variant="body1">{user.name}</Typography>
          <Typography variant="caption">
            {winner && `Victory Points: ${victoryPoints} MoV: ${mov}`}
            {bye && bye.id === user.id && "BYE"}
          </Typography>
        </CardContent>
      </div>
    </Card>
  )
}
