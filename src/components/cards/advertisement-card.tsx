import { Notice } from "@/types/notice"
import { BaseNoticeCard } from "./base-notice-card"

interface AdvertisementCardProps {
  notice: Notice
  isSponsored?: boolean
}

export function AdvertisementCard({ notice, isSponsored }: AdvertisementCardProps) {
  return <BaseNoticeCard notice={notice} isSponsored={isSponsored} />
} 