"use client"

import * as React from "react"
import { useState } from "react"
import { 
  useFirestore, 
  useCollection, 
  useMemoFirebase,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking
} from "@/firebase"
import { collection, query, orderBy, doc } from "firebase/firestore"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { 
  Pencil, 
  Trash2, 
  Download, 
  ArrowLeft, 
  Lock,
  Search,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [editingLead, setEditingLead] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  const db = useFirestore()
  
  const leadsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "leads"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: leads, isLoading } = useCollection(leadsQuery)

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "admin123") {
      setIsAuthenticated(true)
    } else {
      alert("Contraseña incorrecta")
    }
  }

  const handleDelete = (id: string) => {
    if (!db || !confirm("¿Estás seguro de eliminar este registro?")) return
    const docRef = doc(db, "leads", id)
    deleteDocumentNonBlocking(docRef)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !editingLead) return
    const docRef = doc(db, "leads", editingLead.id)
    const { id, ...dataToUpdate } = editingLead
    updateDocumentNonBlocking(docRef, dataToUpdate)
    setEditingLead(null)
  }

  const exportToCSV = () => {
    if (!leads) return
    
    const headers = ["Fecha", "Nombre", "Celular", "Distrito", "Encargado", "Score Salud", "Notas"]
    const rows = leads.map(l => [
      l.createdAt?.seconds ? format(new Date(l.createdAt.seconds * 1000), "dd/MM/yyyy HH:mm") : "",
      l.fullName,
      l.phoneNumber,
      l.district,
      l.salesRep,
      l.healthScore,
      l.notes?.replace(/\n/g, " ") || ""
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `registros_salud_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredLeads = leads?.filter(l => 
    l.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phoneNumber?.includes(searchTerm) ||
    l.district?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-accent/20 p-4 rounded-full">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Acceso Administrativo</h1>
            <p className="text-muted-foreground text-center">Ingresa la contraseña para gestionar los registros</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <Input 
              type="password" 
              placeholder="Contraseña" 
              className="h-14 text-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90">
              ENTRAR
            </Button>
          </form>
          <Link href="/" className="block text-center text-primary/60 hover:text-primary transition-colors text-sm">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-primary">Panel de Administración</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre..." 
              className="pl-10 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={exportToCSV} className="bg-accent text-accent-foreground font-bold flex items-center gap-2">
            <Download className="h-4 w-4" />
            EXPORTAR CSV
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-x-auto">
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-muted-foreground">Cargando registros...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold">Fecha</TableHead>
                  <TableHead className="font-bold">Nombre</TableHead>
                  <TableHead className="font-bold">Celular</TableHead>
                  <TableHead className="font-bold">Distrito</TableHead>
                  <TableHead className="font-bold">Encargado</TableHead>
                  <TableHead className="font-bold text-center">Score</TableHead>
                  <TableHead className="font-bold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads && filteredLeads.length > 0 ? (
                  filteredLeads.map((lead, idx) => (
                    <TableRow key={lead.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <TableCell className="whitespace-nowrap">
                        {lead.createdAt?.seconds ? format(new Date(lead.createdAt.seconds * 1000), "dd MMM, HH:mm", { locale: es }) : "-"}
                      </TableCell>
                      <TableCell className="font-medium">{lead.fullName}</TableCell>
                      <TableCell>{lead.phoneNumber}</TableCell>
                      <TableCell>{lead.district}</TableCell>
                      <TableCell>{lead.salesRep}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full font-bold text-xs ${lead.healthScore >= 8 ? 'bg-green-100 text-green-700' : lead.healthScore >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {lead.healthScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => setEditingLead(lead)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(lead.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No se encontraron registros
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Editar Registro</DialogTitle>
            <DialogDescription>Modifica los datos del contacto seleccionado.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre Completo</Label>
                <Input 
                  id="edit-name" 
                  value={editingLead?.fullName || ""} 
                  onChange={(e) => setEditingLead({...editingLead, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Celular</Label>
                <Input 
                  id="edit-phone" 
                  value={editingLead?.phoneNumber || ""} 
                  onChange={(e) => setEditingLead({...editingLead, phoneNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notas</Label>
                <textarea 
                  id="edit-notes"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editingLead?.notes || ""} 
                  onChange={(e) => setEditingLead({...editingLead, notes: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditingLead(null)}>Cancelar</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
