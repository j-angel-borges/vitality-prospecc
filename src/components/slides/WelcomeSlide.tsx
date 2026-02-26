
"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PlaceHolderImages } from "@/lib/placeholder-images"

interface WelcomeSlideProps {
  onStart: () => void
}

export function WelcomeSlide({ onStart }: WelcomeSlideProps) {
  const bgImage = PlaceHolderImages.find(img => img.id === "bg-welcome")

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-700">
      {/* Background Image with Overlay */}
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
          <div className="absolute inset-0 bg-primary/60" />
        </>
      )}
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center space-y-10">
        <div className="space-y-6 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-white leading-tight drop-shadow-lg">
            Descubre una Experiencia Culinaria única en Perú
          </h1>
          
          <ul className="text-xl md:text-2xl text-white/90 font-medium space-y-4">
            <li className="flex items-center justify-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-accent shrink-0" />
              Contaminación Cruzada.
            </li>
            <li className="flex items-center justify-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-accent shrink-0" />
              Alimentación Saludable.
            </li>
          </ul>
        </div>

        <Button 
          onClick={onStart}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-2xl px-12 py-10 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 mt-8 w-full max-w-sm"
        >
          COMENZAR
        </Button>
      </div>
    </div>
  )
}
