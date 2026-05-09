const axios = require('axios');
async function test() {
    try {
        const res = await axios.post("https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell", {
            text_prompts: [{text: "A beautiful cat"}],
            seed: 0
        }, {
            headers: {
                "Authorization": "Bearer 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",
                "Accept": "application/json"
            }
        });
        console.log("Success:", Object.keys(res.data));
        if (res.data.artifacts) {
            console.log("Artifact keys:", Object.keys(res.data.artifacts[0]));
            if (res.data.artifacts[0].base64) console.log("Has base64 of length:", res.data.artifacts[0].base64.length);
        } else if (res.data.data && res.data.data[0]) {
             console.log("Data keys:", Object.keys(res.data.data[0]));
             if (res.data.data[0].b64_json) console.log("Has b64_json of length:", res.data.data[0].b64_json.length);
        }
    } catch (e) {
        console.log("Error Status:", e.response ? e.response.status : e.message);
        console.log("Error Data:", e.response ? (typeof e.response.data === 'string' ? e.response.data.substring(0, 100) : JSON.stringify(e.response.data)) : "");
    }
}
test();
