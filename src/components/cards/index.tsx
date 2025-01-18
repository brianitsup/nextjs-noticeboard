'use client'

import React from "react"
import type { Notice } from "@/types/notice"
import { BaseNoticeCard } from "./base-notice-card"

const Cards = {
  getCardComponentByCategory: (notice: Notice, isSponsored = false) => {
    return <BaseNoticeCard notice={notice} isSponsored={isSponsored} />
  },
  BaseNoticeCard
}

export default Cards 