# 🤖 Vitality Prospecc & CRM — Directivas Maestras para Agentes (AGY)

> **Documento de Contextualización Canónica (SSOT):**  
> Cualquier agente o sesión de Antigravity CLI (`agy`) que opere en este repositorio (sea en macOS, Windows o Linux) DEBE leer y aplicar estas directivas como su fuente de verdad técnica y operativa.

---

## 1. 📌 Identidad y Propósito del Proyecto
* **Nombre:** Vitality Prospecc & CRM Suite.
* **Propósito:** Plataforma web progresiva (PWA) de prospección comercial, gestión de leads y seguimiento automatizado de demostraciones para asesores de **Royal Prestige / Vitality**.
* **Stack Tecnológico:**
  - **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons.
  - **Backend / BaaS:** Google Firebase (Firebase Auth, Cloud Firestore, Firebase Hosting).
  - **Integraciones:** Google Calendar API v3 (agendamiento interactivo), Google People API (agenda de contactos).
  - **Extensión Asistente:** `extensions/vitality-ws-dispatcher` (Google Chrome Manifest V3 para WhatsApp Web).

---

## 2. ☁️ Infraestructura GCP y Firebase

### 2.1 Identificadores de Proyectos Canónicos
| Proyecto ID | Nombre en Consola | Propósito / URL |
| :--- | :--- | :--- |
| **`studio-4949838222-b0ffc`** | Vitality-prospec | **Hosting Principal & Prospección:** `https://vitality-prospecc.web.app` |
| **`studio-2768936384-2ae9c`** | Vitality-crm | Base de datos CRM y módulo comercial complementario. |

### 2.2 Usuarios e Identidades en GCP / IAM
- **`mipropiadinastia@gmail.com`**: Propietario (Owner) y SuperAdmin técnico de ambos proyectos.
- **`r.olaizola@gmail.com`**: Editor y Administrador de Firebase (`roles/editor`, `roles/firebase.admin`) con permisos completos de desarrollo y despliegue desde Mac.
- **`jangelborges@gmail.com`**: Asesor comercial y operador en plataforma.

---

## 3. 🔐 Matriz de Seguridad y Roles en la Aplicación (RBAC)

Al autenticarse mediante Google OAuth en la aplicación web, el sistema aplica segmentación estricta de datos según el email:

1. **SuperUsuario / Acceso Total (`mipropiadinastia@gmail.com`):**
   - Visualiza el 100% de los leads de todos los asesores y orígenes.
   - Métricas globales, auditoría y panel completo de administración (`/admin`).
2. **Asesora Ricfel (`r.olaizola@gmail.com`):**
   - **Filtro estricto:** Visualiza ÚNICAMENTE los leads asignados a Ricfel.
   - Oculta completamente los leads y gestiones de Jose Angel y otros asesores.
3. **Asesor Jose Angel (`jangelborges@gmail.com`):**
   - **Filtro estricto:** Visualiza ÚNICAMENTE los leads asignados a Jose Angel.
   - Oculta completamente los leads de Ricfel.

---

## 4. 🧩 Arquitectura de Componentes Clave

* **Panel Administrativo y Leads:** `src/components/VitalityAdmin.tsx`
  - Filtros por encargado/asesor, descarga de CSV con tooltip breve (máx 3 palabras), carga de gestiones y notas.
* **Calendario Google Interactivo:** `src/components/VitalityCalendarView.tsx`
  - Drag-and-drop y redimensionamiento de bloques de hora como en Google Calendar.
  - Persistencia de `google_access_token` en LocalStorage con purga y reactivación ante error `401 UNAUTHENTICATED`.
* **Despachador de Campañas & WhatsApp:** `src/components/TickToolModal.tsx`
  - Constructor de campañas con mensajes dinámicos, árbol de follow-ups y jitter anti-baneo (45s - 110s).
  - **Resiliencia de Borradores:** Guarda automáticamente el progreso en `localStorage` si el usuario cambia de vista o recarga, evitando pérdida de formularios.
  - Comunicación bidireccional con la extensión mediante `window.postMessage` emitiendo eventos duales (`Vitality_TICKTOOL_*` y `ZENTRY_TICKTOOL_*`).
* **Extensión de WhatsApp Web:** `extensions/vitality-ws-dispatcher/`
  - `content.js`: Inyecta el auto-envío por URL (`/send?phone=...&text=...`), raspador de agenda `#pane-side`, selector posicional del botón Enviar y detector de respuestas entrantes (Inbound Stop).
  - Cero marcas de agua.

---

## 5. 🛠️ Protocolo Operativo y Comandos Estándar

### Compilación y Verificación
```bash
# Instalar dependencias
npm install

# Compilar proyecto localmente
npm run build
```

### Despliegue en Producción (Firebase Hosting)
```bash
# Autenticarse si es la primera vez
firebase login

# Desplegar hosting en studio-4949838222-b0ffc
firebase deploy --only hosting
```

---

## 6. 🛡️ Guardarraíles y Reglas Inviolables para Agentes

1. **Preservación de Datos:** NUNCA sobrescribas ni borres leads o colecciones de Firestore sin filtros exactos. Toda modificación a la estructura debe mantener compatibilidad hacia atrás.
2. **Microcopy Conciso:** Todo botón con solo icono o forma SVG debe tener un atributo `title` descriptivo de **máximo 3 palabras**.
3. **Aislamiento por Correo:** No relajes las reglas de RBAC; los asesores solo ven sus propios leads.
4. **Historial Técnico:** Ante dudas sobre el funcionamiento de Google Calendar, el despachador de WhatsApp o los errores corregidos anteriormente, consulta obligatoriamente [WALKTHROUGH_TECNICO_SOLUCIONES.md](./WALKTHROUGH_TECNICO_SOLUCIONES.md).
