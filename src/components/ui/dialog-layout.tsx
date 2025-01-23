"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface DialogLayoutProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  title?: React.ReactNode
  description?: React.ReactNode
  leftPanel?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function DialogLayout({
  title,
  description,
  leftPanel,
  children,
  className,
  contentClassName,
  ...props
}: DialogLayoutProps) {
  return (
    <Dialog {...props}>
      <DialogContent className={cn("p-0 gap-0", contentClassName)}>
        <div className={cn("grid lg:grid-cols-[300px_1fr] h-full", className)}>
          {/* Left Panel */}
          {leftPanel && (
            <div className="bg-muted/50 p-6 lg:p-8 lg:border-r">
              {title || description ? (
                <DialogHeader className="space-y-3">
                  {title && <DialogTitle>{title}</DialogTitle>}
                  {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
              ) : null}
              {leftPanel}
            </div>
          )}

          {/* Right Panel - Content */}
          <div className="p-6 lg:p-8 lg:pt-6">
            {!leftPanel && (title || description) && (
              <DialogHeader className="space-y-3 mb-6">
                {title && <DialogTitle>{title}</DialogTitle>}
                {description && <DialogDescription>{description}</DialogDescription>}
              </DialogHeader>
            )}
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 