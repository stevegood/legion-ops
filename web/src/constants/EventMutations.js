import gql from "graphql-tag/src"
import { playerFragment } from "./EventQueries"

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: EventInput!) {
    createEvent(input: $input) {
      id
    }
  }
`
export const UPDATE_EVENT = gql`
  mutation UpdateEvent($input: EventInput!) {
    updateEvent(input: $input) {
      id
    }
  }
`
export const PUBLISH_EVENT = gql`
  mutation PublishEvent($eventId: ID!) {
    publishEvent(eventId: $eventId) {
      id
      published
    }
  }
`
export const UNPUBLISH_EVENT = gql`
  mutation UnpublishEvent($eventId: ID!) {
    unpublishEvent(eventId: $eventId) {
      id
      published
    }
  }
`
export const SET_REGISTRATION = gql`
  mutation SetRegistration(
    $eventId: ID!
    $registrationType: RegistrationType!
  ) {
    setRegistration(eventId: $eventId, registrationType: $registrationType) {
      id
      registration
    }
  }
`
export const ADD_PLAYER = gql`
  mutation AddPlayer($input: AddPlayerInput!) {
    addPlayer(input: $input) {
      id
    }
  }
`
export const CREATE_DAY = gql`
  mutation CreateDay($eventID: ID!, $input: EventDayInput!) {
    createDay(eventID: $eventID, input: $input) {
      id
      startAt
      endAt
    }
  }
`
export const CREATE_ROUND = gql`
  mutation CreateRound($eventID: ID!, $dayID: ID!) {
    createRound(eventID: $eventID, dayID: $dayID, input: { matches: [] }) {
      id
      counter
    }
  }
`
export const CREATE_MATCH = gql`
  mutation CreateMatch($eventID: ID!, $roundID: ID!, $input: MatchInput!) {
    createMatch(eventID: $eventID, roundID: $roundID, input: $input) {
      id
      player1 {
        ...Player_player
      }
      player2 {
        ...Player_player
      }
    }
  }
  ${playerFragment}
`
export const JOIN_EVENT = gql`
  mutation JoinEvent($eventId: ID!) {
    joinEvent(eventId: $eventId) {
      id
      players {
        ...Player_player
      }
    }
  }
  ${playerFragment}
`
export const LEAVE_EVENT = gql`
  mutation LeaveEvent($eventId: ID!) {
    leaveEvent(eventId: $eventId) {
      id
      players {
        ...Player_player
      }
    }
  }
  ${playerFragment}
`
