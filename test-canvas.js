const generateSVG = (text) => {
    const encoded = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080">
        <rect width="100%" height="100%" fill="#4338ca"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="64" fill="white">${text}</text>
    </svg>`);
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
console.log(generateSVG("Test Ad"));
