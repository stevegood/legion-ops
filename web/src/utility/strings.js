export function fmtEventType(eventType) {
  switch (eventType) {
    case "FFGOP":
      return "FFG Organized Play"
    case "LEAGUE":
      return "League Play"
    default:
      return "Other / Casual"
  }
}