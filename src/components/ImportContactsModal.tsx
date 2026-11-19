'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LeadData } from '@/data/leadTypes';
import { getStoredAccessToken } from '@/services/authService';
import { GoogleContact, fetchGoogleContacts, getCachedContacts, normalizePhone } from '@/services/contactsService';

interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  sheetTabs: string[];
  onImportLeads: (leadsToImport: LeadData[]) => Promise<void>;
  isDark?: boolean;
}

export const ImportContactsModal: React.FC<ImportContactsModalProps> = ({
  isOpen,
  onClose,
  currentTab,
  sheetTabs,
  onImportLeads,
  isDark = false
}) => {
  const [activeChannel, setActiveChannel] = useState<'google' | 'phone_native' | 'iphone_file'>('google');
  const [targetTab, setTargetTab] = useState<string>(currentTab === '__ALL__' ? 'Prospecc' : currentTab);

  // Google Contacts State
  const [googleContacts, setGoogleContacts] = useState<GoogleContact[]>(() => getCachedContacts());
  const [isLoadingGoogle, setIsLoadingGoogle] = useState<boolean>(false);
  const [googleSearchQuery, setGoogleSearchQuery] = useState<string>('');
  const [selectedGooglePhones, setSelectedGooglePhones] = useState<Set<string>>(new Set());

  // Phone Native Contact Picker State
  const [isNativeSupported, setIsNativeSupported] = useState<boolean>(false);

  // File Upload State (vCard / CSV / iPhone)
  const [parsedFileContacts, setParsedFileContacts] = useState<Array<{ name: string; phone: string }>>([]);
  const [fileFileName, setFileFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Submission State
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsNativeSupported('contacts' in navigator && 'ContactsManager' in window);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTargetTab(currentTab === '__ALL__' ? (sheetTabs[0] || 'Prospecc') : currentTab);
      const cached = getCachedContacts();
      if (cached.length > 0) {
        setGoogleContacts(cached);
      } else {
        loadGoogleContacts();
      }
    }
  }, [isOpen, currentTab]);

  const loadGoogleContacts = async () => {
    const token = getStoredAccessToken();
    if (!token) return;
    setIsLoadingGoogle(true);
    try {
      const contacts = await fetchGoogleContacts(token);
      setGoogleContacts(contacts);
    } catch (err) {
      console.warn('Error loading Google Contacts:', err);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  // Filtered Google Contacts
  const filteredGoogleContacts = useMemo(() => {
    const q = googleSearchQuery.trim().toLowerCase();
    if (!q) return googleContacts;
    return googleContacts.filter(c =>
      c.name.toLowerCase().includes(q) || c.phoneRaw.includes(q) || c.phoneNormalized.includes(q)
    );
  }, [googleContacts, googleSearchQuery]);

  const toggleGoogleContact = (phoneNorm: string) => {
    setSelectedGooglePhones(prev => {
      const next = new Set(prev);
      if (next.has(phoneNorm)) next.delete(phoneNorm);
      else next.add(phoneNorm);
      return next;
    });
  };

  const handleSelectAllGoogle = () => {
    if (selectedGooglePhones.size === filteredGoogleContacts.length) {
      setSelectedGooglePhones(new Set());
    } else {
      setSelectedGooglePhones(new Set(filteredGoogleContacts.map(c => c.phoneNormalized)));
    }
  };

  // 1. Execute Import from Google Contacts
  const handleImportSelectedGoogle = async () => {
    const contactsToImport = googleContacts.filter(c => selectedGooglePhones.has(c.phoneNormalized));
    if (contactsToImport.length === 0) return;

    setIsImporting(true);
    try {
      const newLeads: LeadData[] = contactsToImport.map(c => ({
        id: `imp_g_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        nombreMadre: c.name || 'Sin nombre',
        celular: c.phoneNormalized || c.phoneRaw,
        distrito: 'Lima',
        sheetTab: targetTab,
        estadoCrm: 'nuevo',
        nivelPreocupacion: 5,
        conocimientoDano: 'No especificado',
        edadHijos: '',
        preguntaCondicional: '',
        respuestaCondicional: '',
        interesSolucion: '',
        observaciones: `Importado de Google Contacts (${c.name})`
      }));

      await onImportLeads(newLeads);
      setSuccessToast(`✓ ${newLeads.length} contactos de Google importados a la pestaña "${targetTab}".`);
      setSelectedGooglePhones(new Set());
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
      alert('Error importando contactos de Google.');
    } finally {
      setIsImporting(false);
    }
  };

  // 2. Execute Import from Native Phone Contacts Picker (Android / Chrome)
  const handleOpenNativePicker = async () => {
    if (!isNativeSupported) return;
    try {
      const props = ['name', 'tel'];
      const opts = { multiple: true };
      const selected = await (navigator as any).contacts.select(props, opts);
      if (Array.isArray(selected) && selected.length > 0) {
        setIsImporting(true);
        const newLeads: LeadData[] = [];
        for (const item of selected) {
          const name = Array.isArray(item.name) ? item.name[0] : (item.name || 'Contacto Móvil');
          const tels = Array.isArray(item.tel) ? item.tel : [item.tel];
          for (const rawTel of tels) {
            if (!rawTel) continue;
            const norm = normalizePhone(rawTel);
            newLeads.push({
              id: `imp_mob_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              timestamp: new Date().toISOString(),
              nombreMadre: name,
              celular: norm || rawTel,
              distrito: 'Lima',
              sheetTab: targetTab,
              estadoCrm: 'nuevo',
              nivelPreocupacion: 5,
              conocimientoDano: 'No especificado',
              edadHijos: '',
              preguntaCondicional: '',
              respuestaCondicional: '',
              interesSolucion: '',
              observaciones: `Importado desde Agenda Celular (${name})`
            });
          }
        }

        if (newLeads.length > 0) {
          await onImportLeads(newLeads);
          setSuccessToast(`✓ ${newLeads.length} contactos de tu celular importados a "${targetTab}".`);
          setTimeout(() => {
            setSuccessToast(null);
            onClose();
          }, 1500);
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('Error al leer contactos del celular:', err);
      }
    } finally {
      setIsImporting(false);
    }
  };

  // 3. Parse and Import vCard (.vcf) or CSV (Universal / iPhone iOS solution)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileFileName(file.name);
    setFileError(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lowerName = file.name.toLowerCase();
      const parsed: Array<{ name: string; phone: string }> = [];

      if (lowerName.endsWith('.vcf')) {
        // vCard Parser
        const cards = text.split(/BEGIN:VCARD/i);
        for (const card of cards) {
          if (!card.trim()) continue;
          let name = '';
          let phone = '';

          const fnMatch = card.match(/FN:(.+)/i);
          if (fnMatch) {
            name = fnMatch[1].trim();
          } else {
            const nMatch = card.match(/N:([^;]+);?([^;]*)/i);
            if (nMatch) {
              name = `${nMatch[2] || ''} ${nMatch[1] || ''}`.trim();
            }
          }

          const telMatches = card.matchAll(/TEL[^:]*:(.+)/gi);
          for (const m of telMatches) {
            const rawPhone = m[1].trim();
            const norm = normalizePhone(rawPhone);
            if (norm && norm.length >= 7) {
              phone = norm;
              break;
            }
          }

          if (phone) {
            parsed.push({ name: name || 'Contacto iPhone', phone });
          }
        }
      } else {
        // CSV Parser
        const lines = text.split(/\r?\n/);
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = line.split(/[,;\t]/).map(s => s.replace(/^["']|["']$/g, '').trim());
          if (cols.length >= 2) {
            const name = cols[0] || 'Contacto';
            const rawPhone = cols[1] || '';
            const norm = normalizePhone(rawPhone);
            if (norm && norm.length >= 7) {
              parsed.push({ name, phone: norm });
            }
          }
        }
      }

      if (parsed.length === 0) {
        setFileError('No se encontraron contactos válidos con número telefónico en el archivo.');
        setParsedFileContacts([]);
      } else {
        setParsedFileContacts(parsed);
      }
    };

    reader.readAsText(file);
  };

  const handleImportFromFile = async () => {
    if (parsedFileContacts.length === 0) return;
    setIsImporting(true);
    try {
      const newLeads: LeadData[] = parsedFileContacts.map(c => ({
        id: `imp_file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        nombreMadre: c.name,
        celular: c.phone,
        distrito: 'Lima',
        sheetTab: targetTab,
        estadoCrm: 'nuevo',
        nivelPreocupacion: 5,
        conocimientoDano: 'No especificado',
        edadHijos: '',
        preguntaCondicional: '',
        respuestaCondicional: '',
        interesSolucion: '',
        observaciones: `Importado de archivo ${fileFileName || 'vCard/CSV'}`
      }));

      await onImportLeads(newLeads);
      setSuccessToast(`✓ ${newLeads.length} contactos del archivo importados a "${targetTab}".`);
      setParsedFileContacts([]);
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
      alert('Error importando contactos desde archivo.');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

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
          maxWidth: '560px',
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
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 3px 8px rgba(2, 132, 199, 0.25)',
                flexShrink: 0
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <polyline points="17 11 19 13 23 9"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isDark ? '#FFFFFF' : '#002244' }}>
                Importar Contactos a Leads
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                Google Contacts, Agenda del Celular o archivo vCard de iPhone.
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

        {/* Destination Tab Selector */}
        <div
          style={{
            padding: '10px 16px',
            background: isDark ? '#111827' : '#F1F5F9',
            borderBottom: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>
            Pestaña de destino:
          </span>
          <select
            value={targetTab}
            onChange={(e) => setTargetTab(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
              background: isDark ? '#1E293B' : '#FFFFFF',
              color: isDark ? '#60A5FA' : '#004D99',
              fontSize: '0.78rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {sheetTabs.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Channel Navigation */}
        <div
          style={{
            display: 'flex',
            padding: '8px 16px 0',
            gap: '4px',
            borderBottom: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0',
            background: isDark ? '#0F172A' : '#FFFFFF'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveChannel('google')}
            style={{
              flex: 1,
              padding: '8px 10px',
              border: 'none',
              borderBottom: activeChannel === 'google' ? '2.5px solid #0284C7' : '2.5px solid transparent',
              background: 'transparent',
              color: activeChannel === 'google' ? (isDark ? '#60A5FA' : '#004D99') : (isDark ? '#94A3B8' : '#64748B'),
              fontWeight: activeChannel === 'google' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>Google Contacts ({googleContacts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChannel('phone_native')}
            style={{
              flex: 1,
              padding: '8px 10px',
              border: 'none',
              borderBottom: activeChannel === 'phone_native' ? '2.5px solid #0284C7' : '2.5px solid transparent',
              background: 'transparent',
              color: activeChannel === 'phone_native' ? (isDark ? '#60A5FA' : '#004D99') : (isDark ? '#94A3B8' : '#64748B'),
              fontWeight: activeChannel === 'phone_native' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>Celular / Móvil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChannel('iphone_file')}
            style={{
              flex: 1,
              padding: '8px 10px',
              border: 'none',
              borderBottom: activeChannel === 'iphone_file' ? '2.5px solid #0284C7' : '2.5px solid transparent',
              background: 'transparent',
              color: activeChannel === 'iphone_file' ? (isDark ? '#60A5FA' : '#004D99') : (isDark ? '#94A3B8' : '#64748B'),
              fontWeight: activeChannel === 'iphone_file' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>iPhone / vCard (.vcf)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
          {/* CHANNEL 1: GOOGLE CONTACTS */}
          {activeChannel === 'google' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Buscar contacto por nombre o celular..."
                  value={googleSearchQuery}
                  onChange={(e) => setGoogleSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    background: isDark ? '#1E293B' : '#F8FAFC',
                    color: isDark ? '#F1F5F9' : '#0F172A',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={loadGoogleContacts}
                  disabled={isLoadingGoogle}
                  style={{
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                    background: isDark ? '#1E293B' : '#FFFFFF',
                    color: isDark ? '#60A5FA' : '#004D99',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Recargar desde Google"
                >
                  <span style={{ display: 'inline-flex', animation: isLoadingGoogle ? 'spin 1s linear infinite' : 'none' }}>
                    🔄
                  </span>
                  <span>Recargar</span>
                </button>
              </div>

              {/* Select All Toggle */}
              {filteredGoogleContacts.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                  <button
                    type="button"
                    onClick={handleSelectAllGoogle}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: isDark ? '#60A5FA' : '#004D99',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {selectedGooglePhones.size === filteredGoogleContacts.length ? 'Deseleccionar todos' : 'Seleccionar todos los visibles'}
                  </button>
                  <span style={{ fontSize: '0.74rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                    {selectedGooglePhones.size} de {filteredGoogleContacts.length} seleccionados
                  </span>
                </div>
              )}

              {/* Contacts List */}
              <div
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0',
                  borderRadius: '10px',
                  background: isDark ? '#0B0F19' : '#F8FAFC',
                  padding: '4px'
                }}
              >
                {filteredGoogleContacts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 10px', color: '#94A3B8', fontSize: '0.8rem' }}>
                    {isLoadingGoogle ? 'Cargando contactos de Google...' : 'No se encontraron contactos en tu cuenta de Google.'}
                  </div>
                ) : (
                  filteredGoogleContacts.map((c) => {
                    const isSelected = selectedGooglePhones.has(c.phoneNormalized);
                    return (
                      <div
                        key={`${c.resourceName}_${c.phoneNormalized}`}
                        onClick={() => toggleGoogleContact(c.phoneNormalized)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: isSelected
                            ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF')
                            : 'transparent',
                          transition: 'background-color 0.1s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleGoogleContact(c.phoneNormalized)}
                            style={{ cursor: 'pointer', accentColor: '#004D99' }}
                          />
                          <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#F1F5F9' : '#1E293B', display: 'block' }}>
                              {c.name}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#64748B', fontFamily: 'monospace' }}>
                              {c.phoneRaw}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <span style={{ fontSize: '0.7rem', color: '#004D99', fontWeight: 800 }}>✓</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Submit Google Import */}
              <button
                type="button"
                onClick={handleImportSelectedGoogle}
                disabled={isImporting || selectedGooglePhones.size === 0}
                style={{
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
                  transition: 'all 0.15s ease',
                  opacity: selectedGooglePhones.size === 0 ? 0.6 : 1
                }}
              >
                {isImporting ? 'Importando...' : `Importar ${selectedGooglePhones.size} contactos a "${targetTab}"`}
              </button>
            </div>
          )}

          {/* CHANNEL 2: PHONE NATIVE PICKER */}
          {activeChannel === 'phone_native' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center', padding: '10px 0' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: isDark ? '#1E293B' : '#E0F2FE',
                  color: '#0284C7',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
              </div>

              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>
                  Agenda Telefónica del Dispositivo
                </h4>
                <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                  Abre la libreta nativa de contactos de tu teléfono móvil Android para seleccionar números con un toque.
                </p>
              </div>

              {isNativeSupported ? (
                <button
                  type="button"
                  onClick={handleOpenNativePicker}
                  disabled={isImporting}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#0284C7',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                  </svg>
                  <span>Abrir Contactos de mi Celular</span>
                </button>
              ) : (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: isDark ? '#1E293B' : '#FEF3C7',
                    border: isDark ? '1px solid #334155' : '1px solid #FDE68A',
                    color: isDark ? '#FBBF24' : '#92400E',
                    fontSize: '0.78rem',
                    textAlign: 'left'
                  }}
                >
                  <strong>ℹ️ Nota para navegadores de escritorio e iOS:</strong>
                  <p style={{ margin: '4px 0 0' }}>
                    La API nativa de contactos está habilitada principalmente en <strong>Android (Chrome, Edge, Samsung Internet)</strong>. Para usuarios de <strong>iPhone / iOS</strong> o PC, utiliza la pestaña contigua <strong>"iPhone / vCard (.vcf)"</strong> o sincroniza vía <strong>Google Contacts</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CHANNEL 3: IPHONE / VCARD / CSV */}
          {activeChannel === 'iphone_file' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* How it works for iPhone */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: isDark ? '#1E293B' : '#EFF6FF',
                  border: isDark ? '1px solid #334155' : '1px solid #DBEAFE',
                  fontSize: '0.76rem',
                  color: isDark ? '#93C5FD' : '#1E40AF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <strong>📱 ¿Cómo exportar tus contactos desde un iPhone en 10 segundos?</strong>
                <ol style={{ margin: '4px 0 0', paddingLeft: '18px', lineHeight: 1.5 }}>
                  <li>Abre la app <strong>Contactos</strong> en tu iPhone.</li>
                  <li>Toca con dos dedos o mantén presionado para <strong>Seleccionar contactos</strong> (o pulsa Listas &gt; Todos los contactos).</li>
                  <li>Pulsa <strong>Compartir</strong> &gt; <strong>Guardar en Archivos</strong> (se exporta como archivo .vcf).</li>
                  <li>Sube ese archivo aquí abajo y se crearán los leads al instante.</li>
                </ol>
              </div>

              {/* File input trigger */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".vcf,.csv,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #0284C7',
                  borderRadius: '12px',
                  padding: '20px 14px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: isDark ? '#111827' : '#F0F9FF',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>📄</div>
                <strong style={{ fontSize: '0.85rem', color: isDark ? '#F8FAFC' : '#0369A1', display: 'block' }}>
                  {fileFileName ? `Archivo cargado: ${fileFileName}` : 'Pulsa aquí para subir tu archivo .vcf o .csv'}
                </strong>
                <span style={{ fontSize: '0.74rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                  Soporta archivos vCard (.vcf) de iPhone, iCloud, Android y hojas CSV
                </span>
              </div>

              {fileError && (
                <div style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 600 }}>
                  {fileError}
                </div>
              )}

              {parsedFileContacts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10B981' }}>
                      ✓ {parsedFileContacts.length} contactos detectados
                    </span>
                  </div>

                  <div
                    style={{
                      maxHeight: '130px',
                      overflowY: 'auto',
                      border: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0',
                      borderRadius: '8px',
                      background: isDark ? '#0B0F19' : '#FFFFFF',
                      padding: '4px'
                    }}
                  >
                    {parsedFileContacts.slice(0, 50).map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '0.75rem' }}>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                        <span style={{ fontFamily: 'monospace', color: isDark ? '#94A3B8' : '#64748B' }}>{c.phone}</span>
                      </div>
                    ))}
                    {parsedFileContacts.length > 50 && (
                      <div style={{ textAlign: 'center', padding: '4px', fontSize: '0.72rem', color: '#94A3B8' }}>
                        ... y {parsedFileContacts.length - 50} más
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleImportFromFile}
                    disabled={isImporting}
                    style={{
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
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    {isImporting ? 'Importando...' : `Importar ${parsedFileContacts.length} contactos a "${targetTab}"`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Success Toast */}
          {successToast && (
            <div
              style={{
                marginTop: '10px',
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
              {successToast}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
