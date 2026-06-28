import React, { useState } from 'react';
import { Tool, Worker, Project, Loan, ToolCategory, ToolStatus } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Wrench, 
  Lock, 
  Unlock, 
  RotateCcw, 
  History, 
  Filter, 
  Search, 
  User, 
  Briefcase, 
  Calendar, 
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Check
} from 'lucide-react';

interface InventoryViewProps {
  tools: Tool[];
  loans: Loan[];
  workers: Worker[];
  projects: Project[];
  onAddTool: (tool: Omit<Tool, 'id'>) => void | Promise<void>;
  onUpdateTool: (tool: Tool) => void | Promise<void>;
  onDeleteTool: (toolId: string) => void | Promise<void>;
  onCheckoutTool: (toolId: string, workerId: string, projectId: string, expectedReturnDate: string, notes?: string) => void | Promise<void>;
  onCheckinTool: (loanId: string, notes?: string) => void | Promise<void>;
}

export default function InventoryView({
  tools,
  loans,
  workers,
  projects,
  onAddTool,
  onUpdateTool,
  onDeleteTool,
  onCheckoutTool,
  onCheckinTool
}: InventoryViewProps) {
  // Pestañas de navegación
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');

  // Control de formularios y ventanas emergentes
  const [showToolForm, setShowToolForm] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  const [checkoutToolId, setCheckoutToolId] = useState<string | null>(null);
  const [checkinLoanId, setCheckinLoanId] = useState<string | null>(null);

  // Filtros de búsqueda
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Campos del formulario de herramientas
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ToolCategory>('herramienta_electrica');
  const [status, setStatus] = useState<ToolStatus>('disponible');
  const [brand, setBrand] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Campos para realizar préstamo (Checkout)
  const [checkoutWorkerId, setCheckoutWorkerId] = useState('');
  const [checkoutProjectId, setCheckoutProjectId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('');

  // Campos para devolución (Checkin)
  const [checkinNotes, setCheckinNotes] = useState('');

  // Imágenes predefinidas recomendadas según la categoría
  const presets = [
    { label: 'Excavadora', url: 'https://images.unsplash.com/photo-1579294800821-694d95e86143?w=500&auto=format&fit=crop&q=60' },
    { label: 'Rotomartillo/Taladro', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=60' },
    { label: 'Estación de Medición', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60' },
    { label: 'Herramientas Manuales', url: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&auto=format&fit=crop&q=60' },
    { label: 'Equipo de Seguridad', url: 'https://images.unsplash.com/photo-1590103512988-3e8208477880?w=500&auto=format&fit=crop&q=60' }
  ];

  // Imágenes por defecto según categoría (cuando no se especifica ninguna)
  const getToolImage = (tool: Tool) => {
    if (tool.imageUrl) return tool.imageUrl;
    const fallbacks: Record<ToolCategory, string> = {
      maquinaria_pesada: 'https://images.unsplash.com/photo-1579294800821-694d95e86143?w=500&auto=format&fit=crop&q=60',
      herramienta_electrica: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=60',
      medicion: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
      manual: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&auto=format&fit=crop&q=60',
      seguridad: 'https://images.unsplash.com/photo-1590103512988-3e8208477880?w=500&auto=format&fit=crop&q=60',
      otros: 'https://images.unsplash.com/photo-1530124566582-ab059d8598a5?w=500&auto=format&fit=crop&q=60'
    };
    return fallbacks[tool.category] || fallbacks.otros;
  };

  // Conversión de archivo local a Base64 con redimensionamiento
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 400; // tamaño máximo para optimizar almacenamiento local
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          setImageUrl(compressedBase64);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Abrir formulario para agregar nuevo equipo
  const handleOpenToolForm = () => {
    setCode('');
    setName('');
    setCategory('herramienta_electrica');
    setStatus('disponible');
    setBrand('');
    setSerialNumber('');
    setLocation('Estante Central A');
    setImageUrl('');
    setEditingTool(null);
    setShowToolForm(true);
  };

  // Abrir formulario para editar equipo
  const handleOpenEditForm = (tool: Tool, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTool(tool);
    setCode(tool.code);
    setName(tool.name);
    setCategory(tool.category);
    setStatus(tool.status);
    setBrand(tool.brand);
    setSerialNumber(tool.serialNumber);
    setLocation(tool.location);
    setImageUrl(tool.imageUrl || '');
    setShowToolForm(true);
  };

  // Enviar formulario (Crear o Actualizar)
  const handleSubmitTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    if (editingTool) {
      onUpdateTool({
        ...editingTool,
        code,
        name,
        category,
        status,
        brand,
        serialNumber,
        location,
        imageUrl: imageUrl || undefined
      });
    } else {
      onAddTool({
        code,
        name,
        category,
        status,
        brand,
        serialNumber,
        location,
        imageUrl: imageUrl || undefined
      });
    }
    setShowToolForm(false);
    setEditingTool(null);
  };

  // Inicializar ventana de Préstamo
  const handleOpenCheckout = (toolId: string) => {
    setCheckoutToolId(toolId);
    setCheckoutWorkerId(workers.filter(w => w.status === 'activo')[0]?.id || '');
    setCheckoutProjectId(projects.filter(p => p.status === 'en_progreso')[0]?.id || '');
    
    // Devolución por defecto en 7 días
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setExpectedReturnDate(nextWeek.toISOString().substring(0, 10));
    setCheckoutNotes('');
  };

  // Confirmar préstamo
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutToolId || !checkoutWorkerId || !checkoutProjectId || !expectedReturnDate) return;
    onCheckoutTool(checkoutToolId, checkoutWorkerId, checkoutProjectId, expectedReturnDate, checkoutNotes);
    setCheckoutToolId(null);
  };

  // Inicializar devolución
  const handleOpenCheckin = (toolId: string) => {
    const activeLoan = loans.find(l => l.toolId === toolId && l.status === 'activo');
    if (activeLoan) {
      setCheckinLoanId(activeLoan.id);
      setCheckinNotes('');
    }
  };

  // Confirmar devolución
  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinLoanId) return;
    onCheckinTool(checkinLoanId, checkinNotes);
    setCheckinLoanId(null);
  };

  // Filtrado de equipos
  const filteredTools = tools.filter(t => {
    if (filterCategory !== 'todos' && t.category !== filterCategory) return false;
    if (filterStatus !== 'todos' && t.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.brand.toLowerCase().includes(q) ||
        t.serialNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categoryLabels: Record<ToolCategory, string> = {
    maquinaria_pesada: 'Maquinaria Pesada',
    herramienta_electrica: 'Herramientas Eléctricas',
    medicion: 'Equipos de Medición',
    manual: 'Herramientas Manuales',
    seguridad: 'Equipos de Seguridad',
    otros: 'Otros Materiales'
  };

  const statusConfigs: Record<ToolStatus, { bg: string, text: string, label: string }> = {
    disponible: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-700', label: 'Disponible' },
    en_uso: { bg: 'bg-orange-50 text-orange-850 border-orange-200', text: 'text-orange-700', label: 'En Uso (Prestado)' },
    mantenimiento: { bg: 'bg-amber-50 text-amber-800 border-amber-250', text: 'text-amber-700', label: 'En Reparación' },
    baja: { bg: 'bg-slate-100 text-slate-500 border-slate-200', text: 'text-slate-500', label: 'Retirado / Baja' }
  };

  return (
    <div className="space-y-6" id="inventory-view-main">
      
      {/* CABECERA CON LENGUAJE CLARO Y DIDÁCTICO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4" id="inventory-view-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Inventario de Equipos y Herramientas</h1>
          <p className="text-slate-500 text-xs mt-1">Registra las herramientas de la empresa, sube fotos de su estado actual y contróla a quién se las prestas para cada obra.</p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <div className="border border-slate-200 bg-white p-0.5 rounded-lg flex text-xs font-medium">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer transition ${
                activeTab === 'catalog' ? 'bg-slate-900 text-white shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Wrench className="h-3.5 w-3.5" /> Lista de Equipos
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer transition ${
                activeTab === 'history' ? 'bg-slate-900 text-white shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <History className="h-3.5 w-3.5" /> Historial de Préstamos
            </button>
          </div>

          <button
            onClick={handleOpenToolForm}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            id="btn-new-tool"
          >
            <Plus className="h-4 w-4" /> Registrar Equipo
          </button>
        </div>
      </div>

      {/* RENDER VISTA 1: CATÁLOGO DE EQUIPOS */}
      {activeTab === 'catalog' && (
        <div className="space-y-6" id="tab-inventory-catalog">
          
          {/* TARJETA DIDÁCTICA EXPLICATIVA */}
          <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 flex gap-3 text-xs text-orange-900">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-700 h-max">
              <Wrench className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-semibold text-orange-950">¿Cómo funciona esta sección?</p>
              <p className="text-orange-800/95 mt-0.5">
                Aquí puedes ver todas las herramientas de la constructora. Si una herramienta está <strong>Disponible</strong>, puedes hacer clic en <strong>"Prestar Equipo"</strong> para asignársela a un trabajador. Cuando la devuelvan, haz clic en <strong>"Recibir Devolución"</strong> para que vuelva a estar libre en la bodega.
              </p>
            </div>
          </div>

          {/* RESUMEN DE NÚMEROS CLAROS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="inventory-stats-row">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total de Equipos</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{tools.length} unidades</span>
            </div>
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] text-emerald-600 font-bold uppercase block">Listos en Bodega</span>
              <span className="text-xl font-bold text-emerald-800 mt-1 block">
                {tools.filter(t => t.status === 'disponible').length} disponibles
              </span>
            </div>
            <div className="bg-orange-50/40 border border-orange-100 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] text-orange-600 font-bold uppercase block">Prestados en Obras</span>
              <span className="text-xl font-bold text-orange-850 mt-1 block">
                {tools.filter(t => t.status === 'en_uso').length} en campo
              </span>
            </div>
            <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] text-amber-700 font-bold uppercase block">En Mantenimiento</span>
              <span className="text-xl font-bold text-amber-800 mt-1 block">
                {tools.filter(t => t.status === 'mantenimiento').length} bajo revisión
              </span>
            </div>
          </div>

          {/* BARRA DE FILTROS DE BÚSQUEDA SENCILA */}
          <div className="bg-white rounded-xl border border-slate-250 p-4 space-y-3 shadow-2xs" id="inventory-filter-deck">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1" id="tool-search-bar">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar equipo por nombre, código único, marca o número de serie..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs shrink-0" id="tool-filter-cat">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500 font-medium">Categoría:</span>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 focus:outline-hidden font-semibold text-slate-700"
                >
                  <option value="todos">Todas</option>
                  <option value="maquinaria_pesada">Maquinaria Pesada</option>
                  <option value="herramienta_electrica">Herramientas Eléctricas</option>
                  <option value="medicion">Equipos de Medición</option>
                  <option value="manual">Herramientas Manuales</option>
                  <option value="seguridad">Equipos de Seguridad</option>
                  <option value="otros">Otros / Consumibles</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs shrink-0" id="tool-filter-st">
                <span className="text-slate-500 font-medium">Disponibilidad:</span>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 focus:outline-hidden font-semibold text-slate-700"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="disponible">Disponibles</option>
                  <option value="en_uso">Prestados (En Uso)</option>
                  <option value="mantenimiento">En Mantenimiento</option>
                  <option value="baja">Dados de Baja</option>
                </select>
              </div>
            </div>
          </div>

          {/* FORMULARIO: REGISTRAR / EDITAR EQUIPO CON IMAGEN */}
          {showToolForm && (
            <div className="bg-white rounded-xl border-2 border-orange-500 p-6 space-y-4 shadow-sm animate-fadeIn" id="tool-form-container">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
                <Wrench className="h-5 w-5 text-orange-600" />
                {editingTool ? 'Modificar Información del Equipo' : 'Registrar Nuevo Equipo en Inventario'}
              </h3>
              
              <form onSubmit={handleSubmitTool} className="space-y-4" id="tool-form">
                
                {/* SECCIÓN DE IMAGEN DESTACADA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-150 pb-5">
                  <div className="md:col-span-1 flex flex-col items-center justify-center border border-dashed border-slate-300 bg-slate-50 rounded-xl p-4 relative min-h-[160px]">
                    {imageUrl ? (
                      <div className="w-full h-full flex flex-col items-center relative">
                        <img 
                          src={imageUrl} 
                          alt="Previsualización" 
                          className="max-h-[140px] max-w-full object-cover rounded-lg shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="mt-2 text-xs text-red-650 hover:underline font-semibold"
                        >
                          Quitar Foto
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-2 flex flex-col items-center">
                        <ImageIcon className="h-8 w-8 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-750">Foto del Equipo</span>
                        <p className="text-[10px] text-slate-450 px-2">Sube una foto desde tu PC o selecciona un ejemplo rápido.</p>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-3 flex flex-col justify-center">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <Upload className="h-3.5 w-3.5" /> Subir Imagen desde el Ordenador
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">O escribe una URL de imagen directamente:</label>
                      <input
                        type="text"
                        placeholder="Ej. https://url-de-la-imagen.jpg"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        className="w-full bg-white border border-slate-250 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ejemplos Rápidos de Ilustración:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {presets.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setImageUrl(p.url)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 rounded px-2.5 py-1 text-[10.5px] font-medium transition cursor-pointer"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* FORMULARIO DE DETALLES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Equipo *</label>
                    <input
                      required
                      type="text"
                      placeholder="Ej. Rotomartillo Inalámbrico 20V"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Código Único (Ficha/SKU) *</label>
                    <input
                      required
                      type="text"
                      placeholder="Ej. ROT-DEW-02"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría del Equipo *</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as ToolCategory)}
                      className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-slate-900"
                    >
                      <option value="maquinaria_pesada">Maquinaria Pesada</option>
                      <option value="herramienta_electrica">Herramientas Eléctricas</option>
                      <option value="medicion">Equipos de Medición</option>
                      <option value="manual">Herramientas Manuales</option>
                      <option value="seguridad">Equipos de Seguridad</option>
                      <option value="otros">Otros Materiales</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Marca</label>
                    <input
                      type="text"
                      placeholder="Ej. Dewalt, Bosch, Caterpillar"
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Serie (S/N)</label>
                    <input
                      type="text"
                      placeholder="Ej. SN-7821A-XX"
                      value={serialNumber}
                      onChange={e => setSerialNumber(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ubicación en Bodega</label>
                    <input
                      type="text"
                      placeholder="Ej. Estante Central A"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Estado de Disponibilidad inicial *</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as ToolStatus)}
                      className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-orange-500 text-slate-900"
                    >
                      <option value="disponible">Excelente (Disponible para usar)</option>
                      <option value="mantenimiento">No Calibrado / En Reparación</option>
                      <option value="baja">Dado de baja (No utilizar)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowToolForm(false); setEditingTool(null); }}
                    className="border border-slate-350 text-slate-700 bg-white hover:bg-slate-50 font-semibold px-4 py-2 text-xs rounded-lg transition cursor-pointer"
                  >
                    Cerrar Formulario
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2 text-xs rounded-lg transition shadow-xs cursor-pointer"
                  >
                    {editingTool ? 'Guardar Información' : 'Registrar Equipo'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DIÁLOGO EMERGENTE: FORMULARIO DE PRÉSTAMO (CHECKOUT) */}
          {checkoutToolId && (
            <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border-2 border-orange-500 shadow-md animate-fadeIn" id="checkout-form-panel">
              <h3 className="font-bold text-white text-base mb-1.5 flex items-center gap-2">
                <Lock className="h-5 w-5 text-orange-400" />
                Prestar Herramienta o Equipo
              </h3>
              <p className="text-xs text-slate-300 mb-5">
                Estás prestando la herramienta: 
                <span className="text-orange-400 font-bold ml-1.5">
                  {tools.find(t => t.id === checkoutToolId)?.name} ({tools.find(t => t.id === checkoutToolId)?.code})
                </span>
              </p>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4" id="checkout-loan-form">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">¿Quién recibe la herramienta? *</label>
                    <select
                      required
                      value={checkoutWorkerId}
                      onChange={e => setCheckoutWorkerId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                    >
                      <option value="">Selecciona al trabajador...</option>
                      {workers.filter(w => w.status === 'activo').map(w => (
                        <option key={w.id} value={w.id}>{w.name} - {w.role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">¿Para qué obra o proyecto? *</label>
                    <select
                      required
                      value={checkoutProjectId}
                      onChange={e => setCheckoutProjectId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                    >
                      <option value="">Selecciona la obra...</option>
                      {projects.filter(p => p.status !== 'completado').map(p => (
                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">¿Cuándo se debe devolver? *</label>
                    <input
                      required
                      type="date"
                      value={expectedReturnDate}
                      onChange={e => setExpectedReturnDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Notas sobre cómo se entrega el equipo:</label>
                  <input
                    type="text"
                    placeholder="Ej. Con maletín de plástico, cargador y dos baterías..."
                    value={checkoutNotes}
                    onChange={e => setCheckoutNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setCheckoutToolId(null)}
                    className="bg-transparent border border-slate-700 text-slate-300 hover:text-white px-4 py-2 text-xs rounded-lg transition"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2 text-xs rounded-lg transition shadow-sm"
                  >
                    Confirmar Préstamo
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DIÁLOGO EMERGENTE: FORMULARIO DE DEVOLUCIÓN (CHECKIN) */}
          {checkinLoanId && (
            <div className="bg-emerald-950 p-6 rounded-xl border-2 border-emerald-500 text-emerald-50 shadow-md animate-fadeIn" id="checkin-return-panel">
              <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-emerald-300" />
                Devolución de Herramienta a Bodega
              </h3>
              <p className="text-xs text-emerald-200 mb-4">
                El equipo volverá a estar registrado en bodega principal como disponible para futuros préstamos.
              </p>

              <form onSubmit={handleCheckinSubmit} className="space-y-4" id="checkin-notes-form">
                <div>
                  <label className="block text-xs font-semibold text-emerald-100 mb-1">¿En qué estado se recibe la herramienta?</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Devuelta en buen estado, limpia y con sus accesorios."
                    value={checkinNotes}
                    onChange={e => setCheckinNotes(e.target.value)}
                    className="w-full bg-emerald-900 border border-emerald-800 text-white rounded-lg px-3 py-2.5 text-xs focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs border-t border-emerald-900 pt-4">
                  <button
                    type="button"
                    onClick={() => setCheckinLoanId(null)}
                    className="bg-transparent border border-emerald-800 text-emerald-300 hover:text-white px-4 py-2 rounded-lg"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="bg-white text-emerald-950 font-bold px-5 py-2 rounded-lg shadow-sm"
                  >
                    Confirmar Recepción
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* GRID PRINCIPAL DE TARJETAS DE EQUIPO (DISEÑO PREMIUM CON IMAGEN) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="tools-catalog-grid">
            {filteredTools.map((tool) => {
              const statusStyle = statusConfigs[tool.status];
              const activeLoan = loans.find(l => l.toolId === tool.id && l.status === 'activo');
              const borrower = activeLoan ? workers.find(w => w.id === activeLoan.workerId) : null;
              const targetProj = activeLoan ? projects.find(p => p.id === activeLoan.projectId) : null;
              const toolImg = getToolImage(tool);

              return (
                <div 
                  key={tool.id} 
                  className={`bg-white rounded-2xl border transition shadow-2xs hover:shadow-sm border-slate-200 overflow-hidden flex flex-col justify-between`}
                  id={`tool-card-render-${tool.id}`}
                >
                  
                  {/* Foto de la herramienta y estatus flotante */}
                  <div className="relative h-44 w-full bg-slate-100 shrink-0">
                    <img 
                      src={toolImg} 
                      alt={tool.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"></div>
                    
                    {/* Estatus flotante */}
                    <span className={`absolute top-3 right-3 text-[10px] font-bold border px-2.5 py-0.5 rounded-full shadow-2xs ${statusStyle.bg}`}>
                      {statusStyle.label}
                    </span>
                    
                    {/* Categoría flotante inferior */}
                    <span className="absolute bottom-3 left-3 text-[9px] uppercase font-mono tracking-wider font-semibold bg-white/90 text-slate-800 border border-slate-250 px-2 py-0.5 rounded">
                      {categoryLabels[tool.category]}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Título y detalles básicos */}
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-slate-900 font-sans tracking-tight leading-snug">{tool.name}</h3>
                        <p className="text-xs text-slate-400 font-mono">Marca: {tool.brand} • S/N: {tool.serialNumber || 'N/D'}</p>
                      </div>

                      {/* Código de la herramienta y ubicación */}
                      <div className="flex items-center gap-2.5 text-[10px] font-mono text-slate-500 mt-2.5">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold border border-slate-200">
                          {tool.code}
                        </span>
                        <span>•</span>
                        <span>Bodega: {tool.location || 'Central'}</span>
                      </div>

                      {/* INFORMACIÓN DEL PRÉSTAMO ACTIVO */}
                      {activeLoan && borrower && (
                        <div className="bg-orange-50/70 p-3 rounded-lg border border-orange-100 mt-4 text-xs space-y-1" id={`tool-checkout-info-${tool.id}`}>
                          <div className="text-[9px] text-orange-600 font-bold uppercase tracking-wider">Detalles del Préstamo</div>
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Prestado a:</span>
                            <span className="font-bold text-slate-900">{borrower.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Obra destino:</span>
                            <span className="font-semibold text-slate-850 truncate">{targetProj?.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[9.5px] pt-0.5">
                            <Calendar className="h-3 w-3" />
                            <span>Devolver antes de: {activeLoan.expectedReturnDate}</span>
                          </div>
                          {activeLoan.notes && (
                            <div className="text-[10.5px] italic text-slate-500 mt-1 pl-1 line-clamp-1 border-l-2 border-orange-200">
                              "{activeLoan.notes}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* BOTONES DE OPERACIONES */}
                    <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between">
                      <div>
                        {tool.status === 'disponible' ? (
                          <button
                            onClick={() => handleOpenCheckout(tool.id)}
                            className="bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer shadow-2xs"
                            id={`btn-borrow-tool-${tool.id}`}
                          >
                            <Unlock className="h-3.5 w-3.5" /> Prestar
                          </button>
                        ) : tool.status === 'en_uso' ? (
                          <button
                            onClick={() => handleOpenCheckin(tool.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer shadow-2xs"
                            id={`btn-return-tool-${tool.id}`}
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Devolver
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 border border-slate-200 rounded-lg">No Disponible</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleOpenEditForm(tool, e)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Editar Ficha"
                          id={`btn-edit-tool-${tool.id}`}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de que quieres eliminar a "${tool.name}" del inventario?`)) {
                              onDeleteTool(tool.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar del inventario"
                          id={`btn-delete-tool-${tool.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}

            {filteredTools.length === 0 && (
              <div className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-xl p-8 text-center" id="catalog-empty-state">
                <AlertCircle className="h-8 w-8 text-slate-450 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-800 text-sm">No se encontraron herramientas</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Prueba cambiando los filtros de categoría o disponibilidad en el menú de arriba.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* RENDER VISTA 2: HISTORIAL DE PRÉSTAMOS */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs animate-fadeIn" id="tab-inventory-history">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Registro Completo de Préstamos y Devoluciones</h3>
              <p className="text-xs text-slate-500 mt-0.5">Consulta la lista histórica de cuándo salieron y entraron las herramientas de bodega.</p>
            </div>
          </div>

          <div className="overflow-x-auto min-w-full" id="history-loans-table-wrapper">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs" id="history-loans-table">
              <thead className="bg-slate-50/70 uppercase font-mono font-bold text-slate-400 text-[10px]" id="history-loans-table-head">
                <tr>
                  <th className="px-5 py-3.5">Equipo</th>
                  <th className="px-5 py-3.5">Trabajador</th>
                  <th className="px-5 py-3.5">Obra de Destino</th>
                  <th className="px-5 py-3.5">Préstamo</th>
                  <th className="px-5 py-3.5">Devolución</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5">Notas de Entrega / Retorno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100" id="history-loans-table-body">
                {loans.map((loan) => {
                  const tool = tools.find(t => t.id === loan.toolId);
                  const worker = workers.find(w => w.id === loan.workerId);
                  const project = projects.find(p => p.id === loan.projectId);

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/50" id={`history-row-${loan.id}`}>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{tool?.name || 'Equipo eliminado'}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Cód: {tool?.code || 'N/D'}</div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {worker?.name || 'Empleado retirado'}
                        <div className="text-[10px] text-slate-400 mt-0.5">{worker?.role}</div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {project?.name || 'Obra archivada'}
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Código: {project?.code}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-700">
                        {loan.borrowDate}
                      </td>
                      <td className="px-5 py-4 font-mono">
                        {loan.status === 'devuelto' ? (
                          <div className="text-emerald-700 font-bold flex items-center gap-1">
                            Devuelto: {loan.actualReturnDate}
                          </div>
                        ) : (
                          <div className="text-slate-850 flex flex-col">
                            <span className="font-semibold">Plazo: {loan.expectedReturnDate}</span>
                            <span className="text-[9.5px] font-sans font-bold text-orange-600">(Aún en obra)</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono border ${
                          loan.status === 'devuelto' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-orange-50 text-orange-850 border-orange-200'
                        }`}>
                          {loan.status === 'devuelto' ? 'Devuelto' : 'Prestado'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-xs truncate" title={loan.notes}>
                        <div className="font-sans italic">"{loan.notes || 'Sin anotaciones'}"</div>
                      </td>
                    </tr>
                  );
                })}
                {loans.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      No hay registros de préstamos todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
