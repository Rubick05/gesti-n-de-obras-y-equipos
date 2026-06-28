-- ============================================================
-- MIGRACIÓN 002 — Seed Data (Solo cuentas iniciales activas)
-- Constructora Vanguardia
-- ============================================================

-- ── Credenciales de Usuarios iniciales ──────────────────────────────────────
INSERT INTO public.user_credentials (email, password, name, role, worker_id, avatar_color)
VALUES 
  ('admin@vanguardia.com', 'admin123', 'Admin Principal', 'admin', NULL, '#ea580c'),
  ('admin', 'admin', 'Admin Principal', 'admin', NULL, '#ea580c'),
  ('carlos.mendoza@constructora-vanguardia.com', 'carlos123', 'Carlos Mendoza', 'worker', NULL, '#0284c7'),
  ('carlos', 'carlos123', 'Carlos Mendoza', 'worker', NULL, '#0284c7')
ON CONFLICT (email) DO NOTHING;
