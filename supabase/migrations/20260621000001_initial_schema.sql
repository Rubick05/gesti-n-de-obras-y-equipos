-- ============================================================
-- MIGRACIÓN 001 — Constructora Vanguardia — Esquema inicial
-- Supabase CLI Migration File
-- Ejecutar con: npx supabase db push
-- ============================================================

-- ── 0. LIMPIAR TABLAS SI EXISTEN (permite re-ejecutar de forma segura) ─────
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS expenses      CASCADE;
DROP TABLE IF EXISTS loans         CASCADE;
DROP TABLE IF EXISTS tasks         CASCADE;
DROP TABLE IF EXISTS tools         CASCADE;
DROP TABLE IF EXISTS workers       CASCADE;
DROP TABLE IF EXISTS projects      CASCADE;
DROP TABLE IF EXISTS profiles      CASCADE;

-- Limpiar funciones si existen
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_auth_user() CASCADE;
DROP FUNCTION IF EXISTS get_my_role() CASCADE;

-- ── 1. TABLA: profiles (extiende auth.users) ──────────────────────────────
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('admin', 'worker')),
  avatar_color  TEXT NOT NULL DEFAULT '#ea580c',
  worker_id     UUID,           -- FK a workers, añadida después
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. TABLA: projects ────────────────────────────────────────────────────
CREATE TABLE projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  code         TEXT NOT NULL UNIQUE,
  location     TEXT,
  start_date   DATE,
  end_date     DATE,
  budget       NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (budget >= 0),
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'planificacion'
               CHECK (status IN ('planificacion','en_progreso','detenido','completado')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. TABLA: workers ─────────────────────────────────────────────────────
CREATE TABLE workers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  role       TEXT NOT NULL,
  email      TEXT UNIQUE,
  phone      TEXT,
  specialty  TEXT,
  status     TEXT NOT NULL DEFAULT 'activo'
             CHECK (status IN ('activo','vacaciones','baja')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FK de profiles → workers (ahora que workers existe)
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_worker
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE SET NULL;

-- ── 4. TABLA: tasks ───────────────────────────────────────────────────────
CREATE TABLE tasks (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assigned_worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
  title              TEXT NOT NULL,
  description        TEXT,
  priority           TEXT NOT NULL DEFAULT 'media'
                     CHECK (priority IN ('baja','media','alta','critica')),
  status             TEXT NOT NULL DEFAULT 'pendiente'
                     CHECK (status IN ('pendiente','en_progreso','completada')),
  due_date           DATE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. TABLA: tools ───────────────────────────────────────────────────────
CREATE TABLE tools (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'otros'
                CHECK (category IN ('maquinaria_pesada','herramienta_electrica','medicion','manual','seguridad','otros')),
  status        TEXT NOT NULL DEFAULT 'disponible'
                CHECK (status IN ('disponible','en_uso','mantenimiento','baja')),
  brand         TEXT,
  serial_number TEXT,
  location      TEXT,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. TABLA: loans ───────────────────────────────────────────────────────
CREATE TABLE loans (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id              UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  worker_id            UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  project_id           UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  borrow_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_return_date DATE NOT NULL,
  actual_return_date   DATE,
  status               TEXT NOT NULL DEFAULT 'activo'
                       CHECK (status IN ('activo','devuelto')),
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. TABLA: expenses ────────────────────────────────────────────────────
CREATE TABLE expenses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category       TEXT NOT NULL DEFAULT 'otro'
                 CHECK (category IN ('materiales','mano_de_obra','maquinaria','subcontrato','administrativo','otro')),
  amount         NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  description    TEXT NOT NULL,
  expense_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  authorized_by  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. TABLA: activity_logs ───────────────────────────────────────────────
CREATE TABLE activity_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project','task','worker','tool','loan','expense','auth')),
  action      TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  details     TEXT,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. FUNCIÓN + TRIGGERS: auto-update de updated_at ─────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_updated_at_profiles  BEFORE UPDATE ON profiles      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_updated_at_projects  BEFORE UPDATE ON projects       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_updated_at_workers   BEFORE UPDATE ON workers        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_updated_at_tasks     BEFORE UPDATE ON tasks          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_updated_at_tools     BEFORE UPDATE ON tools          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_updated_at_loans     BEFORE UPDATE ON loans          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_updated_at_expenses  BEFORE UPDATE ON expenses       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 10. FUNCIÓN + TRIGGER: crear perfil automáticamente al registrar usuario ─
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, avatar_color, worker_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'worker'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_color', '#ea580c'),
    CASE
      WHEN NEW.raw_user_meta_data->>'worker_id' IS NOT NULL
        THEN (NEW.raw_user_meta_data->>'worker_id')::UUID
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- ── 11. FUNCIÓN helper: obtener rol del usuario activo ───────────────────
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── 12. ROW LEVEL SECURITY ────────────────────────────────────────────────
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools         ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- profiles: cada usuario solo ve y edita su propio perfil
CREATE POLICY "profiles_own_access" ON profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.get_my_role() = 'admin');

-- projects: admin total, worker lectura
CREATE POLICY "projects_admin_all"   ON projects FOR ALL    USING (get_my_role() = 'admin');
CREATE POLICY "projects_worker_read" ON projects FOR SELECT USING (get_my_role() = 'worker');

-- workers: admin total, worker lectura
CREATE POLICY "workers_admin_all"   ON workers FOR ALL    USING (get_my_role() = 'admin');
CREATE POLICY "workers_worker_read" ON workers FOR SELECT USING (get_my_role() = 'worker');

-- tasks: admin total, worker solo sus tareas
CREATE POLICY "tasks_admin_all"           ON tasks FOR ALL    USING (get_my_role() = 'admin');
CREATE POLICY "tasks_worker_read_own"     ON tasks FOR SELECT
  USING (get_my_role() = 'worker' AND assigned_worker_id = (SELECT worker_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "tasks_worker_update_status" ON tasks FOR UPDATE
  USING (get_my_role() = 'worker' AND assigned_worker_id = (SELECT worker_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (assigned_worker_id = (SELECT worker_id FROM profiles WHERE id = auth.uid()));

-- tools: admin total, worker lectura
CREATE POLICY "tools_admin_all"   ON tools FOR ALL    USING (get_my_role() = 'admin');
CREATE POLICY "tools_worker_read" ON tools FOR SELECT USING (get_my_role() = 'worker');

-- loans: admin total, worker ve sus propios
CREATE POLICY "loans_admin_all"       ON loans FOR ALL    USING (get_my_role() = 'admin');
CREATE POLICY "loans_worker_read_own" ON loans FOR SELECT
  USING (get_my_role() = 'worker' AND worker_id = (SELECT worker_id FROM profiles WHERE id = auth.uid()));

-- expenses: SOLO admin
CREATE POLICY "expenses_admin_only" ON expenses FOR ALL USING (get_my_role() = 'admin');

-- activity_logs: SOLO admin
CREATE POLICY "logs_admin_only" ON activity_logs FOR ALL USING (get_my_role() = 'admin');

-- ── 13. ÍNDICES para rendimiento ─────────────────────────────────────────
CREATE INDEX idx_tasks_project    ON tasks(project_id);
CREATE INDEX idx_tasks_worker     ON tasks(assigned_worker_id);
CREATE INDEX idx_tasks_status     ON tasks(status);
CREATE INDEX idx_loans_tool       ON loans(tool_id);
CREATE INDEX idx_loans_worker     ON loans(worker_id);
CREATE INDEX idx_loans_status     ON loans(status);
CREATE INDEX idx_expenses_project ON expenses(project_id);
CREATE INDEX idx_logs_type        ON activity_logs(entity_type);
CREATE INDEX idx_logs_date        ON activity_logs(created_at DESC);

-- ── 14. TABLA: user_credentials (autenticación personalizada sin Supabase Auth) ──
CREATE TABLE IF NOT EXISTS public.user_credentials (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL CHECK (role IN ('admin', 'worker')),
  worker_id    UUID REFERENCES public.workers(id) ON DELETE SET NULL,
  avatar_color TEXT NOT NULL DEFAULT '#ea580c',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS y permitir acceso total sin restricciones de token Auth
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_user_credentials" ON public.user_credentials FOR ALL USING (true);
