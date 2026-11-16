Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Adinath\.gemini\antigravity\brain\1a7c7be6-d843-46e9-8600-ff0edbfeb27a\.user_uploaded\media_1794651895482_a84e4417.png"
$img = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Output "Original Image Width: $($img.Width), Height: $($img.Height)"

$minX = $img.Width; $maxX = 0; $minY = $img.Height; $maxY = 0

for ($y = 0; $y -lt $img.Height; $y++) {
    for ($x = 0; $x -lt $img.Width; $x++) {
        $p = $img.GetPixel($x, $y)
        # Check if pixel has opacity and is not pure white
        if ($p.A -gt 20 -and ($p.R -lt 245 -or $p.G -lt 245 -or $p.B -lt 245)) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Logo bounds: X: $minX to $maxX, Y: $minY to $maxY"

$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1
Write-Output "Cropped dimension: $cropW x $cropH"

# Create clean cropped bitmap with transparent background where pixels are white/transparent
$cropRect = New-Object System.Drawing.Rectangle($minX, $minY, $cropW, $cropH)
$cropped = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($cropped)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

# Make white background transparent
$cropped.MakeTransparent([System.Drawing.Color]::FromArgb(255, 255, 255))

# Save to public and assets directories
$destPublic = "d:\Web Development\gurukul Bhose\public\gurukul-logo.png"
$cropped.Save($destPublic, [System.Drawing.Imaging.ImageFormat]::Png)

$destDist = "d:\Web Development\gurukul Bhose\dist\public\gurukul-logo.png"
if (Test-Path "d:\Web Development\gurukul Bhose\dist\public") {
    $cropped.Save($destDist, [System.Drawing.Imaging.ImageFormat]::Png)
}

$destAdmin = "d:\Web Development\gurukul Bhose\dist\admin\gurukul-logo.png"
if (Test-Path "d:\Web Development\gurukul Bhose\dist\admin") {
    $cropped.Save($destAdmin, [System.Drawing.Imaging.ImageFormat]::Png)
}

$cropped.Dispose()
$img.Dispose()
Write-Output "Successfully processed and saved logo!"
