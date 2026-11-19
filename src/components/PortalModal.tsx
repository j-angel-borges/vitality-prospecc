'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { CrmUserProfile, getAllCrmUsers, deleteCrmUser } from '@/services/authService';
import { LeadData, AdminRep } from '@/data/leadTypes';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  userProfile: CrmUserProfile | null;
  sheetTabs: string[];
  leads: LeadData[];
  selectedRep: AdminRep;
  onSelectRep: (rep: AdminRep) => void;
  onSelectTab: (tab: string) => void;
  onBatchUpdateLeads: (updates: Array<{ id: string; changes: Partial<LeadData> }>) => Promise<void>;
  onBatchCreateLeads?: (newLeads: LeadData[]) => Promise<void>;
  isDark?: boolean;
}

export const PortalModal: React.FC<PortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  sheetTabs,
  leads,
  selectedRep,
  onSelectRep,
  onSelectTab,
  onBatchUpdateLeads,
  onBatchCreateLeads,
  isDark = false
}) => {
  const [activePortalTab, setActivePortalTab] = useState<'users' | 'transfers'>('users');
  const [crmUsers, setCrmUsers] = useState<CrmUserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [deletingUid, setDeletingUid] = useState<string | null>(null);

  // Transfer options state
  const [transferMode, setTransferMode] = useState<'tab' | 'individual'>('tab');
  const [transferAction, setTransferAction] = useState<'move' | 'copy'>('move');
  const [transferFromRep, setTransferFromRep] = useState<string>('Jose Angel');
  const [transferTab, setTransferTab] = useState<string>('__ALL_FROM_REP__');
  const [transferToRep, setTransferToRep] = useState<string>('Ricfel');
  const [targetTabName, setTargetTabName] = useState<string>('KEEP_CURRENT');
  const [customTargetTab, setCustomTargetTab] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferSuccessMsg, setTransferSuccessMsg] = useState<string | null>(null);

  // Individual selection state
  const [searchLeadQuery, setSearchLeadQuery] = useState<string>('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

  // Load Firestore crm_users
  const loadUsers = () => {
    setIsLoadingUsers(true);
    getAllCrmUsers()
      .then((users) => {
        setCrmUsers(users);
      })
      .finally(() => setIsLoadingUsers(false));
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // UltraAdmin mipropiadinastia@gmail.com is hidden for other admins
  const isCallerUltraAdmin = currentUser?.email === 'mipropiadinastia@gmail.com';
  const visibleUsers = useMemo(() => {
    return crmUsers.filter(u => {
      if (u.email === 'mipropiadinastia@gmail.com' && !isCallerUltraAdmin) {
        return false;
      }
      return true;
    });
  }, [crmUsers, isCallerUltraAdmin]);

  // Delete User
  const handleDeleteUser = async (uid: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario "${name}"?`)) {
      return;
    }
    setDeletingUid(uid);
    try {
      await deleteCrmUser(uid);
      setCrmUsers(prev => prev.filter(u => u.uid !== uid));
    } catch (e) {
      console.error('Error eliminando usuario:', e);
      alert('Error eliminando el usuario. Revisa la consola.');
    } finally {
      setDeletingUid(null);
    }
  };

  // Leads count per rep
  const repCounts = useMemo(() => {
    const ricfelCount = leads.filter(l => {
      const tab = l.sheetTab || '';
      return tab === 'Mod Avcn (R)' || tab === 'Clientes' || tab.toLowerCase().includes('ricfel');
    }).length;

    const joseAngelCount = leads.filter(l => {
      const tab = l.sheetTab || '';
      return tab !== 'Mod Avcn (R)' && tab !== 'Clientes' && !tab.toLowerCase().includes('ricfel');
    }).length;

    return {
      Ricfel: ricfelCount,
      'Jose Angel': joseAngelCount,
      ALL: leads.length
    };
  }, [leads]);

  // Source tabs for transfer
  const sourceTabs = useMemo(() => {
    return sheetTabs.filter((tab) => {
      if (transferFromRep === 'Ricfel') {
        return tab === 'Mod Avcn (R)' || tab === 'Clientes' || tab.toLowerCase().includes('ricfel');
      }
      if (transferFromRep === 'Jose Angel') {
        return tab !== 'Mod Avcn (R)' && tab !== 'Clientes' && !tab.toLowerCase().includes('ricfel');
      }
      return true;
    });
  }, [sheetTabs, transferFromRep]);

  // Candidates for transfer
  const availableSourceLeads = useMemo(() => {
    return leads.filter((l) => {
      const tab = l.sheetTab || '';
      const repMatch = transferFromRep === 'ALL' || l.salesRep === transferFromRep || (
        transferFromRep === 'Ricfel' ? (tab === 'Mod Avcn (R)' || tab === 'Clientes') : (tab !== 'Mod Avcn (R)' && tab !== 'Clientes')
      );
      if (!repMatch) return false;

      if (transferMode === 'tab' && transferTab !== '__ALL_FROM_REP__') {
        return tab === transferTab;
      }
      return true;
    });
  }, [leads, transferFromRep, transferTab, transferMode]);

  // Filtered leads for individual selection
  const filteredIndividualLeads = useMemo(() => {
    if (!searchLeadQuery.trim()) return availableSourceLeads;
    const q = searchLeadQuery.toLowerCase();
    return availableSourceLeads.filter(l => 
      (l.nombreMadre || '').toLowerCase().includes(q) ||
      (l.celular || '').includes(q) ||
      (l.sheetTab || '').toLowerCase().includes(q)
    );
  }, [availableSourceLeads, searchLeadQuery]);

  // Selection toggle
  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedLeadIds(new Set(filteredIndividualLeads.map(l => l.id)));
  };

  const deselectAll = () => {
    setSelectedLeadIds(new Set());
  };

  // Execute transfer / copy
  const handleExecuteTransfer = async () => {
    const leadsToProcess = transferMode === 'individual'
      ? availableSourceLeads.filter(l => selectedLeadIds.has(l.id))
      : availableSourceLeads;

    if (leadsToProcess.length === 0 || isTransferring) {
      alert('No hay leads seleccionados para traspasar o copiar.');
      return;
    }

    const actionText = transferAction === 'copy' ? 'copiar (duplicar)' : 'traspasar (mover)';
    const confirmMsg = `¿Confirmas ${actionText} ${leadsToProcess.length} lead(s) de ${transferFromRep} hacia ${transferToRep}?`;
    if (!window.confirm(confirmMsg)) return;

    setIsTransferring(true);
    setTransferSuccessMsg(null);
    try {
      const finalTab = targetTabName === 'KEEP_CURRENT' 
        ? undefined 
        : (targetTabName === '__CUSTOM__' ? customTargetTab.trim() : targetTabName);

      if (transferAction === 'copy') {
        // Create duplicate leads
        const newLeads: LeadData[] = leadsToProcess.map(l => ({
          ...l,
          id: `copy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}_${l.id}`,
          salesRep: transferToRep,
          ...(finalTab ? { sheetTab: finalTab } : {})
        }));

        if (onBatchCreateLeads) {
          await onBatchCreateLeads(newLeads);
        } else {
          // Fallback to update batch
          const updates = newLeads.map(l => ({ id: l.id, changes: l }));
          await onBatchUpdateLeads(updates);
        }
        setTransferSuccessMsg(`¡Copia exitosa! ${newLeads.length} lead(s) duplicados hacia ${transferToRep}.`);
      } else {
        // Move leads
        const updates = leadsToProcess.map(l => ({
          id: l.id,
          changes: {
            salesRep: transferToRep,
            ...(finalTab ? { sheetTab: finalTab } : {})
          }
        }));
        await onBatchUpdateLeads(updates);
        setTransferSuccessMsg(`¡Traspaso exitoso! ${updates.length} lead(s) movidos hacia ${transferToRep}.`);
      }

      setSelectedLeadIds(new Set());
      setTimeout(() => setTransferSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error ejecutando traspaso:', err);
      alert('Ocurrió un error al procesar el traspaso. Revisa la consola.');
    } finally {
      setIsTransferring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          color: isDark ? '#F1F5F9' : '#0F172A',
          borderRadius: '18px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
          border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isDark ? '#1E293B' : '#F8FAFC'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #002244 0%, #004D99 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 10px rgba(0, 77, 153, 0.25)'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, letterSpacing: '-0.02em', color: isDark ? '#FFFFFF' : '#002244' }}>
                  Portal Administrativo Vitality
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF',
                    color: isDark ? '#93C5FD' : '#004D99'
                  }}
                >
                  SuperAdmin
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                Control comercial de equipo, acceso a leads y traspasos individuales o en lote.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: isDark ? '#334155' : '#E2E8F0',
              color: isDark ? '#CBD5E1' : '#475569',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              transition: 'background 0.15s ease'
            }}
            title="Cerrar Portal"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs (Solo 2: Usuarios y Traspasos, reordenamiento eliminado) */}
        <div
          style={{
            display: 'flex',
            padding: '10px 24px',
            gap: '8px',
            borderBottom: isDark ? '1px solid #1E293B' : '1px solid #F1F5F9',
            background: isDark ? '#0F172A' : '#FFFFFF'
          }}
        >
          <button
            type="button"
            onClick={() => setActivePortalTab('users')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activePortalTab === 'users' ? 700 : 500,
              fontSize: '0.84rem',
              background: activePortalTab === 'users' ? (isDark ? '#1E293B' : '#EFF6FF') : 'transparent',
              color: activePortalTab === 'users' ? (isDark ? '#60A5FA' : '#004D99') : (isDark ? '#94A3B8' : '#64748B'),
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Equipo Comercial & Leads</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortalTab('transfers')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activePortalTab === 'transfers' ? 700 : 500,
              fontSize: '0.84rem',
              background: activePortalTab === 'transfers' ? (isDark ? '#1E293B' : '#EFF6FF') : 'transparent',
              color: activePortalTab === 'transfers' ? (isDark ? '#60A5FA' : '#004D99') : (isDark ? '#94A3B8' : '#64748B'),
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 1l4 4-4 4"/>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <path d="M7 23l-4-4 4-4"/>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            <span>Traspaso & Copiado de Leads</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: USERS & LEADS */}
          {activePortalTab === 'users' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>Equipo Comercial & Asesores</h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                    Ambos superadministradores (Ricfel y Jose Angel) pueden inspeccionar y entrar a los leads de los demás.
                  </p>
                </div>
                <div
                  style={{
                    fontSize: '0.76rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: isDark ? '#1E293B' : '#F1F5F9',
                    border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                    color: isDark ? '#94A3B8' : '#475569'
                  }}
                >
                  Espacio activo: <strong>{selectedRep}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                {/* Card Ricfel (SuperAdmin) */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: selectedRep === 'Ricfel'
                      ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF')
                      : (isDark ? '#1E293B' : '#F8FAFC'),
                    border: selectedRep === 'Ricfel'
                      ? '2px solid #004D99'
                      : (isDark ? '1px solid #334155' : '1px solid #E2E8F0')
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004D99' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: '#DBEAFE',
                        color: '#1D4ED8'
                      }}
                    >
                      SuperAdmin
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.96rem', fontWeight: 700 }}>Ricfel Olaizola</h4>
                  <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                    r.olaizola@gmail.com
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B' }}>Leads asignados:</span>
                    <strong style={{ fontSize: '0.95rem', color: '#004D99' }}>{repCounts.Ricfel} leads</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRep('Ricfel');
                      onSelectTab('Mod Avcn (R)');
                      onClose();
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: selectedRep === 'Ricfel' ? '#004D99' : (isDark ? '#334155' : '#E2E8F0'),
                      color: selectedRep === 'Ricfel' ? '#FFFFFF' : (isDark ? '#F1F5F9' : '#334155'),
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedRep === 'Ricfel' ? '✓ Viendo sus leads' : 'Entrar a sus Leads'}
                  </button>
                </div>

                {/* Card Jose Angel (SuperAdmin) */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: selectedRep === 'Jose Angel'
                      ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF')
                      : (isDark ? '#1E293B' : '#F8FAFC'),
                    border: selectedRep === 'Jose Angel'
                      ? '2px solid #004D99'
                      : (isDark ? '1px solid #334155' : '1px solid #E2E8F0')
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#004D99' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: '#DBEAFE',
                        color: '#1D4ED8'
                      }}
                    >
                      SuperAdmin
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.96rem', fontWeight: 700 }}>José Angel Borges</h4>
                  <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                    jangelborges@gmail.com
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B' }}>Leads asignados:</span>
                    <strong style={{ fontSize: '0.95rem', color: '#004D99' }}>{repCounts['Jose Angel']} leads</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRep('Jose Angel');
                      onSelectTab('Prospecc');
                      onClose();
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: selectedRep === 'Jose Angel' ? '#004D99' : (isDark ? '#334155' : '#E2E8F0'),
                      color: selectedRep === 'Jose Angel' ? '#FFFFFF' : (isDark ? '#F1F5F9' : '#334155'),
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedRep === 'Jose Angel' ? '✓ Viendo sus leads' : 'Entrar a sus Leads'}
                  </button>
                </div>

                {/* Card UltraAdmin Dinastía (Only visible for mipropiadinastia@gmail.com) */}
                {isCallerUltraAdmin && (
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: selectedRep === 'ALL'
                        ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5')
                        : (isDark ? '#1E293B' : '#F8FAFC'),
                      border: selectedRep === 'ALL'
                        ? '2px solid #10B981'
                        : (isDark ? '1px solid #334155' : '1px solid #E2E8F0')
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: '#D1FAE5',
                          color: '#047857'
                        }}
                      >
                        UltraAdmin
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.96rem', fontWeight: 700 }}>Dinastía (Ultra)</h4>
                    <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                      mipropiadinastia@gmail.com
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B' }}>Todos los leads:</span>
                      <strong style={{ fontSize: '0.95rem', color: '#10B981' }}>{repCounts.ALL} leads</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRep('ALL');
                        onSelectTab('Prospecc');
                        onClose();
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: selectedRep === 'ALL' ? '#10B981' : (isDark ? '#334155' : '#E2E8F0'),
                        color: selectedRep === 'ALL' ? '#FFFFFF' : (isDark ? '#F1F5F9' : '#334155'),
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {selectedRep === 'ALL' ? '✓ Viendo todos los leads' : 'Ver Todos los Leads'}
                    </button>
                  </div>
                )}
              </div>

              {/* Registered Asesores with Delete Button */}
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: isDark ? '#CBD5E1' : '#334155' }}>
                    Asesores Registrados ({visibleUsers.length})
                  </h4>
                  <button
                    type="button"
                    onClick={loadUsers}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: isDark ? '#93C5FD' : '#004D99',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Actualizar lista
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {visibleUsers.map((u) => {
                    const isProtected = u.email === 'mipropiadinastia@gmail.com' || u.email === 'jangelborges@gmail.com' || u.email === 'r.olaizola@gmail.com';
                    const isSelf = u.uid === currentUser?.uid;

                    return (
                      <div
                        key={u.uid}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: isDark ? '#1E293B' : '#F8FAFC',
                          border: isDark ? '1px solid #334155' : '1px solid #E2E8F0'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#004D99', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                            {(u.displayName || u.email || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.85rem' }}>{u.displayName || 'Sin Nombre'}</strong>
                            <span style={{ fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B', marginLeft: '8px' }}>
                              ({u.email})
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: u.role === 'superadmin' ? '#DBEAFE' : (u.role === 'ultra_admin' ? '#D1FAE5' : '#F1F5F9'),
                              color: u.role === 'superadmin' ? '#1D4ED8' : (u.role === 'ultra_admin' ? '#047857' : '#475569'),
                              fontWeight: 700
                            }}
                          >
                            {u.role === 'ultra_admin' ? 'Ultra' : (u.role === 'superadmin' ? 'SuperAdmin' : 'Asesor')}
                          </span>

                          {/* Botón Eliminar Usuario */}
                          {!isProtected && !isSelf && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.uid, u.displayName || u.email)}
                              disabled={deletingUid === u.uid}
                              style={{
                                border: '1px solid #FCA5A5',
                                background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
                                color: '#EF4444',
                                padding: '5px 9px',
                                borderRadius: '6px',
                                cursor: deletingUid === u.uid ? 'not-allowed' : 'pointer',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Eliminar usuario"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                              <span>{deletingUid === u.uid ? 'Eliminando...' : 'Eliminar'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSFERS (Lote o Individual, Mover o Copiar) */}
          {activePortalTab === 'transfers' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>Traspaso & Copiado de Leads</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                  Reasigna o duplica leads entre asesores de forma masiva o seleccionando prospectos individuales.
                </p>
              </div>

              {transferSuccessMsg && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #A7F3D0',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{transferSuccessMsg}</span>
                </div>
              )}

              {/* Mode Toggles */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', background: isDark ? '#1E293B' : '#E2E8F0', padding: '3px', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setTransferAction('move')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: transferAction === 'move' ? '#004D99' : 'transparent',
                      color: transferAction === 'move' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')
                    }}
                  >
                    Mover (Traspasar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferAction('copy')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: transferAction === 'copy' ? '#004D99' : 'transparent',
                      color: transferAction === 'copy' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')
                    }}
                  >
                    Copiar (Duplicar)
                  </button>
                </div>

                <div style={{ display: 'flex', background: isDark ? '#1E293B' : '#E2E8F0', padding: '3px', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setTransferMode('tab')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: transferMode === 'tab' ? '#004D99' : 'transparent',
                      color: transferMode === 'tab' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')
                    }}
                  >
                    Por Pestaña Completa
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferMode('individual')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: transferMode === 'individual' ? '#004D99' : 'transparent',
                      color: transferMode === 'individual' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')
                    }}
                  >
                    Selección Individual ({selectedLeadIds.size})
                  </button>
                </div>
              </div>

              {/* Source & Destination Selectors */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px',
                  background: isDark ? '#1E293B' : '#F8FAFC',
                  padding: '18px',
                  borderRadius: '12px',
                  border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                  marginBottom: '18px'
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                    1. Asesor Origen (De):
                  </label>
                  <select
                    value={transferFromRep}
                    onChange={(e) => {
                      setTransferFromRep(e.target.value);
                      setTransferTab('__ALL_FROM_REP__');
                      setSelectedLeadIds(new Set());
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                      background: isDark ? '#0F172A' : '#FFFFFF',
                      color: isDark ? '#F1F5F9' : '#0F172A',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      outline: 'none',
                      marginBottom: '12px'
                    }}
                  >
                    <option value="Jose Angel">Jose Angel Borges</option>
                    <option value="Ricfel">Ricfel Olaizola</option>
                    <option value="ALL">Todos los asesores</option>
                  </select>

                  {transferMode === 'tab' && (
                    <>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                        2. Pestaña de Origen:
                      </label>
                      <select
                        value={transferTab}
                        onChange={(e) => setTransferTab(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                          background: isDark ? '#0F172A' : '#FFFFFF',
                          color: isDark ? '#F1F5F9' : '#0F172A',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          outline: 'none'
                        }}
                      >
                        <option value="__ALL_FROM_REP__">-- Todos los leads de este asesor --</option>
                        {sourceTabs.map((t) => (
                          <option key={t} value={t}>
                            Pestaña: {t} ({leads.filter(l => l.sheetTab === t).length} leads)
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                    {transferMode === 'tab' ? '3.' : '2.'} Asesor Destino (Hacia):
                  </label>
                  <select
                    value={transferToRep}
                    onChange={(e) => setTransferToRep(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                      background: isDark ? '#0F172A' : '#FFFFFF',
                      color: isDark ? '#F1F5F9' : '#0F172A',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      outline: 'none',
                      marginBottom: '12px'
                    }}
                  >
                    <option value="Ricfel">Ricfel Olaizola</option>
                    <option value="Jose Angel">Jose Angel Borges</option>
                  </select>

                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                    {transferMode === 'tab' ? '4.' : '3.'} Pestaña en Destino:
                  </label>
                  <select
                    value={targetTabName}
                    onChange={(e) => setTargetTabName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                      background: isDark ? '#0F172A' : '#FFFFFF',
                      color: isDark ? '#F1F5F9' : '#0F172A',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    <option value="KEEP_CURRENT">Mantener pestaña original del lead</option>
                    {transferToRep === 'Ricfel' && (
                      <>
                        <option value="Mod Avcn (R)">Asignar a 'Mod Avcn (R)'</option>
                        <option value="Clientes">Asignar a 'Clientes'</option>
                      </>
                    )}
                    {transferToRep === 'Jose Angel' && (
                      <>
                        <option value="Prospecc">Asignar a 'Prospecc'</option>
                        <option value="Mod Aviacion (JA)">Asignar a 'Mod Aviacion (JA)'</option>
                      </>
                    )}
                    <option value="__CUSTOM__">+ Nueva pestaña personalizada...</option>
                  </select>

                  {targetTabName === '__CUSTOM__' && (
                    <input
                      type="text"
                      placeholder="Nombre de la nueva pestaña..."
                      value={customTargetTab}
                      onChange={(e) => setCustomTargetTab(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                        background: isDark ? '#0F172A' : '#FFFFFF',
                        color: isDark ? '#F1F5F9' : '#0F172A',
                        fontSize: '0.85rem',
                        marginTop: '8px',
                        outline: 'none'
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Individual Lead Selector Table */}
              {transferMode === 'individual' && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Buscar por nombre, celular o pestaña..."
                      value={searchLeadQuery}
                      onChange={(e) => setSearchLeadQuery(e.target.value)}
                      style={{
                        flex: 1,
                        minWidth: '220px',
                        padding: '7px 12px',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                        background: isDark ? '#1E293B' : '#FFFFFF',
                        color: isDark ? '#F1F5F9' : '#0F172A',
                        fontSize: '0.82rem',
                        outline: 'none'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={selectAllFiltered}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'transparent', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Seleccionar todos ({filteredIndividualLeads.length})
                      </button>
                      <button
                        type="button"
                        onClick={deselectAll}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: 'transparent', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Limpiar selección
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      maxHeight: '220px',
                      overflowY: 'auto',
                      border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                      borderRadius: '8px',
                      background: isDark ? '#0B0F19' : '#FFFFFF'
                    }}
                  >
                    {filteredIndividualLeads.length === 0 ? (
                      <p style={{ textAlign: 'center', padding: '16px', fontSize: '0.82rem', color: '#94A3B8' }}>
                        No se encontraron leads con ese criterio.
                      </p>
                    ) : (
                      filteredIndividualLeads.map((l) => {
                        const isChecked = selectedLeadIds.has(l.id);
                        return (
                          <div
                            key={l.id}
                            onClick={() => toggleSelectLead(l.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderBottom: isDark ? '1px solid #1E293B' : '1px solid #F1F5F9',
                              cursor: 'pointer',
                              background: isChecked ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF') : 'transparent'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectLead(l.id)}
                                onClick={(e) => e.stopPropagation()}
                                style={{ accentColor: '#004D99', cursor: 'pointer' }}
                              />
                              <div>
                                <strong style={{ fontSize: '0.82rem' }}>{l.nombreMadre || 'Sin Nombre'}</strong>
                                <span style={{ fontSize: '0.74rem', color: '#64748B', marginLeft: '8px' }}>
                                  Tel: {l.celular || '—'}
                                </span>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#004D99', fontWeight: 600 }}>
                              {l.sheetTab || 'Sin pestaña'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Action Button & Summary */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '10px',
                  background: isDark ? '#1E293B' : '#EFF6FF',
                  border: isDark ? '1px solid #334155' : '1px solid #BFDBFE'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isDark ? '#93C5FD' : '#004D99' }}>
                    {transferAction === 'copy' ? 'Resumen de Duplicado:' : 'Resumen de Traspaso:'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: isDark ? '#E2E8F0' : '#1E293B', marginTop: '2px' }}>
                    Se {transferAction === 'copy' ? 'duplicarán' : 'moverán'}{' '}
                    <strong>
                      {transferMode === 'individual' ? selectedLeadIds.size : availableSourceLeads.length} leads
                    </strong>{' '}
                    de <strong>{transferFromRep}</strong> a <strong>{transferToRep}</strong>.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteTransfer}
                  disabled={
                    (transferMode === 'individual' && selectedLeadIds.size === 0) ||
                    (transferMode === 'tab' && availableSourceLeads.length === 0) ||
                    isTransferring
                  }
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#004D99',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: isTransferring ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 77, 153, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{isTransferring ? 'Procesando...' : (transferAction === 'copy' ? 'Confirmar y Copiar Leads' : 'Confirmar y Traspasar Leads')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
            background: isDark ? '#1E293B' : '#F8FAFC',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
              background: isDark ? '#0F172A' : '#FFFFFF',
              color: isDark ? '#CBD5E1' : '#475569',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Cerrar Portal
          </button>
        </div>
      </div>
    </div>
  );
};
