#!/usr/bin/env node
/**
 * setup-supabase.mjs
 * 
 * Script de configuración automática de Supabase para Constructora Vanguardia.
 * 
 * Uso:
 *   node setup-supabase.mjs
 * 
 * Prerequisito: Tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el .env
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Leer variables del .env ──────────────────────────────────────────────
function loadEnv() {
  const envPath = join(__dirname, '.env');
  if (!existsSync(envPath)) {
    console.error('\n❌ Error: No se encontró el archivo .env');
    console.error('   Crea el archivo .env con tus credenciales de Supabase.\n');
    process.exit(1);
  }

  const raw = readFileSync(envPath, 'utf8');
  const vars = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    vars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
  return vars;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || SUPABASE_URL.includes('tu-proyecto') || SUPABASE_URL.includes('placeholder')) {
  console.error('\n❌ Error: VITE_SUPABASE_URL no está configurado correctamente.');
  console.error('   Edita el archivo .env y agrega tu URL de Supabase real.');
  console.error('   La puedes encontrar en: Supabase Dashboard → Settings → API\n');
  process.exit(1);
}

if (!SUPABASE_KEY || SUPABASE_KEY.includes('placeholder')) {
  console.error('\n❌ Error: VITE_SUPABASE_ANON_KEY no está configurado correctamente.');
  console.error('   Edita el archivo .env y agrega tu anon key de Supabase real.\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Colores para la terminal ─────────────────────────────────────────────
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};

// ── Verificar conexión a Supabase ────────────────────────────────────────
async function checkConnection() {
  console.log(c.cyan('\n🔍 Verificando conexión a Supabase...'));
  const { error } = await supabase.from('profiles').select('count').limit(1);
  
  if (error && error.code !== '42P01') {
    // 42P01 = tabla no existe (normal si aún no hay schema)
    if (error.message.includes('JWT')) {
      console.error(c.red('❌ Error de autenticación. Verifica tu VITE_SUPABASE_ANON_KEY.'));
      process.exit(1);
    }
    if (error.message.includes('fetch') || error.message.includes('network')) {
      console.error(c.red('❌ No se puede conectar a Supabase. Verifica tu VITE_SUPABASE_URL.'));
      process.exit(1);
    }
    // Si es otro error, puede ser que las tablas aún no existan
    console.log(c.yellow('⚠️  Las tablas aún no existen — se crearán con las migraciones.'));
    return 'no_tables';
  }
  
  console.log(c.green('✅ Conexión exitosa a Supabase'));
  return 'connected';
}

// ── Verificar si el schema ya existe ────────────────────────────────────
async function checkSchemaExists() {
  const { data } = await supabase.from('projects').select('count').limit(1);
  return data !== null;
}

// ── Verificar si hay proyectos (seed ya ejecutado) ───────────────────────
async function checkSeedExists() {
  const { data } = await supabase.from('projects').select('code').eq('code', 'TVR-04').limit(1);
  return data && data.length > 0;
}

// ── Instrucciones para migraciones ───────────────────────────────────────
function printMigrationInstructions() {
  console.log('\n' + '─'.repeat(60));
  console.log(c.bold(c.cyan('📦 PASO 1: Ejecutar las migraciones del Schema')));
  console.log('─'.repeat(60));
  console.log(`
Las migraciones se encuentran en:
  ${c.yellow('supabase/migrations/')}

Para aplicarlas a tu proyecto Supabase hay ${c.bold('2 opciones')}:

${c.bold('Opción A — Supabase CLI (recomendado):')}
  ${c.cyan('1.')} Obtén tu Project Reference ID:
     Supabase Dashboard → Settings → General → Reference ID
  
  ${c.cyan('2.')} Enlaza tu proyecto:
     ${c.yellow('npx supabase link --project-ref TU_PROJECT_REF_ID')}
  
  ${c.cyan('3.')} Aplica las migraciones:
     ${c.yellow('npx supabase db push')}

${c.bold('Opción B — SQL Editor (más rápido):')}
  ${c.cyan('1.')} Ve a Supabase Dashboard → SQL Editor → New Query
  ${c.cyan('2.')} Abre y copia el contenido de:
     ${c.yellow('supabase/migrations/20260621000001_initial_schema.sql')}
  ${c.cyan('3.')} Haz clic en RUN
  ${c.cyan('4.')} Repite con:
     ${c.yellow('supabase/migrations/20260621000002_seed_data.sql')}
`);
}

// ── Instrucciones para usuario admin ─────────────────────────────────────
function printAdminUserInstructions() {
  console.log('─'.repeat(60));
  console.log(c.bold(c.cyan('👤 PASO 2: Crear el usuario Administrador')));
  console.log('─'.repeat(60));
  console.log(`
En Supabase Dashboard → Authentication → Users → ${c.bold('Add User')}:

  Email:    ${c.yellow('admin@vanguardia.com')}
  Password: ${c.yellow('admin123')}
  
  En "User Metadata" (JSON), pega esto:
  ${c.yellow(`{
    "name": "Admin Principal",
    "role": "admin",
    "avatar_color": "#ea580c"
  }`)}

${c.dim('Nota: El trigger handle_new_auth_user() creará automáticamente')}
${c.dim('el perfil en la tabla profiles al crear el usuario.')}
`);
}

// ── Instrucciones para usuarios trabajadores ──────────────────────────────
function printWorkerUsersInstructions() {
  console.log('─'.repeat(60));
  console.log(c.bold(c.cyan('👷 PASO 3: Crear cuentas para los Trabajadores')));
  console.log('─'.repeat(60));
  
  const workers = [
    { name: 'Carlos Mendoza',  email: 'carlos.mendoza@constructora-vanguardia.com',  id: 'b1c2d3e4-0001-0001-0001-100000000001', pass: 'carlos123' },
    { name: 'Ana Ríos',        email: 'ana.rios@constructora-vanguardia.com',        id: 'b1c2d3e4-0002-0002-0002-100000000002', pass: 'ana123' },
    { name: 'Pedro Gómez',     email: 'pedro.gomez@constructora-vanguardia.com',     id: 'b1c2d3e4-0003-0003-0003-100000000003', pass: 'pedro123' },
    { name: 'Sofía Peralta',   email: 'sofia.peralta@constructora-vanguardia.com',   id: 'b1c2d3e4-0004-0004-0004-100000000004', pass: 'sofia123' },
    { name: 'Juan Carrizo',    email: 'juan.carrizo@constructora-vanguardia.com',    id: 'b1c2d3e4-0005-0005-0005-100000000005', pass: 'juan123' },
  ];

  console.log(`
Para cada trabajador, en Authentication → Users → Add User:
`);
  for (const w of workers) {
    console.log(`  ${c.bold(w.name)}`);
    console.log(`    Email:    ${c.yellow(w.email)}`);
    console.log(`    Password: ${c.yellow(w.pass)}`);
    console.log(`    Metadata: ${c.yellow(`{"name":"${w.name}","role":"worker","worker_id":"${w.id}"}`)}`);
    console.log();
  }
}

// ── Estado final ─────────────────────────────────────────────────────────
function printSummary() {
  console.log('─'.repeat(60));
  console.log(c.bold(c.green('🚀 LISTO — Una vez completados los pasos:')));
  console.log('─'.repeat(60));
  console.log(`
  1. El servidor de desarrollo ya está corriendo: ${c.cyan('npm run dev')}
  2. Actualiza el archivo ${c.yellow('.env')} con tus credenciales reales
  3. Navega a ${c.cyan('http://localhost:5173')} y prueba el login

  ${c.bold('Cuentas de prueba:')}
  Admin:       admin@vanguardia.com / admin123
  Trabajador:  carlos.mendoza@constructora-vanguardia.com / carlos123
`);
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log(c.bold(c.cyan('  🏗️  CONSTRUCTORA VANGUARDIA — Setup de Supabase')));
  console.log('═'.repeat(60));
  console.log(`\n  URL: ${c.dim(SUPABASE_URL)}`);

  const connectionStatus = await checkConnection();
  
  if (connectionStatus === 'connected') {
    const schemaExists = await checkSchemaExists();
    
    if (schemaExists) {
      const seedExists = await checkSeedExists();
      console.log(c.green(`✅ Schema detectado en la base de datos`));
      console.log(seedExists
        ? c.green('✅ Datos de ejemplo ya cargados')
        : c.yellow('⚠️  Datos de ejemplo NO cargados aún (ejecuta la migración 002)')
      );
      console.log('\n' + c.bold('Tu base de datos está lista. Solo necesitas crear los usuarios:'));
      printAdminUserInstructions();
      printWorkerUsersInstructions();
      printSummary();
      return;
    }
  }

  // Si no hay schema, mostrar instrucciones completas
  printMigrationInstructions();
  printAdminUserInstructions();
  printWorkerUsersInstructions();
  printSummary();
}

main().catch(err => {
  console.error(c.red('\n❌ Error inesperado:'), err.message);
  process.exit(1);
});
