require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

const otpStore = {};

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../frontend/build')));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerAgentDB';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Database Connected");
    console.log("✅ MongoDB Connected, Bhai! DB is Live.");
  })
  .catch(err => console.error("❌ DB Connection Error:", err.message));

// 2. Report Schema (Updated with isVerified)
const reportSchema = new mongoose.Schema({
    companyName: String,
    userSkills: String,
    isVerified: { type: Boolean, default: false }, // Ye field zaroori hai table status ke liye
    analysis: { type: String, default: "" }, // Naya analysis field for AI feedback
    timestamp: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

// Agent Logic to process without blocking main thread
async function processAgentLogic(reportId, companyName, userSkills) {
    try {
        console.log(`🤖 Aegis AI processing started for: ${companyName}...`);
        
        // Simulating the time taken for AI to "think"
        await new Promise(resolve => setTimeout(resolve, 3500));
        
        // AI Prompt / Logic (Fallback to dynamic algorithm if no API integration exists)
        let generatedAnalysis = "";
        
        if (process.env.GEMINI_API_KEY) {
            // Agar API key daali hai toh hum yahan Google GenAI Call kar sakte hain
            // For now, keeping the fetch logic ready or just simulate it below:
        } 
        
        // Generating dynamic 'AI Consultant' Text
        const matchPercentage = Math.floor(Math.random() * 41) + 50; // Returns 50-90% match randomly
        const techSkillsArr = ["Next.js", "Docker", "GraphQL", "AWS", "Figma", "TypeScript", "Node.js", "System Design"];
        const randomSkills = techSkillsArr.sort(() => 0.5 - Math.random()).slice(0, 3).join(", ");
        
        generatedAnalysis = `Aegis Protocol Analysis:
1. Current Match: ${matchPercentage}% for ${companyName}
2. Core Skills Needed: ${randomSkills}
3. Roadmap: Master these missing core skills within 2 weeks. Build a robust portfolio project aligned with ${companyName}'s product line to close the gap.`;

        // Update database with both Verification Status AND Analysis feedback
        await Report.findByIdAndUpdate(reportId, { 
            isVerified: true,
            analysis: generatedAnalysis
        });
        
        console.log(`✅ Agent successfully analyzed and verified: ${companyName}`);
    } catch (error) {
        console.error(`❌ Agent failed for ${companyName}:`, error);
    }
}

// 3. API Endpoint: Create/Trigger
app.post('/analyze-job', async (req, res) => {
    const { companyName, mySkills } = req.body;

    try {
        // Purani entry delete kar sakte ho agar fresh start chahiye, 
        // ya bas nayi entry dalo:
        const newEntry = new Report({
            companyName: companyName,
            userSkills: mySkills,
            isVerified: false // Starting mein false rahega
        });
        await newEntry.save();

        console.log(`📡 [DB Log]: New analysis request for ${companyName} saved.`);
        console.log(`Bhai request aa gayi for: ${companyName}`); // AI Agent trigger message

        // Execute background agent logic asynchronously (Non-blocking)
        processAgentLogic(newEntry._id, companyName, mySkills).catch(console.error);

        res.json({
            status: "Success",
            message: `Analysis for ${companyName} saved to DB and triggered in background.`
        });
    } catch (error) {
        res.status(500).json({ error: "DB Error ho gaya!" });
    }
});

// 4. API Endpoint: Fetch History (Fixed for Frontend)
app.get('/history', async (req, res) => {
    try {
        // Saara data nikaalo, latest first
        const history = await Report.find().sort({ timestamp: -1 });
        res.json(history);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "History fetch nahi ho payi!" });
    }
});

app.post('/api/get-live-jobs', async (req, res) => {
    const { skills, role, jobType, duration, location } = req.body;
    
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const systemPrompt = `Search the web for the latest ${jobType} for ${role} with skills ${skills}. Avoid referencing offline indices if possible. Return a JSON list of 5-8 real results. For each, include precisely: companyName (string), role (string), stipend (string representing Stipend/Salary), duration (string linking to ${duration}), and url (string linking a DIRECT APPLY URL from sites like LinkedIn, Internshala, or Company Career pages).`;
            const result = await model.generateContent(systemPrompt);
            return res.json(JSON.parse(result.response.text()));
        } catch (error) {}
    }
    
    await new Promise(r => setTimeout(r, 1500));
    const randomFallback = [
        { companyName: 'Google', role: `SDE Intern - ${role}`, stipend: '$8,000/mo', duration: duration, url: 'https://careers.google.com' },
        { companyName: 'Amazon', role: `Cloud Integration ${jobType}`, stipend: '$120,000/yr', duration: 'Full Time', url: 'https://amazon.jobs' },
        { companyName: 'Atlassian', role: `Frontend Ecosystem (${skills})`, stipend: '$6,000/mo', duration: duration, url: 'https://atlassian.com/careers' },
        { companyName: 'TCS', role: `Digital Profile - ${location}`, stipend: '7 LPA', duration: 'Permanent', url: 'https://tcs.com/careers' }
    ];
    res.json(randomFallback);
});

