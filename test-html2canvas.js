const { createCanvas } = require('canvas');

const generateImage = () => {
    const canvas = createCanvas(1080, 1080);
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#9333ea');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);
    
    // Abstract shapes for attractiveness
    ctx.beginPath();
    ctx.arc(100, 100, 300, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(900, 900, 400, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fill();

    // Text Content
    ctx.textAlign = 'center';
    
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('NEW CAMPAIGN', 540, 250);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 90px sans-serif';
    ctx.fillText('MEGA SALE', 540, 450);
    
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '50px sans-serif';
    ctx.fillText('Flat 50% Off Everything', 540, 600);
    
    // Footer Box
    ctx.fillStyle = '#ffffff';
    ctx.roundRect(340, 800, 400, 100, 50);
    ctx.fill();
    
    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('Instagram Post', 540, 860);
    
    return canvas.toDataURL('image/jpeg', 0.9);
}

console.log(generateImage().substring(0, 50));
