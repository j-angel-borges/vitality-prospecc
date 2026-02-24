/**
 * @fileOverview Defines the LeadData structure for the prospecting flow.
 * Note: Data submission is handled client-side for better offline support and responsiveness.
 */

export type LeadData = {
  fullName: string;
  phoneNumber: string;
  district: string;
  salesRep: string;
  notes: string;
  healthScore: number;
  pollutionAwareness: string;
  interestInDetection: boolean;
};
