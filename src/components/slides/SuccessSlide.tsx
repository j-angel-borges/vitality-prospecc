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

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center space-y-4 sm:space-y-6 max-w-md mx-auto">
        <div className="rounded-full bg-accent/20 p-4 sm:p-6 animate-bounce">
          <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-accent" />
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-white drop-shadow-lg">
            ¡Felicidades!
          </h1>
          <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed drop-shadow-md px-2">
            Tu registro se ha completado exitosamente en nuestro sistema.
          </p>
        </div>

        <Button 
          onClick={onReset}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-sm sm:text-base px-6 sm:px-10 py-3 sm:py-4 rounded-xl shadow-2xl flex items-center justify-center gap-2.5 w-full max-w-[240px] sm:max-w-xs transition-all hover:scale-105 active:scale-95"
        >
          <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>NUEVO REGISTRO</span>
        </Button>
      </div>
    </div>
  )
}
