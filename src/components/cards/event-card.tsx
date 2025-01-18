import { Notice } from "@/types/notice"
import { BaseNoticeCard } from "./base-notice-card"

interface EventCardProps {
  notice: Notice
  isSponsored?: boolean
}

export function EventCard({ notice, isSponsored }: EventCardProps) {
  return <BaseNoticeCard notice={notice} isSponsored={isSponsored} />
} 