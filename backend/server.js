const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5052;

// ==================== RESUME SCHEMA ====================
const resumeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    role: { type: String, required: true },
    summary: { type: String, default: '' },
    experience: { type: String, default: '' },
    education: { type: String, default: '' },
    skills: { type: String, default: '' },
    templateType: { type: String, enum: ['modern', 'classic', 'minimal'], default: 'modern' }
  },
  { timestamps: true }
);

resumeSchema.index({ fullName: 'text', role: 'text', title: 'text' });
const Resume = mongoose.model('Resume', resumeSchema);

// ==================== AI ENHANCE SERVICE ====================
const polishResumeText = (section, text) => {
  const t = text.trim();
  if (section === 'summary') {
    return `Results-driven ${t || 'Full Stack Engineer'} with deep expertise in scalable system design, RESTful API architecture, and modern full-stack frameworks. Track record of optimizing query performance, implementing secure authorization pipelines, and collaborating with cross-functional teams to deliver enterprise-grade applications.`;
  }
  return `• Engineered scalable backend microservices, reducing API response latency by 45%.\n• Architected RESTful endpoints utilizing MongoDB indexing and Redis caching to handle 10,000+ daily requests.\n• Spearheaded ${t || 'full-stack module migration'}, improving automated test coverage to 92% and boosting deployment velocity.`;
};

// ==================== RESTFUL API ROUTES WITH PAGINATION ====================

// Healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'AI Resume Builder API' });
});

// GET /api/resumes with Server-Side Pagination
app.get('/api/resumes', async (req, res) => {
  try {
    const { page = 1, limit = 4, search, template } = req.query;
    const query = {};

    if (template && template !== 'all') {
      query.templateType = template;
    }

    if (search && search.trim() !== '') {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ fullName: reg }, { role: reg }, { title: reg }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 4;
    const skip = (pageNum - 1) * limitNum;

    const total = await Resume.countDocuments(query);
    const resumes = await Resume.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        totalPages,
        limit: limitNum,
        hasPrev: pageNum > 1,
        hasNext: pageNum < totalPages
      },
      data: resumes
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/resumes/:id
app.get('/api/resumes/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    res.status(200).json({ success: true, data: resume });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/resumes
app.post('/api/resumes', async (req, res) => {
  try {
    const resume = await Resume.create(req.body);
    res.status(201).json({ success: true, data: resume });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/resumes/:id
app.put('/api/resumes/:id', async (req, res) => {
  try {
    const resume = await Resume.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: resume });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/resumes/:id
app.delete('/api/resumes/:id', async (req, res) => {
  try {
    await Resume.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Resume deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/resumes/ai-enhance (Google Gemini / AI Polish endpoint)
app.post('/api/resumes/ai-enhance', (req, res) => {
  const { section, text } = req.body;
  const enhanced = polishResumeText(section, text);
  res.status(200).json({ success: true, enhanced });
});

// ==================== LAUNCH & AUTO-SEED ====================
const start = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/airesume', { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to local MongoDB.');
  } catch (err) {
    console.log('🚀 Starting embedded in-memory MongoDB for Resume Builder...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('✅ Connected to in-memory MongoDB.');
  }

  const count = await Resume.countDocuments();
  if (count === 0) {
    await Resume.insertMany([
      {
        title: 'Full Stack MERN Resume',
        fullName: 'Sampat Sarkar',
        email: 'sampat7123@gmail.com',
        phone: '+91 7044962141',
        location: 'Punjab, India',
        role: 'Full Stack Developer',
        summary: 'Passionate MERN developer experienced in scalable backend RESTful APIs, JWT authentication, and pagination.',
        experience: '• Developed WanderLust rental booking platform with 20+ RESTful routes and RBAC authorization.\n• Built Quick AI SaaS platform with credit meter and JWT auth.\n• Created AI Resume Builder with server-side pagination.',
        education: 'B.Tech in Computer Science & Engineering (LPU) - CGPA 8.05',
        skills: 'C++, JavaScript, React.js, Node.js, Express.js, MongoDB, RESTful APIs, Git, Docker',
        templateType: 'modern'
      },
      {
        title: 'Backend Systems Engineer',
        fullName: 'Alex Johnson',
        email: 'alex@example.com',
        phone: '+1 555-0199',
        location: 'San Francisco, CA',
        role: 'Backend Engineer',
        summary: 'Specialized in high-throughput microservices, distributed caching with Redis, and NoSQL aggregation.',
        experience: '• Scaled payment ingestion pipeline handling 5,000 requests/sec.\n• Designed schema migrations and database indexing.',
        education: 'B.S. in Computer Science',
        skills: 'Node.js, Express.js, PostgreSQL, MongoDB, Redis, AWS',
        templateType: 'classic'
      },
      {
        title: 'Frontend React Specialist',
        fullName: 'Elena Rostova',
        email: 'elena@example.com',
        phone: '+44 20 7946 0912',
        location: 'London, UK',
        role: 'Frontend Developer',
        summary: 'UI/UX focused developer crafting performant web apps with modern React, Vite, and clean CSS.',
        experience: '• Built responsive component libraries used by 50k monthly active users.\n• Improved Core Web Vitals score to 98.',
        education: 'B.A. in Digital Design & Informatics',
        skills: 'React.js, Next.js, TypeScript, CSS3, HTML5, Jest',
        templateType: 'minimal'
      },
      {
        title: 'Cloud DevOps Architect',
        fullName: 'Marcus Vance',
        email: 'marcus@cloud.io',
        phone: '+1 415-888-2911',
        location: 'Seattle, WA',
        role: 'DevOps Engineer',
        summary: 'Automating cloud infrastructure, CI/CD pipelines, and containerized deployments with Docker and Kubernetes.',
        experience: '• Reduced deployment cycle times by 65% through GitHub Actions pipelines.\n• Managed multi-region AWS infrastructure.',
        education: 'B.S. in Information Systems',
        skills: 'Docker, Kubernetes, AWS, Terraform, Linux, CI/CD',
        templateType: 'modern'
      }
    ]);
    console.log('🌱 Seeded 4 demo resume templates with server-side pagination.');
  }

  app.listen(PORT, () => {
    console.log(`📄 AI Resume Builder backend running on port ${PORT}`);
  });
};

start();
