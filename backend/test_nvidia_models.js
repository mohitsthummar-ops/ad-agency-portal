const axios = require('axios');
async function test() {
    try {
        console.log("Listing NVIDIA NIM models...");
        const res = await axios.get("https://integrate.api.nvidia.com/v1/models", {
            headers: {
                "Authorization": "Bearer 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.",
                "Accept": "application/json"
            }
        });
        const fluxModels = res.data.data.filter(m => m.id.includes('flux') || m.id.includes('black-forest'));
        console.log("FLUX Models:", JSON.stringify(fluxModels, null, 2));
    } catch (e) {
        console.log("Error Status:", e.response ? e.response.status : e.message);
        console.log("Error Data:", e.response ? JSON.stringify(e.response.data) : "");
    }
}
test();
