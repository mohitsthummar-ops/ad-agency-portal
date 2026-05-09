const AdRequest = require('../models/AdRequest');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// ─── CLIENT ───────────────────────────────────────────────────────────────────

/** POST /api/ad-requests  — submit a new campaign request */
exports.submitRequest = async (req, res, next) => {
    try {
        const { title, businessName, description, targetAudience, offerDetails, contactInfo, logoUrl, imageStyle } = req.body;
        const request = await AdRequest.create({
            user: req.user._id, title, businessName, description, targetAudience,
            offerDetails, contactInfo, logoUrl: logoUrl || null,
            imageStyle: imageStyle || 'Instagram Post', status: 'pending',
        });
        res.status(201).json({ success: true, message: 'Campaign request submitted successfully!', request });
    } catch (err) { next(err); }
};

/** GET /api/ad-requests/mine  — get current user's requests */
exports.getMyRequests = async (req, res, next) => {
    try {
        const requests = await AdRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (err) { next(err); }
};

/** POST /api/ad-requests/:id/generate-image — Premium Multi-Template Canvas Generator */
exports.generateAIImage = async (req, res, next) => {
    try {
        const request = await AdRequest.findOne({ _id: req.params.id, user: req.user._id });
        if (!request) return res.status(404).json({ success: false, message: 'Campaign request not found' });
        if (request.status !== 'approved' && request.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Admin must approve this request before generating an image' });
        }

        const user = await User.findById(req.user._id);
        const sub = user.subscription;
        if (!sub || sub.status !== 'Active') {
            return res.status(403).json({ success: false, message: 'Please renew your subscription to generate images' });
        }
        if (new Date() > new Date(sub.expiryDate)) {
            user.subscription.status = 'Expired';
            await user.save();
            return res.status(403).json({ success: false, message: 'Your subscription has expired. Please renew to continue.' });
        }
        if (sub.imagesUsed >= sub.imageLimit) {
            return res.status(403).json({ success: false, message: 'Image generation limit reached for your current plan. Please upgrade.' });
        }

        // ═══════════════════════════════════════════════════════════════
        //  AI IMAGE GENERATOR (Direct FLUX Prompting)
        // ═══════════════════════════════════════════════════════════════
        const title = request.title || 'Exclusive Collection';
        const brand = request.businessName || 'BRAND';
        const offer = request.offerDetails || 'Limited Time Offer';
        const description = request.description || '';
        const targetAudience = request.targetAudience || 'General';
        const imageStyle = request.imageStyle || 'Instagram Post';
        const contactInfo = request.contactInfo || '';

        // Map resolution based on style
        const resolutionMap = {
            'Instagram Post': { ratio: '1:1', width: 1024, height: 1024 },
            'Facebook Banner': { ratio: '16:9', width: 1440, height: 810 },
            'Poster': { ratio: '4:5', width: 1024, height: 1280 },
            'Story Size': { ratio: '9:16', width: 1024, height: 1820 },
            'YouTube Thumbnail': { ratio: '16:9', width: 1440, height: 810 }
        };
        const styleInfo = resolutionMap[imageStyle] || { ratio: '1:1', width: 1024, height: 1024 };

        // 🎯 4. 🎨 STYLE CONTROL
        let styleKeywords = 'Modern, minimal, elegant (not cluttered)';
        const lowerDesc = description.toLowerCase();
        const lowerBrand = brand.toLowerCase();

        if (lowerDesc.includes('food') || lowerDesc.includes('burger') || lowerDesc.includes('pizza') || lowerBrand.includes('bakery') || lowerBrand.includes('cafe')) {
            styleKeywords = 'delicious food photography, warm lighting, restaurant ad poster, modern, clean';
        } else if (lowerDesc.includes('fashion') || lowerDesc.includes('clothing') || lowerDesc.includes('wear') || lowerBrand.includes('boutique')) {
            styleKeywords = 'trendy fashion models, urban style, instagram aesthetic, high-end editorial';
        } else if (lowerDesc.includes('tech') || lowerDesc.includes('gadget') || lowerDesc.includes('software') || lowerDesc.includes('app')) {
            styleKeywords = 'futuristic design, neon glow, minimal tech branding, premium tech showcase';
        } else if (lowerDesc.includes('gym') || lowerDesc.includes('fitness') || lowerDesc.includes('workout') || lowerBrand.includes('gym')) {
            styleKeywords = 'strong athletes, dark cinematic lighting, motivational poster, high contrast';
        }

        // 🧠 1. ✅ FINAL PRODUCTION PROMPT (BEST VERSION)
        const finalPrompt = `Create a premium, modern advertisement poster.

Business Name: ${brand}
Campaign Title: ${title}
Offer: ${offer}
Target Audience: ${targetAudience}
Description: ${description}
Contact Info: ${contactInfo}

Design Requirements:
- Show "${brand}" as a logo-style brand header at the top
- Add a bold headline: "${title}"
- Highlight offer "${offer}" in large, eye-catching typography
- Add a strong CTA: "Shop Now" or "Order Now"
- Place contact info "${contactInfo}" at the bottom (small clean text)

Layout:
- Professional advertisement layout:
  Top → Brand Name  
  Center → Product visuals  
  Middle → Offer highlight  
  Bottom → CTA + Contact  
- Clean spacing, balanced composition

Visual Style:
- Ultra-realistic or premium 3D design
- Bright lighting, soft shadows, depth
- Use relevant objects based on business type: (cakes, clothes, food, gadgets, gym, etc.)
- ${styleKeywords}

Typography:
- Clean, readable fonts
- Proper alignment (no distorted text)
- Social media ad style (Instagram/Facebook)

Format:
- ${imageStyle}

Mood:
- Premium commercial advertisement
- Eye-catching, trendy 2026 marketing style

IMPORTANT:
- Must look like a real advertisement poster (not just an image)
- Include both visuals + marketing text clearly

Negative Prompt:
blurry, distorted text, unreadable fonts, low quality, messy layout, watermark, overdesign`;

        const seed = Math.floor(Math.random() * 1000000);
        let backgroundBuffer = null;

        console.log(`[Ad Gen] Exact Prompt used:\n${finalPrompt}`);
        console.log(`[Ad Gen] Attempting to generate image using FLUX...`);

        // 🎯 1. Priority: NVIDIA NIM
        if (!backgroundBuffer && process.env.NVIDIA_API_KEY) {
            try {
                console.log(`[Ad Gen] Attempting NVIDIA NIM...`);
                const response = await axios.post("https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell", {
                    text_prompts: [{ text: finalPrompt }],
                    seed: seed
                }, {
                    headers: {
                        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY.trim()}`,
                        "Accept": "application/json", "Content-Type": "application/json"
                    },
                    timeout: 40000
                });

                if (response.data?.artifacts?.[0]?.base64) {
                    backgroundBuffer = Buffer.from(response.data.artifacts[0].base64, 'base64');
                    console.log(`[Ad Gen] Success with NVIDIA!`);
                }
            } catch (e) {
                console.error(`[Ad Gen] NVIDIA Failed:`, e.response?.data?.detail || e.message);
            }
        }

        // 🎯 2. Fallback: Together AI
        if (!backgroundBuffer && process.env.TOGETHER_API_KEY) {
            try {
                console.log(`[Ad Gen] Attempting Together AI...`);
                const response = await axios.post("https://api.together.xyz/v1/images/generations", {
                    model: "black-forest-labs/FLUX.1-schnell",
                    prompt: finalPrompt, width: styleInfo.width, height: styleInfo.height,
                    steps: 28, n: 1, response_format: "b64_json"
                }, {
                    headers: { "Authorization": `Bearer ${process.env.TOGETHER_API_KEY.trim()}` },
                    timeout: 40000
                });

                if (response.data?.data?.[0]?.b64_json) {
                    backgroundBuffer = Buffer.from(response.data.data[0].b64_json, 'base64');
                    console.log(`[Ad Gen] Success with Together AI!`);
                }
            } catch (e) {
                console.error(`[Ad Gen] Together AI Failed:`, e.message);
            }
        }

        // 🎯 3. Final Fallback: Pollinations AI (Free)
        if (!backgroundBuffer) {
            try {
                console.log(`[Ad Gen] Falling back to Pollinations (Free)...`);
                const simplifiedPrompt = `Professional advertisement for ${brand}, ${title}, ${offer}, 8k, modern design`;
                const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(simplifiedPrompt)}?width=${styleInfo.width}&height=${styleInfo.height}&seed=${seed}&nologo=true&model=flux`;

                const response = await fetch(pollinationsUrl);
                if (response.ok) {
                    const arrBuf = await response.arrayBuffer();
                    backgroundBuffer = Buffer.from(arrBuf);
                    console.log(`[Ad Gen] Success with Pollinations!`);
                }
            } catch (e) {
                console.error(`[Ad Gen] Pollinations Failed:`, e.message);
            }
        }

        // Final Fallback: Descriptive Placeholder
        if (!backgroundBuffer) {
            console.log(`[Ad Gen] All AI models failed. Using descriptive placeholder.`);
            const placeholderText = encodeURIComponent(`${brand} - ${title} (${Math.floor(Math.random() * 1000)})`);
            const placeholderUrl = `https://placehold.co/1024x1024/4f46e5/ffffff/png?text=${placeholderText}`;
            try {
                const response = await fetch(placeholderUrl);
                if (response.ok) {
                    const arrBuf = await response.arrayBuffer();
                    backgroundBuffer = Buffer.from(arrBuf);
                }
            } catch (e) {
                console.error(`[Ad Gen] Placeholder fallback failed: ${e.message}`);
            }
        }

        // Save the buffer to disk
        if (backgroundBuffer) {
            const filename = `ad-${request._id}-${Date.now()}.jpg`;
            const uploadDir = path.resolve(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, Buffer.from(backgroundBuffer));
            finalImageUrl = `/uploads/${filename}`;
        } else {
            throw new Error('Failed to obtain any valid image buffer after retries.');
        }

        // 3. Increment usage (Sync for accuracy)
        user.subscription.imagesUsed += 1;
        await user.save();

        // 4. Update the request status and user data (Sync for DB consistency)
        request.generatedImageUrl = finalImageUrl;
        request.aiPromptUsed = finalPrompt;
        request.status = 'completed';
        request.imageHistory.push({ url: finalImageUrl, palette: 'AI Generated', generatedAt: new Date() });
        await request.save();

        await User.updateOne(
            { _id: user._id },
            { $push: { generatedImages: { url: finalImageUrl, prompt: finalPrompt, createdAt: new Date() } } }
        );

        // Send actual real image response
        res.json({
            success: true,
            message: 'Image generated successfully!',
            data: request,
            imageUrl: finalImageUrl,
            imagesUsed: user.subscription.imagesUsed
        });
    } catch (err) {
        next(err);
    }
};

/** GET /api/ad-requests/download — Proxy download to solve CORS and offer clean filenames */
exports.proxyDownload = async (req, res, next) => {
    try {
        const { url, filename } = req.query;
        if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

        // Resolve local paths
        let targetUrl = url;
        if (url.startsWith('/uploads/')) {
            const absolutePath = path.join(process.cwd(), url);
            if (fs.existsSync(absolutePath)) {
                return res.download(absolutePath, filename || path.basename(url));
            }
            return res.status(404).json({ success: false, message: 'Local image not found' });
        }

        // Fetch external image
        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error('Failed to fetch external image');

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        const finalFilename = filename || `ad_download_${Date.now()}.jpg`;

        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${finalFilename}"`,
            'Content-Length': buffer.byteLength
        });

        res.send(Buffer.from(buffer));
    } catch (err) {
        console.error('[Proxy Download Error]:', err.message);
        res.status(500).json({ success: false, message: 'Failed to download image' });
    }
};


// ─── ADMIN ────────────────────────────────────────────────────────────────────

/** GET /api/ad-requests  — admin: list all requests */
exports.getAllRequests = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;
        const requests = await AdRequest.find(filter)
            .populate('user', 'name email subscription')
            .sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (err) { next(err); }
};

/** PUT /api/ad-requests/:id/approve  — admin: approve request */
exports.approveRequest = async (req, res, next) => {
    try {
        const request = await AdRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending')
            return res.status(400).json({ success: false, message: 'Request is already processed' });
        const { adminNote } = req.body;
        request.status = 'approved';
        if (adminNote) request.adminNote = adminNote;
        await request.save();
        res.json({ success: true, message: 'Request approved! Client can now generate AI image.', request });
    } catch (err) { next(err); }
};

/** PUT /api/ad-requests/:id/reject  — admin: reject with reason */
exports.rejectRequest = async (req, res, next) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason is required' });
        const request = await AdRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending')
            return res.status(400).json({ success: false, message: 'Request is already processed' });
        request.status = 'rejected';
        request.adminNote = reason;
        await request.save();
        res.json({ success: true, message: 'Request rejected', request });
    } catch (err) { next(err); }
};
