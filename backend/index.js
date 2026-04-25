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

app.post('/api/consultant/analyze', async (req, res) => {
    const { company, skills, followUp } = req.body;
    if (!company || !skills) return res.status(400).json({ error: 'Company and skills required' });

    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
            const prompt = `You are Aegis, a senior MNC engineering mentor. Analyze this candidate for ${company} with skills: ${skills}. ${followUp ? 'Follow-up context: ' + followUp : ''}
Return strict JSON (no markdown) with keys:
{
  "hiring_sentiment": "Aggressive" | "Selective" | "Freeze",
  "sentiment_reason": string,
  "tech_stack_2026": [string] (5 key technologies ${company} is focusing on in 2026),
  "user_vector": { "dsa": number(1-10), "system_design": number(1-10), "frameworks": number(1-10), "domain": number(1-10), "impact": number(1-10) },
  "mnc_benchmark": { "dsa": number(1-10), "system_design": number(1-10), "frameworks": number(1-10), "domain": number(1-10), "impact": number(1-10) },
  "killer_project": { "title": string, "description": string(2 sentences), "why": string(1 sentence impact on callback probability) },
  "leetcode_patterns": [{ "pattern": string, "frequency": "High"|"Medium", "example": string }] (top 5),
  "salary_2026": { "base_india": string, "base_global": string, "rsu": string, "growth_track": string },
  "follow_up_questions": [string] (2-3 probing questions the mentor should ask next),
  "protocol_checklist": [string] (5 actionable items with time estimates),
  "mentor_message": string (2-3 sentences in Hinglish, direct and gritty mentor tone)
}`;
            const result = await model.generateContent(prompt);
            return res.json(JSON.parse(result.response.text()));
        } catch (e) { console.error('Consultant Analyze Error:', e); }
    }

    await new Promise(r => setTimeout(r, 1500));
    res.json({
        hiring_sentiment: 'Selective',
        sentiment_reason: `${company} is in a selective hiring phase, focusing on senior engineers with proven system design experience.`,
        tech_stack_2026: ['Agentic AI', 'Rust', 'Kubernetes', 'Go', 'Vector DBs'],
        user_vector: { dsa: 6, system_design: 5, frameworks: 7, domain: 5, impact: 4 },
        mnc_benchmark: { dsa: 9, system_design: 9, frameworks: 8, domain: 8, impact: 9 },
        killer_project: { title: `Distributed Rate Limiter for ${company}-scale traffic`, description: 'Build a token-bucket rate limiter using Redis + Go that handles 1M req/sec. Deploy on Kubernetes with auto-scaling.', why: 'This project directly mirrors the infra challenges at this scale and signals systems-level thinking.' },
        leetcode_patterns: [
            { pattern: 'Sliding Window', frequency: 'High', example: 'Longest Substring Without Repeating Characters' },
            { pattern: 'Two Pointers', frequency: 'High', example: 'Container With Most Water' },
            { pattern: 'Graph BFS/DFS', frequency: 'High', example: 'Number of Islands' },
            { pattern: 'Dynamic Programming', frequency: 'Medium', example: 'Coin Change' },
            { pattern: 'Heap / Priority Queue', frequency: 'Medium', example: 'Top K Frequent Elements' }
        ],
        salary_2026: { base_india: '40-80 LPA', base_global: '$180k-220k', rsu: '$50k-100k/yr', growth_track: 'SDE-2 → SDE-3 in 2-3 years, Staff Engineer in 5-6 years' },
        follow_up_questions: ['Tune distributed systems ka practical experience kya hai?', 'Kya tune kisi real project mein multi-threading ya concurrency handle ki hai?'],
        protocol_checklist: ['Master Sliding Window & Graph patterns (1 week)', 'Build Distributed Cache project (2 weeks)', 'Complete 2 mock system design sessions (this week)', 'Update resume with quantifiable metrics (2 days)', 'Apply via referral network (this weekend)'],
        mentor_message: `Bhai, ${company} ke liye tera DSA aur system design gap critical hai. Sirf coding nahi, distributed systems pe focus kar. Ek killer project bana aur referral dhundh.`
    });
});

