-- ============================================================
-- MIGRACIÓN 002 — Seed Data (Datos iniciales de prueba)
-- Constructora Vanguardia
-- ============================================================

-- ── Proyectos de ejemplo ──────────────────────────────────────────────────
INSERT INTO projects (id, name, code, location, start_date, end_date, budget, description, status) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Torre Vanguardia Residencial',             'TVR-04', 'Av. Balboa y Calle 53, Obarrio',     '2026-02-15', '2027-08-30', 3500000, 'Construcción de torre de condominios residenciales de 15 niveles con estacionamiento subterráneo, área social con piscina y gimnasio.', 'en_progreso'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Bulevar Comercial Los Olivos',             'BCL-12', 'Vía España, frente a Parque España',  '2026-07-01', '2027-03-15', 1200000, 'Centro comercial abierto con 24 locales, amplias aceras peatonales y paisajismo urbano sostenible.', 'planificacion'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Remodelación Ala Sur Hospital Metropolitano','RHS-22','Bella Vista, Calle Central',        '2026-05-01', '2026-10-20',  450000, 'Remodelación interna de salas de urgencias y cuidados intensivos geriátricos.', 'detenido'),
  ('a1b2c3d4-0004-0004-0004-000000000004', 'Planta de Tratamiento Clayton',            'PTC-09', 'Clayton Este, Canal Lineal',         '2025-01-10', '2026-05-30', 2800000, 'Expansión de la planta potabilizadora con sistema secundario de filtrado de carbón activado.', 'completado');

-- ── Trabajadores de ejemplo ───────────────────────────────────────────────
INSERT INTO workers (id, name, role, email, phone, specialty, status) VALUES
  ('b1c2d3e4-0001-0001-0001-100000000001', 'Carlos Mendoza',  'Supervisor de Obra',            'carlos.mendoza@constructora-vanguardia.com',  '+507 6231-4560', 'Concreto Estructural',                  'activo'),
  ('b1c2d3e4-0002-0002-0002-100000000002', 'Ana Ríos',        'Coordinadora de Seguridad',     'ana.rios@constructora-vanguardia.com',        '+507 6590-1122', 'SST (Salud y Seguridad en el Trabajo)', 'activo'),
  ('b1c2d3e4-0003-0003-0003-100000000003', 'Pedro Gómez',     'Operario de Maquinaria Pesada', 'pedro.gomez@constructora-vanguardia.com',     '+507 6877-3344', 'Excavación y Movimiento de Tierra',     'activo'),
  ('b1c2d3e4-0004-0004-0004-100000000004', 'Sofía Peralta',   'Electricista Principal',        'sofia.peralta@constructora-vanguardia.com',   '+507 6112-9988', 'Instalaciones de Alta Tensión',         'activo'),
  ('b1c2d3e4-0005-0005-0005-100000000005', 'Juan Carrizo',    'Maestro de Albañilería',        'juan.carrizo@constructora-vanguardia.com',    '+507 6445-5621', 'Acabados y Estructuras Livianas',       'activo'),
  ('b1c2d3e4-0006-0006-0006-100000000006', 'Manuel Centella', 'Ayudante General',              'manuel.centella@constructora-vanguardia.com', '+507 6001-2233', 'Tendido y Logística en Sitio',          'vacaciones');

