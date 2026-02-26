
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
  const qrImageId = data.salesRep === "Vendedor 1" ? "qr-rep-1" : "qr-rep-2"
  const qrImage = PlaceHolderImages.find(img => img.id === qrImageId)

  const handleFinish = async () => {
    if (!db || !user) {
      toast({
        variant: "destructive",
        title: "Error de sesión",
        description: "No se pudo identificar al representante. Por favor, reintente.",
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
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-[1px]" />
        </>
      )}

      <div className="relative z-10 flex flex-col h-full">
        <div className="p-8 md:p-16 text-white shrink-0">
          <h2 className="text-4xl md:text-6xl font-bold drop-shadow-md">Acción Final</h2>
          <p className="text-white/80 text-xl md:text-3xl">Encargado: {data.salesRep}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-16 space-y-12">
          <div className="bg-white/90 p-10 rounded-3xl shadow-2xl max-w-3xl mx-auto space-y-10">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-56 h-56 md:w-72 md:h-72 border-8 border-primary rounded-3xl overflow-hidden p-4 bg-white shadow-xl">
                {qrImage && (
                  <Image
                    src={qrImage.imageUrl}
                    alt={`QR Code for ${data.salesRep}`}
                    fill
                    className="object-contain p-4"
                    data-ai-hint={qrImage.imageHint}
                  />
                )}
              </div>
              <p className="text-center font-bold text-primary text-2xl">
                Escanea para agregarme a contactos
              </p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="notes" className="text-2xl font-bold text-primary">
                Notas Internas
              </Label>
              <Textarea
                id="notes"
                placeholder="Escribe detalles importantes sobre este prospecto..."
                className="min-h-[200px] text-xl p-6 bg-white border-primary/20 rounded-2xl"
                value={data.notes}
                onChange={(e) => onUpdate({ notes: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="p-8 md:p-16">
          <Button
            onClick={handleFinish}
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-20 md:h-28 text-3xl font-bold rounded-2xl shadow-2xl flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : (
              <>
                <Send className="h-10 w-10" />
                FINALIZAR Y ENVIAR
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
