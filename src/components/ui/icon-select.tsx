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
import { LucideIcon } from "lucide-react"

const iconGroups = {
  "Status & Alerts": [
    "ListOrdered",
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
    "Building2",
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
    "Party",
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
    "Tool",
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
    "Monitor",
    "Globe",
    "Cloud",
    "Database",
    "Server",
    "Settings",
    "Wrench",
  ],
  "Security": [
    "Shield",
    "Lock",
    "Unlock",
    "KeyRound",
    "KeySquare",
  ],
}

interface IconSelectProps {
  value: string
  onValueChange: (value: string) => void
}

export function IconSelect({ value, onValueChange }: IconSelectProps) {
  // Ensure the icon exists, fallback to a default if not
  const selectedIcon = (value in Icons ? value : "HelpCircle") as keyof typeof Icons
  const IconComponent = Icons[selectedIcon] as LucideIcon

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an icon">
          {IconComponent && React.createElement(IconComponent, {
            className: "h-4 w-4"
          })}
          <span>{value}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {Object.entries(iconGroups).map(([group, icons]) => (
          <SelectGroup key={group}>
            <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {group}
            </SelectLabel>
            {icons.map((iconName) => {
              // Only render if the icon exists
              if (iconName in Icons) {
                const Icon = Icons[iconName as keyof typeof Icons] as LucideIcon
                return (
                  <SelectItem
                    key={`${group}-${iconName}`}
                    value={iconName}
                    className="flex items-center gap-2"
                  >
                    {React.createElement(Icon, {
                      className: "h-4 w-4"
                    })}
                    <span>{iconName}</span>
                  </SelectItem>
                )
              }
              return null
            })}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
} 