-- ── Tareas de ejemplo ─────────────────────────────────────────────────────
INSERT INTO tasks (project_id, assigned_worker_id, title, description, priority, status, due_date) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001','b1c2d3e4-0001-0001-0001-100000000001','Vaciado de Losa de Concreto - Nivel 4','Vaciado continuo de losa del piso 4. Requiere camión mezclador y vibradores.','alta','en_progreso','2026-06-20'),
  ('a1b2c3d4-0001-0001-0001-000000000001','b1c2d3e4-0002-0002-0002-100000000002','Inspección de Arneses y Líneas de Vida','Auditoría obligatoria de todos los EPP y anclajes en alturas.','critica','completada','2026-06-12'),
  ('a1b2c3d4-0001-0001-0001-000000000001','b1c2d3e4-0004-0004-0004-100000000004','Canalización Eléctrica para Sótano 2','Instalar ductos de acero EMT y cajas de registro secundarias.','media','pendiente','2026-06-25'),
  ('a1b2c3d4-0002-0002-0002-000000000002','b1c2d3e4-0003-0003-0003-100000000003','Estudio Topográfico de Terreno','Tomar cotas de referencia con la estación topográfica.','media','completada','2026-06-08'),
  ('a1b2c3d4-0002-0002-0002-000000000002','b1c2d3e4-0003-0003-0003-100000000003','Excavación Principal para Fundación','Uso de excavadora pesada según plano C-101.','alta','pendiente','2026-07-10'),
  ('a1b2c3d4-0003-0003-0003-000000000003','b1c2d3e4-0005-0005-0005-100000000005','Desmantelamiento de Ductos de Ventilamiento','Remoción de conductos galvanizados y aislamiento deteriorado.','alta','en_progreso','2026-06-28'),
  ('a1b2c3d4-0004-0004-0004-000000000004','b1c2d3e4-0001-0001-0001-100000000001','Prueba de Presión del Sistema de Filtrado','Sistema de tuberías a presión hidrostática de 150 PSI por 4 horas.','critica','completada','2026-05-24');

-- ── Herramientas de ejemplo ───────────────────────────────────────────────
INSERT INTO tools (code, name, category, status, brand, serial_number, location, image_url) VALUES
  ('CAT-320D', 'Excavadora Caterpillar 320D',         'maquinaria_pesada',     'en_uso',       'Caterpillar','CAT0320DBJX83921','Sitio A-1 (Torre)','https://images.unsplash.com/photo-1579294800821-694d95e86143?w=500&auto=format&fit=crop&q=60'),
  ('ROT-BOS8', 'Rotomartillo SDS-Max 1500W',          'herramienta_electrica', 'disponible',   'Bosch',      'BSH-GBH845-9281', 'Bodega Central',   'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=60'),
  ('EST-TOP5', 'Estación Total Láser Profesional',    'medicion',              'disponible',   'Topcon',     'TPC-ES50-77123',  'Bodega Central',   'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60'),
  ('GEN-HON6', 'Generador Eléctrico Portátil 6.5kW', 'herramienta_electrica', 'en_uso',       'Honda',      'HON-GX390-34821', 'Bodega Central',   'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=500&auto=format&fit=crop&q=60'),
  ('ESM-DEW9', 'Esmeril Angular 9"',                  'herramienta_electrica', 'disponible',   'Dewalt',     'DEW-D28490-5511', 'Bodega Central',   'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&auto=format&fit=crop&q=60'),
  ('SIE-MAK1', 'Sierra de Mesa para Madera 10"',      'herramienta_electrica', 'mantenimiento','Makita',     'MAK-MLT100-11029','Taller de Soporte','https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=60'),
  ('NIV-MILK', 'Nivel Electrónico Digital',           'medicion',              'disponible',   'Milwaukee',  'MIL-NV60-12093',  'Bodega Central',   'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?w=500&auto=format&fit=crop&q=60'),
  ('ROT-DEW2', 'Rotomartillo SDS-Plus Inalámbrico',  'herramienta_electrica', 'disponible',   'Dewalt',     'DEW-DCH133-88231','Bodega Central',   'https://images.unsplash.com/photo-1540104709530-768832cf1acb?w=500&auto=format&fit=crop&q=60');

-- ── Préstamos de ejemplo (usando subqueries por seguridad) ────────────────
INSERT INTO loans (tool_id, worker_id, project_id, borrow_date, expected_return_date, status, notes)
SELECT t.id, w.id, p.id, '2026-06-10', '2026-06-25', 'activo', 'Excavación de cimientos Torre Vanguardia.'
FROM tools t, workers w, projects p
WHERE t.code='CAT-320D' AND w.email='pedro.gomez@constructora-vanguardia.com' AND p.code='TVR-04';