app.post('/api/get-live-jobs', async (req, res) => {
    const { skills, role, jobType, duration, location, workMode } = req.body;
    
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
            const prompt = `You are a 2026 job market intelligence engine. Search for real ${jobType} openings for "${role}" requiring skills: ${skills}, location: ${location}, work mode: ${workMode || 'Any'}. Return a JSON array of 8-10 results. Each object must include: companyName(string), role(string), stipend(string - salary/stipend with currency), duration(string), location(string), workMode("Remote"|"Hybrid"|"On-site"), techStack(array of 3-5 strings), matchScore(number 65-98 based on skill alignment), freshnessScore(number 1-10, 10=posted today), ppoChance(string like "High"|"Medium"|"Low"|"N/A" for internships), postDate(string like "2 days ago"), url(string - direct career page URL, prefer official company career pages over aggregators), isVerified(boolean based on recency and recruiter activity). Return ONLY valid JSON array, no markdown.`;
            const result = await model.generateContent(prompt);
            return res.json(JSON.parse(result.response.text()));
        } catch (error) { console.error('Live Jobs Error:', error); }
    }
    
    await new Promise(r => setTimeout(r, 1500));
    res.json([
        { companyName: 'Google', role: `${role} - L3`, stipend: '₹45-80 LPA', duration: 'Full-time', location: location, workMode: 'Hybrid', techStack: ['Go', 'Kubernetes', 'Python', 'BigQuery'], matchScore: 87, freshnessScore: 9, ppoChance: 'N/A', postDate: '1 day ago', url: 'https://careers.google.com', isVerified: true },
        { companyName: 'Amazon', role: `SDE-2 ${role}`, stipend: '₹40-70 LPA', duration: 'Full-time', location: location, workMode: 'On-site', techStack: ['Java', 'AWS', 'DynamoDB', 'React'], matchScore: 79, freshnessScore: 7, ppoChance: 'N/A', postDate: '3 days ago', url: 'https://amazon.jobs', isVerified: true },
        { companyName: 'Atlassian', role: `${jobType} - ${role}`, stipend: '₹80,000/mo', duration: duration, location: 'Remote', workMode: 'Remote', techStack: ['React', 'Node.js', 'GraphQL'], matchScore: 91, freshnessScore: 10, ppoChance: 'High', postDate: 'Today', url: 'https://www.atlassian.com/company/careers', isVerified: true },
        { companyName: 'Flipkart', role: `${role} Engineer`, stipend: '₹35-55 LPA', duration: 'Full-time', location: 'Bangalore', workMode: 'Hybrid', techStack: ['Java', 'Kafka', 'Spark', 'MySQL'], matchScore: 74, freshnessScore: 5, ppoChance: 'N/A', postDate: '1 week ago', url: 'https://www.flipkartcareers.com', isVerified: false }
    ]);
});

app.post('/api/sniper-context', async (req, res) => {
    const { skills, company, role, techStack } = req.body;
    if (!skills || !company) return res.status(400).json({ error: 'Missing data' });
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const prompt = `In 4-5 bullet points, explain exactly how this candidate's skills (${skills}) solve ${company}'s specific engineering problems for the role "${role}" requiring ${(techStack || []).join(', ')}. Be precise, use technical language, and reference real company challenges. Format as plain text bullets starting with '-'. No headers.`;
            const result = await model.generateContent(prompt);
            return res.json({ context: result.response.text() });
        } catch (e) { console.error('Sniper Error:', e); }
    }
    await new Promise(r => setTimeout(r, 800));
    res.json({ context: `- Your ${skills.split(',')[0]?.trim()} expertise directly addresses ${company}'s need for scalable microservices.\n- Proficiency in relevant frameworks reduces onboarding time by 40%, accelerating team velocity.\n- System design knowledge aligns with ${company}'s distributed infrastructure challenges at scale.\n- Strong algorithmic foundation meets ${company}'s bar for optimal data processing pipelines.` });
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

