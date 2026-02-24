
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <div className="flex flex-col h-full bg-white animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-primary p-6 text-white shrink-0">
        <h2 className="text-2xl font-bold">Datos del Prospecto</h2>
        <p className="text-primary-foreground/80">Completa la información básica</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Juan Pérez" {...field} className="h-12" />
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
                  <FormLabel>Número de Celular</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="987 654 321" 
                      {...field} 
                      className="h-12" 
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
                  <FormLabel>Distrito</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Miraflores" {...field} className="h-12" />
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
                  <FormLabel>Vendedor / Encargado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Seleccione un vendedor" />
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

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white h-14 text-lg rounded-xl shadow-lg"
              >
                Siguiente
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
