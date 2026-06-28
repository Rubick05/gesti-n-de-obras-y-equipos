import { Project, Worker, Task, Tool, Loan, ActivityLog, AppUser, Expense } from '../types';

// ── INITIAL USERS ─────────────────────────────────────────────────────────────
export const INITIAL_USERS: AppUser[] = [
  {
    id: 'u-admin-1',
    name: 'Admin Principal',
    email: 'admin@vanguardia.com',
    password: 'admin123',
    role: 'admin',
    avatarColor: '#ea580c',
  },
  {
    id: 'u-w1',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@constructora-vanguardia.com',
    password: 'carlos123',
    role: 'worker',
    workerId: 'w1',
    avatarColor: '#0284c7',
  },
  {
    id: 'u-w2',
    name: 'Ana Ríos',
    email: 'ana.rios@constructora-vanguardia.com',
    password: 'ana123',
    role: 'worker',
    workerId: 'w2',
    avatarColor: '#7c3aed',
  },
  {
    id: 'u-w3',
    name: 'Pedro Gómez',
    email: 'pedro.gomez@constructora-vanguardia.com',
    password: 'pedro123',
    role: 'worker',
    workerId: 'w3',
    avatarColor: '#059669',
  },
  {
    id: 'u-w4',
    name: 'Sofía Peralta',
    email: 'sofia.peralta@constructora-vanguardia.com',
    password: 'sofia123',
    role: 'worker',
    workerId: 'w4',
    avatarColor: '#db2777',
  },
];

// ── INITIAL PROJECTS ──────────────────────────────────────────────────────────
export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Torre Vanguardia Residencial',
    code: 'TVR-04',
    location: 'Av. Balboa y Calle 53, Obarrio',
    startDate: '2026-02-15',
    endDate: '2027-08-30',
    budget: 3500000,
    description: 'Construcción de torre de condominios residenciales de 15 niveles, que incluye estacionamiento subterráneo de 3 niveles, área social con piscina, gimnasio y acabados de lujo.',
    status: 'en_progreso'
  },
  {
    id: 'p2',
    name: 'Bulevar Comercial Los Olivos',
    code: 'BCL-12',
    location: 'Vía España, frente a Parque España',
    startDate: '2026-07-01',
    endDate: '2027-03-15',
    budget: 1200000,
    description: 'Desarrollo de un centro comercial abierto con 24 locales comerciales, amplias aceras peatonales, paisajismo urbano sostenible y un módulo de estacionamiento exterior.',
    status: 'planificacion'
  },
  {
    id: 'p3',
    name: 'Remodelación Ala Sur Hospital Metropolitano',
    code: 'RHS-22',
    location: 'Bella Vista, Calle Central',
    startDate: '2026-05-01',
    endDate: '2026-10-20',
    budget: 450000,
    description: 'Remodelación interna crítica de salas de urgencias, cuidados intensivos geriátricos, y cambio completo de ductos de ventilación y cableado estructurado según normativas de salud.',
    status: 'detenido'
  },
  {
    id: 'p4',
    name: 'Planta de Tratamiento Clayton',
    code: 'PTC-09',
    location: 'Clayton Este, Canal Lineal',
    startDate: '2025-01-10',
    endDate: '2026-05-30',
    budget: 2800000,
    description: 'Expansión de la planta potabilizadora e instalación de un sistema secundario de filtrado de carbón activado para mejorar la distribución de agua potable local.',
    status: 'completado'
  }
];

