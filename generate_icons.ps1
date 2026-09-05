Add-Type -AssemblyName System.Drawing

$sizes = @(16, 48, 128)
$outDir = "c:\Users\reddi\Documents\Chrome Extenstion\Notebook Citation hider\icons"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    # Enable high quality rendering
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # Clear with transparent background (Alpha channel)
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # Draw a bold blue circle edge-to-edge to serve as the background of the logo, 
    # which naturally leaves the corners transparent.
    $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 66, 133, 244)) # Google Blue
    $g.FillEllipse($brush, 0, 0, $size, $size)
    
    # Draw a white 'N' in the center
    $fontFamily = New-Object System.Drawing.FontFamily("Arial")
    $fontSize = $size * 0.6
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    # We slightly adjust the rectangle for optical centering if needed, but standard center is fine
    $g.DrawString("N", $font, $textBrush, $rect, $format)
    
    $outFile = Join-Path $outDir "icon$size.png"
    # Save explicitly as PNG
    $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $g.Dispose()
    $bmp.Dispose()
    $brush.Dispose()
    $textBrush.Dispose()
    $font.Dispose()
    $fontFamily.Dispose()
}

Write-Host "Icons generated successfully in $outDir!"