INSERT INTO loans (tool_id, worker_id, project_id, borrow_date, expected_return_date, status, notes)
SELECT t.id, w.id, p.id, '2026-06-12', '2026-06-16', 'activo', 'Suministro de energía para soldadura Nivel 3.'
FROM tools t, workers w, projects p
WHERE t.code='GEN-HON6' AND w.email='sofia.peralta@constructora-vanguardia.com' AND p.code='TVR-04';

-- ── Gastos de ejemplo ─────────────────────────────────────────────────────
INSERT INTO expenses (project_id, category, amount, description, expense_date, authorized_by)
SELECT id,'materiales',485000,'Cemento Portland, varillas de acero, arena y piedra triturada (Niveles 1-4).','2026-03-10','Admin Principal' FROM projects WHERE code='TVR-04';

INSERT INTO expenses (project_id, category, amount, description, expense_date, authorized_by)
SELECT id,'mano_de_obra',320000,'Cuadrillas de concreto, carpintería de formaleta (Niveles 1-4).','2026-04-01','Admin Principal' FROM projects WHERE code='TVR-04';

INSERT INTO expenses (project_id, category, amount, description, expense_date, authorized_by)
SELECT id,'maquinaria',95000,'Alquiler de grúa torre 3 meses + mantenimiento CAT-320D.','2026-04-15','Admin Principal' FROM projects WHERE code='TVR-04';

INSERT INTO expenses (project_id, category, amount, description, expense_date, authorized_by)
SELECT id,'subcontrato',210000,'Instalaciones Eléctricas Panamá S.A. — cableado y tableros.','2026-05-01','Admin Principal' FROM projects WHERE code='TVR-04';

INSERT INTO expenses (project_id, category, amount, description, expense_date, authorized_by)
SELECT id,'materiales',85000,'Materiales para estudio de suelos y estacas topográficas.','2026-06-05','Admin Principal' FROM projects WHERE code='BCL-12';

INSERT INTO expenses (project_id, category, amount, description, expense_date, authorized_by)
SELECT id,'materiales',125000,'Ductos HVAC de acero inoxidable y aislamiento térmico clase A.','2026-05-10','Admin Principal' FROM projects WHERE code='RHS-22';

INSERT INTO expenses (project_id, category, amount, description, expense_date, authorized_by)
SELECT id,'subcontrato',98000,'Empresa especializada en remoción de asbesto (certificación OSHA).','2026-05-20','Admin Principal' FROM projects WHERE code='RHS-22';

INSERT INTO expenses (project_id, category, amount, description, expense_date, authorized_by)
SELECT id,'materiales',740000,'Tuberías HDPE, válvulas de control y carbón activado granular.','2025-03-15','Admin Principal' FROM projects WHERE code='PTC-09';

INSERT INTO expenses (project_id, category, amount, description, expense_date, authorized_by)
SELECT id,'mano_de_obra',560000,'Cuadrillas especializadas en sistemas de tratamiento de agua.','2025-08-01','Admin Principal' FROM projects WHERE code='PTC-09';

INSERT INTO expenses (project_id, category, amount, description, expense_date, authorized_by)
SELECT id,'administrativo',85000,'Permisos ambientales, seguros y gastos legales.','2025-06-01','Admin Principal' FROM projects WHERE code='PTC-09';

-- ── Logs de actividad iniciales ───────────────────────────────────────────
INSERT INTO activity_logs (entity_type, action, entity_name, details) VALUES
  ('project', 'Obra Registrada', 'Torre Vanguardia Residencial', 'Código: TVR-04. Presupuesto: $3,500,000'),
  ('project', 'Obra Registrada', 'Bulevar Comercial Los Olivos', 'Código: BCL-12. Presupuesto: $1,200,000'),
  ('project', 'Obra Registrada', 'Planta de Tratamiento Clayton', 'Código: PTC-09. Estado: Completado'),
  ('worker',  'Personal Registrado', 'Carlos Mendoza', 'Puesto: Supervisor de Obra'),
  ('worker',  'Personal Registrado', 'Ana Ríos', 'Puesto: Coordinadora de Seguridad');
