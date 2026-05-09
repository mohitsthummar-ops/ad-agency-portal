const prompt = "Vibrant summer cake festival display with delicious, frosted birthday and anniversary cakes. Bright, modern Instagram ad, high-quality, celebratory mood, sunny pastel colors.";
const encodedPrompt = encodeURIComponent(prompt);
const fetchImage = async () => {
    try {
        const url1 = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&seed=${Date.now()}&nologo=true`;
        console.log('Testing image.pollinations.ai/prompt/...');
        const res1 = await fetch(url1);
        console.log(`Status 1: ${res1.status}`);

        const url2 = `https://pollinations.ai/p/${encodedPrompt}?width=1080&height=1080&seed=${Date.now()}&nologo=true`;
        console.log('Testing pollinations.ai/p/...');
        const res2 = await fetch(url2);
        console.log(`Status 2: ${res2.status}`);
    } catch (e) {
        console.error(e);
    }
};
fetchImage();