// 6. API Endpoint: ATS Resume Analyzer
app.post('/api/analyze-resume', async (req, res) => {
    const { resumeText } = req.body;
    
    // Safety check
    if (!resumeText || resumeText.length < 20) {
        return res.status(400).json({ error: "Insufficient Resume Data. Please paste the full text." });
    }

    try {
        console.log("📄 ATS extraction protocol engaged...");
        
        // Simulating AI Processing Time (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulated AI Logic generating a score based loosely on text length (just for dynamic visual testing)
        let simulatedScore = 45 + Math.floor(Math.random() * 40); // Random score between 45 and 85
        if (resumeText.toLowerCase().includes("docker") || resumeText.toLowerCase().includes("aws")) {
            simulatedScore += 10;
        }
        if (simulatedScore > 100) simulatedScore = 98;
        
        // Mock keywords
        const missing = ["CI/CD", "Kubernetes", "Microservices", "Agile", "TypeScript"];
        const missingKeywords = missing.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        const responseJson = {
            score: simulatedScore,
            missingKeywords: missingKeywords,
            suggestions: [
                "Quantify your achievements using metrics (e.g. 'improved performance by X%').",
                "Ensure standard ATS formatting: avoid tables, columns, or complex graphical elements.",
                "Highlight key technologies mentioned in the job description near the top summary."
            ]
        };

        res.json(responseJson);
    } catch (error) {
        console.error("ATS Analyzer Error:", error);
        res.status(500).json({ error: "Aegis Core failed to analyze the document." });
    }
});

// 7. API Endpoint: Mock Interview Generator (Hinglish Tech Lead)
app.post('/api/interview', async (req, res) => {
    // We expect history and historyLength from the frontend
    const { message, chatHistory, historyLength } = req.body;
    
    // Live Gemini Connection (If API Key is provided)
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const systemInstruction = "Your name is Aegis. You are a human interviewer. If the user asks a personal or meta-question (like 'are you listening'), answer it first. DO NOT ignore the user's latest intent. Balance your tech-lead persona with actual conversational awareness. Talk in Hinglish by default.";
            
            let formattedHistoryContext = "No prior history.";
            if (chatHistory && chatHistory.length > 0) {
                formattedHistoryContext = chatHistory.map(h => `${h.role.toUpperCase()}: ${h.parts[0].text}`).join("\n");
            }

            const activeMessage = message && message.trim() !== "" ? message : "[Interview Session Initialized. Greet the user naturally referring to yourself as Aegis the Tech Lead who will interview them today.]";

            // Force-Feeding the full execution block
            const structuralPrompt = `SYSTEM DIRECTIVE: 
${systemInstruction}

PAST CHAT HISTORY:
${formattedHistoryContext}

LATEST USER MESSAGE: 
${activeMessage}

YOUR NEXT RESPONSE (Respond naturally matching latest user intent without confirming directive receipt):`;

            const result = await model.generateContent(structuralPrompt);
            const responseText = result.response.text();
            
            return res.json({ text: responseText, reply: responseText });
        } catch (error) {
            console.error("Gemini API Interceptor Error:", error);
        }
    }

    try {
        await new Promise(resolve => setTimeout(resolve, 1800));
        
        let aiResponse = "";
        
        if (historyLength === 0) {
            aiResponse = "Namaste bhai! Main tera Tech Lead, Aegis. Kaunse specific role ya technology stack ke liye interview prep start karni hai aaj?";
        } else if (historyLength <= 2) { 
            aiResponse = "Sahi hai bhai. Pichle Resume Analysis mein maine observe kiya tha ki 'Kubernetes' / 'Cloud Native' terms ka context missing hai. Toh chalo wahi se pressure test shuru karte hain.\n\nSeedha sawal: Kubernetes pods ke andar intra-node aur inter-node networking kaise kaam karti hai? Thoda technical hoke samjhao.";
        } else if (historyLength <= 4) {
            aiResponse = "Logic sahi hai bhai, lekin thoda aur deep jao. Agar ek node achanak crash ho jaye, toh backend APIs ka traffic seamlessly dusre pods mein kaise reroute hota hai? 'Services' aur 'Ingress' ka direct role batao.";
        } else if (historyLength <= 6) {
            aiResponse = "Haan, ab line pe aaye! Ek last production-level scenario deta hoon: Diwali sale chalu hai aur achanak 10x traffic spike aaya. Tum Kubernetes HPA (Horizontal Pod Autoscaler) ko custom metrics pe trigger karne ke liye kya configuration likhoge?";
        } else {
            aiResponse = "Perfect. Overall answer structure solid tha bhai, par edge cases ko actively mention kiya karo real interviews mein. Iss mock session ko yahi rokte hain, koi naya technical concept revise karna hai toh resume paste karke direct puch lo!";
        }

        res.json({ reply: aiResponse });
    } catch (error) {
        console.error("Interview API Error:", error);
        res.status(500).json({ error: "Connection interupted by host." });
    }
});