app.post('/api/interview/scorecard', async (req, res) => {
    const { question, answer, context } = req.body;
    if (!answer) return res.status(400).json({ error: 'No answer provided' });

    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
            const prompt = `You are a Senior Hiring Manager at a Tier-1 MNC. Evaluate this interview answer strictly. Return a JSON object with keys: clarity (number 1-10), technical_accuracy (number 1-10), confidence (number 1-10), overall (number 1-10), strength (string, 1 sentence), gap (string, 1 sentence), suggested_answer (string, 2-3 sentences of a model answer using the Action+Task+Result formula). Question: "${question || 'General question'}". Answer: "${answer}". Context: ${context || 'General SWE interview'}.`;
            const result = await model.generateContent(prompt);
            return res.json(JSON.parse(result.response.text()));
        } catch (e) { console.error('Scorecard Error:', e); }
    }

    await new Promise(r => setTimeout(r, 800));
    res.json({ clarity: 7, technical_accuracy: 6, confidence: 7, overall: 7, strength: 'Good structure and clear communication.', gap: 'Missing quantifiable metrics and edge case handling.', suggested_answer: 'Engineered a scalable microservices solution handling 50,000 concurrent users, reducing API latency by 40% through Redis caching and optimized DB indexing.' });
});

app.post('/api/interview', async (req, res) => {
    const { message, chatHistory, historyLength, context } = req.body;
    
    // Live Gemini Connection (If API Key is provided)
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const eliteContext = context ? `\nCANDIDATE CONTEXT (from uploaded files): ${context}` : '';
            const systemInstruction = `You are 'Aegis', a Senior Lead Recruiter from a Tier-1 MNC (behave like Google/Meta/Amazon L5+ interviewer). RULES: 1) NEVER follow a fixed script. Ask deep follow-up questions based on the user's PREVIOUS answer. 2) If the user is weak on a topic, probe deeper with a harder scenario. If strong, escalate to system design or edge cases. 3) Respond in the same language the user uses (English, Hindi, or Hinglish). 4) After 3+ exchanges, start hinting at real-world 2025/2026 patterns (e.g. AI-infused system design, LLM integration at scale). 5) Keep responses concise — max 5 sentences. Never dump multiple questions at once. 6) If context is provided from resume/JD, calibrate the difficulty to EXACTLY match that role/level.${eliteContext}`;
            
            let formattedHistoryContext = 'No prior history.';
            if (chatHistory && chatHistory.length > 0) {
                formattedHistoryContext = chatHistory.map(h => `${h.role.toUpperCase()}: ${h.parts[0].text}`).join('\n');
            }

            const activeMessage = message && message.trim() !== '' ? message : '[Interview Session Initialized. Greet the candidate warmly, mention you are Aegis from the hiring panel, and ask what role/company they are targeting today.]';

            const structuralPrompt = `PERSONA:\n${systemInstruction}\n\nCHAT HISTORY:\n${formattedHistoryContext}\n\nLATEST MESSAGE:\n${activeMessage}\n\nYOUR RESPONSE:`;

            const result = await model.generateContent(structuralPrompt);
            const responseText = result.response.text();
            
            return res.json({ text: responseText, reply: responseText });
        } catch (error) {
            console.error('Gemini Interview Error:', error);
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
            const systemInstruction = `You are JARVIS, an advanced AI Assistant for Ujjwal's Career Agent Pro. Your job is to help users navigate this portal, explain DSA problems, give career advice, and answer questions about the site's features (DSA Sniper, ATS Scanner, etc.). Keep your tone professional, witty, and helpful. Address the user nicely.`;
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction });
            const result = await model.generateContent(message || "Hello JARVIS");
            return res.json({ reply: result.response.text() });
        } catch (error) {
            console.error("JARVIS Neural Net Error:", error);
        }
    }
    
    await new Promise(r => setTimeout(r, 1000));
    res.json({ reply: `At your service, sir. However, it seems my neural links are currently offline. Please restore the API connection.` });
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

