import { useState, useCallback, useRef, useEffect } from 'react';

// ── Web Speech API type extensions ────────────────────────────────────────
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// ── Message types ─────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: Date;
}

export type VoiceFlowType =
  | 'idle'
  | 'menu'
  | 'new-project'
  | 'new-worker'
  | 'new-task'
  | 'new-tool'
  | 'new-expense'
  | 'worker-profile'
  | 'worker-task';

// ── Flow field definitions ─────────────────────────────────────────────────
interface FlowField {
  key: string;
  question: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  optional?: boolean;
}

// ── Pending submit (avoids side-effects inside setState) ───────────────────
interface PendingSubmit {
  baseFlow: VoiceFlowType;
  data: Record<string, string>;
}

const PROJECT_FLOW: FlowField[] = [
  { key: 'name',        question: '¿Cuál es el nombre de la obra?', type: 'text' },
  { key: 'code',        question: '¿Cuál es el código del proyecto? Por ejemplo: OBR-2024-001', type: 'text' },
  { key: 'location',    question: '¿Cuál es la ubicación o dirección de la obra?', type: 'text' },
  { key: 'startDate',   question: '¿Cuándo inicia la obra? Dime la fecha en formato día, mes y año.', type: 'date' },
  { key: 'endDate',     question: '¿Cuál es la fecha estimada de finalización?', type: 'date' },
  { key: 'budget',      question: '¿Cuál es el presupuesto total de la obra en pesos?', type: 'number' },
  { key: 'description', question: '¿Puedes darme una breve descripción de la obra? Si no tienes una, di "sin descripción".', type: 'text', optional: true },
];

const WORKER_FLOW: FlowField[] = [
  { key: 'name',      question: '¿Cuál es el nombre completo del trabajador?', type: 'text' },
  { key: 'role',      question: '¿Cuál es el cargo o puesto del trabajador?', type: 'text' },
  { key: 'email',     question: '¿Cuál es el correo electrónico? Si no tienes, di "sin correo".', type: 'text', optional: true },
  { key: 'phone',     question: '¿Cuál es el número de teléfono? Si no tienes, di "sin teléfono".', type: 'text', optional: true },
  { key: 'specialty', question: '¿Cuál es la especialidad técnica del trabajador?', type: 'text' },
];

const TASK_FLOW: FlowField[] = [
  { key: 'title',          question: '¿Cuál es el título o nombre de la tarea?', type: 'text' },
  { key: 'project',        question: '¿A qué obra pertenece esta tarea? Dime el nombre o código de la obra.', type: 'text' },
  { key: 'description',    question: '¿Puedes describir la tarea? Di "sin descripción" para omitir.', type: 'text', optional: true },
  { key: 'assignedWorker', question: '¿A qué trabajador se la asignamos? Dime su nombre o di "nadie".', type: 'text', optional: true },
  { key: 'priority',       question: '¿Cuál es la prioridad? Di: baja, media, alta o crítica.', type: 'select', options: ['baja', 'media', 'alta', 'critica'] },
  { key: 'dueDate',        question: '¿Para cuándo debe completarse la tarea? Dime la fecha.', type: 'date' },
];

const TOOL_FLOW: FlowField[] = [
  { key: 'name',         question: '¿Cuál es el nombre de la herramienta o equipo?', type: 'text' },
  { key: 'code',         question: '¿Cuál es el código o identificador de la herramienta?', type: 'text' },
  { key: 'brand',        question: '¿Cuál es la marca? Di "sin marca" si no aplica.', type: 'text', optional: true },
  { key: 'serialNumber', question: '¿Cuál es el número de serie? Di "sin serie" si no aplica.', type: 'text', optional: true },
  { key: 'location',     question: '¿Dónde se almacena esta herramienta?', type: 'text' },
];

const EXPENSE_FLOW: FlowField[] = [
  { key: 'project',     question: '¿A qué obra o proyecto corresponde este gasto?', type: 'text' },
  { key: 'category',    question: '¿En qué categoría va el gasto? Di: materiales, mano de obra, maquinaria, subcontrato, administrativo u otro.', type: 'select', options: ['materiales', 'mano_de_obra', 'maquinaria', 'subcontrato', 'administrativo', 'otro'] },
  { key: 'amount',      question: '¿Cuál es el monto del gasto en pesos?', type: 'number' },
  { key: 'description', question: '¿Cuál es la descripción del gasto?', type: 'text' },
  { key: 'authorizedBy',question: '¿Quién autoriza este gasto?', type: 'text' },
];

const WORKER_PROFILE_FLOW: FlowField[] = [
  { key: 'phone',     question: '¿Cuál es tu nuevo número de teléfono?', type: 'text' },
  { key: 'specialty', question: '¿Cuál es tu especialidad principal? Por ejemplo: pintura, electricidad, soldadura...', type: 'text' },
];