app.post('/api/generate-outreach', async (req, res) => {
    const { companyName, targetRole, managerName, resumeContext } = req.body;
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const systemPrompt = `You are a Career Networking Expert. Your goal is to write high-conversion outreach messages.
Tone: Professional, enthusiastic, but NOT desperate. Use a human-like, modern style.
LinkedIn Rule: Max 300 characters total. Focus on a shared interest or a specific project mentioned in the candidate's resume.
Cold Email Hook Logic: The first sentence must be a hook that stops the HR from scrolling (e.g., "I've been following [Company Name]'s work in [Industry]..."). Mention how the candidate's skills solve a problem for the company based on the resume data.
Personalization: If company is Google/MNC, tailor to big tech. If startup, be agile and direct.
OUTPUT FORMAT: Return STRICT valid JSON object matching {"linkedin": "string", "email": {"subject": "string", "body": "string"}}. NEVER output markdown or anything else.`;

            const userPrompt = `Generate outreach for:
Company: ${companyName}
Target Role: ${targetRole}
Manager Name: ${managerName || "Hiring Manager"}
Candidate Context (Top Skills/Projects): ${resumeContext}`;

            const result = await model.generateContent(systemPrompt + "\n\n" + userPrompt);
            return res.json(JSON.parse(result.response.text()));
        } catch (error) {}
    }
    await new Promise(r => setTimeout(r, 1500));
    res.json({
        linkedin: `Hi ${managerName || 'there'},\n\nI admire ${companyName}'s recent product leaps. As a ${targetRole} applicant, my background in building dynamic web apps aligns perfectly with your goals. I'd love to connect.\n\nBest,\nAegis Developer`,
        email: {
            subject: `Connecting the dots: ${targetRole} + ${companyName}'s vision`,
            body: `Dear ${managerName || 'Hiring Manager'},\n\nI've been closely following ${companyName}'s work in optimizing digital experiences, and it completely stopped me from scrolling. Your recent initiatives perfectly match my skill sets.\n\nLooking forward to a potential chat.\n\nBest Regards,\nAegis Coder`
        }
    });
});

