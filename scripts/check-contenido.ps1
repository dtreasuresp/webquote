$response = Invoke-WebRequest -Uri 'http://localhost:4101/api/quotation-config' -UseBasicParsing
$json = $response.Content | ConvertFrom-Json
Write-Host "=== Propiedades de contenidoGeneral ===" -ForegroundColor Cyan
$json.contenidoGeneral.PSObject.Properties | ForEach-Object {
    $name = $_.Name
    $value = $_.Value
    if ($null -eq $value) {
        Write-Host "$name : NULL" -ForegroundColor Red
    } elseif ($value -is [bool]) {
        Write-Host "$name : $value" -ForegroundColor Yellow
    } elseif ($value -is [string] -or $value -is [int]) {
        Write-Host "$name : $value" -ForegroundColor Green
    } else {
        Write-Host "$name : [Object]" -ForegroundColor Blue
    }
}
