import { compareDateStrings } from "./time"

export function sortByName(a, b) {
  return a.name > b.name ? 1 : -1
}

export function eventDaySort(a, b) {
  const aStart = a.days[0].startAt
  const bStart = b.days[0].startAt
  return aStart !== bStart
    ? compareDateStrings(aStart, bStart)
    : sortByName(a, b)
}