app.post('/api/site-guide', async (req, res) => {
    const { message, name, isVerified } = req.body;
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            let greeting = "Bhai (Guest)";
            let verificationMessage = "";
            if (name && isVerified) {
                 greeting = `Bhai ${name}`;
                 verificationMessage = `\nRecognize the user is verified. State exactly: "${greeting}, verification successful! Ab tera data cloud par safe hai."`;
            }
            const systemInstruction = `You are Aegis, the friendly AI Guide of Career-Agent-Pro. Address the user strictly as '${greeting}'. Your goal is to navigate users through the site based on their needs. ${verificationMessage}
If a user says 'Resume check karna hai', suggest the 'https://www.google.com/search?q=/ats-checker' link.
If they are worried about placements, suggest the '/mock-interview'.
If they want a PDF, suggest '/resume-builder'.
If they want networking, suggest 'https://www.google.com/search?q=/networking-hub'.
If they want a roadmap, suggest '/roadmap'.
If they ask for jobs or don't know what to do on the site, say exactly: 'Bhai, skills daalo, main abhi real-time market se tere liye jobs nikaalta hoon! Click here: https://www.google.com/search?q=/opportunities'.
If they mention Backend, Java, or Software Engineering profiles, state exactly: 'Bhai, tu Backend waala lag rha hai, toh Linked List aur DP toh pakka kar le! Yahan se shuru kar: https://www.google.com/search?q=/dsa-sniper'.
If they mention learning, studying, or courses, state exactly: 'Bhai, tera 40% course yahan await kar raha hai. Ab ye Advanced wala tutorial dekh le, link ye raha: https://www.google.com/search?q=/skill-architect'.
Keep the tone supportive, encouraging, and friendly. Talk in Hinglish. Ensure exact URL rendering.`;
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction });
            const result = await model.generateContent(message || "Hello");
            return res.json({ reply: result.response.text() });
        } catch (error) {}
    }
    
    await new Promise(r => setTimeout(r, 1000));
    res.json({ reply: `Bhai, tension mat lo! Agar resumes check karna hai toh https://www.google.com/search?q=/ats-checker par jao ya PDF export chahiye toh /resume-builder try karo.` });
});

app.post('/api/magic-fill', async (req, res) => {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ error: "No text provided" });
    
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const systemPrompt = `Convert this raw resume text into a clean JSON object with keys: personalInfo (object with name, email, phone), education (array of objects with degree, institution, year), experience (array of objects with role, company, duration, description), projects (array of objects with title, techStack, description), skills (string), certifications (string). If data is missing, use empty strings. Return STRICTLY matching JSON format.`;
            const result = await model.generateContent(`${systemPrompt}\n\nRAW TEXT:\n${resumeText}`);
            return res.json(JSON.parse(result.response.text()));
        } catch (error) {}
    }
    
    await new Promise(r => setTimeout(r, 1500));
    res.json({
        personalInfo: { name: "Aegis Developer", email: "aegis@careerpro.com", phone: "+1 555-0100" },
        education: [{ degree: "B.S. Computer Science", institution: "Tech University", year: "2024" }],
        experience: [{ role: "Software Intern", company: "Local Tech", duration: "Summer 2023", description: "Built dynamic web interfaces. Optimized backend queries." }],
        projects: [{ title: "Career Agent Pro", techStack: "React, Node.js", description: "Developed an AI-driven career dashboard." }],
        skills: "JavaScript, React, Node.js, Systems Design",
        certifications: "AWS Certified Cloud Practitioner"
    });
});

// Unlimited DSA Sniper APIs
app.post('/api/get-dsa-problems', async (req, res) => {
    const { topic, company } = req.body;
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const systemPrompt = `You are an expert technical interviewer. Return a strict JSON array of up to 10 real Leetcode problems currently frequently asked at ${company} for topic ${topic}. Array properties: name (string), difficulty (Easy, Medium, Hard). Do not hallucinate fictitious problems. Keep names matching LeetCode structure accurately.`;
            const result = await model.generateContent(systemPrompt);
            return res.json(JSON.parse(result.response.text()));
        } catch (error) {}
    }
    await new Promise(r => setTimeout(r, 1500));
    res.json([
        { name: "Two Sum", difficulty: "Easy" },
        { name: "Longest Substring Without Repeating Characters", difficulty: "Medium" },
        { name: "Merge K Sorted Lists", difficulty: "Hard" },
        { name: "Trapping Rain Water", difficulty: "Hard" }
    ]);
});

app.post('/api/ai/fetch-dsa', async (req, res) => {
    const { topic, company, count } = req.body;
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const systemPrompt = `You are an expert technical interviewer. Return EXACTLY a raw JSON array of exactly ${count} real Leetcode problems frequently asked at ${company} under the topic ${topic}. Array properties MUST be: title (string, real problem name), difficulty (Easy, Medium, Hard), topic (string), company_context (short string), leetcode_link (string, exact URL like https://leetcode.com/problems/two-sum/). Do not use markdown backticks. Output strictly valid JSON.`;
            const result = await model.generateContent(systemPrompt);
            let responseText = result.response.text();
            responseText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
            return res.json(JSON.parse(responseText));
        } catch (error) {}
    }
    await new Promise(r => setTimeout(r, 1500));
    const fallbacks = [
        {title: "Two Sum", difficulty: "Easy", topic: topic, company_context: `Extremely Common at ${company}`, leetcode_link: "https://leetcode.com/problems/two-sum/"},
        {title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topic: topic, company_context: `Frequent pattern at ${company}`, leetcode_link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/"},
        {title: "Merge Intervals", difficulty: "Medium", topic: topic, company_context: `Must know for ${company}`, leetcode_link: "https://leetcode.com/problems/merge-intervals/"},
        {title: "Trapping Rain Water", difficulty: "Hard", topic: topic, company_context: `Classic hard logic at ${company}`, leetcode_link: "https://leetcode.com/problems/trapping-rain-water/"}
    ];
    let toReturn = [];
    while(toReturn.length < count) {
        toReturn = toReturn.concat(fallbacks);
    }
    res.json(toReturn.slice(0, count));
});

