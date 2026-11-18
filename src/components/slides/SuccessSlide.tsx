"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle2, UserPlus } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"

interface SuccessSlideProps {
  onReset: () => void
}

export function SuccessSlide({ onReset }: SuccessSlideProps) {
  const bgImage = PlaceHolderImages.find(img => img.id === "bg-success")

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden animate-in zoom-in duration-700">
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
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px]" />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 sm:p-8 md:p-16 text-center space-y-6 sm:space-y-8 md:space-y-10 max-w-xl mx-auto">
        <div className="rounded-full bg-accent/20 p-5 sm:p-7 md:p-8 animate-bounce">
          <CheckCircle2 className="h-16 w-16 sm:h-22 sm:w-22 md:h-28 md:w-28 text-accent" />
        </div>
        
        <div className="space-y-3 sm:space-y-4 max-w-lg">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-headline font-bold text-white drop-shadow-lg">
            ¡Felicidades!
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 font-medium leading-relaxed drop-shadow-md px-2">
            Tu registro se ha completado exitosamente en nuestro sistema.
          </p>
        </div>

        <Button 
          onClick={onReset}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg sm:text-xl md:text-2xl px-8 sm:px-12 py-3 sm:py-5 rounded-2xl md:rounded-3xl shadow-2xl flex items-center justify-center gap-3 w-full max-w-sm transition-all hover:scale-105 active:scale-95"
        >
          <UserPlus className="h-6 w-6 sm:h-7 sm:w-7" />
          <span>NUEVO REGISTRO</span>
        </Button>
      </div>
    </div>
  )
}
