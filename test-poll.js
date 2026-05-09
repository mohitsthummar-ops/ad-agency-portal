async function test() {
    const prompt = `Create a professional advertisement poster for: Business: Test Business, Campaign: Summer Mega Sale 2026, Offer: Flat 50% OFF on all items, Target Audience: General, Style: Modern, High Quality, Instagram Post, Social Media Ready, vibrant colors, clean typography`;
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&seed=12345&nologo=true&enhance=true`;

    console.log("Fetching:", imageUrl);
    try {
        const res = await fetch(imageUrl);
        console.log("Status:", res.status);
        const ct = res.headers.get("content-type");
        console.log("Content-Type:", ct);

        if (!ct.includes("image")) {
            const text = await res.text();
            console.log("Body:", text.substring(0, 200));
        } else {
            console.log("It's an image!");
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}
test();
