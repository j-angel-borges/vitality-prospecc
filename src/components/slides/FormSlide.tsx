
"use client"

import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LeadData } from "@/app/actions/leads"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const formSchema = z.object({
  fullName: z.string().min(3, "Nombre es muy corto"),
  phoneNumber: z.string().min(8, "Número de celular inválido"),
  district: z.string().min(2, "Distrito es requerido"),
  salesRep: z.string().min(1, "Seleccione un encargado"),
})

interface FormSlideProps {
  data: LeadData
  onUpdate: (data: Partial<LeadData>) => void
  onNext: () => void
}

export function FormSlide({ data, onUpdate, onNext }: FormSlideProps) {
  const bgImage = PlaceHolderImages.find(img => img.id === "bg-form")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      district: data.district,
      salesRep: data.salesRep,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    onUpdate(values)
    onNext()
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
          <h2 className="text-4xl md:text-6xl font-bold mb-2 drop-shadow-md">Datos del Prospecto</h2>
          <p className="text-white/80 text-xl md:text-3xl">Completa la información básica</p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-16">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 md:space-y-12 max-w-4xl mx-auto bg-white/90 p-8 md:p-12 rounded-3xl shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg md:text-xl font-semibold text-primary">Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Juan Pérez" {...field} className="h-14 md:h-20 text-xl bg-white border-primary/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg md:text-xl font-semibold text-primary">Número de Celular</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="987 654 321" 
                          {...field} 
                          className="h-14 md:h-20 text-xl bg-white border-primary/20" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg md:text-xl font-semibold text-primary">Distrito</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Miraflores" {...field} className="h-14 md:h-20 text-xl bg-white border-primary/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salesRep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg md:text-xl font-semibold text-primary">Vendedor / Encargado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 md:h-20 text-xl bg-white border-primary/20">
                            <SelectValue placeholder="Seleccione un encargado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Vendedor 1">Vendedor 1</SelectItem>
                          <SelectItem value="Vendedor 2">Vendedor 2</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-8">
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white h-16 md:h-24 text-2xl font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                >
                  Siguiente
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