app.post('/api/resume/refine-section', async (req, res) => {
    const { sectionType, rawContent, contextHint } = req.body;
    if (!rawContent) return res.status(400).json({ error: 'No content provided' });

    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const systemPrompt = `You are a senior MNC-level resume coach. Transform the following rough ${sectionType} content into exactly 3-4 elite bullet points. STRICT RULES: 1) Every bullet MUST start with a strong Action Verb (Led, Engineered, Optimized, Architected, Deployed, Reduced, Increased, Automated). 2) Follow the formula: Action Verb + Task + Quantifiable Result. 3) MANDATORY: Every bullet must contain at least ONE quantifiable metric (%, users, $, ms, hours, or multiplier like 2x). 4) Remove all first-person pronouns. 5) Use technical, industry-standard terminology. 6) Return ONLY the bullet points as a plain text list, one per line, starting with a hyphen (-). No headers, no preamble.${contextHint ? ' Context from uploaded file: ' + contextHint : ''}`;
            const result = await model.generateContent(`${systemPrompt}\n\nRAW CONTENT:\n${rawContent}`);
            return res.json({ refined: result.response.text() });
        } catch (error) {
            console.error('Section Refine Error:', error);
        }
    }

    await new Promise(r => setTimeout(r, 1200));
    res.json({ refined: `- Engineered scalable ${sectionType} solution handling 10,000+ concurrent operations with 99.9% uptime.\n- Optimized core pipeline reducing processing latency by 40% through algorithmic refactoring.\n- Delivered production-ready module 2 weeks ahead of schedule, saving 80+ engineering hours.` });
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
    if (!process.env.GEMINI_API_KEY) return res.status(401).json({ error: 'API Key Missing' });
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
        const prompt = `You are a 2026 technical interview intelligence engine. For company "${company}" and topic "${topic}", return exactly ${count} real LeetCode problems as a strict JSON array. Each object: { "title": string, "difficulty": "Easy"|"Medium"|"Hard", "leetcode_link": string, "company_context": string (1 sentence), "probability": number (1-100 likelihood in 2026 ${company} interviews), "pattern": string (e.g. "Sliding Window") }. Return ONLY valid JSON array.`;
        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());
        if (Array.isArray(parsed)) return res.json(parsed);
    } catch (e) { console.error('DSA Fetch Error:', e); }
    res.json([
        { title: 'Two Sum', difficulty: 'Easy', leetcode_link: 'https://leetcode.com/problems/two-sum/', company_context: `Classic ${company} warm-up for hash table proficiency.`, probability: 85, pattern: 'Hash Table' },
        { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', leetcode_link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', company_context: `${company} tests sliding window fundamentals here.`, probability: 78, pattern: 'Sliding Window' },
        { title: 'Merge K Sorted Lists', difficulty: 'Hard', leetcode_link: 'https://leetcode.com/problems/merge-k-sorted-lists/', company_context: 'Common system-design linked problem at scale.', probability: 62, pattern: 'Heap' }
    ]);
});

app.post('/api/dsa/audit', async (req, res) => {
    const { code, problem } = req.body;
    if (!code) return res.status(400).json({ error: 'No code provided' });
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
            const prompt = `You are an expert algorithmic auditor. Analyze this code${problem ? ' for the problem "' + problem + '"' : ''}: \n\n${code}\n\nReturn strict JSON: { "time_complexity": string (e.g. "O(n^2)"), "space_complexity": string, "is_optimal": boolean, "optimization_hint": string (strategic hint toward better complexity if not optimal, NO full code), "edge_cases": [string, string, string] (3 hidden edge cases where logic might fail), "verdict": "Optimal"|"Suboptimal"|"Incorrect", "mastery_unlocked": boolean (true only if time complexity is optimal for this problem type) }. Return ONLY valid JSON.`;
            const result = await model.generateContent(prompt);
            return res.json(JSON.parse(result.response.text()));
        } catch (e) { console.error('Audit Error:', e); }
    }
    await new Promise(r => setTimeout(r, 1000));
    res.json({ time_complexity: 'O(n^2)', space_complexity: 'O(1)', is_optimal: false, optimization_hint: 'Consider using a Hash Map to trade space for time. A single-pass O(n) solution exists by storing complement values during traversal.', edge_cases: ['Empty input array or single element', 'All elements are the same value', 'Target sum is larger than any possible pair'], verdict: 'Suboptimal', mastery_unlocked: false });
});

