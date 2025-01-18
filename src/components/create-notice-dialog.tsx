"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { NoticeForm } from "@/components/notice-form"
import { Plus } from "lucide-react"

export function CreateNoticeDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Post a Notice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a New Notice</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new notice. Click submit when you're done.
          </DialogDescription>
        </DialogHeader>
        <NoticeForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
} 