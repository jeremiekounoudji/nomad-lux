param(
  [string]$EnDir,
  [string]$FrDir
)

$ErrorActionPreference = 'Stop'

if (-not $EnDir -or $EnDir -eq '') { $EnDir = Join-Path (Get-Location) 'src/locales/en' }
if (-not $FrDir -or $FrDir -eq '') { $FrDir = Join-Path (Get-Location) 'src/locales/fr' }

function Flatten-Keys {
  param(
    [Parameter(Mandatory=$true)] [object]$Object,
    [string]$Prefix = ''
  )

  $keys = New-Object System.Collections.Generic.List[string]

  function Recurse {
    param([object]$Obj, [string]$Pref)

    if ($null -eq $Obj) { if ($Pref) { $script:acc.Add($Pref) } return }

    if ($Obj -is [System.Collections.IDictionary]) {
      foreach ($k in $Obj.Keys) {
        $v = $Obj[$k]
        $np = if ($Pref) { "$Pref.$k" } else { "$k" }
        Recurse -Obj $v -Pref $np
      }
      return
    }

    if ($Obj -is [System.Management.Automation.PSCustomObject]) {
      foreach ($p in $Obj.PSObject.Properties) {
        $k = $p.Name
        $v = $p.Value
        $np = if ($Pref) { "$Pref.$k" } else { "$k" }
        Recurse -Obj $v -Pref $np
      }
      return
    }

    if ($Pref) { $script:acc.Add($Pref) }
  }

  $script:acc = New-Object System.Collections.Generic.List[string]
  Recurse -Obj $Object -Pref $Prefix
  return $script:acc | Sort-Object -Unique
}

function Get-KeysFromFile {
  param([string]$Path)
  $json = Get-Content $Path -Raw | ConvertFrom-Json
  return Flatten-Keys -Object $json -Prefix ''
}

$results = New-Object System.Collections.Generic.List[string]

Get-ChildItem $EnDir -Filter *.json | ForEach-Object {
  $enFile = $_.FullName
  $name = $_.Name
  $frFile = Join-Path $FrDir $name
  if (-not (Test-Path $frFile)) {
    $results.Add("MISSING_FR_FILE: $name") | Out-Null
    return
  }

  $enKeys = Get-KeysFromFile -Path $enFile
  $frKeys = Get-KeysFromFile -Path $frFile

  $missingInFr = $enKeys | Where-Object { $_ -notin $frKeys }
  $missingInEn = $frKeys | Where-Object { $_ -notin $enKeys }

  if ($missingInFr.Count -gt 0 -or $missingInEn.Count -gt 0) {
    $results.Add("KEY_DIFF: $name") | Out-Null
    if ($missingInFr.Count -gt 0) {
      $results.Add("  Missing in fr:") | Out-Null
      $missingInFr | ForEach-Object { $results.Add("    $_") | Out-Null }
    }
    if ($missingInEn.Count -gt 0) {
      $results.Add("  Missing in en:") | Out-Null
      $missingInEn | ForEach-Object { $results.Add("    $_") | Out-Null }
    }
  }
}

if ($results.Count -eq 0) {
  Write-Output 'PARITY_OK'
} else {
  $results | ForEach-Object { $_ }
}


