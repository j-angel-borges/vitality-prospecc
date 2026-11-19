'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { CrmUserProfile, getAllCrmUsers } from '@/services/authService';
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
  onUpdateTabs: (tabs: string[]) => Promise<void>;
  onBatchUpdateLeads: (updates: Array<{ id: string; changes: Partial<LeadData> }>) => Promise<void>;
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
  onUpdateTabs,
  onBatchUpdateLeads,
  isDark = false
}) => {
  const [activePortalTab, setActivePortalTab] = useState<'users' | 'transfers' | 'reorder'>('users');
  const [crmUsers, setCrmUsers] = useState<CrmUserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);

  // Transfer state
  const [transferFromRep, setTransferFromRep] = useState<string>('Jose Angel');
  const [transferTab, setTransferTab] = useState<string>('__ALL_FROM_REP__');
  const [transferToRep, setTransferToRep] = useState<string>('Ricfel');
  const [targetTabName, setTargetTabName] = useState<string>('KEEP_CURRENT');
  const [customTargetTab, setCustomTargetTab] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferSuccessMsg, setTransferSuccessMsg] = useState<string | null>(null);

  // Reorder state
  const [orderedTabs, setOrderedTabs] = useState<string[]>(sheetTabs);
  const [isSavingOrder, setIsSavingOrder] = useState<boolean>(false);
  const [orderSavedMsg, setOrderSavedMsg] = useState<boolean>(false);

  // Sync orderedTabs when sheetTabs change
  useEffect(() => {
    setOrderedTabs(sheetTabs);
  }, [sheetTabs]);

  // Load Firestore crm_users
  useEffect(() => {
    if (isOpen) {
      setIsLoadingUsers(true);
      getAllCrmUsers()
        .then((users) => {
          setCrmUsers(users);
        })
        .finally(() => setIsLoadingUsers(false));
    }
  }, [isOpen]);

  // Helper to determine which rep owns a tab
  const getTabOwner = (tab: string): 'Ricfel' | 'Jose Angel' | 'General' => {
    if (tab === 'Mod Avcn (R)' || tab === 'Clientes' || tab.toLowerCase().includes('ricfel')) {
      return 'Ricfel';
    }
    return 'Jose Angel';
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

  // Leads available to transfer
  const leadsToTransfer = useMemo(() => {
    return leads.filter((l) => {
      const tab = l.sheetTab || '';
      const repMatch = transferFromRep === 'ALL' || l.salesRep === transferFromRep || (
        transferFromRep === 'Ricfel' ? (tab === 'Mod Avcn (R)' || tab === 'Clientes') : (tab !== 'Mod Avcn (R)' && tab !== 'Clientes')
      );
      if (!repMatch) return false;

      if (transferTab === '__ALL_FROM_REP__') return true;
      return tab === transferTab;
    });
  }, [leads, transferFromRep, transferTab]);

  // Available tabs for the selected fromRep
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

  // Execute lead transfer
  const handleExecuteTransfer = async () => {
    if (leadsToTransfer.length === 0 || isTransferring) return;
    if (transferFromRep === transferToRep && targetTabName === 'KEEP_CURRENT') {
      alert('Selecciona un asesor destino diferente o una pestaña diferente.');
      return;
    }

    const confirmMsg = `¿Confirmas el traspaso de ${leadsToTransfer.length} leads de ${transferFromRep} hacia ${transferToRep}?`;
    if (!window.confirm(confirmMsg)) return;

    setIsTransferring(true);
    setTransferSuccessMsg(null);
    try {
      const finalTab = targetTabName === 'KEEP_CURRENT' 
        ? undefined 
        : (targetTabName === '__CUSTOM__' ? customTargetTab.trim() : targetTabName);

      const updates = leadsToTransfer.map((l) => ({
        id: l.id,
        changes: {
          salesRep: transferToRep,
          ...(finalTab ? { sheetTab: finalTab } : {})
        }
      }));

      await onBatchUpdateLeads(updates);
      setTransferSuccessMsg(`¡Traspaso exitoso! ${updates.length} leads transferidos a ${transferToRep}.`);
      setTimeout(() => setTransferSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error ejecutando traspaso:', err);
      alert('Ocurrió un error al ejecutar el traspaso. Revisa la consola.');
    } finally {
      setIsTransferring(false);
    }
  };

  // Reorder tab moves
  const moveTab = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= orderedTabs.length) return;
    const copy = [...orderedTabs];
    const item = copy.splice(index, 1)[0];
    copy.splice(newIdx, 0, item);
    setOrderedTabs(copy);
  };

  // Save new tab order
  const handleSaveTabOrder = async () => {
    setIsSavingOrder(true);
    try {
      await onUpdateTabs(orderedTabs);
      setOrderSavedMsg(true);
      setTimeout(() => setOrderSavedMsg(false), 2500);
    } catch (e) {
      console.error('Error guardando orden de pestañas:', e);
      alert('Error guardando el orden.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
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
          maxWidth: '820px',
          maxHeight: '90vh',
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          color: isDark ? '#F1F5F9' : '#0F172A',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
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
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.2rem',
                boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)'
              }}
            >
              ⚡
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Portal de Administración Vitality
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: isDark ? 'rgba(124, 58, 237, 0.25)' : '#EDE9FE',
                    color: isDark ? '#C4B5FD' : '#7C3AED'
                  }}
                >
                  Roles & Traspasos
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                Gestión de asesores, inspección de leads, traspaso de pestañas y reordenamiento global.
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

        {/* Segmented Navigation */}
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
              background: activePortalTab === 'users' ? (isDark ? '#334155' : '#EFF6FF') : 'transparent',
              color: activePortalTab === 'users' ? (isDark ? '#93C5FD' : '#004D99') : (isDark ? '#94A3B8' : '#64748B'),
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>👥</span>
            <span>Usuarios & Leads</span>
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
              background: activePortalTab === 'transfers' ? (isDark ? '#334155' : '#EFF6FF') : 'transparent',
              color: activePortalTab === 'transfers' ? (isDark ? '#93C5FD' : '#004D99') : (isDark ? '#94A3B8' : '#64748B'),
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🔄</span>
            <span>Traspaso de Pestañas</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortalTab('reorder')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activePortalTab === 'reorder' ? 700 : 500,
              fontSize: '0.84rem',
              background: activePortalTab === 'reorder' ? (isDark ? '#334155' : '#EFF6FF') : 'transparent',
              color: activePortalTab === 'reorder' ? (isDark ? '#93C5FD' : '#004D99') : (isDark ? '#94A3B8' : '#64748B'),
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>↕️</span>
            <span>Reordenamiento de Pestañas</span>
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
                    Selecciona un asesor para ingresar directamente a su espacio de trabajo y revisar sus leads.
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
                  Vista actual: <strong>{selectedRep}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {/* Card Ricfel */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: selectedRep === 'Ricfel'
                      ? (isDark ? 'rgba(124, 58, 237, 0.15)' : '#F5F3FF')
                      : (isDark ? '#1E293B' : '#F8FAFC'),
                    border: selectedRep === 'Ricfel'
                      ? '2px solid #7C3AED'
                      : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>👩‍💼</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: isDark ? 'rgba(236, 72, 153, 0.2)' : '#FCE7F3',
                        color: isDark ? '#F472B6' : '#BE185D'
                      }}
                    >
                      Asesora
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.96rem', fontWeight: 700 }}>Ricfel Olaizola</h4>
                  <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                    r.olaizola@gmail.com
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B' }}>Leads asignados:</span>
                    <strong style={{ fontSize: '0.95rem', color: '#7C3AED' }}>{repCounts.Ricfel} leads</strong>
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
                      background: selectedRep === 'Ricfel' ? '#7C3AED' : (isDark ? '#334155' : '#E2E8F0'),
                      color: selectedRep === 'Ricfel' ? '#FFFFFF' : (isDark ? '#F1F5F9' : '#334155'),
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {selectedRep === 'Ricfel' ? '✓ Viendo sus leads' : 'Entrar a sus Leads'}
                  </button>
                </div>

                {/* Card Jose Angel */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: selectedRep === 'Jose Angel'
                      ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF')
                      : (isDark ? '#1E293B' : '#F8FAFC'),
                    border: selectedRep === 'Jose Angel'
                      ? '2px solid #004D99'
                      : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>👨‍💼</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
                        color: isDark ? '#93C5FD' : '#1D4ED8'
                      }}
                    >
                      Asesor
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
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {selectedRep === 'Jose Angel' ? '✓ Viendo sus leads' : 'Entrar a sus Leads'}
                  </button>
                </div>

                {/* Card SuperAdmin Dinastía */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: selectedRep === 'ALL'
                      ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5')
                      : (isDark ? '#1E293B' : '#F8FAFC'),
                    border: selectedRep === 'ALL'
                      ? '2px solid #10B981'
                      : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>👑</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5',
                        color: isDark ? '#34D399' : '#047857'
                      }}
                    >
                      SuperAdmin
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.96rem', fontWeight: 700 }}>Dinastía (Global)</h4>
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
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {selectedRep === 'ALL' ? '✓ Viendo todos los leads' : 'Ver Todos los Leads'}
                  </button>
                </div>
              </div>

              {/* Registered CRM users from Firestore */}
              {crmUsers.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0 0 10px', color: isDark ? '#CBD5E1' : '#475569' }}>
                    Usuarios Registrados en Firestore ({crmUsers.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {crmUsers.map((u) => (
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
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>{u.displayName || 'Sin Nombre'}</strong>
                          <span style={{ fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B', marginLeft: '8px' }}>
                            ({u.email})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: u.role === 'superadmin' ? '#FEF3C7' : '#E0E7FF',
                              color: u.role === 'superadmin' ? '#92400E' : '#3730A3',
                              fontWeight: 600
                            }}
                          >
                            Asignado: {u.assignedRepName || u.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRANSFERS */}
          {activePortalTab === 'transfers' && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>Traspaso de Pestañas y Leads</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                  Mueve leads o pestañas completas entre asesores con sincronización inmediata a la nube.
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
                  <span>✓</span>
                  <span>{transferSuccessMsg}</span>
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px',
                  background: isDark ? '#1E293B' : '#F8FAFC',
                  padding: '20px',
                  borderRadius: '12px',
                  border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                  marginBottom: '20px'
                }}
              >
                {/* Column 1: ORIGIN */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#CBD5E1' : '#334155' }}>
                    1. Asesor Origen (De):
                  </label>
                  <select
                    value={transferFromRep}
                    onChange={(e) => {
                      setTransferFromRep(e.target.value);
                      setTransferTab('__ALL_FROM_REP__');
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
                      marginBottom: '14px'
                    }}
                  >
                    <option value="Jose Angel">Jose Angel Borges</option>
                    <option value="Ricfel">Ricfel Olaizola</option>
                    <option value="ALL">Todos los asesores (Sin asignar)</option>
                  </select>

                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#CBD5E1' : '#334155' }}>
                    2. Pestaña o Lote a Traspasar:
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
                </div>

                {/* Column 2: DESTINATION */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#CBD5E1' : '#334155' }}>
                    3. Asesor Destino (Hacia):
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
                      marginBottom: '14px'
                    }}
                  >
                    <option value="Ricfel">Ricfel Olaizola</option>
                    <option value="Jose Angel">Jose Angel Borges</option>
                  </select>

                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#CBD5E1' : '#334155' }}>
                    4. Asignación de Pestaña en Destino:
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
                    <option value="KEEP_CURRENT">Mantener el nombre de pestaña actual</option>
                    {transferToRep === 'Ricfel' && (
                      <>
                        <option value="Mod Avcn (R)">Mover a 'Mod Avcn (R)'</option>
                        <option value="Clientes">Mover a 'Clientes'</option>
                      </>
                    )}
                    {transferToRep === 'Jose Angel' && (
                      <>
                        <option value="Prospecc">Mover a 'Prospecc'</option>
                        <option value="Mod Aviacion (JA)">Mover a 'Mod Aviacion (JA)'</option>
                      </>
                    )}
                    <option value="__CUSTOM__">+ Crear y asignar a nueva pestaña...</option>
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

              {/* Transfer Summary & Action */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '10px',
                  background: isDark ? 'rgba(124, 58, 237, 0.15)' : '#F5F3FF',
                  border: isDark ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid #DDD6FE'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isDark ? '#C4B5FD' : '#6D28D9' }}>
                    Resumen del Traspaso:
                  </div>
                  <div style={{ fontSize: '0.8rem', color: isDark ? '#E2E8F0' : '#4C1D95', marginTop: '2px' }}>
                    Se transferirán <strong>{leadsToTransfer.length} leads</strong> de{' '}
                    <strong>{transferFromRep}</strong> hacia <strong>{transferToRep}</strong>.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteTransfer}
                  disabled={leadsToTransfer.length === 0 || isTransferring}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: leadsToTransfer.length === 0 ? '#94A3B8' : '#7C3AED',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: leadsToTransfer.length === 0 || isTransferring ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>⚡</span>
                  <span>{isTransferring ? 'Ejecutando traspaso...' : 'Confirmar y Ejecutar Traspaso'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: REORDER */}
          {activePortalTab === 'reorder' && (
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
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>Reordenamiento Global de Pestañas</h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                    Reorganiza el orden de aparición de las pestañas en la barra superior del CRM con las flechas ▲ y ▼.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveTabOrder}
                  disabled={isSavingOrder}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: orderSavedMsg ? '#10B981' : '#004D99',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: isSavingOrder ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0, 77, 153, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>💾</span>
                  <span>{orderSavedMsg ? '¡Orden Guardado!' : (isSavingOrder ? 'Guardando...' : 'Guardar Nuevo Orden')}</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {orderedTabs.map((tab, idx) => {
                  const owner = getTabOwner(tab);
                  const count = leads.filter(l => l.sheetTab === tab).length;

                  return (
                    <div
                      key={tab}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: isDark ? '#1E293B' : '#F8FAFC',
                        border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: isDark ? '#64748B' : '#94A3B8',
                            width: '24px'
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <strong style={{ fontSize: '0.88rem' }}>{tab}</strong>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: owner === 'Ricfel'
                              ? (isDark ? 'rgba(236, 72, 153, 0.2)' : '#FCE7F3')
                              : (isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF'),
                            color: owner === 'Ricfel'
                              ? (isDark ? '#F472B6' : '#BE185D')
                              : (isDark ? '#93C5FD' : '#1D4ED8'),
                            fontWeight: 700
                          }}
                        >
                          {owner}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                          ({count} leads)
                        </span>
                      </div>

                      {/* Reorder Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => moveTab(idx, 'up')}
                          disabled={idx === 0}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                            background: isDark ? '#0F172A' : '#FFFFFF',
                            color: isDark ? '#F1F5F9' : '#334155',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            opacity: idx === 0 ? 0.35 : 1,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Subir posición"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTab(idx, 'down')}
                          disabled={idx === orderedTabs.length - 1}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                            background: isDark ? '#0F172A' : '#FFFFFF',
                            color: isDark ? '#F1F5F9' : '#334155',
                            cursor: idx === orderedTabs.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: idx === orderedTabs.length - 1 ? 0.35 : 1,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Bajar posición"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  );
                })}
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
            justifyContent: 'flex-end',
            gap: '10px'
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
