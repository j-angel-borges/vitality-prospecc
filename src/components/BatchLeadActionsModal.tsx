'use client';

import React, { useState } from 'react';
import { LeadData } from '@/data/leadTypes';

interface BatchLeadActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadIds?: string[];
  leads?: LeadData[];
  sheetTabs?: string[];
  availableTabs?: string[];
  onBatchUpdateStatus: (newStatus: LeadData['estadoCrm']) => Promise<void>;
  onBatchMoveToTab: (targetTab: string) => Promise<void>;
  onBatchCreateTabAndMove: (newTabName: string) => Promise<void>;
  onClearSelection: () => void;
  isDark?: boolean;
}

export const BatchLeadActionsModal: React.FC<BatchLeadActionsModalProps> = ({
  isOpen,
  onClose,
  selectedLeadIds = [],
  leads = [],
  sheetTabs = [],
  availableTabs = [],
  onBatchUpdateStatus,
  onBatchMoveToTab,
  onBatchCreateTabAndMove,
  onClearSelection,
  isDark = false
}) => {
  const tabsList = (sheetTabs && sheetTabs.length > 0) ? sheetTabs : ((availableTabs && availableTabs.length > 0) ? availableTabs : ['Prospecc']);
  const [activeTab, setActiveTab] = useState<'stage' | 'new_tab' | 'existing_tab'>('stage');
  const [selectedStage, setSelectedStage] = useState<LeadData['estadoCrm']>('contactado');
  const [newTabName, setNewTabName] = useState<string>('');
  const [targetTab, setTargetTab] = useState<string>(tabsList[0] || 'Prospecc');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const count = selectedLeadIds.length;

  const handleApplyStatus = async () => {
    if (count === 0 || !selectedStage) return;
    setIsProcessing(true);
    try {
      await onBatchUpdateStatus(selectedStage);
      setFeedbackMsg(`✓ Se actualizaron ${count} prospectos a la etapa "${selectedStage}".`);
      setTimeout(() => {
        setFeedbackMsg(null);
        onClose();
      }, 1400);
    } catch (err) {
      console.error(err);
      alert('Error al actualizar etapa de leads.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyNewTab = async () => {
    const trimmed = newTabName.trim();
    if (!trimmed) {
      alert('Por favor ingresa un nombre para la nueva pestaña.');
      return;
    }
    setIsProcessing(true);
    try {
      await onBatchCreateTabAndMove(trimmed);
      setFeedbackMsg(`✓ Pestaña "${trimmed}" creada con ${count} prospectos.`);
      setTimeout(() => {
        setFeedbackMsg(null);
        onClose();
      }, 1400);
    } catch (err) {
      console.error(err);
      alert('Error al crear pestaña y mover leads.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyExistingTab = async () => {
    if (!targetTab) return;
    setIsProcessing(true);
    try {
      await onBatchMoveToTab(targetTab);
      setFeedbackMsg(`✓ ${count} prospectos traspasados a "${targetTab}".`);
      setTimeout(() => {
        setFeedbackMsg(null);
        onClose();
      }, 1400);
    } catch (err) {
      console.error(err);
      alert('Error al traspasar leads.');
    } finally {
      setIsProcessing(false);
    }
  };

  const CRM_STAGES: Array<{ key: LeadData['estadoCrm']; label: string; color: string; desc: string }> = [
    { key: 'nuevo', label: 'Nuevo', color: '#3B82F6', desc: 'Recién registrado sin contacto' },
    { key: 'contactado', label: 'Contactado', color: '#F59E0B', desc: 'Llamada realizada o en seguimiento' },
    { key: 'demo_agendada', label: 'Demo Agendada', color: '#8B5CF6', desc: 'Cita pactada para demostración' },
    { key: 'ganado', label: 'Venta Cerrada (Ganado)', color: '#10B981', desc: 'Cliente compró producto Royal Prestige' },
    { key: 'descartado', label: 'Descartado', color: '#EF4444', desc: 'No interesado / Teléfono inválido' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(10px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left))'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: 'calc(100dvh - 24px)',
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderRadius: '18px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
          border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
            background: isDark ? '#1E293B' : '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 3 Isometric Cubes Icon */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #002244 0%, #004D99 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60A5FA',
                boxShadow: '0 3px 8px rgba(0, 77, 153, 0.25)',
                flexShrink: 0
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#FFFFFF' : '#002244' }}>
                  Acciones en Lote
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: count > 0 ? '#10B981' : '#94A3B8',
                    color: '#FFFFFF'
                  }}
                >
                  {count} {count === 1 ? 'seleccionado' : 'seleccionados'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                Gestión masiva de etapa, pestañas y traspaso de leads.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: isDark ? '#334155' : '#E2E8F0',
              color: isDark ? '#CBD5E1' : '#475569',
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {count === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94A3B8' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
              <strong style={{ display: 'block', fontSize: '0.92rem', color: isDark ? '#F1F5F9' : '#1E293B', marginBottom: '4px' }}>
                No hay prospectos seleccionados
              </strong>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>
                Marca las casillas de verificación (checkbox) al lado izquierdo de los nombres en la tabla para seleccionarlos.
              </p>
            </div>
          ) : (
            <>
              {/* Tabs for Action Type */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  background: isDark ? '#1E293B' : '#F1F5F9',
                  padding: '3px',
                  borderRadius: '10px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('stage')}
                  style={{
                    flex: 1,
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeTab === 'stage' ? (isDark ? '#0F172A' : '#FFFFFF') : 'transparent',
                    color: activeTab === 'stage' ? (isDark ? '#60A5FA' : '#004D99') : (isDark ? '#94A3B8' : '#64748B'),
                    boxShadow: activeTab === 'stage' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Cambiar Etapa
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('new_tab')}
                  style={{
                    flex: 1,
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeTab === 'new_tab' ? (isDark ? '#0F172A' : '#FFFFFF') : 'transparent',
                    color: activeTab === 'new_tab' ? (isDark ? '#60A5FA' : '#004D99') : (isDark ? '#94A3B8' : '#64748B'),
                    boxShadow: activeTab === 'new_tab' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Nueva Pestaña
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('existing_tab')}
                  style={{
                    flex: 1,
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeTab === 'existing_tab' ? (isDark ? '#0F172A' : '#FFFFFF') : 'transparent',
                    color: activeTab === 'existing_tab' ? (isDark ? '#60A5FA' : '#004D99') : (isDark ? '#94A3B8' : '#64748B'),
                    boxShadow: activeTab === 'existing_tab' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Traspasar Pestaña
                </button>
              </div>

              {/* ACTION 1: CAMBIAR ETAPA CRM */}
              {activeTab === 'stage' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>
                    Selecciona la nueva etapa para los {count} prospectos:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {CRM_STAGES.map((st) => (
                      <label
                        key={st.key}
                        onClick={() => setSelectedStage(st.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: selectedStage === st.key ? `2px solid ${st.color}` : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                          background: selectedStage === st.key ? (isDark ? 'rgba(59, 130, 246, 0.12)' : '#F0F9FF') : (isDark ? '#1E293B' : '#F8FAFC'),
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="radio"
                            name="crm_batch_stage"
                            checked={selectedStage === st.key}
                            onChange={() => setSelectedStage(st.key)}
                            style={{ accentColor: st.color, cursor: 'pointer' }}
                          />
                          <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                              {st.label}
                            </span>
                            <span style={{ display: 'block', fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                              {st.desc}
                            </span>
                          </div>
                        </div>
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: st.color
                          }}
                        />
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyStatus}
                    disabled={isProcessing}
                    style={{
                      marginTop: '8px',
                      padding: '11px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#004D99',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 6px rgba(0, 77, 153, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isProcessing ? 'Actualizando etapa...' : `Actualizar ${count} prospectos a "${selectedStage}"`}
                  </button>
                </div>
              )}

              {/* ACTION 2: CREAR NUEVA PESTAÑA */}
              {activeTab === 'new_tab' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>
                    Nombre de la nueva pestaña:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Expo Maternidad Noviembre / Clientes Especiales"
                    value={newTabName}
                    onChange={(e) => setNewTabName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1',
                      background: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#F1F5F9' : '#0F172A',
                      fontSize: '0.88rem',
                      outline: 'none',
                      fontWeight: 600,
                      boxSizing: 'border-box'
                    }}
                  />
                  <p style={{ margin: 0, fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                    Se creará la nueva pestaña en la nube y se transferirán automáticamente los {count} prospectos seleccionados.
                  </p>

                  <button
                    type="button"
                    onClick={handleApplyNewTab}
                    disabled={isProcessing || !newTabName.trim()}
                    style={{
                      marginTop: '6px',
                      padding: '11px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#10B981',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isProcessing ? 'Creando y traspasando...' : `Crear pestaña y mover ${count} prospectos`}
                  </button>
                </div>
              )}

              {/* ACTION 3: TRASPASAR A PESTAÑA EXISTENTE */}
              {activeTab === 'existing_tab' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>
                    Selecciona la pestaña de destino:
                  </label>
                  <select
                    value={targetTab}
                    onChange={(e) => setTargetTab(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1',
                      background: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#F1F5F9' : '#0F172A',
                      fontSize: '0.88rem',
                      outline: 'none',
                      fontWeight: 600,
                      boxSizing: 'border-box'
                    }}
                  >
                    {tabsList.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                    Los {count} prospectos seleccionados cambiarán su pestaña origen a "{targetTab}".
                  </p>

                  <button
                    type="button"
                    onClick={handleApplyExistingTab}
                    disabled={isProcessing}
                    style={{
                      marginTop: '6px',
                      padding: '11px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#004D99',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 6px rgba(0, 77, 153, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isProcessing ? 'Traspasando...' : `Traspasar ${count} prospectos a "${targetTab}"`}
                  </button>
                </div>
              )}

              {/* Feedback Alert */}
              {feedbackMsg && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#065F46',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                >
                  {feedbackMsg}
                </div>
              )}

              {/* Clear selection option */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={onClearSelection}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: isDark ? '#94A3B8' : '#64748B',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Deseleccionar todos
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