const WORKER_TASK_FLOW: FlowField[] = [
  { key: 'taskSearch', question: '¿Qué tarea quieres actualizar? Dime una palabra clave o parte del título.', type: 'text' },
  { key: 'status',     question: '¿Qué estado deseas ponerle? Di: pendiente, en progreso o completada.', type: 'select', options: ['pendiente', 'en_progreso', 'completada'] },
];

// ── Utilities ─────────────────────────────────────────────────────────────
function parseDate(text: string): string {
  const today = new Date();
  const lower = text.toLowerCase().trim();
  if (lower === 'hoy') return today.toISOString().substring(0, 10);
  if (lower === 'mañana') {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().substring(0, 10);
  }

  const months: Record<string, number> = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  };

  for (const [name, num] of Object.entries(months)) {
    if (lower.includes(name)) {
      const dayMatch = lower.match(/\b(\d{1,2})\b/);
      const yearMatch = lower.match(/\b(20\d{2})\b/);
      const day = dayMatch ? parseInt(dayMatch[1]) : 1;
      const year = yearMatch ? parseInt(yearMatch[1]) : today.getFullYear();
      return `${year}-${String(num).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  const numMatch = lower.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (numMatch) {
    const d = parseInt(numMatch[1]), m = parseInt(numMatch[2]), y = parseInt(numMatch[3]);
    const year = y < 100 ? 2000 + y : y;
    return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  return today.toISOString().substring(0, 10);
}

function parseNumber(text: string): number {
  const clean = text.replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(clean) || 0;
}

function normalizeOptional(text: string, field: FlowField): string {
  const lower = text.toLowerCase().trim();
  if (!field.optional) return text;
  if (['sin correo', 'sin teléfono', 'sin descripción', 'sin marca', 'sin serie', 'no', 'ninguno', 'omitir', 'nada', 'nadie'].includes(lower)) {
    return '';
  }
  return text;
}

function matchSelect(text: string, options: string[]): string | null {
  const lower = text.toLowerCase().trim();
  if (options.includes(lower)) return lower;
  for (const opt of options) {
    if (lower.includes(opt) || opt.includes(lower)) return opt;
  }
  return null;
}

// ── State & Handler types ─────────────────────────────────────────────────
export interface VoiceAssistantState {
  isOpen: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  flowType: VoiceFlowType;
  messages: ChatMessage[];
  collectedData: Record<string, string>;
  currentFieldIndex: number;
  currentFlow: FlowField[];
  isSupported: boolean;
  error: string | null;
  /** Internal: triggers a submission side-effect via useEffect (not inside setState) */
  pendingSubmit: PendingSubmit | null;
  /** Waiting for per-field yes/no confirmation before advancing (deprecated/unused but kept for type compatibility) */
  awaitingFieldConfirm: boolean;
  /** The parsed value pending user confirmation */
  pendingFieldValue: string;
  /** Pending Gemini API query */
  pendingGeminiQuery: string | null;
  /** Currently selected field to modify at the final confirmation step */
  modifyingField: FlowField | null;
}

export type SubmitHandler = {
  // admin views
  onAddProject?: (data: any) => void | Promise<any>;
  onAddWorker?: (data: any) => void | Promise<any>;
  onAddTask?: (data: any) => void | Promise<any>;
  onAddTool?: (data: any) => void | Promise<any>;
  onAddExpense?: (data: any) => void | Promise<any>;
  // worker portal
  onUpdateWorker?: (data: any) => void | Promise<boolean>;
  onUpdateTaskStatus?: (taskId: string, status: any) => void | Promise<boolean>;
  // context data
  projects?: any[];
  workers?: any[];
  tasks?: any[];
  currentWorkerId?: string;
  onNavigate?: (view: any) => void;
  role?: 'admin' | 'worker';
};

const INITIAL_STATE: VoiceAssistantState = {
  isOpen: false,
  isListening: false,
  isSpeaking: false,
  isProcessing: false,
  flowType: 'idle',
  messages: [],
  collectedData: {},
  currentFieldIndex: 0,
  currentFlow: [],
  isSupported: false,
  error: null,
  pendingSubmit: null,
  awaitingFieldConfirm: false,
  pendingFieldValue: '',
  pendingGeminiQuery: null,
  modifyingField: null,
};

// ── Symbol normalization ──────────────────────────────────────────────────
// Converts spoken symbol names into their actual characters.
function normalizeDictatedSymbols(text: string): string {
  return text
    .replace(/\bbarra\s+baja\b/gi, '_')
    .replace(/\bbarra\s+diagonal\b/gi, '/')
    .replace(/\bbarra\b/gi, '/')
    .replace(/\bguión\b/gi, '-')
    .replace(/\bguion\b/gi, '-')
    .replace(/\bpunto\b/gi, '.')
    .replace(/\barroba\b/gi, '@')
    .replace(/\bslash\b/gi, '/')
    .replace(/\bunderscore\b/gi, '_')
    .replace(/\basterisc[oa]\b/gi, '*')
    .replace(/\bespacio\b/gi, ' ')
    .replace(/\s*([\-\/_.@*])\s*/g, '$1');
}

// ── Field labels and find helper ──────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre',
  code: 'Código',
  location: 'Ubicación',
  startDate: 'Fecha de Inicio',
  endDate: 'Fecha de Fin',
  budget: 'Presupuesto',
  description: 'Descripción',
  role: 'Cargo',
  email: 'Correo',
  phone: 'Teléfono',
  specialty: 'Especialidad',
  title: 'Título',
  project: 'Proyecto',
  assignedWorker: 'Trabajador',
  priority: 'Prioridad',
  dueDate: 'Fecha Límite',
  brand: 'Marca',
  serialNumber: 'Número de Serie',
  category: 'Categoría',
  amount: 'Monto',
  authorizedBy: 'Autorizado Por',
  taskSearch: 'Tarea a Buscar',
  status: 'Estado',
};

function findFieldToModify(text: string, flow: FlowField[]): FlowField | null {
  const lower = text.toLowerCase();
  for (const field of flow) {
    const key = field.key.toLowerCase();
    const aliases: Record<string, string[]> = {
      name: ['nombre', 'obra', 'proyecto', 'trabajador', 'herramienta', 'título', 'titulo', 'nombre de la obra'],
      code: ['código', 'codigo', 'identificador'],
      location: ['ubicación', 'ubicacion', 'dirección', 'direccion', 'dónde', 'donde', 'lugar'],
      startDate: ['fecha de inicio', 'inicia', 'inicio', 'fecha inicio', 'comienza'],
      endDate: ['fecha de finalización', 'fin', 'finalización', 'finalizacion', 'termina', 'termino', 'fecha fin'],
      budget: ['presupuesto', 'monto', 'pesos', 'dinero'],
      description: ['descripción', 'descripcion', 'detalle'],
      role: ['cargo', 'puesto', 'rol'],
      email: ['correo', 'email', 'e-mail'],
      phone: ['teléfono', 'telefono', 'celular', 'número', 'numero'],
      specialty: ['especialidad', 'técnica', 'tecnica'],
      title: ['título', 'titulo', 'nombre de la tarea'],
      project: ['obra', 'proyecto'],
      assignedWorker: ['trabajador', 'asignado', 'quién', 'quien'],
      priority: ['prioridad', 'importancia'],
      dueDate: ['fecha', 'límite', 'limite', 'para cuándo', 'para cuando'],
      brand: ['marca'],
      serialNumber: ['serie', 'número de serie', 'numero de serie'],
      category: ['categoría', 'categoria'],
      amount: ['monto', 'cantidad', 'dinero', 'pesos'],
      authorizedBy: ['autoriza', 'autorizado', 'quién autoriza'],
      taskSearch: ['tarea', 'búsqueda', 'busqueda'],
      status: ['estado'],
    };
    const words = aliases[field.key] || [key];
    if (words.some(w => lower.includes(w))) {
      return field;
    }
  }
  return null;
}

// ── Gemini API client ─────────────────────────────────────────────────────
async function callGeminiAPI(question: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return 'No tengo configurada la clave API de Gemini. Por favor configúrala en el archivo .env como VITE_GEMINI_API_KEY.';
  }
  if (!apiKey.startsWith('AIzaSy')) {
    return `La clave de API de Gemini configurada ("${apiKey.substring(0, 8)}...") parece inválida. Recuerda que las claves de Google AI Studio siempre comienzan con "AIzaSy". Obtén una clave gratis en https://aistudio.google.com/app/apikey`;
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: question
          }]
        }],
        systemInstruction: {
          parts: [{
            text: "Eres un asistente inteligente para una aplicación móvil y web de construcción y obras. Responde en español de forma muy concisa, directa y amable (máximo dos oraciones)."
          }]
        }
      })
    });
    if (!response.ok) {
      throw new Error(`Gemini API error status: ${response.status}`);
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta.';
  } catch (err) {
    console.error('Error al llamar a Gemini:', err);
    return 'Lo siento, tuve un problema de conexión al intentar consultar con Gemini. Por favor verifica que tu API Key sea correcta.';
  }
}

