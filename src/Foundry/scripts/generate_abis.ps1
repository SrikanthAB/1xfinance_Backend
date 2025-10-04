# Create abis directory if it doesn't exist
$abisDir = Join-Path $PSScriptRoot "..\abis"
if (-not (Test-Path $abisDir)) {
    New-Item -ItemType Directory -Path $abisDir | Out-Null
}

# Find all .sol files in the src directory
$solFiles = Get-ChildItem -Path "$PSScriptRoot\..\src" -Recurse -Filter "*.sol" -File

foreach ($file in $solFiles) {
    $contractName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $relativePath = $file.FullName.Substring($PSScriptRoot.Length + 1)
    
    Write-Host "Generating ABI for $contractName..."
    
    # Compile the contract and extract ABI
    $output = solc --abi $file.FullName --overwrite -o $abisDir 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Failed to generate ABI for $contractName"
        Write-Warning $output
    } else {
        Write-Host "Successfully generated ABI for $contractName"
    }
}

Write-Host "\nAll ABIs have been generated in the 'abis' directory."
