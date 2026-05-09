const fetch = require('node-fetch');

async function test() {
    const url = `https://source.unsplash.com/1080x1080/?fitness`;
    console.log("Fetching:", url);
    try {
        const res = await fetch(url);
        console.log("Status:", res.status);
        console.log("URL resolved to:", res.url);
    } catch (e) {
        console.log("Error", e.message);
    }
}
test();
