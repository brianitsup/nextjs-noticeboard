import type { Notice } from "../../types/notice"
import type { ReactElement } from "react"
import { BaseNoticeCard } from "./base-notice-card"

declare const Cards: {
  getCardComponentByCategory: (notice: Notice, isSponsored?: boolean) => ReactElement
  BaseNoticeCard: typeof BaseNoticeCard
}

export default Cards 