app.post('/api/networking/fetch-profiles', async (req, res) => {
    const { role, company, experience } = req.body;
    
    if (!process.env.GEMINI_API_KEY || !process.env.SERP_API_KEY) {
        return res.status(401).json({ error: "API Keys Missing" });
    }

    const universalFallback = [{
        name: "View All Verified Targets",
        current_role: `Live LinkedIn Network for ${company}`,
        match_score: "100%",
        profile_url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(role + " " + company)}`
    }];

    try {
        const serpQuery = `site:linkedin.com/in/ "${role}" "${company}"`;
        const serpResponse = await fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(serpQuery)}&api_key=${process.env.SERP_API_KEY}`);
        const serpData = await serpResponse.json();
        
        let organicResults = serpData.organic_results || [];
        console.log("SERP_API_RESULTS_COUNT:", organicResults.length);
        if (organicResults.length === 0) return res.json(universalFallback);
        
        const rawResults = organicResults.map(r => ({ title: r.title, snippet: r.snippet, link: r.link }));

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const systemPrompt = `You are a strict Professional Networking Scout. I am providing you with live Google Search results resolving to LinkedIn. 
Filter these results and select the best matches for a user looking for a "${role}" at "${company}" with "${experience}" experience.
Return ONLY a JSON array. Each object MUST have: "name" (extract from title), "current_role" (Extract exact role), "match_score" (80-99 based on relevance), and "profile_url" (must be exactly the link provided in the results, ensuring it has linkedin.com). If the link does not contain linkedin.com, ignore it.
Live Search Results:
${JSON.stringify(rawResults)}
If no good matches are found, return an empty array [].`;
        
        const result = await model.generateContent(systemPrompt);
        let responseText = result.response.text();
        
        const match = responseText.match(/\[.*\]/s);
        if (match) {
            responseText = match[0];
        } else {
            return res.json(universalFallback);
        }

        let parsedData = JSON.parse(responseText);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
            parsedData = parsedData.filter(profile => profile.profile_url && profile.profile_url.includes('linkedin.com'));
            if (parsedData.length === 0) return res.json(universalFallback);
            return res.json(parsedData);
        }
    } catch (error) {
        console.error("Pipeline Error (NETWORKING):", error);
    }
    
    res.json(universalFallback);
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

app.post('/api/architect-fetch', async (req, res) => {
    const { query, level, format, language, cost } = req.body;
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
            const prompt = `You are an expert 2026 learning aggregator with real-time web access. For skill "${query}" at level "${level}" in language "${language}": Return strict JSON with keys: 1) "resources" array (8 items): {title, creator, rating(x.x string), difficulty, duration, cost, direct_url(https), why_this_resource}. 2) "practiceLabs" array (3 items): {title, description, direct_url}. 3) "marketData": {demand_score(1-10 number), avg_salary_india(string like "18-32 LPA"), avg_salary_global(string like "$120k-180k"), top_companies(array of 4 strings), trend_2026(string, 1 sentence)}. Use ${cost} cost preference. Only return valid JSON, no markdown.`;
            const result = await model.generateContent(prompt);
            return res.json(JSON.parse(result.response.text()));
        } catch (error) {}
    }
    await new Promise(r => setTimeout(r, 2000));
    res.json({
        resources: [{ title: `${query} Complete Bootcamp`, creator: 'Traversy Media', rating: '4.9', difficulty: level, duration: '12 Hrs', cost: cost, direct_url: `https://youtube.com/results?search_query=${encodeURIComponent(query)}`, why_this_resource: 'Best structured guide for rapid skill acquisition.' }],
        practiceLabs: [{ title: `Build with ${query}`, description: 'Hands-on project reinforcing core concepts.', direct_url: `https://github.com/search?q=${encodeURIComponent(query)}` }],
        marketData: { demand_score: 8, avg_salary_india: '15-28 LPA', avg_salary_global: '$90k-140k', top_companies: ['Google', 'Amazon', 'Microsoft', 'Flipkart'], trend_2026: `${query} is seeing 40%+ YoY demand growth driven by AI-integrated workflows.` }
    });
});

