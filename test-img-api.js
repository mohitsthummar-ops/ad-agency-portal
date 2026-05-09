const fetch = require('node-fetch');

async function test() {
    const url = `https://placehold.co/1080x1080/4f46e5/ffffff/png?text=Creative+Ad+Campaign`;
    console.log("Fetching:", url);
    try {
        const res = await fetch(url);
        console.log("Status:", res.status, "content-type", res.headers.get("content-type"));
    } catch (e) {
        console.log("Error", e.message);
    }
}
test();
