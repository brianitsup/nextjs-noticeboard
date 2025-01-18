"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import type { EmblaCarouselType as CarouselApi } from "embla-carousel"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type CarouselProps = {
  opts?: Parameters<typeof useEmblaCarousel>[0]
  children: React.ReactNode
}

export function Carousel({ opts = { align: "start" }, children }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    ...opts,
    breakpoints: {
      '(min-width: 1024px)': { slidesToScroll: 3 },
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 0px)': { slidesToScroll: 1 },
    }
  })
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = React.useCallback((emblaApi: any) => {
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [])

  React.useEffect(() => {
    if (!emblaApi) return

    onSelect(emblaApi)
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect])

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">{children}</div>
      </div>
      {canScrollPrev && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 h-8 w-8 rounded-full bg-background shadow-md hidden sm:flex"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      {canScrollNext && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 h-8 w-8 rounded-full bg-background shadow-md hidden sm:flex"
          onClick={scrollNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
} 