"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Lock } from "lucide-react"
import { InstallAppButton } from "@/components/InstallAppButton"

interface WelcomeSlideProps {
  onStart: () => void
}

export function WelcomeSlide({ onStart }: WelcomeSlideProps) {
  const bgImage = PlaceHolderImages.find(img => img.id === "bg-welcome")

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-700">
      {/* Top Action Bar with PWA Install */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-6 z-30 flex items-center">
        <InstallAppButton variant="badge" />
      </div>

      {/* Background Image/GIF with 60% Blue Overlay */}
      {bgImage && (
        <>
          <Image
            src={bgImage.imageUrl}
            alt={bgImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={bgImage.imageHint}
          />
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px]" />
        </>
      )}
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 text-center space-y-5 sm:space-y-8 md:space-y-10 my-auto">
        <div className="space-y-3 sm:space-y-6 max-w-2xl">
          <h1 className="text-xl sm:text-3xl md:text-5xl font-headline font-bold text-white leading-snug sm:leading-tight drop-shadow-2xl px-2">
            Descubre una Experiencia Culinaria única en Perú
          </h1>
          
          <ul className="text-sm sm:text-lg md:text-2xl text-white/95 font-medium space-y-2 sm:space-y-3 drop-shadow-lg">
            <li className="flex items-center justify-center gap-2.5 sm:gap-3">
              <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-accent shrink-0 shadow-lg" />
              <span>Contaminación Cruzada.</span>
            </li>
            <li className="flex items-center justify-center gap-2.5 sm:gap-3">
              <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-accent shrink-0 shadow-lg" />
              <span>Alimentación Saludable.</span>
            </li>
          </ul>
        </div>

        <Button 
          onClick={onStart}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base sm:text-xl md:text-2xl px-8 sm:px-12 py-3.5 sm:py-5 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 w-full max-w-[240px] sm:max-w-sm h-auto"
        >
          COMENZAR
        </Button>
      </div>
    </div>
  )
}
