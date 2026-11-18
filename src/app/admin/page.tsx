"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VitalityAdmin } from "@/components/VitalityAdmin";
import { subscribeToCloudLeads, saveCloudLead, deleteCloudLead } from "@/services/cloudCrm";
import { LeadData } from "@/data/leadTypes";

export default function AdminPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si por alguna razón la conexión con Firestore tarda más de 3.5s,
    // desbloquear la interfaz para que no quede en pantalla de carga
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 3500);

    const unsubscribe = subscribeToCloudLeads((cloudLeads) => {
      setLeads(cloudLeads);
      setLoading(false);
      clearTimeout(safetyTimeout);
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const handleUpdateLead = async (updated: LeadData) => {
    try {
      await saveCloudLead(updated);
    } catch (e) {
      console.error("Error guardando lead:", e);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteCloudLead(leadId);
    } catch (e) {
      console.error("Error eliminando lead:", e);
    }
  };

  const handleClose = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#D1D3D4]">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-xl">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#004D99] border-t-transparent" />
          <p className="font-semibold text-[#004D99]">Cargando Vitality CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <VitalityAdmin
        leads={leads}
        onClose={handleClose}
        onUpdateLead={handleUpdateLead}
        onDeleteLead={handleDeleteLead}
      />
    </div>
  );
}
