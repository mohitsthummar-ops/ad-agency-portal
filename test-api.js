const https = require('https');

async function test(url) {
    console.log("Fetching:", url);
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            console.log("Status:", res.statusCode);
            const ct = res.headers['content-type'];
            console.log("Content-Type:", ct);
            resolve();
        }).on('error', (e) => {
            console.error(e);
            resolve();
        });
    });
}

async function run() {
    await test('https://picsum.photos/1080/1080');
}
run();
