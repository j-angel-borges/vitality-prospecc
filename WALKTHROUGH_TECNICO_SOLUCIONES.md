# Walkthrough Técnico: Arquitectura, Sincronización Google OAuth y Resiliencia en Vitality CRM

**Proyecto:** Vitality CRM & Prospecting Suite (`vitality-prospecc`)  
**Fecha:** 2026-10-25  
**Autor:** Antigravity AI  

---

## 1. Resumen Ejecutivo

Durante el ciclo de desarrollo continuo y estabilización de la plataforma web de prospección y CRM, se identificaron y resolvieron múltiples desafíos críticos de persistencia, sincronización con el ecosistema de Google Cloud / Workspace, seguridad de roles (RBAC) y experiencia de usuario (resiliencia de borradores).

Este documento detalla la arquitectura, el diagnóstico de cada error, la causa raíz encontrada y el patrón de código exacto utilizado para resolverlos, de modo que sirva como guía de referencia reproducible para otras versiones y aplicaciones satélites del ecosistema.

---

## 2. Mapa de Problemas Resueltos y Soluciones

```mermaid
flowchart TD
    subgraph "Autenticación & Google OAuth"
        A[Sesión Firebase Auth] --> B[GoogleAuthProvider con Scopes Extendidos]
        B -->|People API| C[Lectura Contactos: contacts.readonly]
        B -->|Calendar API v3| D[Lectura/Escritura: calendar.events & calendar.readonly]
        B -->|Parametrización| E["prompt: consent select_account & access_type: offline"]
    end

    subgraph "Gestión de Tokens & Error 401"
        F[Access Token en LocalStorage] --> G{¿Token Válido?}
        G -->|401 UNAUTHENTICATED| H[Purga de Cache & Disparo de Re-autenticación]
        G -->|200 OK| I[Renderizado de Eventos y Contactos]
    end

    subgraph "Seguridad & RBAC"
        J[Login de Usuario] --> K{Email del Usuario}
        K -->|mipropiadinastia@gmail.com| L[SuperAdmin: Vista Global ALL + Acceso Total]
        K -->|jangelborges@gmail.com| M[Asesor: Jose Angel - Solo leads asignados]
        K -->|r.olaizola@gmail.com| N[Asesora: Ricfel - Solo leads asignados]
    end

    subgraph "Resiliencia de Campañas"
        O[Edición de Campaña en TickToolModal] --> P[Auto-save reactivo en Background]
        P --> Q[Persistencia en LocalStorage]
        Q -->|Cambio de pestaña o recarga| R[Restauración automática + Botón Descartar]
        Q -->|Campaña encolada con éxito| S[Limpieza de Borrador]
    end
```

---

## 3. Desglose Técnico Detallado por Componente

