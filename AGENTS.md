# 👑 Vitality — Directivas Maestras de Negocio y Reglas para Agentes (AGY)

> **Documento Canónico SSOT (Single Source of Truth):**  
> Cualquier agente o sesión de Antigravity CLI (`agy`) que opere en este repositorio (sea en macOS, Windows o Linux) DEBE leer y aplicar estas directivas como su fuente de verdad técnica, comercial y operativa.

---

## 🚨 REGLA CERO: AISLAMIENTO TOTAL — ESTO ES EXCLUSIVAMENTE VITALITY
* **PROHIBICIÓN ESTRICTA:** Queda terminantemente prohibido recomendar, importar, mezclar o hacer referencia a conceptos, sistemas, repositorios o marcas de **QUARZ** o **ZENTRY** en este entorno.
* **ENTIDAD:** Distribución Oficial Autorizada de **Royal Prestige / Vitality**.
* Todo el código, copy, plantillas de mensajes, CRM y herramientas asociadas pertenecen única y exclusivamente al ecosistema de **Vitality y Royal Prestige**.

---

## 1. 👥 Actores Reales y Roles del Negocio
* **Directora Líder & Distribuidora:** **Ricfel** (Madre de José Ángel Borges).
* **Director Comercial y de Sistemas:** **José Ángel Borges**.
* **Aliada Estratégica:** **Angie Yovera** (Red de contactos de corredores de seguros para reclutamiento comercial).
* **Regla Anti-Alucinación:** NUNCA confundir a Angie Yovera con la madre de José Ángel (la madre y Directora Líder es **Ricfel**).

---

## 2. 💼 Modelo de Negocio y Finanzas
* **Sector:** Salud familiar, nutrición preventiva, alta cocina y venta directa de alta gama.
* **Ticket Promedio:** ~S/ 7,000 por cliente.
* **Márgenes:** 35% en compras financiadas y 50% en compras al contado.
* **Línea de Producto:** Utensilios de acero grado quirúrgico 316L (5 capas, aro silicromático de sello al vacío, válvula *Ready Temp*), sistemas de purificación de agua y extracción de nutrientes.
* **Metodología de Venta:** Demostración culinaria experiencial en casa ("Ver para Creer", prueba de bicarbonato eliminando contaminantes de teflón, níquel y aluminio).
* **Línea de Reclutamiento:** Jóvenes (18-25 años en San Borja / Lima Metropolitana) orientados a formación ejecutiva, comisiones de alto impacto y liderazgo.

---

## 3. 🛠️ Suite de Herramientas Asociadas de Vitality
El ecosistema digital de Vitality se compone de:

1. **Vitality Prospecc & CRM (`vitality-prospecc`):**
   - Portal web PWA para captura de leads en eventos (Expo Maternidad, ferias, referidos).
   - CRM en tiempo real con segmentación por asesor.
   - Módulo interactivo de Google Calendar para agendar demos de cocina en casa.
2. **Cotizador Comercial de Royal Prestige:**
   - Herramienta para cálculo de presupuestos, financiamiento, cuotas mensuales, combos y sets de cocina para clientes en demostración.
3. **Vitality WS Dispatcher (`extensions/vitality-ws-dispatcher`):**
   - Extensión de Chrome (Manifest V3) para automatizar seguimientos en WhatsApp Web sin marcas de agua, con jitter humano anti-baneo (45s - 110s) y auto-parada ante respuestas de prospectos.

---

## 4. ☁️ Infraestructura GCP y Firebase

### 4.1 Identificadores de Proyectos Canónicos
| Proyecto ID | Nombre en Consola | Propósito / URL |
| :--- | :--- | :--- |
| **`studio-4949838222-b0ffc`** | Vitality-prospec | **Hosting Principal & Prospección:** `https://vitality-prospecc.web.app` |
| **`studio-2768936384-2ae9c`** | Vitality-crm | Base de datos CRM y módulo comercial complementario. |

### 4.2 Usuarios y Permisos en GCP / IAM
- **`mipropiadinastia@gmail.com`**: Propietario (Owner) y SuperAdmin técnico de ambos proyectos.
- **`r.olaizola@gmail.com`**: Editor y Administrador de Firebase (`roles/editor`, `roles/firebase.admin`) con permisos completos de desarrollo y despliegue desde Mac.
- **`jangelborges@gmail.com`**: Asesor comercial y operador en plataforma.

---

## 5. 🔐 Matriz de Seguridad y Roles en la Aplicación (RBAC)

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

## 6. 🛠️ Protocolo Operativo y Comandos Estándar

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

## 7. 🛡️ Guardarraíles Inviolables para Agentes

1. **Aislamiento Total de Marca:** Nunca sugerir, usar ni mezclar términos, código ni plantillas de Zentry o Quarz.
2. **Preservación de Datos:** NUNCA sobrescribas ni borres leads o colecciones de Firestore sin filtros exactos. Toda modificación a la estructura debe mantener compatibilidad hacia atrás.
3. **Microcopy Conciso:** Todo botón con solo icono o forma SVG debe tener un atributo `title` descriptivo de **máximo 3 palabras**.
4. **Aislamiento por Correo:** No relajes las reglas de RBAC; los asesores solo ven sus propios leads.
5. **Historial Técnico:** Ante dudas sobre el funcionamiento de Google Calendar, el despachador de WhatsApp o los errores corregidos anteriormente, consulta obligatoriamente [WALKTHROUGH_TECNICO_SOLUCIONES.md](./WALKTHROUGH_TECNICO_SOLUCIONES.md).