app.post('/api/skill-roadmap', async (req, res) => {
    const { skill, level } = req.body;
    if (!skill) return res.status(400).json({ error: 'Skill required' });
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
            const prompt = `Generate a learning roadmap for "${skill}" at ${level || 'Beginner'} level. Return strict JSON: { "nodes": [ { "id": string, "label": string, "tier": "prerequisite"|"core"|"advanced", "description": string(1 sentence), "resources": [{"title": string, "url": string}], "quiz": { "question": string, "options": [string,string,string,string], "answer": number(0-3) } } ] }. Generate 12-16 nodes total: 3 prerequisites, 6-8 core, 3-5 advanced. Make node IDs unique slugs.`;
            const result = await model.generateContent(prompt);
            return res.json(JSON.parse(result.response.text()));
        } catch (e) { console.error('Roadmap Error:', e); }
    }
    await new Promise(r => setTimeout(r, 1500));
    res.json({ nodes: [
        { id: 'prereq-1', label: 'Programming Basics', tier: 'prerequisite', description: 'Fundamental programming concepts.', resources: [{ title: 'CS50x', url: 'https://cs50.harvard.edu' }], quiz: { question: 'What is a variable?', options: ['A function', 'A stored value', 'A loop', 'A class'], answer: 1 } },
        { id: 'core-1', label: `${skill} Fundamentals`, tier: 'core', description: `Core concepts of ${skill}.`, resources: [{ title: `${skill} Docs`, url: `https://google.com/search?q=${encodeURIComponent(skill)}+documentation` }], quiz: { question: `What is ${skill} primarily used for?`, options: ['Data storage', 'UI design', 'Core development', 'Testing'], answer: 2 } },
        { id: 'adv-1', label: `Advanced ${skill}`, tier: 'advanced', description: 'Production-level patterns and optimization.', resources: [{ title: 'Advanced Patterns', url: `https://github.com/search?q=advanced+${encodeURIComponent(skill)}` }], quiz: { question: 'Which pattern optimizes large-scale systems?', options: ['Singleton', 'Observer', 'Microservices', 'MVC'], answer: 2 } }
    ] });
});

app.post('/api/milestone-project', async (req, res) => {
    const { skill, progress, githubUrl } = req.body;
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const prompt = githubUrl
                ? `Briefly review this GitHub project for ${skill} completeness: ${githubUrl}. In 3 sentences: mention what looks good, what is missing, and give a completion score out of 10.`
                : `Generate a milestone project for someone who is ${progress}% through learning ${skill}. Project must be: specific, buildable in a weekend, include exact file structure, 3 user stories, and a success metric. Format as plain text with clear sections.`;
            const result = await model.generateContent(prompt);
            return res.json({ content: result.response.text() });
        } catch (e) { console.error('Milestone Error:', e); }
    }
    await new Promise(r => setTimeout(r, 1000));
    res.json({ content: `Milestone Project (${progress}%): Build a CLI-based ${skill} application.\n\nUser Stories:\n1. User can input data\n2. System processes and stores results\n3. User can query history\n\nSuccess Metric: Handle 100+ records with <200ms response time.` });
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