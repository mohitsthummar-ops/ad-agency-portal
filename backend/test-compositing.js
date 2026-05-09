const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

async function testCompositing() {
    console.log('Starting compositing test...');
    
    // Create a 1024x1024 base image (mocking Pollinations output)
    const canvas = createCanvas(1024, 1024);
    const ctx = canvas.getContext('2d');
    
    // Draw a gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#4a4a4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Draw some "modern" text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.fillText('STYLISH AD PREVIEW', 100, 200);
    
    // Mock Logo (we'll draw a white circle with some letters)
    const logoSize = 120;
    const margin = 40;
    const x = 1024 - logoSize - margin;
    const y = 1024 - logoSize - margin;
    
    // Glassmorphism effect for logo background
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + logoSize/2, y + logoSize/2, logoSize/2 + 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();
    
    // Shadow for logo
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    // The Logo itself (mocked)
    ctx.beginPath();
    ctx.arc(x + logoSize/2, y + logoSize/2, logoSize/2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    ctx.shadowColor = 'transparent'; // Reset shadow
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LOGO', x + logoSize/2, y + logoSize/2);
    ctx.restore();
    
    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(path.join(__dirname, 'test-composited-ad.jpg'), buffer);
    console.log('Test image saved to test-composited-ad.jpg');
}

testCompositing().catch(console.error);
