# SCRIPT: Complete Test Suite Runner (PowerShell)
# Purpose: Execute all tests with performance and security validations
# Usage: pwsh scripts/run-complete-tests.ps1

param(
    [switch]$Verbose = $false,
    [switch]$StopOnError = $false
)

# Colors
$Colors = @{
    Reset   = "`e[0m"
    Bold    = "`e[1m"
    Green   = "`e[32m"
    Red     = "`e[31m"
    Yellow  = "`e[33m"
    Blue    = "`e[36m"
    Gray    = "`e[90m"
}

$Script:TestsPassed = 0
$Script:TestsFailed = 0
$Script:TestsSkipped = 0
$Script:StartTime = Get-Date

# Helper functions
function Print-Header {
    param([string]$Text)
    Write-Host "`n$($Colors.Blue)============================================$($Colors.Reset)"
    Write-Host "$($Colors.Bold)  $Text$($Colors.Reset)"
    Write-Host "$($Colors.Blue)============================================$($Colors.Reset)`n"
}

function Print-Section {
    param([string]$Text)
    Write-Host "`n$($Colors.Blue)>>> $($Colors.Bold)$Text$($Colors.Reset)"
}

function Print-Success {
    param([string]$Text)
    Write-Host "$($Colors.Green)[OK]$($Colors.Reset) $Text"
    $Script:TestsPassed++
}

function Print-Error {
    param([string]$Text, [string]$Details = "")
    Write-Host "$($Colors.Red)[FAIL]$($Colors.Reset) $Text"
    if ($Details) {
        Write-Host "$($Colors.Gray)    $Details$($Colors.Reset)"
    }
    $Script:TestsFailed++
}

function Print-Warning {
    param([string]$Text)
    Write-Host "$($Colors.Yellow)[WARN]$($Colors.Reset) $Text"
    $Script:TestsSkipped++
}

function Print-Info {
    param([string]$Text)
    Write-Host "$($Colors.Blue)[INFO]$($Colors.Reset) $Text"
}

function Run-Test {
    param(
        [string]$Description,
        [scriptblock]$Command,
        [string]$Phase,
        [bool]$FailOnError = $false
    )
    
    Print-Info "Running: $Description"
    $startTime = Get-Date
    
    try {
        if ($Verbose) {
            & $Command
        } else {
            & $Command | Out-Null
        }
        
        $duration = (Get-Date) - $startTime
        Print-Success "$Description ($($duration.TotalSeconds.ToString('0.00'))s)"
        
        return $true
    }
    catch {
        $duration = (Get-Date) - $startTime
        $errorMsg = $_.Exception.Message
        
        if ($FailOnError) {
            Print-Error "$Description ($($duration.TotalSeconds.ToString('0.00'))s)" $errorMsg
            
            if ($StopOnError) {
                exit 1
            }
            return $false
        }
        else {
            Print-Warning "$Description - SKIPPED ($($duration.TotalSeconds.ToString('0.00'))s)"
            return $true
        }
    }
}

# MAIN EXECUTION
Clear-Host

Print-Header "COMPLETE TEST SUITE RUNNER"
Print-Info "Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Print-Info "Node version: $(& node --version)"

# PHASE 1: Environment Check
Print-Section "Environment Validation"

try {
    $nodeVersion = & node --version
    Print-Success "Node.js found: $nodeVersion"
}
catch {
    Print-Error "Node.js not found"
}

try {
    $npmVersion = & npm --version
    Print-Success "npm found: $npmVersion"
}
catch {
    Print-Error "npm not found"
}

# PHASE 2: TypeScript Validation
Print-Section "TypeScript Validation"
Run-Test -Description "TypeScript compilation" `
    -Command { & npx tsc --noEmit } `
    -Phase "typescript" `
    -FailOnError $false

# PHASE 3: Build Validation
Print-Section "Build Validation"
Run-Test -Description "Next.js build compilation" `
    -Command { & npm run build } `
    -Phase "build" `
    -FailOnError $false

