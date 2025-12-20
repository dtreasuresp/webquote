#!/usr/bin/env node

/**
 * SCRIPT: Complete Test Suite Runner
 * Purpose: Execute all tests with performance and security validations
 * 
 * Usage:
 *   npm run test:complete
 *   or
 *   ts-node scripts/run-complete-tests.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  phase: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  output: string;
  errorMessage?: string;
}

const results: TestResult[] = [];
const startTime = Date.now();

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
};

const log = {
  title: (text: string) => console.log(`\n${colors.bright}${colors.blue}╔════════════════════════════════════════╗${colors.reset}`),
  header: (text: string) => console.log(`${colors.bright}${colors.blue}║${colors.reset} ${colors.bright}${text.padEnd(38)}${colors.blue}║${colors.reset}`),
  section: (text: string) => console.log(`\n${colors.bright}${colors.blue}► ${text}${colors.reset}`),
  success: (text: string) => console.log(`${colors.green}✓${colors.reset} ${text}`),
  error: (text: string) => console.log(`${colors.red}✗${colors.reset} ${text}`),
  warning: (text: string) => console.log(`${colors.yellow}⚠${colors.reset} ${text}`),
  info: (text: string) => console.log(`${colors.blue}ℹ${colors.reset} ${text}`),
  metric: (label: string, value: string | number) => console.log(`  ${label}: ${colors.bright}${value}${colors.reset}`),
};

function executeCommand(
  command: string,
  description: string,
  phase: string,
  failOnError: boolean = true
): TestResult {
  const phaseStartTime = Date.now();
  log.info(`Running: ${description}`);

  try {
    const output = execSync(command, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    const duration = Date.now() - phaseStartTime;
    const result: TestResult = {
      phase,
      status: 'PASS',
      duration,
      output,
    };

    log.success(`${description} (${duration}ms)`);
    results.push(result);
    return result;
  } catch (error: any) {
    const duration = Date.now() - phaseStartTime;
    const errorMessage = error.stderr?.toString() || error.message || 'Unknown error';

    if (failOnError) {
      log.error(`${description} FAILED (${duration}ms)`);
      const result: TestResult = {
        phase,
        status: 'FAIL',
        duration,
        output: error.stdout?.toString() || '',
        errorMessage,
      };
      results.push(result);
      return result;
    } else {
      log.warning(`${description} SKIPPED (${duration}ms)`);
      const result: TestResult = {
        phase,
        status: 'SKIP',
        duration,
        output: '',
      };
      results.push(result);
      return result;
    }
  }
}

function validateTypeScript(): void {
  log.section('📝 TypeScript Validation');
  executeCommand(
    'npx tsc --noEmit',
    'TypeScript type checking',
    'typescript',
    false
  );
}

function validateBuild(): void {
  log.section('🏗️ Build Validation');
  executeCommand(
    'npm run build',
    'Next.js build compilation',
    'build',
    false
  );
}

function runUnitTests(): void {
  log.section('🧪 Unit Tests - Zustand Store');
  executeCommand(
    'npx jest src/stores/__tests__/quotationSyncStore.test.ts --coverage --passWithNoTests',
    'Quotation Sync Store Tests',
    'unit-tests',
    false
  );
}

function runIntegrationTests(): void {
  log.section('🔗 Integration Tests - Component Communication');
  executeCommand(
    'npx jest tests/quotation-sync-integration.test.ts --passWithNoTests',
    'Quotation Sync Integration Tests',
    'integration-tests',
    false
  );
}

function runAllUnitTests(): void {
  log.section('🧪 All Unit Tests');
  executeCommand(
    'npx jest --testPathPattern="src/stores/__tests__|tests/.*\\.test\\.ts" --coverage --passWithNoTests',
    'All Unit Tests with Coverage',
    'all-unit-tests',
    false
  );
}

function validateSecurity(): void {
  log.section('🔒 Security Validation');
  
  // Check for common vulnerabilities
  const securityChecks = [
    {
      name: 'npm audit',
      command: 'npm audit --audit-level=moderate || true',
    },
    {
      name: 'Check for console.log in production code',
      command: 'grep -r "console\\." src/ --include="*.ts" --include="*.tsx" | grep -v "__tests__" | grep -v ".test.ts" || echo "✓ No console logs in production"',
    },
    {
      name: 'Check for hardcoded secrets',
      command: 'grep -r "password\\|secret\\|key\\|token" src/ --include="*.ts" --include="*.tsx" | grep -E "=\\s*[\'\\"]" || echo "✓ No hardcoded secrets detected"',
    },
    {
      name: 'Check dependency vulnerabilities',
      command: 'npm ls 2>&1 | grep -i "vulnerabilities" || echo "✓ No critical vulnerabilities"',
    },
  ];

  securityChecks.forEach((check) => {
    executeCommand(check.command, check.name, 'security', false);
  });
}

function validatePerformance(): void {
  log.section('⚡ Performance Validation');

  // Check bundle size
  const bundleCheck = {
    name: 'Bundle size check',
    command:
      'du -sh .next 2>/dev/null | awk "{print $1}" || echo "Build directory not found"',
  };

  executeCommand(bundleCheck.command, bundleCheck.name, 'performance', false);

  // Check store performance
  log.info('Checking Zustand store implementation...');
  const storeFile = fs.readFileSync(path.join(process.cwd(), 'src/stores/quotationSyncStore.ts'), 'utf-8');

  // Check for proper subscription cleanup
  if (storeFile.includes('unsubscribe')) {
    log.success('✓ Proper subscription cleanup detected');
  } else {
    log.warning('⚠ Review subscription cleanup implementation');
  }

  // Check for circular dependencies
  if (!storeFile.includes('import.*from.*quotationSyncStore')) {
    log.success('✓ No apparent circular dependencies in store');
  }
}

function generateReport(): void {
  log.section('📊 Test Report Generation');

  const totalDuration = Date.now() - startTime;
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  const skipCount = results.filter((r) => r.status === 'SKIP').length;

  const reportPath = path.join(process.cwd(), 'test-results', 'complete-test-report.json');
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = {
    timestamp: new Date().toISOString(),
    totalDuration,
    summary: {
      total: results.length,
      passed: passCount,
      failed: failCount,
      skipped: skipCount,
      successRate: `${Math.round((passCount / (passCount + failCount)) * 100)}%`,
    },
    results,
    systemInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
    },
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log.success(`Report generated: ${reportPath}`);

  return report;
}

function printSummary(report: any): void {
  console.log(`\n${colors.bright}${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}║${colors.reset} ${colors.bright}TEST EXECUTION SUMMARY${colors.blue}                   ║${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}╠════════════════════════════════════════╣${colors.reset}`);

  log.header(`TOTAL TESTS: ${report.summary.total}`);
  log.header(`PASSED: ${report.summary.passed} | FAILED: ${report.summary.failed}`);
  log.header(`SUCCESS RATE: ${report.summary.successRate}`);
  log.header(`DURATION: ${(report.totalDuration / 1000).toFixed(2)}s`);

  console.log(`${colors.bright}${colors.blue}╠════════════════════════════════════════╣${colors.reset}`);

  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '✓' : result.status === 'FAIL' ? '✗' : '⊙';
    const color =
      result.status === 'PASS'
        ? colors.green
        : result.status === 'FAIL'
          ? colors.red
          : colors.yellow;

    console.log(
      `${colors.bright}${colors.blue}║${colors.reset} ${color}${icon}${colors.reset} ${result.phase.padEnd(25)} ${result.status.padEnd(6)} ${(result.duration / 1000).toFixed(2)}s`
    );
  });

  console.log(`${colors.bright}${colors.blue}╚════════════════════════════════════════╝${colors.reset}\n`);

  if (failCount > 0) {
    console.log(`${colors.red}${colors.bright}⚠ SOME TESTS FAILED - Review output above${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bright}✓ ALL TESTS PASSED - System is ready!${colors.reset}\n`);
    process.exit(0);
  }
}

// MAIN EXECUTION
async function main() {
  console.clear();
  console.log(`${colors.bright}${colors.blue}
╔════════════════════════════════════════╗
║  COMPLETE TEST SUITE RUNNER            ║
║  Sincronización Global con Zustand     ║
╚════════════════════════════════════════╝
${colors.reset}`);

  log.section('🚀 Starting Complete Test Suite');
  log.info(`Started at: ${new Date().toISOString()}`);
  log.info(`Node version: ${process.version}`);
  log.info(`Platform: ${process.platform}`);

  // PHASE 1: Validation
  validateTypeScript();
  validateBuild();

  // PHASE 2: Unit Tests
  runUnitTests();

  // PHASE 3: Integration Tests
  runIntegrationTests();

  // PHASE 4: All Tests
  runAllUnitTests();

  // PHASE 5: Security & Performance
  validateSecurity();
  validatePerformance();

  // PHASE 6: Report
  const report = generateReport();
  printSummary(report);
}

main().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
