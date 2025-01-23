"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Button } from "@/components/ui/button"
import { DialogLayout } from "@/components/ui/dialog-layout"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { CalendarIcon, Clock } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  requires_date?: boolean
  date_label?: string
  date_description?: string
}

interface CreateNoticeDialogProps {
  onClose: () => void
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  category_id: z.string({
    required_error: "Please select a category.",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority level.",
  }),
  event_date: z.date().optional(),
  submitter_email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export default function CreateNoticeDialog({ onClose }: CreateNoticeDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>("development")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      priority: "low",
    },
  })

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        const enhancedCategories = data.map((cat: any) => ({
          ...cat,
          requires_date: cat.slug === 'events' || cat.slug === 'promotions',
          date_label: cat.slug === 'events' ? 'Event Date & Time' : 
                     cat.slug === 'promotions' ? 'Promotion End Date & Time' : 
                     'Date & Time (Optional)',
          date_description: cat.slug === 'events' ? 'When will this event take place?' :
                          cat.slug === 'promotions' ? 'When will this promotion end?' :
                          'Optional date and time for this notice.'
        }))
        setCategories(enhancedCategories)
      })
      .catch(error => {
        console.error('Error fetching categories:', error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        })
      })
  }, [])

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'category_id') {
        const category = categories.find(c => c.id === value.category_id)
        setSelectedCategory(category || null)
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch, categories])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      onClose()
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          status: 'draft',
          is_published: false,
          captchaToken: "development",
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create notice')
      }

      toast({
        title: "Notice Submitted",
        description: "Your notice has been submitted for review. We'll notify you once it's published.",
      })

      setIsOpen(false)
      onClose()
    } catch (error) {
      console.error('Error creating notice:', error)
      toast({
        title: "Error",
        description: "Failed to create notice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const Tips = () => (
    <div className="mt-8 space-y-4">
      <h3 className="font-medium text-base">Tips for creating a notice:</h3>
      <ul className="space-y-3 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <span className="select-none">•</span>
          <span>Be clear and concise in your title</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="select-none">•</span>
          <span>Provide all relevant details in the content</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="select-none">•</span>
          <span>Select the appropriate category and priority</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="select-none">•</span>
          <span>Double-check dates and times if applicable</span>
        </li>
      </ul>
    </div>
  )

  return (
    <DialogLayout
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="Create Notice"
      description="Submit a new notice for review. All notices will be reviewed before being published."
      leftPanel={<Tips />}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter notice title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter notice content"
                    className="min-h-[150px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="event_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{selectedCategory?.date_label || 'Date & Time (Optional)'}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      timeCaption="Time"
                      placeholderText="Select date and time"
                      minDate={selectedCategory?.slug === 'events' ? new Date() : undefined}
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                      customInput={
                        <Input
                          suffix={
                            <div className="flex gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <CalendarIcon className="h-4 w-4" />
                            </div>
                          }
                        />
                      }
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  {selectedCategory?.date_description}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="submitter_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Enter your email address" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  We'll use this to contact you if we need any clarification.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogLayout>
  )
} 