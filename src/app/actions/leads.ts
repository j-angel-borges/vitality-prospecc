
"use server"

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type LeadData = {
  fullName: string;
  phoneNumber: string;
  district: string;
  salesRep: string;
  notes: string;
};

export async function submitLead(data: LeadData) {
  try {
    const leadsRef = collection(db, "leads");
    await addDoc(leadsRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting lead:", error);
    return { success: false, error: "Failed to submit prospect data." };
  }
}
