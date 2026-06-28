import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const isBrowser = typeof window !== 'undefined';
const isMockMode = isBrowser && (
  !supabaseUrl ||
  supabaseUrl.includes('tu-proyecto') ||
  supabaseUrl.includes('placeholder') ||
  !supabaseAnonKey ||
  supabaseAnonKey.includes('placeholder') ||
  supabaseAnonKey.includes('tu-anon-key')
);

if (!isMockMode) {
  console.log('[Supabase] Conectando a Supabase Cloud real...');
} else {
  console.log('[Supabase] Modo offline/demo activo. Usando base de datos localStorage local.');
}

// ── Tipos de base de datos ───────────────────────────────────────────────────
export type DbProject = {
  id: string;
  name: string;
  code: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  description: string | null;
  status: 'planificacion' | 'en_progreso' | 'detenido' | 'completado';
  created_at: string;
  updated_at: string;
};

export type DbWorker = {
  id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  specialty: string | null;
  status: 'activo' | 'vacaciones' | 'baja';
  created_at: string;
  updated_at: string;
};

export type DbTask = {
  id: string;
  project_id: string;
  assigned_worker_id: string | null;
  assigned_group_id?: string | null;
  title: string;
  description: string | null;
  priority: 'baja' | 'media' | 'alta' | 'critica';
  status: 'pendiente' | 'en_progreso' | 'completada';
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type DbTool = {
  id: string;
  code: string;
  name: string;
  category: 'maquinaria_pesada' | 'herramienta_electrica' | 'medicion' | 'manual' | 'seguridad' | 'otros';
  status: 'disponible' | 'en_uso' | 'mantenimiento' | 'baja';
  brand: string | null;
  serial_number: string | null;
  location: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type DbLoan = {
  id: string;
  tool_id: string;
  worker_id: string;
  project_id: string;
  borrow_date: string;
  expected_return_date: string;
  actual_return_date: string | null;
  status: 'activo' | 'devuelto';
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DbExpense = {
  id: string;
  project_id: string;
  category: 'materiales' | 'mano_de_obra' | 'maquinaria' | 'subcontrato' | 'administrativo' | 'otro';
  amount: number;
  description: string;
  expense_date: string;
  authorized_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DbProfile = {
  id: string;
  name: string;
  role: 'admin' | 'worker';
  avatar_color: string;
  worker_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DbActivityLog = {
  id: string;
  entity_type: 'project' | 'task' | 'worker' | 'tool' | 'loan' | 'expense' | 'auth';
  action: string;
  entity_name: string;
  details: string | null;
  user_id: string | null;
  created_at: string;
};

export type DbWorkerGroup = {
  id: string;
  name: string;
  project_id: string;
  leader_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DbGroupMember = {
  group_id: string;
  worker_id: string;
  created_at: string;
};

export type DbUserCredential = {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: 'admin' | 'worker';
  worker_id: string | null;
  avatar_color: string;
  created_at: string;
};

// ── Datos Semilla ───────────────────────────────────────────────────────────
const SEED_PROJECTS: Omit<DbProject, 'created_at' | 'updated_at'>[] = [
  {
    id: 'a1b2c3d4-0001-0001-0001-000000000001',
    name: 'Torre Vanguardia Residencial',
    code: 'TVR-04',
    location: 'Av. Balboa y Calle 53, Obarrio',
    start_date: '2026-02-15',
    end_date: '2027-08-30',
    budget: 3500000,
    description: 'Construcción de torre de condominios residenciales de 15 niveles, que incluye estacionamiento subterráneo de 3 niveles, área social con piscina, gimnasio y acabados de lujo.',
    status: 'en_progreso'
  },
  {
    id: 'a1b2c3d4-0002-0002-0002-000000000002',
    name: 'Bulevar Comercial Los Olivos',
    code: 'BCL-12',
    location: 'Vía España, frente a Parque España',
    start_date: '2026-07-01',
    end_date: '2027-03-15',
    budget: 1200000,
    description: 'Desarrollo de un centro comercial abierto con 24 locales comerciales, amplias aceras peatonales, paisajismo urbano sostenible y un módulo de estacionamiento exterior.',
    status: 'planificacion'
  },
  {
    id: 'a1b2c3d4-0003-0003-0003-000000000003',
    name: 'Remodelación Ala Sur Hospital Metropolitano',
    code: 'RHS-22',
    location: 'Bella Vista, Calle Central',
    start_date: '2026-05-01',
    end_date: '2026-10-20',
    budget: 450000,
    description: 'Remodelación interna crítica de salas de urgencias, cuidados intensivos geriátricos, y cambio completo de ductos de ventilación y cableado estructurado según normativas de salud.',
    status: 'detenido'
  },
  {
    id: 'a1b2c3d4-0004-0004-0004-000000000004',
    name: 'Planta de Tratamiento Clayton',
    code: 'PTC-09',
    location: 'Clayton Este, Canal Lineal',
    start_date: '2025-01-10',
    end_date: '2026-05-30',
    budget: 2800000,
    description: 'Expansión de la planta potabilizadora e instalación de un sistema secundario de filtrado de carbón activado para mejorar la distribución de agua potable local.',
    status: 'completado'
  }
];

const SEED_WORKERS: Omit<DbWorker, 'created_at' | 'updated_at'>[] = [
  {
    id: 'b1c2d3e4-0001-0001-0001-100000000001',
    name: 'Carlos Mendoza',
    role: 'Supervisor de Obra',
    email: 'carlos.mendoza@constructora-vanguardia.com',
    phone: '+507 6231-4560',
    specialty: 'Concreto Estructural',
    status: 'activo'
  },
  {
    id: 'b1c2d3e4-0002-0002-0002-100000000002',
    name: 'Ana Ríos',
    role: 'Coordinadora de Seguridad',
    email: 'ana.rios@constructora-vanguardia.com',
    phone: '+507 6590-1122',
    specialty: 'SST (Salud y Seguridad en el Trabajo)',
    status: 'activo'
  },
  {
    id: 'b1c2d3e4-0003-0003-0003-100000000003',
    name: 'Pedro Gómez',
    role: 'Operario de Maquinaria Pesada',
    email: 'pedro.gomez@constructora-vanguardia.com',
    phone: '+507 6877-3344',
    specialty: 'Excavación y Movimiento de Tierra',
    status: 'activo'
  },
  {
    id: 'b1c2d3e4-0004-0004-0004-100000000004',
    name: 'Sofía Peralta',
    role: 'Electricista Principal',
    email: 'sofia.peralta@constructora-vanguardia.com',
    phone: '+507 6112-9988',
    specialty: 'Instalaciones de Alta Tensión',
    status: 'activo'
  },
  {
    id: 'b1c2d3e4-0005-0005-0005-100000000005',
    name: 'Juan Carrizo',
    role: 'Maestro de Albañilería',
    email: 'juan.carrizo@constructora-vanguardia.com',
    phone: '+507 6445-5621',
    specialty: 'Acabados y Estructuras Livianas',
    status: 'activo'
  },
  {
    id: 'b1c2d3e4-0006-0006-0006-100000000006',
    name: 'Manuel Centella',
    role: 'Ayudante General',
    email: 'manuel.centella@constructora-vanguardia.com',
    phone: '+507 6001-2233',
    specialty: 'Tendido y Logística en Sitio',
    status: 'vacaciones'
  }
];

const SEED_TASKS: Omit<DbTask, 'created_at' | 'updated_at'>[] = [
  {
    id: 'task-uuid-1',
    project_id: 'a1b2c3d4-0001-0001-0001-000000000001',
    assigned_worker_id: 'b1c2d3e4-0001-0001-0001-100000000001',
    assigned_group_id: 'group-uuid-1',
    title: 'Vaciado de Losa de Concreto - Nivel 4',
    description: 'Vaciado continuo de losa del piso 4. Requiere camión mezclador, vibradores de hormigón y supervisión estructural directa.',
    priority: 'alta',
    status: 'en_progreso',
    due_date: '2026-06-20'
  },
  {
    id: 'task-uuid-2',
    project_id: 'a1b2c3d4-0001-0001-0001-000000000001',
    assigned_worker_id: 'b1c2d3e4-0002-0002-0002-100000000002',
    assigned_group_id: null,
    title: 'Inspección de Arneses y Líneas de Vida',
    description: 'Auditoría obligatoria de todos los equipos de protección personal y anclajes en alturas.',
    priority: 'critica',
    status: 'completada',
    due_date: '2026-06-12'
  },
  {
    id: 'task-uuid-3',
    project_id: 'a1b2c3d4-0001-0001-0001-000000000001',
    assigned_worker_id: 'b1c2d3e4-0004-0004-0004-100000000004',
    assigned_group_id: 'group-uuid-2',
    title: 'Canalización Eléctrica para Sótano 2',
    description: 'Instalar ductos de acero EMT y cajas de registro secundarias en la pared perimetral norte del sótano 2.',
    priority: 'media',
    status: 'pendiente',
    due_date: '2026-06-25'
  },
  {
    id: 'task-uuid-4',
    project_id: 'a1b2c3d4-0002-0002-0002-000000000002',
    assigned_worker_id: 'b1c2d3e4-0003-0003-0003-100000000003',
    assigned_group_id: null,
    title: 'Nivelación y Estudio Topográfico de Terreno',
    description: 'Tomar cotas de referencia en los linderos del lote con la estación de topografía.',
    priority: 'media',
    status: 'completada',
    due_date: '2026-06-08'
  },
  {
    id: 'task-uuid-5',
    project_id: 'a1b2c3d4-0002-0002-0002-000000000002',
    assigned_worker_id: 'b1c2d3e4-0003-0003-0003-100000000003',
    assigned_group_id: null,
    title: 'Excavación Principal para Fundación de Columnas',
    description: 'Uso de excavadora pesada para los canales primarios según el plano C-101.',
    priority: 'alta',
    status: 'pendiente',
    due_date: '2026-07-10'
  },
  {
    id: 'task-uuid-6',
    project_id: 'a1b2c3d4-0003-0003-0003-000000000003',
    assigned_worker_id: 'b1c2d3e4-0005-0005-0005-100000000005',
    assigned_group_id: null,
    title: 'Desmantelamiento de Ductos de Ventilamiento',
    description: 'Remoción de conductos de lámina galvanizada y aislamiento de asbesto deteriorado. Requiere trajes estancos.',
    priority: 'alta',
    status: 'en_progreso',
    due_date: '2026-06-28'
  },
  {
    id: 'task-uuid-7',
    project_id: 'a1b2c3d4-0004-0004-0004-000000000004',
    assigned_worker_id: 'b1c2d3e4-0001-0001-0001-100000000001',
    assigned_group_id: null,
    title: 'Prueba de Presión del Sistema de Filtrado',
    description: 'Someter las tuberías de carbono activo de 12 pulgadas a presión hidrostática de 150 PSI por 4 horas continuas.',
    priority: 'critica',
    status: 'completada',
    due_date: '2026-05-24'
  }
];

const SEED_TOOLS: Omit<DbTool, 'created_at' | 'updated_at'>[] = [
  {
    id: 't1e2f3g4-0001-0001-0001-000000000001',
    code: 'CAT-320D',
    name: 'Excavadora Caterpillar 320D',
    category: 'maquinaria_pesada',
    status: 'en_uso',
    brand: 'Caterpillar',
    serial_number: 'CAT0320DBJX83921',
    location: 'Sitio A-1 (Torre)',
    image_url: 'https://images.unsplash.com/photo-1579294800821-694d95e86143?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 't1e2f3g4-0002-0002-0002-000000000002',
    code: 'ROT-BOS8',
    name: 'Rotomartillo SDS-Max 1500W',
    category: 'herramienta_electrica',
    status: 'disponible',
    brand: 'Bosch',
    serial_number: 'BSH-GBH845-9281',
    location: 'Bodega Central',
    image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 't1e2f3g4-0003-0003-0003-000000000003',
    code: 'EST-TOP5',
    name: 'Estación Total Láser Profesional',
    category: 'medicion',
    status: 'disponible',
    brand: 'Topcon',
    serial_number: 'TPC-ES50-77123',
    location: 'Bodega Central',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 't1e2f3g4-0004-0004-0004-000000000004',
    code: 'GEN-HON6',
    name: 'Generador Eléctrico Portátil 6.5kW',
    category: 'herramienta_electrica',
    status: 'en_uso',
    brand: 'Honda',
    serial_number: 'HON-GX390-34821',
    location: 'Bodega Central',
    image_url: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 't1e2f3g4-0005-0005-0005-000000000005',
    code: 'ESM-DEW9',
    name: 'Esmeril Angular de 9 pulgadas',
    category: 'herramienta_electrica',
    status: 'disponible',
    brand: 'Dewalt',
    serial_number: 'DEW-D28490-5511',
    location: 'Bodega Central',
    image_url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 't1e2f3g4-0006-0006-0006-000000000006',
    code: 'SIE-MAK1',
    name: 'Sierra de Mesa para Madera 10"',
    category: 'herramienta_electrica',
    status: 'mantenimiento',
    brand: 'Makita',
    serial_number: 'MAK-MLT100-11029',
    location: 'Taller de Soporte',
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 't1e2f3g4-0007-0007-0007-000000000007',
    code: 'NIV-MILK',
    name: 'Nivel Electrónico Digital de Precisión',
    category: 'medicion',
    status: 'disponible',
    brand: 'Milwaukee',
    serial_number: 'MIL-NV60-12093',
    location: 'Bodega Central',
    image_url: 'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 't1e2f3g4-0008-0008-0008-000000000008',
    code: 'ROT-DEW2',
    name: 'Rotomartillo SDS-Plus Inalámbrico 20V',
    category: 'herramienta_electrica',
    status: 'disponible',
    brand: 'Dewalt',
    serial_number: 'DEW-DCH133-88231',
    location: 'Bodega Central',
    image_url: 'https://images.unsplash.com/photo-1540104709530-768832cf1acb?w=500&auto=format&fit=crop&q=60'
  }
];

const SEED_LOANS: Omit<DbLoan, 'created_at' | 'updated_at'>[] = [
  {
    id: 'loan-uuid-1',
    tool_id: 't1e2f3g4-0001-0001-0001-000000000001',
    worker_id: 'b1c2d3e4-0003-0003-0003-100000000003',
    project_id: 'a1b2c3d4-0001-0001-0001-000000000001',
    borrow_date: '2026-06-10',
    expected_return_date: '2026-06-25',
    actual_return_date: null,
    status: 'activo',
    notes: 'Excavación y movimiento de rocas en cimientos para Torre Vanguardia.'
  },
  {
    id: 'loan-uuid-2',
    tool_id: 't1e2f3g4-0004-0004-0004-000000000004',
    worker_id: 'b1c2d3e4-0004-0004-0004-100000000004',
    project_id: 'a1b2c3d4-0001-0001-0001-000000000001',
    borrow_date: '2026-06-12',
    expected_return_date: '2026-06-16',
    actual_return_date: null,
    status: 'activo',
    notes: 'Proveer suministro energía intermitente para soldadura en Nivel 3.'
  }
];

const SEED_EXPENSES: Omit<DbExpense, 'created_at' | 'updated_at'>[] = [
  {
    id: 'expense-uuid-1',
    project_id: 'a1b2c3d4-0001-0001-0001-000000000001',
    category: 'materiales',
    amount: 485000,
    description: 'Cemento Portland tipo I, varillas de acero 3/8" y 1/2", arena de río y piedra triturada para vaciado de losas niveles 1–4.',
    expense_date: '2026-03-10',
    authorized_by: 'Admin Principal'
  },
  {
    id: 'expense-uuid-2',
    project_id: 'a1b2c3d4-0001-0001-0001-000000000001',
    category: 'mano_de_obra',
    amount: 320000,
    description: 'Pago de cuadrillas de concreto, carpintería de formaleta y personal de apoyo para los primeros 4 niveles.',
    expense_date: '2026-04-01',
    authorized_by: 'Admin Principal'
  },
  {
    id: 'expense-uuid-3',
    project_id: 'a1b2c3d4-0001-0001-0001-000000000001',
    category: 'maquinaria',
    amount: 95000,
    description: 'Alquiler de grúa torre por 3 meses y mantenimiento preventivo de excavadora CAT-320D.',
    expense_date: '2026-04-15',
    authorized_by: 'Admin Principal'
  },
  {
    id: 'expense-uuid-4',
    project_id: 'a1b2c3d4-0001-0001-0001-000000000001',
    category: 'subcontrato',
    amount: 210000,
    description: 'Subcontrato con empresa Instalaciones Eléctricas Panamá S.A. para cableado estructurado y tableros de distribución.',
    expense_date: '2026-05-01',
    authorized_by: 'Admin Principal'
  },
  {
    id: 'expense-uuid-5',
    project_id: 'a1b2c3d4-0002-0002-0002-000000000002',
    category: 'materiales',
    amount: 85000,
    description: 'Materiales para estudio de suelos y adquisición de estacas topográficas.',
    expense_date: '2026-06-05',
    authorized_by: 'Admin Principal'
  },
  {
    id: 'expense-uuid-6',
    project_id: 'a1b2c3d4-0003-0003-0003-000000000003',
    category: 'materiales',
    amount: 125000,
    description: 'Adquisición de ductos HVAC de acero inoxidable, aislamiento térmico clase A y cajas de registro.',
    expense_date: '2026-05-10',
    authorized_by: 'Admin Principal'
  },
  {
    id: 'expense-uuid-7',
    project_id: 'a1b2c3d4-0003-0003-0003-000000000003',
    category: 'subcontrato',
    amount: 98000,
    description: 'Empresa especializada en remoción de asbesto con certificación internacional OSHA.',
    expense_date: '2026-05-20',
    authorized_by: 'Admin Principal'
  },
  {
    id: 'expense-uuid-8',
    project_id: 'a1b2c3d4-0004-0004-0004-000000000004',
    category: 'materiales',
    amount: 740000,
    description: 'Tuberías de HDPE, válvulas de control y carbón activado granular para sistema de filtrado secundario.',
    expense_date: '2025-03-15',
    authorized_by: 'Admin Principal'
  },
  {
    id: 'expense-uuid-9',
    project_id: 'a1b2c3d4-0004-0004-0004-000000000004',
    category: 'mano_de_obra',
    amount: 560000,
    description: 'Pago total de cuadrillas especializadas en instalación de sistemas de tratamiento de agua.',
    expense_date: '2025-08-01',
    authorized_by: 'Admin Principal'
  },
  {
    id: 'expense-uuid-10',
    project_id: 'a1b2c3d4-0004-0004-0004-000000000004',
    category: 'administrativo',
    amount: 85000,
    description: 'Permisos ambientales, seguros de obra y gastos legales para extensión del contrato.',
    expense_date: '2025-06-01',
    authorized_by: 'Admin Principal'
  }
];

const SEED_WORKER_GROUPS: Omit<DbWorkerGroup, 'created_at' | 'updated_at'>[] = [
  {
    id: 'group-uuid-1',
    name: 'Cuadrilla de Concreto',
    project_id: 'a1b2c3d4-0001-0001-0001-000000000001',
    leader_id: 'b1c2d3e4-0001-0001-0001-100000000001' // Carlos Mendoza
  },
  {
    id: 'group-uuid-2',
    name: 'Cuadrilla de Electricidad',
    project_id: 'a1b2c3d4-0001-0001-0001-000000000001',
    leader_id: 'b1c2d3e4-0004-0004-0004-100000000004' // Sofía Peralta
  }
];

const SEED_GROUP_MEMBERS: Omit<DbGroupMember, 'created_at'>[] = [
  { group_id: 'group-uuid-1', worker_id: 'b1c2d3e4-0001-0001-0001-100000000001' }, // Carlos Mendoza
  { group_id: 'group-uuid-1', worker_id: 'b1c2d3e4-0003-0003-0003-100000000003' }, // Pedro Gómez
  { group_id: 'group-uuid-1', worker_id: 'b1c2d3e4-0005-0005-0005-100000000005' }, // Juan Carrizo
  { group_id: 'group-uuid-2', worker_id: 'b1c2d3e4-0004-0004-0004-100000000004' }, // Sofía Peralta
  { group_id: 'group-uuid-2', worker_id: 'b1c2d3e4-0006-0006-0006-100000000006' }  // Manuel Centella
];

const SEED_USER_CREDENTIALS: Omit<DbUserCredential, 'created_at'>[] = [
  {
    id: 'admin-user-uuid-mock',
    email: 'admin@vanguardia.com',
    password: 'admin123',
    name: 'Admin Principal',
    role: 'admin',
    worker_id: null,
    avatar_color: '#ea580c'
  },
  {
    id: 'carlos-user-uuid-mock',
    email: 'carlos.mendoza@constructora-vanguardia.com',
    password: 'carlos123',
    name: 'Carlos Mendoza',
    role: 'worker',
    worker_id: 'b1c2d3e4-0001-0001-0001-100000000001',
    avatar_color: '#0284c7'
  },
  {
    id: 'ana-user-uuid-mock',
    email: 'ana.rios@constructora-vanguardia.com',
    password: 'ana123',
    name: 'Ana Ríos',
    role: 'worker',
    worker_id: 'b1c2d3e4-0002-0002-0002-100000000002',
    avatar_color: '#0284c7'
  },
  {
    id: 'pedro-user-uuid-mock',
    email: 'pedro.gomez@constructora-vanguardia.com',
    password: 'pedro123',
    name: 'Pedro Gómez',
    role: 'worker',
    worker_id: 'b1c2d3e4-0003-0003-0003-100000000003',
    avatar_color: '#0284c7'
  },
  {
    id: 'sofia-user-uuid-mock',
    email: 'sofia.peralta@constructora-vanguardia.com',
    password: 'sofia123',
    name: 'Sofía Peralta',
    role: 'worker',
    worker_id: 'b1c2d3e4-0004-0004-0004-100000000004',
    avatar_color: '#0284c7'
  },
  {
    id: 'juan-user-uuid-mock',
    email: 'juan.carrizo@constructora-vanguardia.com',
    password: 'juan123',
    name: 'Juan Carrizo',
    role: 'worker',
    worker_id: 'b1c2d3e4-0005-0005-0005-100000000005',
    avatar_color: '#0284c7'
  },
  {
    id: 'manuel-user-uuid-mock',
    email: 'manuel.centella@constructora-vanguardia.com',
    password: 'manuel123',
    name: 'Manuel Centella',
    role: 'worker',
    worker_id: 'b1c2d3e4-0006-0006-0006-100000000006',
    avatar_color: '#0284c7'
  }
];

// Helpers
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getMockTable(table: string): any[] {
  const key = `cv_mock_${table}`;
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveMockTable(table: string, data: any[]) {
  const key = `cv_mock_${table}`;
  localStorage.setItem(key, JSON.stringify(data));
}

// Realtime emitter lists
const realtimeListeners: Array<{
  table: string;
  callback: (payload: any) => void;
}> = [];

function triggerRealtimeEvent(table: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', record: any) {
  const oldRecord = eventType === 'DELETE' ? { id: record.id } : undefined;
  realtimeListeners.forEach(listener => {
    if (listener.table === table) {
      listener.callback({
        eventType,
        new: eventType !== 'DELETE' ? record : undefined,
        old: oldRecord
      });
    }
  });
}

// ── Mock Query Builder ──────────────────────────────────────────────────────
class MockQueryBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean> = [];
  private sortField: string | null = null;
  private sortAscending = true;
  private limitVal: number | null = null;
  private isSingle = false;
  private insertPayload: any = null;
  private updatePayload: any = null;
  private isDeleteOperation = false;
  private selectCols = '*';

  constructor(table: string) {
    this.table = table;
  }

  select(columns = '*') {
    this.selectCols = columns;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.sortField = column;
    this.sortAscending = options?.ascending ?? true;
    return this;
  }

  limit(n: number) {
    this.limitVal = n;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push(item => item[column] === value);
    return this;
  }

  insert(data: any) {
    this.insertPayload = data;
    return this;
  }

  update(data: any) {
    this.updatePayload = data;
    return this;
  }

  delete() {
    this.isDeleteOperation = true;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async execute() {
    let items = getMockTable(this.table);

    // Initial seed check (in case tables are completely empty and need restart)
    if (items.length === 0 && this.table !== 'activity_logs' && this.table !== 'profiles') {
      initMockDatabase(true);
      items = getMockTable(this.table);
    }

    if (this.insertPayload) {
      const rawData = Array.isArray(this.insertPayload) ? this.insertPayload : [this.insertPayload];
      const created = rawData.map(d => {
        const item = {
          id: d.id || generateUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...d
        };
        return item;
      });
      const newTable = [...items, ...created];
      saveMockTable(this.table, newTable);

      created.forEach(c => triggerRealtimeEvent(this.table, 'INSERT', c));
      return { data: this.isSingle ? created[0] : created, error: null };
    }

    if (this.updatePayload) {
      const updatedList: any[] = [];
      const newTable = items.map(item => {
        const matches = this.filters.every(f => f(item));
        if (matches) {
          const updated = {
            ...item,
            ...this.updatePayload,
            updated_at: new Date().toISOString()
          };
          updatedList.push(updated);
          return updated;
        }
        return item;
      });
      saveMockTable(this.table, newTable);

      updatedList.forEach(u => triggerRealtimeEvent(this.table, 'UPDATE', u));
      return { data: this.isSingle ? updatedList[0] : updatedList, error: null };
    }

    if (this.isDeleteOperation) {
      const deletedList: any[] = [];
      const remaining = items.filter(item => {
        const matches = this.filters.every(f => f(item));
        if (matches) {
          deletedList.push(item);
          return false;
        }
        return true;
      });
      saveMockTable(this.table, remaining);

      deletedList.forEach(d => triggerRealtimeEvent(this.table, 'DELETE', d));
      return { data: null, error: null };
    }

    // SELECT
    let result = [...items];
    for (const filter of this.filters) {
      result = result.filter(filter);
    }

    if (this.sortField) {
      const field = this.sortField;
      const asc = this.sortAscending;
      result.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA === valB) return 0;
        if (valA == null) return asc ? -1 : 1;
        if (valB == null) return asc ? 1 : -1;
        if (typeof valA === 'string' && typeof valB === 'string') {
          return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return asc ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
      });
    }

    if (this.limitVal !== null) {
      result = result.slice(0, this.limitVal);
    }

    if (this.selectCols === 'count') {
      return { data: [{ count: result.length }], error: null };
    }

    const finalData = this.isSingle ? (result[0] || null) : result;
    return { data: finalData, error: null };
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

// ── Mock Auth System ────────────────────────────────────────────────────────
class MockAuth {
  private listeners: Array<(_event: string, session: any) => void> = [];

  async getSession() {
    const sessionStr = localStorage.getItem('cv_mock_session');
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    return { data: { session }, error: null };
  }

  async signInWithPassword({ email, password }: any) {
    const e = email.trim().toLowerCase();
    const p = password;

    const creds = getMockTable('user_credentials');
    const account = creds.find((x: any) => x.email?.toLowerCase() === e);

    if (account && account.password === p) {
      const session = {
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: account.id,
          email: account.email,
          role: account.role,
          user_metadata: {
            name: account.name,
            role: account.role,
            worker_id: account.worker_id,
            avatar_color: account.avatar_color || '#ea580c'
          }
        }
      };

      localStorage.setItem('cv_mock_session', JSON.stringify(session));

      // Asegurar que exista perfil mock en profiles
      const profiles = getMockTable('profiles');
      const profileIdx = profiles.findIndex((x: any) => x.id === account.id);
      const profileData = {
        id: account.id,
        name: account.name,
        role: account.role,
        avatar_color: account.avatar_color || '#ea580c',
        worker_id: account.worker_id,
        created_at: account.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      if (profileIdx !== -1) {
        profiles[profileIdx] = profileData;
      } else {
        profiles.push(profileData);
      }
      saveMockTable('profiles', profiles);

      this.notify('SIGNED_IN', session);
      return { data: { session, user: session.user }, error: null };
    } else {
      return { error: { message: 'Invalid login credentials' } };
    }
  }

  async signOut() {
    localStorage.removeItem('cv_mock_session');
    this.notify('SIGNED_OUT', null);
    return { error: null };
  }

  onAuthStateChange(callback: any) {
    this.listeners.push(callback);
    this.getSession().then(({ data: { session } }) => {
      callback('INITIAL_SESSION', session);
    });

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          }
        }
      }
    };
  }

  private notify(event: string, session: any) {
    setTimeout(() => {
      this.listeners.forEach(l => l(event, session));
    }, 0);
  }
}

// ── Mock Supabase Client Wrapper ─────────────────────────────────────────────
class MockSupabaseClient {
  auth = new MockAuth();

  from(table: string) {
    return new MockQueryBuilder(table);
  }

  channel(name: string) {
    return {
      on(event: string, filter: any, callback: (payload: any) => void) {
        const table = filter.table;
        const listener = { table, callback };
        realtimeListeners.push(listener);
        return {
          subscribe() {
            return {
              unsubscribe() {
                const idx = realtimeListeners.indexOf(listener);
                if (idx !== -1) realtimeListeners.splice(idx, 1);
              }
            };
          }
        };
      },
      subscribe() {
        return this;
      }
    };
  }

  removeChannel(channel: any) {
    if (channel && typeof channel.unsubscribe === 'function') {
      channel.unsubscribe();
    }
  }
}

// Inicialización de la base de datos localStorage
function initMockDatabase(force = false) {
  if (!isBrowser) return;
  const initialized = localStorage.getItem('cv_mock_initialized');
  if (initialized && !force) return;

  const nowStr = new Date().toISOString();

  const addTimestamps = (list: any[]) => list.map(item => ({
    created_at: nowStr,
    updated_at: nowStr,
    ...item
  }));

  localStorage.setItem('cv_mock_projects', JSON.stringify(addTimestamps(SEED_PROJECTS)));
  localStorage.setItem('cv_mock_workers', JSON.stringify(addTimestamps(SEED_WORKERS)));
  localStorage.setItem('cv_mock_tasks', JSON.stringify(addTimestamps(SEED_TASKS)));
  localStorage.setItem('cv_mock_tools', JSON.stringify(addTimestamps(SEED_TOOLS)));
  localStorage.setItem('cv_mock_loans', JSON.stringify(addTimestamps(SEED_LOANS)));
  localStorage.setItem('cv_mock_expenses', JSON.stringify(addTimestamps(SEED_EXPENSES)));
  localStorage.setItem('cv_mock_worker_groups', JSON.stringify(addTimestamps(SEED_WORKER_GROUPS)));
  localStorage.setItem('cv_mock_group_members', JSON.stringify(SEED_GROUP_MEMBERS.map(m => ({ ...m, created_at: nowStr }))));
  localStorage.setItem('cv_mock_user_credentials', JSON.stringify(SEED_USER_CREDENTIALS.map(c => ({ ...c, created_at: nowStr }))));
  localStorage.setItem('cv_mock_profiles', JSON.stringify([]));
  localStorage.setItem('cv_mock_activity_logs', JSON.stringify([]));

  localStorage.setItem('cv_mock_initialized', 'true');
  console.log('[Supabase Mock] Base de datos mock inicializada con datos semilla.');
}

if (isMockMode) {
  initMockDatabase();
}

// ── Instancia exportada ─────────────────────────────────────────────────────
const realSupabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

const mockSupabase = new MockSupabaseClient() as any;

export const supabase = isMockMode ? mockSupabase : realSupabase;