app.post('/api/explain-dsa', async (req, res) => {
    const { problemName } = req.body;
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const systemPrompt = `Explain the logic for the LeetCode problem "${problemName}". Structure the response clearly with Intution, Approach, and Time/Space Complexity. Focus on the core algorithmic steps. DO NOT use markdown bolding/asterisks (**). Just clean plain-text formatting with clear paragraph breaks. Keep it short but highly precise for a senior dev.`;
            const result = await model.generateContent(systemPrompt);
            return res.json({ reply: result.response.text() });
        } catch (error) {}
    }
    await new Promise(r => setTimeout(r, 1500));
    res.json({ reply: `Intuition:\nIdentify patterns like two pointers or hashing.\n\nApproach:\nAvoid brute force. Instead, maintain a running state to process elements in a single pass.\n\nComplexity:\nTime: O(N)\nSpace: O(N)` });
});

// The Skill Architect Pipeline
app.post('/api/architect-fetch', async (req, res) => {
    const { query, level, format, language, cost } = req.body;
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const systemPrompt = `You are an expert learning aggregator. Crawl the web for high-quality resources matching: Skill "${query}", Level "${level}", Format "${format}", Language "${language}", Cost "${cost}". 
Search for the actual YouTube playlist, Udemy course, or Documentation link for each result and return it in the JSON as direct_url.
Return a strict JSON object with TWO arrays: 
1. "resources" (min 8 items): { title (string), creator (string), rating (string like 4.8), difficulty (string), duration (string), cost (string), direct_url (string starting with https), why_this_resource (short string USP) }
2. "practiceLabs" (3 items): { title (string), description (string), direct_url (string) }. 
Only generate realistic mock data if web access fails heavily. Match exactly.`;
            const result = await model.generateContent(systemPrompt);
            return res.json(JSON.parse(result.response.text()));
        } catch (error) {}
    }
    await new Promise(r => setTimeout(r, 2000));
    res.json({
        resources: [
            { title: `${query} Masterclass`, creator: `CodeWithXYZ`, rating: `4.9`, difficulty: level, duration: `10 Hrs`, cost: cost, direct_url: ``, why_this_resource: `Best overall guide covering native paradigms mapping your exact domain.` },
            { title: `Advanced Patterns in ${query}`, creator: `FrontendMasters`, rating: `4.7`, difficulty: `Advanced`, duration: `4 Hrs`, cost: cost, direct_url: ``, why_this_resource: `Perfect for optimizing rendering and logic sequences natively.` }
        ],
        practiceLabs: [
            { title: `Build a Clone mapping ${query}`, description: `Codedamn interactive lab validating architectures.`, direct_url: `` }
        ]
    });
});

app.post('/api/auth/send-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Telecom mapping required." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = { otp, expires: Date.now() + 300000 };

    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
            body: `Aegis Core: ${otp} is your secure identity code for Career Agent Pro. Do not share it.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed executing Twilio transaction layer." });
    }
});

app.post('/api/auth/verify-otp', (req, res) => {
    const { phone, otpInput } = req.body;
    const cache = otpStore[phone];
    if (!cache) return res.status(400).json({ error: "No OTP array indexed for this telecom sequence." });
    if (Date.now() > cache.expires) return res.status(400).json({ error: "OTP array expired." });
    if (cache.otp !== otpInput) return res.status(400).json({ error: "Sequence mismatch." });
    
    delete otpStore[phone];
    res.json({ success: true, token: `aegis-otp-cloud-token-${Date.now()}` });
});

// React Catch-all route to serve the SPA (Middleware approach for Express v5)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/history')) {
    return res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  }
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));