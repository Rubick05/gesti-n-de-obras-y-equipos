-- ============================================================
-- MIGRACIÓN 004 — Constructora Vanguardia — Imágenes en Proyectos y Tareas
-- ============================================================

-- Agregar columna image_url a la tabla projects
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Agregar columna image_urls a la tabla tasks (como array de texto para múltiples evidencias)
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS image_urls TEXT[];
