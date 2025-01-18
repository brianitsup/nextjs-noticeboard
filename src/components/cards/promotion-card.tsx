import { Notice } from "@/types/notice"
import { BaseNoticeCard } from "./base-notice-card"

interface PromotionCardProps {
  notice: Notice
  isSponsored?: boolean
}

export function PromotionCard({ notice, isSponsored }: PromotionCardProps) {
  return <BaseNoticeCard notice={notice} isSponsored={isSponsored} />
} 