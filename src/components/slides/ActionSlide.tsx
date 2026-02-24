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
    <div className="flex flex-col h-full bg-white animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-primary p-6 text-white shrink-0">
        <h2 className="text-2xl font-bold">Acción Final</h2>
        <p className="text-primary-foreground/80">Encargado: {data.salesRep}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-48 h-48 border-4 border-primary rounded-xl overflow-hidden p-2 bg-white shadow-xl">
            {qrImage && (
              <Image
                src={qrImage.imageUrl}
                alt={`QR Code for ${data.salesRep}`}
                fill
                className="object-contain p-2"
                data-ai-hint={qrImage.imageHint}
              />
            )}
          </div>
          <p className="text-center font-medium text-primary text-lg">
            Escanea para agregarme a contactos
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-lg font-semibold text-primary">
            Notas Internas
          </Label>
          <Textarea
            id="notes"
            placeholder="Escribe detalles importantes sobre este prospecto..."
            className="min-h-[150px] text-base"
            value={data.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
          />
        </div>
      </div>

      <div className="p-6">
        <Button
          onClick={handleFinish}
          disabled={isSubmitting}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-16 text-xl font-bold rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          {isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Send className="h-6 w-6" />
              FINALIZAR Y ENVIAR
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