// ── INITIAL WORKERS ───────────────────────────────────────────────────────────
export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'w1',
    name: 'Carlos Mendoza',
    role: 'Supervisor de Obra',
    email: 'carlos.mendoza@constructora-vanguardia.com',
    phone: '+507 6231-4560',
    specialty: 'Concreto Estructural',
    status: 'activo'
  },
  {
    id: 'w2',
    name: 'Ana Ríos',
    role: 'Coordinadora de Seguridad',
    email: 'ana.rios@constructora-vanguardia.com',
    phone: '+507 6590-1122',
    specialty: 'SST (Salud y Seguridad en el Trabajo)',
    status: 'activo'
  },
  {
    id: 'w3',
    name: 'Pedro Gómez',
    role: 'Operario de Maquinaria Pesada',
    email: 'pedro.gomez@constructora-vanguardia.com',
    phone: '+507 6877-3344',
    specialty: 'Excavación y Movimiento de Tierra',
    status: 'activo'
  },
  {
    id: 'w4',
    name: 'Sofía Peralta',
    role: 'Electricista Principal',
    email: 'sofia.peralta@constructora-vanguardia.com',
    phone: '+507 6112-9988',
    specialty: 'Instalaciones de Alta Tensión',
    status: 'activo'
  },
  {
    id: 'w5',
    name: 'Juan Carrizo',
    role: 'Maestro de Albañilería y Acabados',
    email: 'juan.carrizo@constructora-vanguardia.com',
    phone: '+507 6445-5621',
    specialty: 'Acabados y Estructuras Livianas',
    status: 'activo'
  },
  {
    id: 'w6',
    name: 'Manuel Centella',
    role: 'Ayudante General',
    email: 'manuel.centella@constructora-vanguardia.com',
    phone: '+507 6001-2233',
    specialty: 'Tendido y Logística en Sitio',
    status: 'vacaciones'
  }
];

// ── INITIAL TASKS ─────────────────────────────────────────────────────────────
export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Vaciado de Losa de Concreto - Nivel 4',
    description: 'Vaciado continuo de losa del piso 4. Requiere camión mezclador, vibradores de hormigón y supervisión estructural directa durante el fraguado.',
    assignedWorkerId: 'w1',
    priority: 'alta',
    status: 'en_progreso',
    dueDate: '2026-06-20'
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Inspección de Arneses y Líneas de Vida',
    description: 'Auditoría obligatoria de todos los equipos de protección personal y anclajes en alturas para cumplir con regulaciones municipales y de seguridad vial.',
    assignedWorkerId: 'w2',
    priority: 'critica',
    status: 'completada',
    dueDate: '2026-06-12'
  },
  {
    id: 't3',
    projectId: 'p1',
    title: 'Canalización Eléctrica para Sótano 2',
    description: 'Instalar ductos de acero EMT y cajas de registro secundarias en la pared perimetral norte del sótano 2.',
    assignedWorkerId: 'w4',
    priority: 'media',
    status: 'pendiente',
    dueDate: '2026-06-25'
  },
  {
    id: 't4',
    projectId: 'p2',
    title: 'Nivelación y Estudio Topográfico de Terreno',
    description: 'Tomar cotas de referencia en los linderos del lote con la estación de topografía para validar alineación con la vía principal.',
    assignedWorkerId: 'w3',
    priority: 'media',
    status: 'completada',
    dueDate: '2026-06-08'
  },
  {
    id: 't5',
    projectId: 'p2',
    title: 'Excavación Principal para Fundación de Columnas',
    description: 'Uso de excavadora pesada para los canales primarios según el plano C-101. Mantener constante bombeo de lodo si se intercepta capa freática.',
    assignedWorkerId: 'w3',
    priority: 'alta',
    status: 'pendiente',
    dueDate: '2026-07-10'
  },
  {
    id: 't6',
    projectId: 'p3',
    title: 'Desmantelamiento de Ductos de Ventilamiento Viejos',
    description: 'Remoción de conductos de lámina galvanizada y aislamiento de asbesto deteriorado en el pasillo de pediatría. Requiere trajes estancos.',
    assignedWorkerId: 'w5',
    priority: 'alta',
    status: 'en_progreso',
    dueDate: '2026-06-28'
  },
  {
    id: 't7',
    projectId: 'p4',
    title: 'Prueba de Presión del Sistema de Filtrado',
    description: 'Someter las tuberías de carbono activo de 12 pulgadas a presión hidrostática de 150 PSI por 4 horas continuas para asegurar estanqueidad estructural.',
    assignedWorkerId: 'w1',
    priority: 'critica',
    status: 'completada',
    dueDate: '2026-05-24'
  }
];

