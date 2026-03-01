"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Lock } from "lucide-react"

interface WelcomeSlideProps {
  onStart: () => void
}

export function WelcomeSlide({ onStart }: WelcomeSlideProps) {
  const bgImage = PlaceHolderImages.find(img => img.id === "bg-welcome")

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-700">
      {/* Admin Button */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
        <Link href="/admin">
          <Button 
            variant="outline" 
            size="sm"
            className="border-accent text-accent hover:bg-accent/10 bg-black/20 backdrop-blur-sm font-bold tracking-widest text-xs h-8 px-4 rounded-full transition-all"
          >
            <Lock className="h-3 w-3 mr-2" />
            ADMIN
          </Button>
        </Link>
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
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center space-y-10">
        <div className="space-y-6 max-w-4xl">
          <h1 className="text-5xl md:text-8xl font-headline font-bold text-white leading-tight drop-shadow-2xl">
            Descubre una Experiencia Culinaria única en Perú
          </h1>
          
          <ul className="text-2xl md:text-4xl text-white font-medium space-y-4 drop-shadow-lg">
            <li className="flex items-center justify-center gap-4">
              <span className="h-4 w-4 rounded-full bg-accent shrink-0 shadow-lg" />
              Contaminación Cruzada.
            </li>
            <li className="flex items-center justify-center gap-4">
              <span className="h-4 w-4 rounded-full bg-accent shrink-0 shadow-lg" />
              Alimentación Saludable.
            </li>
          </ul>
        </div>

        <Button 
          onClick={onStart}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-3xl md:text-4xl px-16 py-12 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 mt-12 w-full max-w-md h-auto"
        >
          COMENZAR
        </Button>
      </div>
    </div>
  )
}
