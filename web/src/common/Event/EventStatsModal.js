import React, { useEffect, useState } from "react"
import { useQuery } from "urql"
import {
  Container,
  Grid,
  IconButton,
  makeStyles,
  Modal,
  Paper,
  Typography,
} from "@material-ui/core"
import { DataGrid } from "@material-ui/data-grid"
import CloseIcon from "@material-ui/icons/Close"
import { EVENT_PLAYER_STATS_QUERY } from "constants/EventQueries"
import LoadingWidget from "common/LoadingWidget"

const useStyles = makeStyles(theme => ({
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

const tableColumns = [
  { field: "name", headerName: "Name", width: 150 },
  { field: "totalMOV", headerName: "Total MOV", width: 150 },
  { field: "averageMOV", headerName: "Average MOV", width: 175 },
  { field: "totalVP", headerName: "Total VP", width: 150 },
  { field: "totalWins", headerName: "Total Wins", width: 150 },
  { field: "timesBlue", headerName: "Times Blue", width: 150 },
  { field: "totalMatches", headerName: "Total Matches", width: 175 },
]

export default function EventStats({ event: { id, name }, open, onClose }) {
  const classes = useStyles()
  const [tableData, setTableData] = useState([])
  const [sortModel, setSortModel] = React.useState([
    {
      field: "totalWins",
      sort: "desc",
    },
  ])
  const [statsResults, getStats] = useQuery({
    query: EVENT_PLAYER_STATS_QUERY,
    variables: {
      eventID: id,
    },
    requestPolicy: "cache-and-network",
  })

  useEffect(() => {
    getStats()
  }, [])

  useEffect(() => {
    if (!statsResults?.data?.eventPlayerStats || statsResults.fetching) return
    if (statsResults.error) return console.error(statsResults.error)

    setTableData(
      statsResults.data.eventPlayerStats.map(stats => ({
        id: stats.id,
        name: stats.player.name,
        totalMOV: stats.totalMOV,
        averageMOV: stats.averageMOV,
        totalVP: stats.totalVP,
        totalWins: stats.totalWins,
        timesBlue: stats.timesBlue,
        totalMatches: stats.totalMatches,
      }))
    )
  }, [statsResults, setTableData])

  if (!statsResults || statsResults.fetching) {
    return <LoadingWidget />
  }

  return (
    <Modal className={classes.modal} open={open} onEscapeKeyDown={onClose}>
      <Container>
        <Paper className={classes.paper}>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <Grid item xs={11}>
              <Typography variant="h2" component="h1">
                {name} - Player Stats
              </Typography>
            </Grid>

            <Grid item xs={1}>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Grid>

            <Grid item xs={12}>
              <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={tableData}
                  columns={tableColumns}
                  pageSize={10}
                  sortModel={sortModel}
                  onSortModelChange={model => setSortModel(model)}
                  disableSelectionOnClick
                />
              </div>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Modal>
  )
}
