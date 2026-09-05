const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];
const outDir = path.join(__dirname, 'icons');

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
}

function drawIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // 100% transparent background
    ctx.clearRect(0, 0, size, size);

    // We want a very bold, geometric 'N'. 
    // Left bar and right bar in vibrant blue.
    // Diagonal bar in vibrant red (acting as a strike-through).
    // NO background container, just the raw shapes edge-to-edge.
    
    // Calculate dimensions
    const barWidth = size * 0.28; // Very thick bars (28% of canvas width)
    const height = size; // Full height edge-to-edge
    
    // We will leave a tiny 1px margin on 16x16 just to prevent clipping, so maybe 5% margin.
    const m = size * 0.05;
    const h = size - (m * 2);
    
    ctx.fillStyle = '#3B82F6'; // Bright Blue
    
    // Left Bar
    ctx.fillRect(m, m, barWidth, h);
    
    // Right Bar
    ctx.fillRect(size - m - barWidth, m, barWidth, h);
    
    // Diagonal Bar (Red)
    ctx.fillStyle = '#EF4444'; // Bright Red
    
    ctx.beginPath();
    // Top left of diagonal starts at the top right of the left bar
    ctx.moveTo(m + barWidth, m);
    // Top right of diagonal starts at the top left of the right bar
    ctx.lineTo(size - m, m); // Actually let's make it cover the whole diagonal
    
    // Let's make a true 'N' diagonal that overlaps the bars slightly
    // Top-left point
    ctx.moveTo(m, m);
    // Top-right point of the diagonal chunk
    ctx.lineTo(m + barWidth * 1.5, m);
    // Bottom-right point
    ctx.lineTo(size - m, size - m);
    // Bottom-left point of the diagonal chunk
    ctx.lineTo(size - m - barWidth * 1.5, size - m);
    ctx.closePath();
    
    ctx.fill();

    // To make it look even cooler and more geometric, let's refine the diagonal.
    // Clear everything and redraw the 'N' perfectly.
    ctx.clearRect(0, 0, size, size);
    
    // Blue color
    const blue = '#2563EB'; // Royal Blue
    const red = '#DC2626';  // Crimson Red
    
    const w = barWidth;
    
    // Left vertical bar
    ctx.fillStyle = blue;
    ctx.fillRect(m, m, w, h);
    
    // Right vertical bar
    ctx.fillRect(size - m - w, m, w, h);
    
    // Red diagonal "Strike"
    ctx.fillStyle = red;
    ctx.beginPath();
    // Start at top-left inner corner
    ctx.moveTo(m, m);
    // Go right along the top edge
    ctx.lineTo(m + w * 1.2, m);
    // Go down to bottom right outer corner
    ctx.lineTo(size - m, size - m);
    // Go left along the bottom edge
    ctx.lineTo(size - m - w * 1.2, size - m);
    ctx.closePath();
    ctx.fill();

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    const outPath = path.join(outDir, `icon${size}.png`);
    fs.writeFileSync(outPath, buffer);
    console.log(`Generated ${outPath}`);
}

sizes.forEach(size => drawIcon(size));
console.log('All geometric icons generated successfully!');
