-- ============================================================
-- CONSTRUCTORA VANGUARDIA — MIGRACIÓN: GRUPOS DE TRABAJO (CUADRILLAS)
-- Ejecutar en: Supabase Dashboard → SQL Editor o vía CLI push
-- ============================================================

-- ── 1. CREACIÓN DE TABLAS ───────────────────────────────────

CREATE TABLE IF NOT EXISTS worker_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  leader_id   UUID REFERENCES workers(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id    UUID NOT NULL REFERENCES worker_groups(id) ON DELETE CASCADE,
  worker_id   UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, worker_id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar columna de asignación de grupo a las tareas
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_group_id UUID REFERENCES worker_groups(id) ON DELETE SET NULL;

-- ── 2. TRIGGERS PARA UPDATED_AT ──────────────────────────────
CREATE TRIGGER trg_updated_at_worker_groups
  BEFORE UPDATE ON worker_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── 3. ROW LEVEL SECURITY (Desactivado para compatibilidad con Auth Bypass) ──
ALTER TABLE worker_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;

-- ── 4. POLÍTICAS RLS ────────────────────────────────────────

-- worker_groups RLS
CREATE POLICY "worker_groups_admin_all" ON worker_groups
  FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "worker_groups_worker_read" ON worker_groups
  FOR SELECT USING (get_my_role() = 'worker');

-- group_members RLS
CREATE POLICY "group_members_admin_all" ON group_members
  FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "group_members_worker_read" ON group_members
  FOR SELECT USING (get_my_role() = 'worker');

-- ── 5. ÍNDICES DE RENDIMIENTO ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_worker_groups_project ON worker_groups(project_id);
CREATE INDEX IF NOT EXISTS idx_worker_groups_leader  ON worker_groups(leader_id);
CREATE INDEX IF NOT EXISTS idx_group_members_worker  ON group_members(worker_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_group  ON tasks(assigned_group_id);
