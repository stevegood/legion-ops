import gql from "graphql-tag/src"
import { userFragment } from "./EventQueries"

const eventFragment = gql`
  fragment event_Event on Event {
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
      id
    }
    days {
      id
      startAt
      endAt
    }
  }
  ${userFragment}
`

export const MY_PROFILE = gql`
  query MyProfile {
    myProfile {
      account {
        ...User_user
      }
      username
      organizedEvents {
        ...event_Event
      }
      judgingEvents {
        ...event_Event
      }
      participatingEvents {
        ...event_Event
      }
    }
  }
  ${eventFragment}
`
