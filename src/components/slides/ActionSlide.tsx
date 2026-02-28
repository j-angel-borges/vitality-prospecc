"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Send } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { LeadData } from "@/app/actions/leads"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

interface ActionSlideProps {
  data: LeadData
  onUpdate: (data: Partial<LeadData>) => void
  onSuccess: () => void
}

export function ActionSlide({ data, onUpdate, onSuccess }: ActionSlideProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const db = useFirestore()
  const { user } = useUser()

  const bgImage = PlaceHolderImages.find(img => img.id === "bg-action")
  
  // Logic to select the correct QR code based on the sales representative's name
  const qrImageId = data.salesRep === "Jose Angel" ? "qr-jose-angel" : "qr-ricfel"
  const qrImage = PlaceHolderImages.find(img => img.id === qrImageId)

  const handleFinish = async () => {
    if (!db || !user) {
      toast({
        variant: "destructive",
        title: "Error de sesión",
        description: "No se pudo identificar al encargado. Por favor, reintente.",
      })
      return
    }

    setIsSubmitting(true)

    const leadsRef = collection(db, "leads")
    const payload = {
      ...data,
      salesRepUid: user.uid,
      createdAt: serverTimestamp(),
    }

    addDoc(leadsRef, payload)
      .then(() => {
        setIsSubmitting(false)
        onSuccess()
      })
      .catch(async (error) => {
        setIsSubmitting(false)
        const permissionError = new FirestorePermissionError({
          path: leadsRef.path,
          operation: 'create',
          requestResourceData: payload,
        })
        errorEmitter.emit('permission-error', permissionError)
      })
  }

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-500">
      {/* Background Image/GIF with 60% Blue Overlay */}
      {bgImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={bgImage.imageUrl}
            alt={bgImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={bgImage.imageHint}
          />
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px]" />
        </div>
      )}

      {/* Main Container - Using flex-1 to push footer button down if possible, but allowing scroll */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header Section */}
        <div className="p-6 md:p-12 lg:p-16 text-white text-center shrink-0">
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-bold drop-shadow-2xl">Acción Final</h2>
          <p className="text-white/90 text-xl md:text-3xl lg:text-5xl drop-shadow-lg">Encargado: {data.salesRep}</p>
        </div>

        {/* Scrollable Form Section */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-20 flex flex-col items-center">
          <div className="bg-white/95 p-6 md:p-12 lg:p-20 rounded-3xl md:rounded-[3rem] shadow-2xl max-w-4xl w-full space-y-10 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-6 md:space-y-8">
              <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-[400px] lg:h-[400px] border-4 md:border-8 border-primary rounded-2xl md:rounded-[3rem] overflow-hidden p-4 bg-white shadow-2xl transition-transform hover:scale-105">
                {qrImage && (
                  <Image
                    src={qrImage.imageUrl}
                    alt={`Código QR de ${data.salesRep}`}
                    fill
                    className="object-contain p-4 md:p-8"
                    data-ai-hint={qrImage.imageHint}
                  />
                )}
              </div>
              <p className="text-center font-bold text-primary text-xl md:text-3xl lg:text-5xl">
                Escanea para agregarme a contactos
              </p>
            </div>

            <div className="space-y-4 md:space-y-6">
              <Label htmlFor="notes" className="text-2xl md:text-3xl lg:text-5xl font-bold text-primary block">
                Notas Adicionales
              </Label>
              <Textarea
                id="notes"
                placeholder="Escribe detalles importantes aquí..."
                className="min-h-[150px] md:min-h-[250px] lg:min-h-[350px] text-lg md:text-2xl lg:text-4xl p-6 md:p-10 bg-white border-primary/20 rounded-2xl md:rounded-3xl shadow-inner focus:border-accent"
                value={data.notes}
                onChange={(e) => onUpdate({ notes: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Footer Button Section */}
        <div className="p-6 md:p-12 lg:p-16 shrink-0">
          <Button
            onClick={handleFinish}
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-16 md:h-28 lg:h-44 text-2xl md:text-4xl lg:text-6xl font-bold rounded-2xl md:rounded-[3rem] shadow-2xl flex items-center justify-center gap-4 md:gap-6 transition-all hover:scale-105 active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="h-10 w-10 md:h-16 md:w-16 lg:h-24 lg:w-24 animate-spin" />
            ) : (
              <>
                <Send className="h-10 w-10 md:h-16 md:w-16 lg:h-24 lg:w-24" />
                FINALIZAR Y ENVIAR
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
