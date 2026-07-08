// ── Tutorial Steps Definition ─────────────────────────────────────────────
// Each tutorial has a list of steps. Each step targets a CSS selector and
// shows a tooltip with a description. The tutorial system will scroll and
// highlight the target element.

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface TutorialStep {
  /** CSS selector or element ID of the element to highlight */
  target: string;
  /** Title displayed in the tooltip */
  title: string;
  /** Description text in the tooltip */
  description: string;
  /** Where to place the tooltip relative to the highlighted element */
  position: TooltipPosition;
  /** If set, navigate to this view before showing the step */
  navigateTo?: string;
  /** If true, the spotlight is not shown (for intro/outro steps) */
  noSpotlight?: boolean;
  /** Action hint shown at the bottom (e.g. "Haz clic en el botón") */
  actionHint?: string;
}

export interface TutorialDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
  /** 'admin' | 'worker' | 'both' */
  role: 'admin' | 'worker' | 'both';
  steps: TutorialStep[];
}

export const TUTORIALS: TutorialDefinition[] = [
  // ── 1. Nueva Obra / Proyecto ──────────────────────────────────────────────
  {
    id: 'projects',
    title: 'Registrar Nueva Obra',
    description: 'Aprende a crear y gestionar proyectos de construcción',
    icon: '🏗️',
    estimatedMinutes: 3,
    role: 'admin',
    steps: [
      {
        target: 'body',
        title: '¡Bienvenido al tutorial de Obras!',
        description: 'Te guiaremos paso a paso para registrar una nueva obra en el sistema. Usa las flechas para navegar o presiona "Saltar" para cerrar el tutorial.',
        position: 'center',
        noSpotlight: true,
        navigateTo: 'projects',
      },
      {
        target: '#btn-nav-desktop-projects, #btn-nav-mobile-projects',
        title: 'Navegar a Obras y Proyectos',
        description: 'Primero, haz clic aquí en el menú lateral para ir a la sección de "Obras y Proyectos". Desde aquí puedes ver y gestionar todas tus obras.',
        position: 'right',
        navigateTo: 'projects',
        actionHint: 'Clic en "Obras y Proyectos" en el menú',
      },
      {
        target: '#btn-add-project',
        title: 'Agregar Nueva Obra',
        description: 'Este es el botón principal para crear una nueva obra. Al hacer clic, se abrirá un formulario con todos los campos necesarios.',
        position: 'bottom',
        navigateTo: 'projects',
        actionHint: 'Haz clic en "+ Nueva Obra"',
      },
      {
        target: '#project-form-name',
        title: 'Nombre de la Obra',
        description: 'Ingresa el nombre descriptivo de la obra o proyecto. Elige un nombre claro que identifique fácilmente el proyecto.',
        position: 'bottom',
        navigateTo: 'projects',
      },
      {
        target: '#project-form-code',
        title: 'Código del Proyecto',
        description: 'El código es un identificador único (ej. OBR-2024-001). Úsalo para referenciar rápidamente el proyecto en reportes y comunicaciones.',
        position: 'bottom',
        navigateTo: 'projects',
      },
      {
        target: '#project-form-location',
        title: 'Ubicación de la Obra',
        description: 'Ingresa la dirección o zona donde se realizará la obra. Puedes también adjuntar una foto de referencia más abajo.',
        position: 'bottom',
        navigateTo: 'projects',
      },
      {
        target: '#project-form-budget',
        title: 'Presupuesto Asignado',
        description: 'Define el presupuesto total de la obra. Este valor se usará para calcular el porcentaje de gasto y alertarte cuando se acerque al límite.',
        position: 'bottom',
        navigateTo: 'projects',
      },
      {
        target: '#project-form-dates',
        title: 'Fechas de Inicio y Fin',
        description: 'Establece las fechas de inicio y fin planificadas. El sistema calculará automáticamente el progreso temporal de la obra.',
        position: 'bottom',
        navigateTo: 'projects',
      },
      {
        target: '#project-form-image',
        title: 'Foto de Referencia (Opcional)',
        description: 'Puedes adjuntar una foto de la ubicación o planos del proyecto. Esto ayuda a identificar visualmente la obra en la lista de proyectos.',
        position: 'bottom',
        navigateTo: 'projects',
      },
      {
        target: '#project-form-submit',
        title: '¡Guardar la Obra!',
        description: 'Una vez llenos todos los campos, haz clic en "Guardar" para registrar la obra. Aparecerá en la lista de proyectos activos.',
        position: 'top',
        navigateTo: 'projects',
        actionHint: 'Haz clic en "Guardar Obra"',
      },
      {
        target: 'body',
        title: '¡Tutorial Completado! 🎉',
        description: 'Ya sabes cómo registrar una nueva obra. Recuerda que puedes actualizar su estado (En progreso, Detenido, Completado) en cualquier momento desde la tarjeta del proyecto.',
        position: 'center',
        noSpotlight: true,
      },
    ],
  },

  // ── 2. Nueva Área / Grupo de Trabajo ─────────────────────────────────────
  {
    id: 'groups',
    title: 'Crear Nueva Área de Trabajo',
    description: 'Organiza cuadrillas y grupos de trabajadores por proyecto',
    icon: '👷',
    estimatedMinutes: 2,
    role: 'admin',
    steps: [
      {
        target: 'body',
        title: 'Tutorial: Áreas de Trabajo',
        description: 'Las áreas de trabajo te permiten organizar equipos de trabajadores dentro de un proyecto. Cada área tiene un líder y varios miembros.',
        position: 'center',
        noSpotlight: true,
        navigateTo: 'projects',
      },
      {
        target: '#btn-nav-desktop-projects, #btn-nav-mobile-projects',
        title: 'Ir a Obras y Proyectos',
        description: 'Los grupos o áreas se crean desde dentro de un proyecto. Ve primero a la sección de "Obras y Proyectos".',
        position: 'right',
        navigateTo: 'projects',
      },
      {
        target: '.project-card-expand',
        title: 'Expandir un Proyecto',
        description: 'Haz clic en una tarjeta de proyecto para expandirla y ver sus detalles, incluyendo las áreas de trabajo asignadas.',
        position: 'bottom',
        navigateTo: 'projects',
        actionHint: 'Haz clic en una tarjeta de proyecto',
      },
      {
        target: '#btn-add-group',
        title: 'Crear Nueva Área',
        description: 'Dentro del proyecto expandido, encontrarás el botón para agregar una nueva área o cuadrilla de trabajo.',
        position: 'top',
        navigateTo: 'projects',
        actionHint: 'Haz clic en "+ Nueva Área"',
      },
      {
        target: '#group-form-name',
        title: 'Nombre del Área',
        description: 'Dale un nombre descriptivo al área (ej. "Cuadrilla Estructuras", "Equipo Eléctrico"). Esto facilitará la asignación de tareas.',
        position: 'bottom',
        navigateTo: 'projects',
      },
      {
        target: '#group-form-leader',
        title: 'Líder del Área',
        description: 'Selecciona el trabajador responsable de esta área. El líder coordina al equipo y es el punto de contacto principal.',
        position: 'bottom',
        navigateTo: 'projects',
      },
      {
        target: '#group-form-members',
        title: 'Miembros del Equipo',
        description: 'Selecciona los trabajadores que integran esta área. Puedes seleccionar múltiples trabajadores de la lista.',
        position: 'bottom',
        navigateTo: 'projects',
      },
      {
        target: 'body',
        title: '¡Área Creada! 🎉',
        description: 'El área de trabajo quedará asignada al proyecto. Podrás asignar tareas directamente a esta área desde la sección de "Tareas Pendientes".',
        position: 'center',
        noSpotlight: true,
      },
    ],
  },

  // ── 3. Registrar Trabajador ───────────────────────────────────────────────
  {
    id: 'team',
    title: 'Registrar Trabajador',
    description: 'Agrega un nuevo miembro al equipo de trabajo',
    icon: '👤',
    estimatedMinutes: 2,
    role: 'admin',
    steps: [
      {
        target: 'body',
        title: 'Tutorial: Registrar Trabajador',
        description: 'Aprende cómo agregar un nuevo trabajador al sistema para asignarle tareas, herramientas y rastrear su actividad.',
        position: 'center',
        noSpotlight: true,
        navigateTo: 'team',
      },
      {
        target: '#btn-nav-desktop-team, #btn-nav-mobile-team',
        title: 'Ir a Personal / Empleados',
        description: 'Navega a la sección de "Personal / Empleados" desde el menú lateral.',
        position: 'right',
        navigateTo: 'team',
        actionHint: 'Haz clic en "Personal / Empleados"',
      },
      {
        target: '#btn-add-worker',
        title: 'Agregar Nuevo Trabajador',
        description: 'Haz clic en este botón para abrir el formulario de registro de un nuevo trabajador en el equipo.',
        position: 'bottom',
        navigateTo: 'team',
        actionHint: 'Haz clic en "+ Nuevo Trabajador"',
      },
      {
        target: '#worker-form-name',
        title: 'Nombre Completo',
        description: 'Ingresa el nombre completo del trabajador. Este nombre aparecerá en tareas, reportes y el portal del trabajador.',
        position: 'bottom',
        navigateTo: 'team',
      },
      {
        target: '#worker-form-role',
        title: 'Puesto / Cargo',
        description: 'Define el puesto o cargo del trabajador (ej. Maestro de Obra, Electricista, Plomero). Esto ayuda a filtrar al personal por especialidad.',
        position: 'bottom',
        navigateTo: 'team',
      },
      {
        target: '#worker-form-contact',
        title: 'Información de Contacto',
        description: 'Ingresa el correo electrónico y teléfono del trabajador. El correo se puede usar para crear su acceso al portal del trabajador.',
        position: 'bottom',
        navigateTo: 'team',
      },
      {
        target: '#worker-form-specialty',
        title: 'Especialidad',
        description: 'Describe la especialidad técnica del trabajador. Por ejemplo: "Soldadura estructural", "Instalaciones hidráulicas", etc.',
        position: 'bottom',
        navigateTo: 'team',
      },
      {
        target: '#worker-form-submit',
        title: 'Guardar Trabajador',
        description: 'Haz clic en "Guardar" para registrar al trabajador. Quedará disponible para asignarle tareas, grupos y préstamos de herramientas.',
        position: 'top',
        navigateTo: 'team',
        actionHint: 'Haz clic en "Guardar Trabajador"',
      },
      {
        target: 'body',
        title: '¡Trabajador Registrado! 🎉',
        description: 'El trabajador ya aparece en la lista del equipo. Si necesitas darle acceso al portal del trabajador, ve a "Gestión de Usuarios" para crear su cuenta.',
        position: 'center',
        noSpotlight: true,
      },
    ],
  },

  // ── 4. Inventario en Bodega ───────────────────────────────────────────────
  {
    id: 'inventory',
    title: 'Inventario en Bodega',
    description: 'Gestiona herramientas, préstamos y devoluciones',
    icon: '🔧',
    estimatedMinutes: 3,
    role: 'admin',
    steps: [
      {
        target: 'body',
        title: 'Tutorial: Inventario en Bodega',
        description: 'El inventario te permite registrar herramientas y equipos, controlar préstamos a trabajadores y gestionar su estado de disponibilidad.',
        position: 'center',
        noSpotlight: true,
        navigateTo: 'inventory',
      },
      {
        target: '#btn-nav-desktop-inventory, #btn-nav-mobile-inventory',
        title: 'Ir a Inventario de Bodega',
        description: 'Navega a la sección de "Inventario de Bodega" desde el menú lateral.',
        position: 'right',
        navigateTo: 'inventory',
        actionHint: 'Haz clic en "Inventario de Bodega"',
      },
      {
        target: '#btn-add-tool',
        title: 'Agregar Herramienta',
        description: 'Usa este botón para registrar una nueva herramienta o equipo en el inventario de la bodega.',
        position: 'bottom',
        navigateTo: 'inventory',
        actionHint: 'Haz clic en "+ Nueva Herramienta"',
      },
      {
        target: '#tool-form-name',
        title: 'Nombre de la Herramienta',
        description: 'Ingresa el nombre de la herramienta o equipo (ej. "Taladro percutor", "Nivel láser", "Concretera").',
        position: 'bottom',
        navigateTo: 'inventory',
      },
      {
        target: '#tool-form-category',
        title: 'Categoría',
        description: 'Clasifica la herramienta por categoría: Maquinaria Pesada, Herramienta Eléctrica, Medición, Manual, Seguridad u Otros.',
        position: 'bottom',
        navigateTo: 'inventory',
      },
      {
        target: '#tool-form-code',
        title: 'Código y Marca',
        description: 'Asigna un código único a la herramienta y registra la marca. Esto facilita el control de inventario y la búsqueda rápida.',
        position: 'bottom',
        navigateTo: 'inventory',
      },
      {
        target: '.btn-borrow-tool',
        title: 'Registrar Préstamo',
        description: 'Al hacer clic en "Prestar" en cualquier herramienta disponible del catálogo, se abrirá el panel para registrar su asignación.',
        position: 'top',
        navigateTo: 'inventory',
        actionHint: 'Haz clic en "Prestar" en una herramienta disponible',
      },
      {
        target: '#checkout-form-panel',
        title: 'Formulario de Préstamo',
        description: 'Aquí seleccionas el trabajador responsable, el proyecto de destino y la fecha estimada de devolución del equipo.',
        position: 'left',
        navigateTo: 'inventory',
      },
      {
        target: 'body',
        title: '¡Todo Bajo Control! 🎉',
        description: 'Desde el inventario puedes ver el estado de cada herramienta (Disponible, En uso, En mantenimiento) y registrar las devoluciones cuando regresen a bodega.',
        position: 'center',
        noSpotlight: true,
      },
    ],
  },

  // ── 5. Presupuesto y Gastos ───────────────────────────────────────────────
  {
    id: 'budget',
    title: 'Presupuesto y Gastos',
    description: 'Registra y controla los gastos de cada proyecto',
    icon: '💰',
    estimatedMinutes: 2,
    role: 'admin',
    steps: [
      {
        target: 'body',
        title: 'Tutorial: Presupuesto y Gastos',
        description: 'Controla el presupuesto de cada obra registrando los gastos por categoría. El sistema calculará automáticamente el porcentaje consumido.',
        position: 'center',
        noSpotlight: true,
        navigateTo: 'budget',
      },
      {
        target: '#btn-nav-desktop-budget, #btn-nav-mobile-budget',
        title: 'Ir a Presupuesto y Gastos',
        description: 'Navega a la sección de "Presupuesto y Gastos" desde el menú. Esta sección es exclusiva para administradores.',
        position: 'right',
        navigateTo: 'budget',
        actionHint: 'Haz clic en "Presupuesto y Gastos"',
      },
      {
        target: '#budget-project-tabs',
        title: 'Seleccionar Proyecto',
        description: 'Haz clic en las pestañas para cambiar entre tus diferentes proyectos activos. Verás el presupuesto y porcentaje consumido de cada uno.',
        position: 'bottom',
        navigateTo: 'budget',
        actionHint: 'Haz clic en la pestaña de un proyecto',
      },
      {
        target: '#budget-summary-card',
        title: 'Resumen de Presupuesto',
        description: 'Aquí puedes ver el presupuesto total, el monto gastado y el saldo disponible. La barra de progreso cambia de color cuando el gasto supera el 80%.',
        position: 'bottom',
        navigateTo: 'budget',
      },
      {
        target: '#btn-add-expense',
        title: 'Agregar Nuevo Gasto',
        description: 'Haz clic para registrar un gasto. Puedes categorizarlo en: Materiales, Mano de Obra, Maquinaria, Subcontrato, Administrativo u Otro.',
        position: 'bottom',
        navigateTo: 'budget',
        actionHint: 'Haz clic en "+ Agregar Gasto"',
      },
      {
        target: '#expense-form-category',
        title: 'Categoría del Gasto',
        description: 'Clasifica el gasto para tener reportes detallados por tipo. Esto facilita el análisis y control de costos de la obra.',
        position: 'bottom',
        navigateTo: 'budget',
      },
      {
        target: '#input-expense-amount',
        title: 'Monto del Gasto',
        description: 'Ingresa el monto exacto del gasto. El sistema actualizará automáticamente el presupuesto consumido y el saldo disponible.',
        position: 'bottom',
        navigateTo: 'budget',
      },
      {
        target: 'body',
        title: '¡Gastos Bajo Control! 🎉',
        description: 'Todos los gastos quedan registrados con fecha y categoría. Puedes eliminar registros erróneos y ver el historial completo de la obra.',
        position: 'center',
        noSpotlight: true,
      },
    ],
  },

  // ── 6. Gestión de Usuarios ────────────────────────────────────────────────
  {
    id: 'users',
    title: 'Gestión de Usuarios',
    description: 'Administra las cuentas de acceso al sistema',
    icon: '🛡️',
    estimatedMinutes: 2,
    role: 'admin',
    steps: [
      {
        target: 'body',
        title: 'Tutorial: Gestión de Usuarios',
        description: 'Desde aquí puedes ver todos los usuarios del sistema, sus roles y los trabajadores vinculados a cada cuenta.',
        position: 'center',
        noSpotlight: true,
        navigateTo: 'users',
      },
      {
        target: '#btn-nav-desktop-users, #btn-nav-mobile-users',
        title: 'Ir a Gestión de Usuarios',
        description: 'Esta sección está disponible solo para administradores. Navega a "Gestión de Usuarios" desde el menú.',
        position: 'right',
        navigateTo: 'users',
        actionHint: 'Haz clic en "Gestión de Usuarios"',
      },
      {
        target: '#users-list-grid',
        title: 'Cuentas de Usuarios',
        description: 'Aquí verás todos los usuarios registrados con su nombre, correo y detalles. Puedes buscar y filtrar cuentas usando la barra superior.',
        position: 'bottom',
        navigateTo: 'users',
      },
      {
        target: '.user-role-badge',
        title: 'Roles de Acceso',
        description: 'Cada cuenta tiene un rol. El Administrador tiene acceso total, mientras que el Trabajador solo puede ver su portal asignado.',
        position: 'top',
        navigateTo: 'users',
      },
      {
        target: 'body',
        title: 'Para Crear Usuarios',
        description: 'Los nuevos usuarios se crean desde Supabase o mediante el proceso de registro. Esta vista permite consultar y gestionar los accesos existentes.',
        position: 'center',
        noSpotlight: true,
      },
    ],
  },

  // ── 7. Portal del Trabajador ──────────────────────────────────────────────
  {
    id: 'worker-portal',
    title: 'Cómo Usar el Portal del Trabajador',
    description: 'Guía completa para el portal de trabajadores',
    icon: '📋',
    estimatedMinutes: 3,
    role: 'worker',
    steps: [
      {
        target: 'body',
        title: '¡Bienvenido a tu Portal!',
        description: 'Este es tu espacio de trabajo. Aquí puedes ver tus tareas asignadas, actualizar su estado, consultar el inventario y gestionar tu perfil.',
        position: 'center',
        noSpotlight: true,
      },
      {
        target: '#worker-tab-tasks',
        title: 'Mis Tareas',
        description: 'La pestaña "Mis Tareas" muestra todas las tareas asignadas a ti. Están organizadas por estado: Pendientes, En Progreso y Completadas.',
        position: 'bottom',
        actionHint: 'Haz clic en "Mis Tareas"',
      },
      {
        target: '#worker-task-kanban',
        title: 'Tablero de Tareas',
        description: 'Las tareas aparecen en columnas según su estado. Puedes cambiar el estado de una tarea haciendo clic en el ícono circular a la izquierda.',
        position: 'top',
        actionHint: 'Haz clic en el ícono de estado para avanzar la tarea',
      },
      {
        target: '#worker-task-photo',
        title: 'Adjuntar Fotos como Evidencia',
        description: 'En cada tarea puedes adjuntar fotos como evidencia del trabajo realizado. Esto es útil para documentar avances e incidencias.',
        position: 'bottom',
      },
      {
        target: '#worker-tab-groups',
        title: 'Mis Grupos de Trabajo',
        description: 'En "Mis Grupos" verás los equipos o cuadrillas a los que perteneces, el líder del grupo y los demás miembros.',
        position: 'bottom',
        actionHint: 'Haz clic en "Mis Grupos"',
      },
      {
        target: '#worker-tab-inventory',
        title: 'Inventario de Bodega',
        description: 'Puedes consultar el inventario de herramientas disponibles y las que están actualmente prestadas. Es útil para coordinar con el administrador.',
        position: 'bottom',
        actionHint: 'Haz clic en "Inventario"',
      },
      {
        target: '#worker-tab-profile',
        title: 'Mi Perfil',
        description: 'Desde tu perfil puedes actualizar tu teléfono y especialidad. Esta información la ve el administrador al asignarte a proyectos.',
        position: 'bottom',
        actionHint: 'Haz clic en "Mi Perfil"',
      },
      {
        target: 'body',
        title: '¡Ya conoces tu Portal! 🎉',
        description: 'Recuerda mantener tus tareas actualizadas y adjuntar fotos de evidencia cuando completes trabajos. El equipo de administración podrá ver tu progreso en tiempo real.',
        position: 'center',
        noSpotlight: true,
      },
    ],
  },
];

/** Get tutorials available for a given role */
export function getTutorialsForRole(role: 'admin' | 'worker'): TutorialDefinition[] {
  return TUTORIALS.filter(t => t.role === 'both' || t.role === role);
}
