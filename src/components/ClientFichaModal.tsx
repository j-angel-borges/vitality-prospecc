'use client';

import React, { useState } from 'react';
import { LeadData } from '@/data/leadTypes';

interface ClientFichaModalProps {
  lead: LeadData;
  isDark?: boolean;
  onClose: () => void;
  onSave?: (updatedLead: Partial<LeadData>) => Promise<void>;
}

export const ClientFichaModal: React.FC<ClientFichaModalProps> = ({
  lead,
  isDark = false,
  onClose,
  onSave
}) => {
  // Local editable state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const ficha = lead.clienteFicha || {};

  const [numeroCliente, setNumeroCliente] = useState(
    lead.numeroCliente || ficha.numeroCliente || ''
  );
  const [nombreMadre, setNombreMadre] = useState(lead.nombreMadre || '');
  const [apellido, setApellido] = useState(lead.apellido || ficha.apellido || '');
  const [celular, setCelular] = useState(lead.celular || '');
  const [provincia, setProvincia] = useState(lead.provincia || ficha.provincia || 'Lima');
  const [distrito, setDistrito] = useState(lead.distrito || 'Lima');
  const [direccion, setDireccion] = useState(lead.direccion || ficha.direccion || '');
  const [emprendedores, setEmprendedores] = useState(
    lead.emprendedores || ficha.emprendedores || 'No'
  );
  const [informacionCuenta, setInformacionCuenta] = useState(
    lead.informacionCuenta || ficha.informacionCuenta || ''
  );
  const [ordenes, setOrdenes] = useState(lead.ordenes || ficha.ordenes || '');

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = async () => {
    if (!onSave) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      const updatedFicha = {
        ...ficha,
        numeroCliente,
        apellido,
        provincia,
        direccion,
        informacionCuenta,
        ordenes,
        emprendedores
      };

      await onSave({
        nombreMadre,
        apellido,
        celular,
        distrito,
        provincia,
        direccion,
        numeroCliente,
        emprendedores,
        informacionCuenta,
        ordenes,
        clienteFicha: updatedFicha
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving ficha:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Clean phone number for WhatsApp link
  const cleanPhone = (celular || '').replace(/\D/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`}`
    : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(8px, env(safe-area-inset-top)) max(8px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left))'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: isDark ? '#0F172A' : '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: 'calc(100dvh - 16px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px #334155'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px #E2E8F0',
          overflow: 'hidden',
          color: isDark ? '#F1F5F9' : '#1E293B',
          transition: 'all 0.2s ease-in-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0',
            background: isDark
              ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
              : 'linear-gradient(135deg, #F8FAFC 0%, #EEF2F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
                flexShrink: 0
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Ficha del Cliente
                </h3>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    background: '#10B98122',
                    color: '#059669',
                    border: '1px solid #10B98144'
                  }}
                >
                  Venta Cerrada
                </span>
                {lead.salesRep && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      background: lead.salesRep === 'Ricfel' ? '#F59E0B22' : '#3B82F622',
                      color: lead.salesRep === 'Ricfel' ? '#D97706' : '#2563EB',
                      border: `1px solid ${lead.salesRep === 'Ricfel' ? '#F59E0B44' : '#3B82F644'}`
                    }}
                  >
                    {lead.salesRep}
                  </span>
                )}
              </div>
              <p className="hidden xs:block" style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                Registro oficial Hy Cite & Vitality ERP
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onSave && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                title="Editar ficha"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                  background: isDark ? '#1E293B' : '#FFFFFF',
                  color: isDark ? '#E2E8F0' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                </svg>
                Editar
              </button>
            )}
            {isEditing && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                title="Guardar ficha"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: isSaving ? 'wait' : 'pointer'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Cerrar ficha"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                background: isDark ? '#1E293B' : '#E2E8F0',
                color: isDark ? '#94A3B8' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body content */}
        <div style={{ padding: '14px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Quick info bar: Número de Cliente & Acciones Directas */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: isDark ? '#1E293B' : '#F1F5F9',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B' }}>
                Nº DE CLIENTE HY CITE:
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={numeroCliente}
                  onChange={(e) => setNumeroCliente(e.target.value)}
                  placeholder="Ej: 23640243"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #3B82F6',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    background: isDark ? '#0F172A' : '#FFFFFF'
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => copyToClipboard(numeroCliente, 'cliente')}
                  title="Copiar número"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isDark ? '#0F172A' : '#FFFFFF',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#2563EB',
                    cursor: 'pointer'
                  }}
                >
                  <span>{numeroCliente || 'Sin Nº asignado'}</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                  {copiedField === 'cliente' && (
                    <span style={{ fontSize: '0.72rem', color: '#10B981' }}>¡Copiado!</span>
                  )}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {celular && (
                <>
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir WhatsApp"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: '#25D366',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
                      </svg>
                      WhatsApp
                    </a>
                  )}
                  <a
                    href={`tel:${celular}`}
                    title="Llamar teléfono"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: isDark ? '#334155' : '#E2E8F0',
                      color: isDark ? '#F8FAFC' : '#1E293B',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Llamar
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Sección 1: Datos Personales y Contacto */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: isDark ? '#111827' : '#FFFFFF',
              border: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0'
            }}
          >
            <h4
              style={{
                margin: '0 0 14px 0',
                fontSize: '0.88rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: isDark ? '#94A3B8' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Datos del Cliente y Contacto
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>
                  Nombres
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={nombreMadre}
                    onChange={(e) => setNombreMadre(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      background: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      fontSize: '0.88rem'
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{nombreMadre || '—'}</div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>
                  Apellidos
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      background: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      fontSize: '0.88rem'
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{apellido || '—'}</div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>
                  Teléfono Móvil
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      background: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      fontSize: '0.88rem'
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{celular || '—'}</div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>
                  ¿Emprendedores?
                </label>
                {isEditing ? (
                  <select
                    value={emprendedores}
                    onChange={(e) => setEmprendedores(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      background: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      fontSize: '0.88rem'
                    }}
                  >
                    <option value="No">No</option>
                    <option value="Sí">Sí</option>
                  </select>
                ) : (
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: emprendedores === 'Sí' || emprendedores === 'Si' ? '#10B98122' : (isDark ? '#334155' : '#E2E8F0'),
                      color: emprendedores === 'Sí' || emprendedores === 'Si' ? '#059669' : (isDark ? '#94A3B8' : '#475569')
                    }}
                  >
                    {emprendedores || 'No'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sección 2: Ubicación y Dirección */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: isDark ? '#111827' : '#FFFFFF',
              border: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0'
            }}
          >
            <h4
              style={{
                margin: '0 0 14px 0',
                fontSize: '0.88rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: isDark ? '#94A3B8' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Dirección y Ubicación
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>
                  Provincia
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      background: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      fontSize: '0.88rem'
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{provincia || 'Lima'}</div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>
                  Distrito
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      background: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      fontSize: '0.88rem'
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{distrito || 'Lima'}</div>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>
                Dirección Completa
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle, Jr, Av, Mz, Lote, Urbanización"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    background: isDark ? '#1E293B' : '#F8FAFC',
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    fontSize: '0.88rem'
                  }}
                />
              ) : (
                <div style={{ fontSize: '0.92rem', fontWeight: 500, color: direccion ? 'inherit' : (isDark ? '#64748B' : '#94A3B8') }}>
                  {direccion || 'Sin dirección registrada'}
                </div>
              )}
            </div>
          </div>

          {/* Sección 3: Información de la Cuenta (Financiera / Hy Cite) */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: isDark ? '#111827' : '#FFFFFF',
              border: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0'
            }}
          >
            <h4
              style={{
                margin: '0 0 14px 0',
                fontSize: '0.88rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: isDark ? '#94A3B8' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="14" x="2" y="5" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              Información de la Cuenta Hy Cite
            </h4>

            {isEditing ? (
              <textarea
                value={informacionCuenta}
                onChange={(e) => setInformacionCuenta(e.target.value)}
                rows={4}
                placeholder="Términos, línea de crédito, saldo, días de gracia..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                  background: isDark ? '#1E293B' : '#F8FAFC',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  resize: 'vertical'
                }}
              />
            ) : (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: isDark ? '#0F172A' : '#F8FAFC',
                  border: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  color: isDark ? '#CBD5E1' : '#334155',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                {informacionCuenta || 'Sin información de cuenta registrada'}
              </div>
            )}
          </div>

          {/* Sección 4: Historial de Órdenes y Compras */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: isDark ? '#111827' : '#FFFFFF',
              border: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0'
            }}
          >
            <h4
              style={{
                margin: '0 0 14px 0',
                fontSize: '0.88rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: isDark ? '#94A3B8' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Órdenes y Adquisiciones
            </h4>

            {isEditing ? (
              <textarea
                value={ordenes}
                onChange={(e) => setOrdenes(e.target.value)}
                rows={4}
                placeholder="Número de orden, fecha, artículos, montos..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                  background: isDark ? '#1E293B' : '#F8FAFC',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  resize: 'vertical'
                }}
              />
            ) : (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: isDark ? '#0F172A' : '#F8FAFC',
                  border: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  color: isDark ? '#CBD5E1' : '#334155',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                {ordenes || 'Sin órdenes registradas'}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0',
            background: isDark ? '#0F172A' : '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span style={{ fontSize: '0.78rem', color: isDark ? '#64748B' : '#94A3B8' }}>
            ID Lead: {lead.id}
          </span>
          <button
            type="button"
            onClick={onClose}
            title="Cerrar modal"
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
              background: isDark ? '#1E293B' : '#F1F5F9',
              color: isDark ? '#E2E8F0' : '#475569',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
