// ── Project & Status Types ──────────────────────────────────────────────────
export type ProjectStatus = 'planificacion' | 'en_progreso' | 'detenido' | 'completado';
export type WorkerStatus = 'activo' | 'vacaciones' | 'baja';
export type TaskPriority = 'baja' | 'media' | 'alta' | 'critica';
export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada';
export type ToolCategory = 'maquinaria_pesada' | 'herramienta_electrica' | 'medicion' | 'manual' | 'seguridad' | 'otros';
export type ToolStatus = 'disponible' | 'en_uso' | 'mantenimiento' | 'baja';
export type LoanStatus = 'activo' | 'devuelto';

// ── Auth Types ───────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'worker';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  workerId?: string;
  avatarColor?: string;
}

// ── Budget & Expense Types ───────────────────────────────────────────────────
export type ExpenseCategory =
  | 'materiales'
  | 'mano_de_obra'
  | 'maquinaria'
  | 'subcontrato'
  | 'administrativo'
  | 'otro';

export interface Expense {
  id: string;
  projectId: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;           // maps to expense_date in DB
  authorizedBy: string;   // maps to authorized_by in DB
}

// ── Core Entity Types ────────────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  code: string;
  location: string;
  startDate: string;
  endDate: string;
  budget: number;
  description: string;
  status: ProjectStatus;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  specialty: string;
  status: WorkerStatus;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedWorkerId: string;
  assignedGroupId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
}

export interface WorkerGroup {
  id: string;
  name: string;
  projectId: string;
  leaderId: string; // ID del trabajador responsable
  memberIds: string[]; // IDs de los trabajadores miembros
}

export interface Tool {
  id: string;
  code: string;
  name: string;
  category: ToolCategory;
  status: ToolStatus;
  brand: string;
  serialNumber: string;
  location: string;
  imageUrl?: string;
}

export interface Loan {
  id: string;
  toolId: string;
  workerId: string;
  projectId: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: LoanStatus;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'project' | 'task' | 'worker' | 'tool' | 'loan' | 'expense' | 'auth';
  action: string;
  entityName: string;
  details: string;
}
