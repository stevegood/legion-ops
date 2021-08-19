import moment from "moment"

export function parseDate(dateTimeStr) {
  return moment(dateTimeStr)
}

export function compareDateStrings(a, b) {
  const aDate = parseDate(a)
  const bDate = parseDate(b)
  return aDate - bDate
}

const dayFormatter = new Intl.DateTimeFormat(moment.locale(), {
  day: "2-digit",
})
const monthFormatter = new Intl.DateTimeFormat(moment.locale(), {
  month: "long",
})
const yearFormatter = new Intl.DateTimeFormat(moment.locale(), {
  year: "numeric",
})

export function fmtMonth(d) {
  return monthFormatter.format(d)
}

export function fmtDay(d) {
  return dayFormatter.format(d)
}

export function fmtYear(d) {
  return yearFormatter.format(d)
}

export function formatDateTime(dtStr) {
  moment.locale()
  return parseDate(dtStr).format("llll")
}
