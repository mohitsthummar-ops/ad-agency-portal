const fetch = require('node-fetch');
fetch("https://image.pollinations.ai/prompt/test").then(res => {
  console.log("Status:", res.status);
  console.log("Headers:", res.headers.raw());
}).catch(console.error);
