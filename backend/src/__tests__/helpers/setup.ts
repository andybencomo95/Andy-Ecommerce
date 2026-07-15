/**
 * Test helper — configura una base de datos SQLite efímera por suite.
 *
 * Uso:
 * ```ts
 * import { useTestDatabase } from './helpers/setup';
 * const { dbPath } = useTestDatabase();
 * ```
 *
 * Llámalo al inicio del archivo de test, ANTES de importar la app.
 * Garantiza que Prisma use una DB limpia por suite.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface TestDatabase {
  dbPath: string;
  teardown: () => void;
}

/**
 * Crea una base de datos SQLite temporal para la suite de tests.
 * - Pushea el schema de Prisma
 * - Retorna la ruta y un cleanup que borra el archivo
 */
export function useTestDatabase(suiteName: string): TestDatabase {
  const dbDir = path.resolve(__dirname, '../../../prisma');
  const dbName = `test-${suiteName}-${Date.now()}.db`;
  const dbPath = path.join(dbDir, dbName);

  const dbUrl = `file:${dbPath}`;

  // Fijar DATABASE_URL antes de que Prisma se instancie
  process.env.DATABASE_URL = dbUrl;

  // Pushear schema
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    env: { ...process.env, DATABASE_URL: dbUrl },
    cwd: path.resolve(__dirname, '../..'),
    stdio: 'pipe',
  });

  return {
    dbPath,
    teardown: () => {
      try {
        if (fs.existsSync(dbPath)) {
          fs.unlinkSync(dbPath);
        }
        // Eliminar también el journal de SQLite
        const journalPath = `${dbPath}-journal`;
        if (fs.existsSync(journalPath)) {
          fs.unlinkSync(journalPath);
        }
      } catch {
        // Ignorar errores de cleanup
      }
    },
  };
}