// ── INITIAL TOOLS ─────────────────────────────────────────────────────────────
export const INITIAL_TOOLS: Tool[] = [
  {
    id: 'to1',
    code: 'CAT-320D',
    name: 'Excavadora Caterpillar 320D',
    category: 'maquinaria_pesada',
    status: 'en_uso',
    brand: 'Caterpillar',
    serialNumber: 'CAT0320DBJX83921',
    location: 'Sitio A-1 (Torre)',
    imageUrl: 'https://images.unsplash.com/photo-1579294800821-694d95e86143?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'to2',
    code: 'ROT-BOS8',
    name: 'Rotomartillo SDS-Max 1500W',
    category: 'herramienta_electrica',
    status: 'disponible',
    brand: 'Bosch',
    serialNumber: 'BSH-GBH845-9281',
    location: 'Bodega Central',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'to3',
    code: 'EST-TOP5',
    name: 'Estación Total Láser Profesional',
    category: 'medicion',
    status: 'disponible',
    brand: 'Topcon',
    serialNumber: 'TPC-ES50-77123',
    location: 'Bodega Central',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'to4',
    code: 'GEN-HON6',
    name: 'Generador Eléctrico Portátil 6.5kW',
    category: 'herramienta_electrica',
    status: 'en_uso',
    brand: 'Honda',
    serialNumber: 'HON-GX390-34821',
    location: 'Bodega Central',
    imageUrl: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'to5',
    code: 'ESM-DEW9',
    name: 'Esmeril Angular de 9 pulgadas',
    category: 'herramienta_electrica',
    status: 'disponible',
    brand: 'Dewalt',
    serialNumber: 'DEW-D28490-5511',
    location: 'Bodega Central',
    imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'to6',
    code: 'SIE-MAK1',
    name: 'Sierra de Mesa para Madera 10"',
    category: 'herramienta_electrica',
    status: 'mantenimiento',
    brand: 'Makita',
    serialNumber: 'MAK-MLT100-11029',
    location: 'Taller de Soporte',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'to7',
    code: 'NIV-MILK',
    name: 'Nivel Electrónico Digital de Precisión',
    category: 'medicion',
    status: 'disponible',
    brand: 'Milwaukee',
    serialNumber: 'MIL-NV60-12093',
    location: 'Bodega Central',
    imageUrl: 'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'to8',
    code: 'ROT-DEW2',
    name: 'Rotomartillo SDS-Plus Inalámbrico 20V',
    category: 'herramienta_electrica',
    status: 'disponible',
    brand: 'Dewalt',
    serialNumber: 'DEW-DCH133-88231',
    location: 'Bodega Central',
    imageUrl: 'https://images.unsplash.com/photo-1540104709530-768832cf1acb?w=500&auto=format&fit=crop&q=60'
  }
];

// ── INITIAL LOANS ─────────────────────────────────────────────────────────────
export const INITIAL_LOANS: Loan[] = [
  {
    id: 'l1',
    toolId: 'to1',
    workerId: 'w3',
    projectId: 'p1',
    borrowDate: '2026-06-10',
    expectedReturnDate: '2026-06-25',
    status: 'activo',
    notes: 'Excavación y movimiento de rocas en cimientos para Torre Vanguardia. Reportar cambios de presión hidráulica.'
  },
  {
    id: 'l2',
    toolId: 'to4',
    workerId: 'w4',
    projectId: 'p1',
    borrowDate: '2026-06-12',
    expectedReturnDate: '2026-06-16',
    status: 'activo',
    notes: 'Proveer suministro energía intermitente para soldadura y equipos de mano en Nivel 3.'
  },
  {
    id: 'l3',
    toolId: 'to2',
    workerId: 'w5',
    projectId: 'p3',
    borrowDate: '2026-06-01',
    expectedReturnDate: '2026-06-05',
    actualReturnDate: '2026-06-05',
    status: 'devuelto',
    notes: 'Demolición de base de soporte vieja en pediatría. Se devuelve limpio y lubricado.'
  }
];