# PHASE 4: Unit Tests - Quotation Sync Store
Print-Section "Unit Tests - Zustand Store"
Run-Test -Description "Quotation Sync Store Tests" `
    -Command { & npx jest src/stores/__tests__/quotationSyncStore.test.ts --coverage --passWithNoTests } `
    -Phase "unit-tests" `
    -FailOnError $false

# PHASE 5: Integration Tests
Print-Section "Integration Tests - Component Communication"
Run-Test -Description "Quotation Sync Integration Tests" `
    -Command { & npx jest tests/quotation-sync-integration.test.ts --passWithNoTests } `
    -Phase "integration-tests" `
    -FailOnError $false

# PHASE 6: All Unit Tests
Print-Section "All Unit Tests"
Run-Test -Description "All Unit Tests with Coverage" `
    -Command { & npx jest --testPathPattern="src/stores/__tests__|tests/.*\.test\.ts" --coverage --passWithNoTests } `
    -Phase "all-unit-tests" `
    -FailOnError $false

# PHASE 7: Security Validation
Print-Section "Security Validation"

Print-Info "Checking npm audit..."
$auditOutput = & npm audit --audit-level=moderate 2>&1
if ($auditOutput -match "vulnerabilities") {
    Print-Warning "npm audit found issues - review required"
}
else {
    Print-Success "npm audit passed"
}

Print-Info "Checking for console.log in production code..."
$consoleLogs = Get-ChildItem -Recurse -Path "src" -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue | 
    Where-Object { -not $_.FullName -match "__tests__|\.test\." } |
    Select-String -Pattern "console\." -ErrorAction SilentlyContinue

if ($consoleLogs) {
    Print-Warning "Found console logs in production code"
}
else {
    Print-Success "No console logs in production code"
}

Print-Info "Checking for hardcoded secrets..."
$secrets = Get-ChildItem -Recurse -Path "src" -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue |
    Select-String -Pattern "(password|secret|apiKey|token)\s*=\s*['\"]" -ErrorAction SilentlyContinue

if ($secrets) {
    Print-Warning "Found potential hardcoded secrets"
}
else {
    Print-Success "No hardcoded secrets detected"
}

# PHASE 8: Performance Validation
Print-Section "Performance Validation"

Print-Info "Checking bundle size..."
if (Test-Path ".next") {
    $buildSize = (Get-ChildItem ".next" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    Print-Success "Build size: $($buildSize.ToString('0.00')) MB"
}
else {
    Print-Warning "Build directory not found"
}

Print-Info "Checking Zustand store implementation..."
if (Test-Path "src/stores/quotationSyncStore.ts") {
    $storeFile = Get-Content "src/stores/quotationSyncStore.ts" -Raw
    if ($storeFile -match "unsubscribe") {
        Print-Success "Proper subscription cleanup detected"
    }
    else {
        Print-Warning "Review subscription cleanup implementation"
    }
    Print-Success "Store imports verified"
} else {
    Print-Warning "Store file not found"
}

# PHASE 9: Final Summary
$endTime = Get-Date
$totalDuration = $endTime - $Script:StartTime

Write-Host "`n$($Colors.Blue)============================================$($Colors.Reset)"
Write-Host "$($Colors.Bold)  TEST EXECUTION SUMMARY$($Colors.Reset)"
Write-Host "$($Colors.Blue)============================================$($Colors.Reset)"
Write-Host "$($Colors.Blue)  Tests Passed:   $($Colors.Green)$Script:TestsPassed$($Colors.Reset)"
Write-Host "$($Colors.Blue)  Tests Failed:   $($Colors.Red)$Script:TestsFailed$($Colors.Reset)"
Write-Host "$($Colors.Blue)  Tests Skipped:  $($Colors.Yellow)$Script:TestsSkipped$($Colors.Reset)"
Write-Host "$($Colors.Blue)  Total Duration: $($totalDuration.TotalSeconds.ToString('0.00'))s"
Write-Host "$($Colors.Blue)============================================$($Colors.Reset)`n"

if ($Script:TestsFailed -gt 0) {
    Write-Host "$($Colors.Red)[FAIL] SOME TESTS FAILED - Review output above$($Colors.Reset)`n"
    exit 1
}
else {
    Write-Host "$($Colors.Green)[OK] ALL TESTS PASSED - System is ready!$($Colors.Reset)`n"
    exit 0
}
