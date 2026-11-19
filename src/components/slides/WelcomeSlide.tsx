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
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 text-center space-y-6 sm:space-y-8 md:space-y-10 my-auto">
        <div className="space-y-4 sm:space-y-6 max-w-3xl">
          <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-headline font-bold text-white leading-snug sm:leading-tight drop-shadow-2xl px-2">
            Descubre una Experiencia Culinaria única en Perú
          </h1>
          
          <ul className="text-base sm:text-xl md:text-3xl text-white font-medium space-y-2 sm:space-y-3 drop-shadow-lg">
            <li className="flex items-center justify-center gap-3">
              <span className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 rounded-full bg-accent shrink-0 shadow-lg" />
              <span>Contaminación Cruzada.</span>
            </li>
            <li className="flex items-center justify-center gap-3">
              <span className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 rounded-full bg-accent shrink-0 shadow-lg" />
              <span>Alimentación Saludable.</span>
            </li>
          </ul>
        </div>

        <Button 
          onClick={onStart}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xl sm:text-2xl md:text-3xl px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-7 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 w-full max-w-xs sm:max-w-sm md:max-w-md h-auto"
        >
          COMENZAR
        </Button>
      </div>
    </div>
  )
}