let msgCounter = 0;
function mkMsg(role: 'assistant' | 'user', text: string): ChatMessage {
  return { id: `msg-${++msgCounter}`, role, text, timestamp: new Date() };
}
// ── Main Hook ─────────────────────────────────────────────────────────────
export function useVoiceAssistant(handlers: SubmitHandler) {
  const [state, setState] = useState<VoiceAssistantState>({
    ...INITIAL_STATE,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  });

  const recognitionRef = useRef<any>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const processInputRef = useRef<(input: string) => void>(() => {});

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'es-ES';
    utt.rate = 1.0;
    utt.pitch = 1;
    setState(p => ({ ...p, isSpeaking: true }));
    utt.onend = () => {
      setState(p => ({ ...p, isSpeaking: false }));
      onEnd?.();
    };
    utt.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setState(p => ({ ...p, isSpeaking: false }));
      onEnd?.();
    };
    window.speechSynthesis.speak(utt);
  }, []);

  const stopListening = useCallback(() => {
    console.log('VoiceAssistant: Stop listening requested');
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    recognitionRef.current = null;
    setState(p => ({ ...p, isListening: false }));
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setState(p => ({ ...p, error: 'Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.' }));
      return;
    }

    try { recognitionRef.current?.stop(); } catch { /* ignore */ }

    console.log('VoiceAssistant: Initializing SpeechRecognition');
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log('VoiceAssistant: Microphone started recording (onstart)');
      setState(p => ({ ...p, isListening: true, error: null }));
    };
    
    recognition.onend = () => {
      console.log('VoiceAssistant: Microphone stopped recording (onend)');
      setState(p => ({ ...p, isListening: false }));
    };
    
    recognition.onerror = (e: any) => {
      console.error('VoiceAssistant: Recognition error event:', e.error, e);
      let errMsg = '';
      switch (e.error) {
        case 'not-allowed':
          errMsg = 'Permiso de micrófono denegado. Haz clic en el candado de la barra de direcciones y activa el micrófono.';
          break;
        case 'no-speech':
          errMsg = 'No se detectó voz. Asegúrate de hablar fuerte y de que tu micrófono predeterminado esté bien configurado.';
          break;
        case 'network':
          errMsg = 'Error de red al procesar voz. Verifica tu conexión de red o de internet.';
          break;
        case 'service-not-allowed':
          errMsg = 'Servicio de reconocimiento de voz no permitido por el navegador o red corporativa.';
          break;
        default:
          errMsg = `Error de micrófono: ${e.error}. Revisa la configuración de tu sistema.`;
      }
      setState(p => ({ ...p, isListening: false, error: errMsg }));
    };

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript.trim();
      console.log('VoiceAssistant: Heard speech result:', transcript);
      if (transcript) {
        processInputRef.current(transcript);
      }
    };

    setState(p => ({ ...p, isListening: true, error: null }));
    try {
      console.log('VoiceAssistant: Starting recognition instance...');
      recognition.start();
    } catch (err) {
      console.error('VoiceAssistant: Exception when running recognition.start():', err);
      setState(p => ({ ...p, isListening: false, error: 'No se pudo iniciar el micrófono. Revisa los permisos de tu navegador.' }));
    }
  }, []);

  // ── Execute pending submissions in useEffect ─────────────────────────────
  useEffect(() => {
    if (!state.pendingSubmit) return;

    const { baseFlow, data } = state.pendingSubmit;
    const h = handlersRef.current;

    const execute = async () => {
      try {
        let result: any = true;
        if (baseFlow === 'new-project' && h.onAddProject) {
          result = await h.onAddProject({
            name: data.name || 'Sin nombre',
            code: data.code || 'COD-001',
            location: data.location || '',
            startDate: data.startDate || new Date().toISOString().substring(0, 10),
            endDate: data.endDate || new Date().toISOString().substring(0, 10),
            budget: parseFloat(data.budget) || 0,
            description: data.description || '',
            status: 'planificacion',
          });
        } else if (baseFlow === 'new-worker' && h.onAddWorker) {
          result = await h.onAddWorker({
            name: data.name || '',
            role: data.role || '',
            email: data.email || '',
            phone: data.phone || '',
            specialty: data.specialty || '',
            status: 'activo',
          });
        } else if (baseFlow === 'new-task' && h.onAddTask) {
          let assignedWorkerId = '';
          if (data.assignedWorker) {
            const workerQuery = data.assignedWorker.toLowerCase();
            const matchedWorker = (h.workers || []).find(w => w.name.toLowerCase().includes(workerQuery));
            if (matchedWorker) assignedWorkerId = matchedWorker.id;
          }
          result = await h.onAddTask({
            title: data.title || '',
            description: data.description || '',
            priority: (data.priority as any) || 'media',
            status: 'pendiente',
            dueDate: data.dueDate || new Date().toISOString().substring(0, 10),
            assignedWorkerId,
            projectId: data.projectId || '',
          });
        } else if (baseFlow === 'new-tool' && h.onAddTool) {
          result = await h.onAddTool({
            name: data.name || '',
            code: data.code || '',
            brand: data.brand || '',
            serialNumber: data.serialNumber || '',
            location: data.location || '',
            category: 'otros',
            status: 'disponible',
          });
        } else if (baseFlow === 'new-expense' && h.onAddExpense) {
          result = await h.onAddExpense({
            category: (data.category as any) || 'otro',
            amount: parseFloat(data.amount) || 0,
            description: data.description || '',
            authorizedBy: data.authorizedBy || '',
            date: new Date().toISOString().substring(0, 10),
            projectId: data.projectId || '',
          });
        } else if (baseFlow === 'worker-profile' && h.onUpdateWorker) {
          const currentWorker = (h.workers || []).find(w => w.id === h.currentWorkerId);
          if (currentWorker) {
            result = await h.onUpdateWorker({ ...currentWorker, phone: data.phone, specialty: data.specialty });
          }
        } else if (baseFlow === 'worker-task' && h.onUpdateTaskStatus && data.matchedTaskId) {
          result = await h.onUpdateTaskStatus(data.matchedTaskId, data.status as any);
        }

        if (result === null || result === false) {
          throw new Error('La base de datos retornó un resultado nulo o fallido (por ejemplo, el código puede estar duplicado).');
        }

        const successMsg = '¡Guardado correctamente! ¿Deseas registrar algo más? Puedes decírmelo o di "salir" para cerrar.';
        setState(p => ({
          ...p,
          pendingSubmit: null,
          messages: [...p.messages, mkMsg('assistant', successMsg)],
          collectedData: {},
          currentFieldIndex: 0,
          currentFlow: [],
          flowType: 'menu',
        }));
        setTimeout(() => speak(successMsg), 100);

      } catch (err: any) {
        console.error('Error al guardar datos:', err);
        const errMsg = `Hubo un error al guardar: ${err.message || 'Error desconocido'}. Asegúrate de que el código no esté duplicado e intenta de nuevo.`;
        setState(p => ({
          ...p,
          pendingSubmit: null,
          messages: [...p.messages, mkMsg('assistant', errMsg)],
          flowType: 'menu',
        }));
        setTimeout(() => speak(errMsg), 100);
      }
    };

    execute();
  }, [state.pendingSubmit, speak]);

  // ── Handle Gemini API async queries in useEffect ────────────────────────
  useEffect(() => {
    if (!state.pendingGeminiQuery) return;
    const query = state.pendingGeminiQuery;

    const queryGemini = async () => {
      setState(p => ({ ...p, isProcessing: true }));
      const answer = await callGeminiAPI(query);
      setState(p => {
        const nextMessages = [...p.messages, mkMsg('assistant', answer)];
        setTimeout(() => speak(answer), 100);
        return {
          ...p,
          isProcessing: false,
          pendingGeminiQuery: null,
          messages: nextMessages,
        };
      });
    };

    queryGemini();
  }, [state.pendingGeminiQuery, speak]);

  // Helper to build the final summary
  const buildSummaryConfirm = useCallback((
    prev: VoiceAssistantState,
    newData: Record<string, string>,
    newMessages: ChatMessage[]
  ): VoiceAssistantState => {
    let enrichedData = { ...newData };
    let summaryLines: string[] = [];

    if (prev.flowType === 'worker-task') {
      const searchVal = newData.taskSearch?.toLowerCase() || '';
      const myWorkerId = handlersRef.current.currentWorkerId || '';
      const userTasks = (handlersRef.current.tasks || []).filter(t => t.assignedWorkerId === myWorkerId);
      const matchedTask = userTasks.find(t => t.title.toLowerCase().includes(searchVal));
      if (!matchedTask) {
        const noMatchMsg = `No encontré ninguna tarea tuya que contenga "${newData.taskSearch}". ¿Cuál tarea deseas actualizar?`;
        setTimeout(() => speak(noMatchMsg), 100);
        return {
          ...prev,
          messages: [...newMessages, mkMsg('assistant', noMatchMsg)],
          collectedData: {},
          currentFieldIndex: 0,
          awaitingFieldConfirm: false,
          pendingFieldValue: '',
          modifyingField: null
        };
      }
      enrichedData.matchedTaskId = matchedTask.id;
      enrichedData.matchedTaskTitle = matchedTask.title;
      summaryLines = [`Tarea: "${matchedTask.title}"`, `Nuevo estado: ${newData.status}`];
    } else if (prev.flowType === 'new-task' || prev.flowType === 'new-expense') {
      const projQuery = (newData.project || '').toLowerCase();
      const matchedProj = (handlersRef.current.projects || []).find(
        p => p.name.toLowerCase().includes(projQuery) || p.code.toLowerCase().includes(projQuery)
      );
      enrichedData.projectId = matchedProj?.id || (handlersRef.current.projects || [])[0]?.id || '';
      enrichedData.projectMatchedName = matchedProj?.name || (handlersRef.current.projects || [])[0]?.name || 'sin proyecto';
      
      summaryLines = Object.entries(enrichedData)
        .filter(([k]) => !['projectId', 'projectMatchedName', 'matchedTaskId', 'matchedTaskTitle'].includes(k))
        .map(([k, v]) => `${FIELD_LABELS[k] || k}: ${v || '(vacío)'}`);
      if (enrichedData.projectMatchedName) {
        summaryLines.push(`Proyecto: ${enrichedData.projectMatchedName}`);
      }
    } else {
      summaryLines = Object.entries(enrichedData)
        .filter(([k]) => !['projectId', 'projectMatchedName', 'matchedTaskId', 'matchedTaskTitle'].includes(k))
        .map(([k, v]) => `${FIELD_LABELS[k] || k}: ${v || '(vacío)'}`);
    }

    const confirmMsg = `Hemos completado los datos. Resumen:\n${summaryLines.join(', ')}.\n\n¿Deseas "confirmar" para guardar, "cancelar" para reiniciar, o deseas "cambiar [campo]" (por ejemplo, "cambiar presupuesto")?`;
    setTimeout(() => speak(confirmMsg), 100);
    
    // Determine target confirm flow name
    const targetFlow = prev.flowType.endsWith('-confirm') ? prev.flowType : `${prev.flowType}-confirm` as VoiceFlowType;

    return {
      ...prev,
      messages: [...newMessages, mkMsg('assistant', confirmMsg)],
      collectedData: enrichedData,
      currentFieldIndex: prev.currentFlow.length,
      awaitingFieldConfirm: false,
      pendingFieldValue: '',
      modifyingField: null,
      flowType: targetFlow,
    };
  }, [speak]);

  // ── Process input (pure state transitions — no side-effects) ─────────────
  const processInput = useCallback((input: string) => {
    setState(prev => {
      // Normalize dictations first
      const normalized = normalizeDictatedSymbols(input.trim());
      if (!normalized) return prev;

      const newMessages = [...prev.messages, mkMsg('user', normalized)];
      const lower = normalized.toLowerCase();

      // ── MODIFY FIELD MODE ───────────────────────────────────────────────
      if (prev.modifyingField) {
        const field = prev.modifyingField;
        let value = normalized;

        if (field.type === 'date') {
          value = parseDate(normalized);
        } else if (field.type === 'number') {
          value = String(parseNumber(normalized));
        } else if (field.type === 'select' && field.options) {
          const matched = matchSelect(normalized, field.options);
          if (!matched) {
            const errMsg = `No reconocí esa opción. Por favor di una de estas: ${field.options.join(', ')}.`;
            setTimeout(() => speak(errMsg), 100);
            return { ...prev, messages: [...newMessages, mkMsg('assistant', errMsg)] };
          }
          value = matched;
        } else if (field.optional) {
          value = normalizeOptional(normalized, field);
        }

        const newData = { ...prev.collectedData, [field.key]: value };
        const confirmText = `Entendido. He cambiado ${FIELD_LABELS[field.key] || field.key} a "${value}".`;
        const updatedMessages = [...newMessages, mkMsg('assistant', confirmText)];

        // Return back to final confirmation screen with the updated data
        return buildSummaryConfirm({ ...prev, modifyingField: null }, newData, updatedMessages);
      }

      // ── MENU / idle ─────────────────────────────────────────────────────
      if (prev.flowType === 'idle' || prev.flowType === 'menu') {
        const role = handlersRef.current.role || 'admin';
        let nextFlow: VoiceFlowType = 'menu';
        let nextFields: FlowField[] = [];
        let responseText = '';

        if (lower.includes('salir') || lower.includes('cerrar') || lower.includes('cancelar')) {
          return { ...prev, isOpen: false, flowType: 'idle', messages: [], collectedData: {}, currentFieldIndex: 0, currentFlow: [], pendingSubmit: null, awaitingFieldConfirm: false, pendingFieldValue: '', modifyingField: null };
        }

        let matchedTrigger = false;

        if (role === 'admin') {
          if (lower.includes('obra') || lower.includes('proyecto')) {
            nextFlow = 'new-project'; nextFields = PROJECT_FLOW; matchedTrigger = true;
            responseText = '¡Perfecto! Vamos a registrar una nueva obra. ' + PROJECT_FLOW[0].question;
            setTimeout(() => handlersRef.current.onNavigate?.('projects'), 200);
          } else if (lower.includes('trabajador') || lower.includes('empleado') || lower.includes('personal')) {
            nextFlow = 'new-worker'; nextFields = WORKER_FLOW; matchedTrigger = true;
            responseText = '¡Perfecto! Vamos a registrar un nuevo trabajador. ' + WORKER_FLOW[0].question;
            setTimeout(() => handlersRef.current.onNavigate?.('team'), 200);
          } else if (lower.includes('tarea') || lower.includes('actividad')) {
            nextFlow = 'new-task'; nextFields = TASK_FLOW; matchedTrigger = true;
            responseText = '¡Perfecto! Vamos a crear una nueva tarea. ' + TASK_FLOW[0].question;
            setTimeout(() => handlersRef.current.onNavigate?.('tasks'), 200);
          } else if (lower.includes('herramienta') || lower.includes('equipo') || lower.includes('inventario') || lower.includes('bodega')) {
            nextFlow = 'new-tool'; nextFields = TOOL_FLOW; matchedTrigger = true;
            responseText = '¡Perfecto! Vamos a registrar una herramienta. ' + TOOL_FLOW[0].question;
            setTimeout(() => handlersRef.current.onNavigate?.('inventory'), 200);
          } else if (lower.includes('gasto') || lower.includes('presupuesto') || lower.includes('pago')) {
            nextFlow = 'new-expense'; nextFields = EXPENSE_FLOW; matchedTrigger = true;
            responseText = '¡Perfecto! Vamos a registrar un gasto. ' + EXPENSE_FLOW[0].question;
            setTimeout(() => handlersRef.current.onNavigate?.('budget'), 200);
          }
        } else {
          if (lower.includes('perfil') || lower.includes('teléfono') || lower.includes('especialidad') || lower.includes('mis datos')) {
            nextFlow = 'worker-profile'; nextFields = WORKER_PROFILE_FLOW; matchedTrigger = true;
            responseText = 'Vamos a actualizar tu información de perfil. ' + WORKER_PROFILE_FLOW[0].question;
          } else if (lower.includes('tarea') || lower.includes('completar') || lower.includes('iniciar') || lower.includes('estado')) {
            nextFlow = 'worker-task'; nextFields = WORKER_TASK_FLOW; matchedTrigger = true;
            responseText = 'Vamos a actualizar el estado de una de tus tareas. ' + WORKER_TASK_FLOW[0].question;
          }
        }

        // If no forms are matched, trigger Gemini API query!
        if (!matchedTrigger) {
          return {
            ...prev,
            messages: newMessages,
            pendingGeminiQuery: normalized,
          };
        }

        const withAssistant = [...newMessages, mkMsg('assistant', responseText)];
        setTimeout(() => speak(responseText), 100);
        return { ...prev, flowType: nextFlow, currentFlow: nextFields, currentFieldIndex: 0, collectedData: {}, messages: withAssistant, pendingSubmit: null, awaitingFieldConfirm: false, pendingFieldValue: '', modifyingField: null };
      }

      // ── Final confirmation step (entire form) ─────────────────────────
      if (prev.flowType.endsWith('-confirm')) {
        const baseFlow = prev.flowType.replace('-confirm', '') as VoiceFlowType;

        // Check if user wants to CONFIRM
        if (lower.includes('confirmar') || lower.includes('sí') || lower.includes('si') || lower.includes('guardar') || lower.includes('adelante') || lower.includes('correcto')) {
          const savingMsg = 'Guardando los datos, un momento...';
          setTimeout(() => speak(savingMsg), 100);
          return {
            ...prev,
            messages: [...newMessages, mkMsg('assistant', savingMsg)],
            pendingSubmit: { baseFlow, data: prev.collectedData },
          };
        }

        // Check if user wants to CANCEL
        if (lower.includes('cancelar') || lower.includes('empezar de nuevo') || lower.includes('no')) {
          const cancelMsg = '¡Entendido! Empezamos de nuevo. ¿Qué deseas hacer?';
          setTimeout(() => speak(cancelMsg), 100);
          return { ...prev, messages: [...newMessages, mkMsg('assistant', cancelMsg)], collectedData: {}, currentFieldIndex: 0, currentFlow: [], flowType: 'menu', pendingSubmit: null, awaitingFieldConfirm: false, pendingFieldValue: '', modifyingField: null };
        }

        // Check if user wants to MODIFY a field (e.g. "cambiar presupuesto" or "nombre")
        const fieldToModify = findFieldToModify(lower, prev.currentFlow);
        if (fieldToModify) {
          const askMsg = `Entendido. ¿Cuál es el nuevo valor para "${FIELD_LABELS[fieldToModify.key] || fieldToModify.key}"?`;
          setTimeout(() => speak(askMsg), 100);
          return {
            ...prev,
            messages: [...newMessages, mkMsg('assistant', askMsg)],
            modifyingField: fieldToModify,
          };
        }

        // User typed modify/change words but we couldn't match a field
        if (lower.includes('cambiar') || lower.includes('modificar') || lower.includes('corregir') || lower.includes('editar')) {
          const fieldsList = prev.currentFlow.map(f => FIELD_LABELS[f.key] || f.key).join(', ');
          const helpMsg = `No entendí qué campo deseas cambiar. Los campos de este formulario son: ${fieldsList}. Di algo como "cambiar ${FIELD_LABELS[prev.currentFlow[0].key]}".`;
          setTimeout(() => speak(helpMsg), 100);
          return { ...prev, messages: [...newMessages, mkMsg('assistant', helpMsg)] };
        }

        const remindMsg = 'Di "confirmar" para guardar, "cancelar" para reiniciar, o indica cuál campo deseas modificar diciendo "cambiar [campo]".';
        setTimeout(() => speak(remindMsg), 100);
        return { ...prev, messages: [...newMessages, mkMsg('assistant', remindMsg)] };
      }

      // ── Active flow: collect a field value sequentially ──────────────────
      if (prev.currentFlow.length > 0 && prev.currentFieldIndex < prev.currentFlow.length) {
        const field = prev.currentFlow[prev.currentFieldIndex];
        let value = normalized;

        if (field.type === 'date') {
          value = parseDate(normalized);
        } else if (field.type === 'number') {
          value = String(parseNumber(normalized));
        } else if (field.type === 'select' && field.options) {
          const matched = matchSelect(normalized, field.options);
          if (!matched) {
            const errMsg = `No reconocí esa opción. Por favor di una de estas: ${field.options.join(', ')}.`;
            setTimeout(() => speak(errMsg), 100);
            return { ...prev, messages: [...newMessages, mkMsg('assistant', errMsg)] };
          }
          value = matched;
        } else if (field.optional) {
          value = normalizeOptional(normalized, field);
        }

        const newData = { ...prev.collectedData, [field.key]: value };
        const nextFieldIndex = prev.currentFieldIndex + 1;

        if (nextFieldIndex < prev.currentFlow.length) {
          const nextQ = prev.currentFlow[nextFieldIndex].question;
          setTimeout(() => speak(nextQ), 100);
          return {
            ...prev,
            messages: [...newMessages, mkMsg('assistant', nextQ)],
            collectedData: newData,
            currentFieldIndex: nextFieldIndex,
            awaitingFieldConfirm: false,
            pendingFieldValue: '',
            modifyingField: null
          };
        }

        // We finished the flow fields! Show final summary
        return buildSummaryConfirm(prev, newData, newMessages);
      }

      return { ...prev, messages: newMessages };
    });
  }, [speak, buildSummaryConfirm]);

  processInputRef.current = processInput;

  // ── Open / Close ──────────────────────────────────────────────────────
  const open = useCallback(() => {
    const role = handlersRef.current.role || 'admin';
    const greeting = role === 'admin'
      ? '¡Hola! Soy tu asistente de voz. ¿Qué deseas hacer? Puedes decir: nueva obra, nuevo trabajador, nueva tarea o registrar gasto. También puedes hacerme preguntas generales.'
      : '¡Hola! Soy tu asistente de voz. ¿Qué deseas hacer? Puedes decir: actualizar perfil o actualizar tarea. También puedes hacerme preguntas generales.';

    setState(p => ({
      ...p,
      isOpen: true,
      flowType: 'menu',
      messages: [mkMsg('assistant', greeting)],
      collectedData: {},
      currentFieldIndex: 0,
      currentFlow: [],
      pendingSubmit: null,
      awaitingFieldConfirm: false,
      pendingFieldValue: '',
      pendingGeminiQuery: null,
      modifyingField: null,
    }));
    setTimeout(() => speak(greeting), 300);
  }, [speak]);

  const close = useCallback(() => {
    window.speechSynthesis?.cancel();
    stopListening();
    setState(p => ({ ...INITIAL_STATE, isSupported: p.isSupported }));
  }, [stopListening]);

  const submitText = useCallback((text: string) => {
    processInput(text);
  }, [processInput]);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    };
  }, []);

  return { state, open, close, toggleListening, submitText, speak };
}
