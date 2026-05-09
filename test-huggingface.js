const fetch = require('node-fetch');

async function test() {
    const prompt = `A professional advertisement poster for a fitness gym`;
    // We can use a different free API or huggingface inference
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`; // Test if pollinations is up again
    
    console.log("Fetching:", url);
    try {
        const res = await fetch(url, { method: "HEAD" });
        console.log("Status:", res.status);
    } catch (e) {
        console.log("Error", e);
    }
}
test();
