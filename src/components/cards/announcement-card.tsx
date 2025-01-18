import { Notice } from "@/types/notice"
import { BaseNoticeCard } from "./base-notice-card"

interface AnnouncementCardProps {
  notice: Notice
  isSponsored?: boolean
}

export function AnnouncementCard({ notice, isSponsored }: AnnouncementCardProps) {
  return <BaseNoticeCard notice={notice} isSponsored={isSponsored} />
} 