// ── INITIAL EXPENSES ──────────────────────────────────────────────────────────
export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp1',
    projectId: 'p1',
    category: 'materiales',
    amount: 485000,
    description: 'Cemento Portland tipo I, varillas de acero 3/8" y 1/2", arena de río y piedra triturada para vaciado de losas niveles 1–4.',
    date: '2026-03-10',
    authorizedBy: 'Admin Principal'
  },
  {
    id: 'exp2',
    projectId: 'p1',
    category: 'mano_de_obra',
    amount: 320000,
    description: 'Pago de cuadrillas de concreto, carpintería de formaleta y personal de apoyo para los primeros 4 niveles.',
    date: '2026-04-01',
    authorizedBy: 'Admin Principal'
  },
  {
    id: 'exp3',
    projectId: 'p1',
    category: 'maquinaria',
    amount: 95000,
    description: 'Alquiler de grúa torre por 3 meses y mantenimiento preventivo de excavadora CAT-320D.',
    date: '2026-04-15',
    authorizedBy: 'Admin Principal'
  },
  {
    id: 'exp4',
    projectId: 'p1',
    category: 'subcontrato',
    amount: 210000,
    description: 'Subcontrato con empresa Instalaciones Eléctricas Panamá S.A. para cableado estructurado y tableros de distribución.',
    date: '2026-05-01',
    authorizedBy: 'Admin Principal'
  },
  {
    id: 'exp5',
    projectId: 'p2',
    category: 'materiales',
    amount: 85000,
    description: 'Materiales para estudio de suelos y adquisición de estacas topográficas.',
    date: '2026-06-05',
    authorizedBy: 'Admin Principal'
  },
  {
    id: 'exp6',
    projectId: 'p3',
    category: 'materiales',
    amount: 125000,
    description: 'Adquisición de ductos HVAC de acero inoxidable, aislamiento térmico clase A y cajas de registro.',
    date: '2026-05-10',
    authorizedBy: 'Admin Principal'
  },
  {
    id: 'exp7',
    projectId: 'p3',
    category: 'subcontrato',
    amount: 98000,
    description: 'Empresa especializada en remoción de asbesto con certificación internacional OSHA.',
    date: '2026-05-20',
    authorizedBy: 'Admin Principal'
  },
  {
    id: 'exp8',
    projectId: 'p4',
    category: 'materiales',
    amount: 740000,
    description: 'Tuberías de HDPE, válvulas de control y carbón activado granular para sistema de filtrado secundario.',
    date: '2025-03-15',
    authorizedBy: 'Admin Principal'
  },
  {
    id: 'exp9',
    projectId: 'p4',
    category: 'mano_de_obra',
    amount: 560000,
    description: 'Pago total de cuadrillas especializadas en instalación de sistemas de tratamiento de agua.',
    date: '2025-08-01',
    authorizedBy: 'Admin Principal'
  },
  {
    id: 'exp10',
    projectId: 'p4',
    category: 'administrativo',
    amount: 85000,
    description: 'Permisos ambientales, seguros de obra y gastos legales para extensión del contrato.',
    date: '2025-06-01',
    authorizedBy: 'Admin Principal'
  }
];

// ── INITIAL LOGS ──────────────────────────────────────────────────────────────
export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log1',
    timestamp: '2026-06-01T08:00:00Z',
    type: 'loan',
    action: 'Préstamo iniciado',
    entityName: 'Rotomartillo SDS-Max 1500W',
    details: 'Prestado a Juan Carrizo para el proyecto RHS-22 (Remodelación Ala Sur Hospital)'
  },
  {
    id: 'log2',
    timestamp: '2026-06-05T16:20:00Z',
    type: 'loan',
    action: 'Equipo devuelto',
    entityName: 'Rotomartillo SDS-Max 1500W',
    details: 'Devuelto por Juan Carrizo. Informa estado: Excelente.'
  },
  {
    id: 'log3',
    timestamp: '2026-06-10T07:45:00Z',
    type: 'loan',
    action: 'Préstamo iniciado',
    entityName: 'Excavadora Caterpillar 320D',
    details: 'Prestada a Pedro Gómez para el proyecto TVR-04 (Torre Vanguardia Residencial)'
  },
  {
    id: 'log4',
    timestamp: '2026-06-12T10:30:00Z',
    type: 'loan',
    action: 'Préstamo iniciado',
    entityName: 'Generador Eléctrico Portátil 6.5kW',
    details: 'Prestado a Sofía Peralta para el proyecto TVR-04 (Torre Vanguardia Residencial)'
  },
  {
    id: 'log5',
    timestamp: '2026-06-12T18:00:00Z',
    type: 'task',
    action: 'Tarea completada',
    entityName: 'Inspección de Arneses y Líneas de Vida',
    details: 'Completada y firmada digitalmente por Ana Ríos.'
  }
];
