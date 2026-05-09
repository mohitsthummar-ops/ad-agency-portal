async function test() {
    const prompt = `apple`;
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

    console.log("Fetching:", imageUrl);
    try {
        const res = await fetch(imageUrl);
        console.log("Status:", res.status);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}
test();
