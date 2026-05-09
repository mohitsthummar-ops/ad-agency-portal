const https = require('https');

async function test(url) {
    console.log("Fetching:", url);
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            console.log("Status:", res.statusCode);
            console.log("Headers:", res.headers);
            resolve();
        }).on('error', (e) => {
            console.error(e);
            resolve();
        });
    });
}

// source.unsplash.com is dead. 
// let's test dummyimage.com or fakeimg.pl
async function run() {
    await test('https://fakeimg.pl/1080x1080/?text=Ad_Campaign');
}
run();
