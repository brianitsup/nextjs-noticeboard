"use client"

import { cn } from "@/lib/utils"

interface SocialIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function FacebookIcon({ className, ...props }: SocialIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className={cn("w-5 h-5", className)} 
      {...props}
    >
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
    </svg>
  )
}

export function LinkedInIcon({ className, ...props }: SocialIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className={cn("w-5 h-5", className)} 
      {...props}
    >
      <path d="M6.5 8V18h-3V8h3zm.25-5a1.75 1.75 0 11-3.5 0 1.75 1.75 0 013.5 0zM18.5 18h3v-5.09c0-4.5-3.17-5.41-4.5-5.41-1.33 0-2.67.58-3.24 1.71V8h-3v10h3v-5.16c0-1.06.55-2.34 2.24-2.34s2.5.8 2.5 2.34V18z" />
    </svg>
  )
}

export function XIcon({ className, ...props }: SocialIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className={cn("w-5 h-5", className)} 
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
} 