### 3.1. Google OAuth: Configuración Multi-Scope y Prompt Forzado
- **Problema previo:** Al integrar nuevas APIs de Google (People API y Google Calendar), el token de acceso inicial emitido por Firebase solo poseía los scopes básicos de perfil (`userinfo.email`, `userinfo.profile`). Como resultado, las llamadas a los endpoints REST fallaban con `403 ACCESS_TOKEN_SCOPE_INSUFFICIENT` o `401 UNAUTHENTICATED`.
- **Causa Raíz:** Firebase Auth por defecto reutiliza credenciales previas de sesión en caché a menos que se le ordene explícitamente re-consentir los nuevos scopes. En Google Cloud, la API de Calendar debe habilitarse bajo el identificador exacto `calendar-json.googleapis.com`.
- **Implementación en [`authService.ts`](file:///D:/1_jose_angel/1_GitHub/Vitality/vitality-prospecc/src/services/authService.ts):**

```typescript
export function createGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  // Permisos de Google People API
  provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
  // Permisos de Google Calendar v3
  provider.addScope('https://www.googleapis.com/auth/calendar.events');
  provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
  provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
  provider.addScope('https://www.googleapis.com/auth/userinfo.email');
  
  // Forzar diálogo de consentimiento para grantear los nuevos scopes y permitir refresh
  provider.setCustomParameters({
    prompt: 'consent select_account',
    access_type: 'offline'
  });
  return provider;
}
```

---

### 3.2. Resolución Definitiva del Error 401 en Google Calendar API
- **Problema previo:** El calendario se quedaba pegado o arrojaba un cartel rojo: `Google Calendar API (401): {"error": {"code": 401, "message": "Request had invalid authentication credentials"}}`.
- **Causa Raíz:** 
  1. El usuario tenía un token guardado en `localStorage` proveniente de un inicio de sesión previo a la adición del scope de calendario.
  2. Los access tokens de Google OAuth expiran tras 3600 segundos (1 hora).
  3. El frontend enviaba el Bearer token vencido sin interceptar el código de error HTTP ni proveer un flujo de renovación amigable.
- **Solución implementada:**
  1. **Sanitización del error en [`calendarService.ts`](file:///D:/1_jose_angel/1_GitHub/Vitality/vitality-prospecc/src/services/calendarService.ts):** Se interceptan los códigos `401` y `403` para retornar mensajes claros y no volcar JSONs crudos que rompen la interfaz.
  2. **Auto-limpieza y botón de reconexión directa en [`VitalityCalendarView.tsx`](file:///D:/1_jose_angel/1_GitHub/Vitality/vitality-prospecc/src/components/VitalityCalendarView.tsx):**
     - Si la API responde con 401 o `UNAUTHENTICATED`, se ejecuta inmediatamente:
       ```typescript
       localStorage.removeItem('vitality_google_access_token_v2');
       ```
     - La vista muestra un banner con el botón **"Conectar Google Calendar"**, permitiendo re-autenticar sin tener que salir ni perder el contexto de la aplicación.
  3. **Comunicación reactiva mediante eventos personalizados:**
     - En [`VitalityAdmin.tsx`](file:///D:/1_jose_angel/1_GitHub/Vitality/vitality-prospecc/src/components/VitalityAdmin.tsx), al completar `handleGoogleLogin()`, se despacha:
       ```typescript
       window.dispatchEvent(new Event('vitality_google_token_updated'));
       ```
     - En [`VitalityCalendarView.tsx`](file:///D:/1_jose_angel/1_GitHub/Vitality/vitality-prospecc/src/components/VitalityCalendarView.tsx), un `useEffect` escucha este evento y re-ejecuta `loadEvents()`, cargando los eventos en pantalla al instante.

---

### 3.3. Cruce Inteligente de Contactos (Google Contacts -> CRM)
- **Regla de Negocio:**
  - Los leads del CRM que no estén en Google Contacts **deben mantenerse** y no eliminarse bajo ninguna circunstancia.
  - Para aquellos contactos que **sí coincidan** mediante el número de celular normalizado (formato internacional +51 o local de 9 dígitos), el nombre registrado en la agenda de Google debe sincronizarse automáticamente hacia el CRM y persistirse en Firestore (`saveCloudLead`).
- **Normalización de Teléfonos en [`contactsService.ts`](file:///D:/1_jose_angel/1_GitHub/Vitality/vitality-prospecc/src/services/contactsService.ts):**
  - Remoción de caracteres no numéricos, validación de prefijos `+51` y coincidencia exacta por clave única en un `Map<string, GoogleContact>`.

---

### 3.4. Control de Acceso Basado en Roles (RBAC Estricto)
- **Requisito de privacidad:**
  - Cuenta SuperAdmin: `mipropiadinastia@gmail.com` -> Visualización completa de todas las pestañas, selector de asesores (`ALL`), gestión global y exportaciones completas.
  - Cuenta Asesor 1: `jangelborges@gmail.com` -> Asesor Jose Angel; solo ve sus prospectos asignados.
  - Cuenta Asesor 2: `r.olaizola@gmail.com` -> Asesora Ricfel; solo ve sus prospectos asignados y pestaña por defecto `Mod Avcn (R)`.
- **Implementación en [`VitalityAdmin.tsx`](file:///D:/1_jose_angel/1_GitHub/Vitality/vitality-prospecc/src/components/VitalityAdmin.tsx):**
  - En el callback `onAuthStateChanged`, se evalúa el perfil del usuario autenticado contra la colección `crm_users`.
  - La interfaz oculta selectores no autorizados y aplica un filtro `selectedRep` inmutable en el cliente cuando el usuario no es superadmin.

---

### 3.5. Vista Interactiva de Google Calendar (7:00 AM a 9:00 PM)
- **Funcionalidades en [`VitalityCalendarView.tsx`](file:///D:/1_jose_angel/1_GitHub/Vitality/vitality-prospecc/src/components/VitalityCalendarView.tsx):**
  - Grilla responsiva de semana completa (Lunes a Domingo).
  - **Drag & Drop:** Posicionamiento por bloques con cálculo automático de minutos y horas mediante `snap` de 15 minutos. Al soltar, envía `PATCH` a `https://www.googleapis.com/calendar/v3/calendars/primary/events/{id}`.
  - **Redimensionamiento inferior (Resize Handle):** Permite arrastrar hacia arriba o abajo para alargar/acortar la duración del evento.
  - **Modal "+ Agendar Cita":** Permite vincular cualquier lead del CRM directamente al título y descripción del evento en Google Calendar.

---

### 3.6. Sistema de Auto-Guardado y Resiliencia en Campañas WhatsApp
- **Problema previo:** Al configurar una campaña en [`TickToolModal.tsx`](file:///D:/1_jose_angel/1_GitHub/Vitality/vitality-prospecc/src/components/TickToolModal.tsx) (selección de audiencia, redacción de copy, adjuntos, follow-ups con jitter anti-baneo), si el usuario cambiaba de vista a `Spreadsheet` o cerraba el modal, se perdía todo el progreso.
- **Implementación de Borrador Resiliente:**
  - Constante de persistencia: `LS_CAMPAIGN_DRAFT = 'vitality_campaign_draft_v1'`.
  - Al montar el componente, se leen los estados guardados (`useMemo` + inicializadores perezosos de `useState`).
  - `useEffect` en background que guarda el estado de la campaña en `localStorage` ante cualquier cambio en el texto, paso del wizard, adjuntos o tiempos de delay.
  - **Protección contra sobreescritura accidental:** Se implementó una referencia `isInitialMount = useRef(true)` en el efecto de sincronización de pestañas para evitar que los IDs seleccionados previamente en el borrador se reinicien al abrir el componente.
  - Al crearse exitosamente la campaña en Firestore, se ejecuta `localStorage.removeItem(LS_CAMPAIGN_DRAFT)`.

---

## 4. Archivos Modificados y Creados

| Archivo | Tipo | Propósito |
| :--- | :--- | :--- |
| [`src/services/calendarService.ts`](file:///D:/1_jose_angel/1_GitHub/Vitality/vitality-prospecc/src/services/calendarService.ts) | Creado | Comunicación con Google Calendar API v3 (Fetch, Create, Patch, Delete y caché local). |
| [`src/components/VitalityCalendarView.tsx`](file:///D:/1_jose_angel/1_GitHub/Vitality/vitality-prospecc/src/components/VitalityCalendarView.tsx) | Creado | Componente de grilla interactiva semanal con drag & drop, resize y auto-recuperación de token. |
| [`src/services/authService.ts`](file:///D:/1_jose_angel/1_GitHub/Vitality/vitality-prospecc/src/services/authService.ts) | Modificado | Inclusión de scopes de Calendar, People API, token cache v2 y soporte RBAC para SuperAdmin y Asesores. |
| [`src/components/VitalityAdmin.tsx`](file:///D:/1_jose_angel/1_GitHub/Vitality/vitality-prospecc/src/components/VitalityAdmin.tsx) | Modificado | Integración de 4ta vista (`calendar`), despacho de evento de token, RBAC estricto y tooltips concisos. |
| [`src/components/TickToolModal.tsx`](file:///D:/1_jose_angel/1_GitHub/Vitality/vitality-prospecc/src/components/TickToolModal.tsx) | Modificado | Auto-guardado en background de borradores, restauración de estado y banner de descarte. |

---

## 5. Checklist para Replicar en Otras Aplicaciones

1. **Habilitación en GCP Console:**
   - Habilitar `calendar-json.googleapis.com` (Google Calendar API) y `people.googleapis.com` (Google People API).
   - En la pantalla de consentimiento OAuth, autorizar los scopes:
     - `https://www.googleapis.com/auth/calendar.events`
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/contacts.readonly`
2. **Forzar consentimiento offline:** En el proveedor de Google Auth de Firebase, configurar siempre `prompt: 'consent select_account'` para garantizar la entrega del `accessToken` con los permisos necesarios.
3. **Manejar la caducidad del token (1 hora):** Nunca asumir que el token en `localStorage` es eterno; capturar el código `401` y proveer un botón directo de renovación en el componente visual que consume el servicio.
4. **Respetar la integridad de la base de datos:** Al implementar listeners de sincronización masiva o recarga, las mutaciones a colecciones en Firestore (`leads`) deben ejecutarse de manera atómica o por ID específico, nunca mediante sobreescritura de la colección completa.
