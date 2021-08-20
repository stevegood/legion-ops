import { gql } from "urql"

export const userFragment = gql`
  fragment User_user on User {
    id
    name
    picture
  }
`

export const playerFragment = gql`
  fragment Player_player on Player {
    id
    name
  }
`

export const EVENT_QUERY = gql`
  query Event($id: ID!) {
    event(id: $id) {
      id
      createdAt
      updatedAt
      name
      description
      type
      published
      registration
      organizer {
        ...User_user
      }
      headJudge {
        ...User_user
      }
      judges {
        ...User_user
      }
      players {
        ...Player_player
      }
      days {
        id
        startAt
        endAt
        rounds {
          id
          counter
          closed
          matches {
            id
            player1 {
              ...Player_player
            }
            player1VictoryPoints
            player1MarginOfVictory
            player2 {
              ...Player_player
            }
            player2VictoryPoints
            player2MarginOfVictory
            bye {
              ...Player_player
            }
            blue {
              ...Player_player
            }
            winner {
              ...Player_player
            }
          }
        }
      }
    }
  }
  ${userFragment}
  ${playerFragment}
`

export const ALL_EVENTS_QUERY = gql`
  query AllEvents(
    $eventType: EventType
    $startsAfter: Time
    $endsBefore: Time
  ) {
    events(
      eventType: $eventType
      startsAfter: $startsAfter
      endsBefore: $endsBefore
    ) {
      id
      createdAt
      updatedAt
      name
      description
      type
      registration
      organizer {
        ...User_user
      }
      headJudge {
        ...User_user
      }
      judges {
        ...User_user
      }
      players {
        id
      }
      days {
        id
        startAt
        endAt
      }
    }
  }
  ${userFragment}
`

export const CAN_MODIFY_QUERY = gql`
  query CanModifyEvent($id: ID!) {
    canModifyEvent(id: $id)
  }
`

export const EVENT_PLAYER_STATS_QUERY = gql`
  query EventPlayerStats($eventID: ID!) {
    eventPlayerStats(eventID: $eventID) {
      id
      player {
        id
        name
      }
      totalMOV
      averageMOV
      totalVP
      totalWins
      timesBlue
      totalMatches
    }
  }
`
