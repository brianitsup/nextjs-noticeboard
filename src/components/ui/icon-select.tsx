"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import * as Icons from "lucide-react"
import { cn } from "@/lib/utils"

const iconGroups = {
  "Status & Alerts": [
    "List",
    "Bell",
    "Megaphone",
    "AlertCircle",
    "AlertTriangle",
    "Info",
    "CheckCircle",
    "XCircle",
    "HelpCircle",
  ],
  "People & Organizations": [
    "User",
    "Users",
    "Building",
    "Building2",
    "Home",
    "Briefcase",
  ],
  "Business & Finance": [
    "DollarSign",
    "CreditCard",
    "ShoppingBag",
    "ShoppingCart",
    "Store",
    "Tag",
    "Package",
    "Truck",
    "Gift",
  ],
  "Events & Activities": [
    "Calendar",
    "PartyPopper",
    "Cake",
    "Music",
    "Film",
    "Video",
    "Camera",
    "Image",
  ],
  "Places & Venues": [
    "MapPin",
    "Hotel",
    "Building",
    "Home",
    "Store",
  ],
  "Food & Drink": [
    "Coffee",
    "Wine",
  ],
  "Education & Training": [
    "GraduationCap",
    "School",
    "Presentation",
    "BookOpen",
    "Wrench",
  ],
  "Communication": [
    "MessageCircle",
    "MessagesSquare",
    "Mail",
    "Phone",
  ],
  "Technology": [
    "Smartphone",
    "Laptop",
    "Computer",
    "Globe",
    "Cloud",
    "Database",
    "ServerIcon",
    "Settings",
    "Wrench",
  ],
  "Security": [
    "ShieldCheck",
    "Lock",
    "Unlock",
    "KeyRound",
    "LockKeyhole",
    "Key",
  ],
}

interface IconSelectProps {
  value: string
  onValueChange: (value: string) => void
}

export function IconSelect({ value, onValueChange }: IconSelectProps) {
  const selectedIcon = value as keyof typeof Icons
  const IconComponent = Icons[selectedIcon] as Icons.LucideIcon

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an icon">
          {IconComponent && (
            <div className="flex items-center gap-2">
              <IconComponent className="h-4 w-4" />
              <span>{value}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {Object.entries(iconGroups).map(([group, icons]) => (
          <SelectGroup key={group}>
            <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {group}
            </SelectLabel>
            {icons.map((iconName) => {
              const Icon = Icons[iconName as keyof typeof Icons] as Icons.LucideIcon
              return (
                <SelectItem
                  key={iconName}
                  value={iconName}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{iconName}</span>
                </SelectItem>
              )
            })}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
} 