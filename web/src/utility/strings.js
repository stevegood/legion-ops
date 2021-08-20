export function fmtEventType(eventType) {
  switch (eventType) {
    case "FTOP":
      return "The Fifth Trooper Organized Play"
    case "LEAGUE":
      return "League Play"
    default:
      return "Other / Casual"
  }
}
