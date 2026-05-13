$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts"
foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    $changed = $false
    $newLines = $lines | ForEach-Object {
        $line = $_
        # Fix doubled icons first
        if ($line -match "YoutubeIconIcon") {
            $line = $line -replace "YoutubeIconIcon", "PlayCircle"
            $changed = $true
        }
        # Fix YoutubeIcon -> PlayCircle
        if ($line -match "YoutubeIcon") {
            $line = $line -replace "YoutubeIcon", "PlayCircle"
            $changed = $true
        }
        # Fix InstagramIcon -> ImageIcon
        if ($line -match "InstagramIcon") {
            $line = $line -replace "InstagramIcon", "ImageIcon"
            $changed = $true
        }
        # Fix Instagram -> ImageIcon (in imports and JSX)
        if ($line -match "\bInstagram\b") {
            $line = $line -replace "\bInstagram\b", "ImageIcon"
            $changed = $true
        }
        # Fix Facebook -> Users
        if ($line -match "\bFacebook\b") {
            $line = $line -replace "\bFacebook\b", "Users"
            $changed = $true
        }
        $line
    }
    if ($changed) {
        Set-Content $file.FullName $newLines
        Write-Host "Fixed: $($file.Name)"
    }
}
Write-Host "Done."
