import React from "react"
import { Link } from "@material-ui/core"

export const MarkdownRenderer = {
  link: ({ children, href }) => {
    return (
      <Link target="_blank" href={href} underline="always">
        {children}
      </Link>
    )
  },
}
