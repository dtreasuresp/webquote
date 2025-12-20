import { defineConfig, devices } from '@playwright/test'

/**
 * Configuración de Playwright para tests E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Timeout global para cada test
  timeout: 30 * 1000,
  
  // Expectativas con timeout más corto
  expect: {
    timeout: 5000
  },
  
  // Configuración de ejecución
  fullyParallel: true, // Tests en paralelo
  forbidOnly: !!process.env.CI, // Fallar en CI si hay test.only
  retries: process.env.CI ? 2 : 0, // Reintentos en CI
  workers: process.env.CI ? 1 : undefined, // Workers en CI
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  // Configuración compartida para todos los tests
  use: {
    // Base URL de la aplicación
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4101',
    
    // Trace en fallo
    trace: 'on-first-retry',
    
    // Screenshots
    screenshot: 'only-on-failure',
    
    // Video
    video: 'retain-on-failure',
    
    // Timeouts
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
  },

  // Configuración de proyectos (navegadores)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Descomenta para probar en otros navegadores
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Servidor de desarrollo (opcional)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4101',
    reuseExistingServer: !process.env.CI,
    timeout: 300 * 1000, // 5 minutos para dar tiempo a compilación
  },
})
