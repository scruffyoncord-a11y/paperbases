import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { extractTextFromPdf } from './server/pdf_service.js';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

const upload = multer({ storage: multer.memoryStorage() });
const jobs = new Map();

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

// In a real app, use the same CLIENT_ID exactly here as in the frontend.
// Since you provided it:
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '61443326668-rd9i38u50mjj3k0cqujv7irkcm89l0qr.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize DeepSeek Client
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-empty',
  baseURL: 'https://api.deepseek.com'
});

// AI Content Moderation Helper (DISABLED BY USER REQUEST)
async function moderateContent(text) {
  // Always allow for maximum speed and zero filtering
  return { safe: true, reason: "SAFE" };
}

// Unified Syllabus Dataset
const UNIFIED_SYLLABUS = {
  "Maths": [
    "Sets, Relations and Functions", "Complex Numbers and Quadratic Equations", "Matrices and Determinants", 
    "Permutations and Combinations", "Binomial Theorem", "Sequence and Series", 
    "Limit, Continuity and Differentiability", "Integral Calculus", "Differential Equations", 
    "Coordinate Geometry", "Three Dimensional Geometry", "Vector Algebra", 
    "Statistics and Probability", "Trigonometry", "Mathematical Reasoning"
  ],
  "Physics": [
    "Units and Measurements", "Kinematics", "Laws of Motion", "Work, Energy and Power", 
    "Rotational Motion", "Gravitation", "Properties of Solids and Liquids", "Thermodynamics", 
    "Kinetic Theory of Gases", "Oscillations and Waves", "Electrostatics", "Current Electricity", 
    "Magnetism", "Electromagnetic Induction and AC", "Electromagnetic Waves", "Optics", 
    "Dual Nature of Matter and Radiation", "Atoms and Nuclei", "Electronic Devices", "Experimental Skills"
  ],
  "Chemistry": [
    "Some Basic Concepts of Chemistry", "Atomic Structure", "Chemical Bonding and Molecular Structure", 
    "Chemical Thermodynamics", "Solutions", "Equilibrium", "Redox Reactions and Electrochemistry", 
    "Chemical Kinetics", "Classification of Elements and Periodicity", "p-Block Elements", 
    "d- and f-Block Elements", "Coordination Compounds", "Purification and Characterisation of Organic Compounds", 
    "Some Basic Principles of Organic Chemistry", "Hydrocarbons", "Organic Compounds Containing Halogens", 
    "Organic Compounds Containing Oxygen", "Organic Compounds Containing Nitrogen", "Biomolecules", 
    "Principles Related to Practical Chemistry"
  ],
  "Biology": [
    "Diversity in Living World", "Structural Organisation in Animals and Plants", "Cell Structure and Function", 
    "Plant Physiology", "Reproduction", "Genetics and Evolution", "Ecology and Environment", 
    "Human Physiology", "Biology and Human Welfare", "Biotechnology and Its Applications", "Experimental Skills"
  ]
};

// Helper function to initialize syllabus - obsolete in simplified model
async function initializeSyllabus(userId) {
  // No longer needed
}

// Helper: check if a user exists in the DB
async function validateUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: parseInt(userId, 10) } });
  return user;
}

// API Endpoints

// Google Login Endpoint
app.post('/api/auth/google', async (req, res) => {
  const { user: userInfo } = req.body;
  if (!userInfo || !userInfo.email) {
    return res.status(400).json({ success: false, message: 'Missing user info' });
  }
  
  try {
    const { email, name, picture } = userInfo;

    // Create or find user in DB
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          picture,
        },
      });
      await initializeSyllabus(user.id);
    } else {
        // Update name/picture if they changed
        user = await prisma.user.update({
            where: { email },
            data: { name, picture },
        });
        // Ensure syllabus exists (for old users migrating)
        await initializeSyllabus(user.id);
    }

    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, picture: user.picture, points: user.points, policiesAccepted: user.policiesAccepted } });
  } catch (error) {
    console.error('Error handling Google login:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Email/Password Signup Endpoint
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Missing email or password' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    await initializeSyllabus(user.id);

    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, picture: user.picture, points: user.points, policiesAccepted: user.policiesAccepted } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Email/Password Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Missing email or password' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Please login using Google' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, picture: user.picture, points: user.points, policiesAccepted: user.policiesAccepted } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get User Syllabus (Static Version)
app.get('/api/syllabus/:userId', async (req, res) => {
  res.json({ success: true, subjects: UNIFIED_SYLLABUS });
});

// Validate user session
app.get('/api/auth/validate/:userId', async (req, res) => {
  try {
    const user = await validateUser(req.params.userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, picture: user.picture, points: user.points, policiesAccepted: user.policiesAccepted } });
  } catch (error) {
    console.error('Error validating user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark legal policies as accepted
app.post('/api/user/accept-policies', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: { policiesAccepted: true }
    });
    res.json({ success: true, policiesAccepted: user.policiesAccepted });
  } catch (error) {
    console.error('Error accepting policies:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get User Progress
app.get('/api/progress/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Check user exists first
    const user = await validateUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const progressRecords = await prisma.progress.findMany({
      where: { userId: parseInt(userId, 10) },
    });
    
    // Format into simpler structure: { subject: { chapterIndex: status } }
    const formattedProgress = {};
    progressRecords.forEach((record) => {
      const { subject, chapterIndex, status } = record;
      if (!formattedProgress[subject]) {
        formattedProgress[subject] = {};
      }
      formattedProgress[subject][chapterIndex] = status;
    });

    res.json({ success: true, progress: formattedProgress });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update Progress
app.post('/api/progress', async (req, res) => {
  const { userId, subject, chapterIndex, status } = req.body;
  console.log(`Update progress received: userId=${userId}, subject=${subject}, chapterIndex=${chapterIndex}, status=${status}`);
  
  if (!userId || !subject || chapterIndex === undefined) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const userIdInt = parseInt(userId, 10);
    const chapterIndexInt = parseInt(chapterIndex, 10);

    // Verify user exists before writing
    const user = await validateUser(userIdInt);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Upsert progress using simplified codes
    const progress = await prisma.progress.upsert({
      where: {
        userId_subject_chapterIndex: {
          userId: userIdInt,
          subject,
          chapterIndex: chapterIndexInt,
        },
      },
      update: { status: parseInt(status, 10) || 0 },
      create: {
        userId: userIdInt,
        subject,
        chapterIndex: chapterIndexInt,
        status: parseInt(status, 10) || 0,
      },
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- Doubt Forum API ---

// Get all doubts
app.get('/api/doubts', async (req, res) => {
  try {
    const doubts = await prisma.doubt.findMany({
      select: {
        id: true,
        userId: true,
        subject: true,
        title: true,
        content: true,
        imageUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, picture: true } },
        _count: { select: { replies: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, doubts });
  } catch (error) {
    console.error('Error fetching doubts:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single doubt with replies
app.get('/api/doubts/:id', async (req, res) => {
  try {
    const doubtId = parseInt(req.params.id, 10);
    const doubt = await prisma.doubt.findUnique({
      where: { id: doubtId },
      include: {
        user: { select: { id: true, name: true, picture: true } },
        replies: {
          include: { user: { select: { id: true, name: true, picture: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }
    
    res.json({ success: true, doubt });
  } catch (error) {
    console.error('Error fetching doubt details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new doubt
app.post('/api/doubts', async (req, res) => {
  const { userId, subject, title, content, imageUrl } = req.body;
  if (!userId || !subject || !title || !content) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  try {
    // Verify user exists before writing
    const user = await validateUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const doubt = await prisma.doubt.create({
      data: {
        userId: parseInt(userId, 10),
        subject,
        title,
        content,
        imageUrl: imageUrl || null
      },
      include: {
        user: { select: { id: true, name: true, picture: true } },
        _count: { select: { replies: true } }
      }
    });
    res.json({ success: true, doubt });
  } catch (error) {
    console.error('Error creating doubt:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a doubt
app.delete('/api/doubts/:id', async (req, res) => {
  const doubtId = parseInt(req.params.id, 10);
  const { userId } = req.body;
  
  try {
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
    if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });
    if (doubt.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ success: false, message: 'Unauthorized deletion' });
    }
    
    await prisma.doubt.delete({ where: { id: doubtId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting doubt:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Post a reply
app.post('/api/doubts/:id/reply', async (req, res) => {
  const doubtId = parseInt(req.params.id, 10);
  const { userId, content } = req.body;
  
  if (!userId || !content) {
    return res.status(400).json({ success: false, message: 'Missing user or content' });
  }
  
  try {
    const reply = await prisma.reply.create({
      data: {
        doubtId,
        userId: parseInt(userId, 10),
        content
      },
      include: {
        user: { select: { id: true, name: true, picture: true } }
      }
    });
    res.json({ success: true, reply });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a reply
app.delete('/api/replies/:id', async (req, res) => {
  const replyId = parseInt(req.params.id, 10);
  const { userId } = req.body;
  
  try {
    const reply = await prisma.reply.findUnique({ where: { id: replyId } });
    if (!reply) return res.status(404).json({ success: false, message: 'Reply not found' });
    if (reply.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ success: false, message: 'Unauthorized deletion' });
    }
    
    await prisma.reply.delete({ where: { id: replyId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- Resource Sharing API ---

// Get all resources
app.get('/api/resources', async (req, res) => {
  const { subject } = req.query;
  try {
    const where = subject && subject !== 'All' ? { subject } : {};
    const resources = await prisma.resource.findMany({
      where,
      select: {
          id: true, title: true, description: true, subject: true, tag: true, fileType: true, fileUrl: true, userId: true, createdAt: true,
          user: { select: { id: true, name: true, picture: true } },
          _count: { select: { likes: true, dislikes: true } },
          likes: { select: { userId: true } },
          dislikes: { select: { userId: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single resource (Full data with fileUrl)
app.get('/api/resources/:id', async (req, res) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: {
        user: { select: { id: true, name: true, picture: true } },
        _count: { select: { likes: true, dislikes: true, reports: true } },
        likes: { select: { userId: true } },
        dislikes: { select: { userId: true } }
      }
    });
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, resource });
  } catch (error) {
    console.error('Error fetching resource details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new resource
app.post('/api/resources', async (req, res) => {
  const { userId, title, description, subject, fileUrl, fileType, tag } = req.body;
  if (!userId || !title || !subject || !fileUrl) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  try {
    // Verify user exists before writing
    const user = await validateUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let textContent = null;
    if (fileType === 'pdf') {
       try {
          textContent = await extractTextFromPdf(fileUrl, { maxPages: 20 });
          // AI Verification Step
          const moderation = await moderateContent(textContent);
          if (!moderation.safe) {
             console.warn(`Blocked potentially unsafe resource: ${title}. Reason: ${moderation.reason}`);
             return res.status(400).json({ 
                success: false, 
                message: 'Your document was flagged by our security filters.', 
                reason: moderation.reason 
             });
          }
       } catch (err) {
          console.error("PDF text extraction failed during moderation:", err);
       }
    }

    const resource = await prisma.resource.create({
      data: {
        userId: parseInt(userId, 10),
        title,
        description,
        subject,
        tag,
        fileUrl,
        fileType: fileType || 'pdf',
        textContent: textContent // Save text for PaperAI too
      },
      include: {
        user: { select: { id: true, name: true, picture: true } },
        _count: { select: { likes: true, dislikes: true } },
        likes: { select: { userId: true } },
        dislikes: { select: { userId: true } }
      }
    });
    res.json({ success: true, resource });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle a like on a resource
app.post('/api/resources/:id/like', async (req, res) => {
  const resourceId = parseInt(req.params.id, 10);
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });

  try {
    const existingLike = await prisma.resourceLike.findUnique({
      where: {
        resourceId_userId: { resourceId, userId: parseInt(userId, 10) }
      }
    });

    const resourceInfo = await prisma.resource.findUnique({ where: { id: resourceId } });

    if (existingLike) {
      await prisma.resourceLike.delete({ where: { id: existingLike.id } });
      if (resourceInfo && resourceInfo.userId !== parseInt(userId, 10)) {
        // Decrement uploader's points (if they exist and it's not self-like)
        await prisma.user.update({
          where: { id: resourceInfo.userId },
          data: { points: { decrement: 1 } }
        });
      }
    } else {
      // If user disliked it, remove dislike first
      await prisma.resourceDislike.deleteMany({
        where: { resourceId, userId: parseInt(userId, 10) }
      });
      await prisma.resourceLike.create({
        data: { resourceId, userId: parseInt(userId, 10) }
      });
      if (resourceInfo && resourceInfo.userId !== parseInt(userId, 10)) {
        // Increment uploader's points
        await prisma.user.update({
          where: { id: resourceInfo.userId },
          data: { points: { increment: 1 } }
        });
      }
    }

    const updatedResource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        user: { select: { id: true, name: true, picture: true } },
        _count: { select: { likes: true, dislikes: true } },
        likes: { select: { userId: true } },
        dislikes: { select: { userId: true } }
      }
    });

    res.json({ success: true, resource: updatedResource });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle a dislike on a resource
app.post('/api/resources/:id/dislike', async (req, res) => {
  const resourceId = parseInt(req.params.id, 10);
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });

  try {
    const existingDislike = await prisma.resourceDislike.findUnique({
      where: {
        resourceId_userId: { resourceId, userId: parseInt(userId, 10) }
      }
    });

    if (existingDislike) {
      await prisma.resourceDislike.delete({ where: { id: existingDislike.id } });
    } else {
      // If user liked it, remove like first
      await prisma.resourceLike.deleteMany({
        where: { resourceId, userId: parseInt(userId, 10) }
      });
      await prisma.resourceDislike.create({
        data: { resourceId, userId: parseInt(userId, 10) }
      });
    }

    const updatedResource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        user: { select: { id: true, name: true, picture: true } },
        _count: { select: { likes: true, dislikes: true } },
        likes: { select: { userId: true } },
        dislikes: { select: { userId: true } }
      }
    });

    res.json({ success: true, resource: updatedResource });
  } catch (error) {
    console.error('Error toggling dislike:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Report a resource
app.post('/api/resources/:id/report', async (req, res) => {
  const resourceId = parseInt(req.params.id, 10);
  const { userId, reason, details } = req.body;

  if (!userId || !reason) return res.status(400).json({ success: false, message: 'Missing userId or reason' });

  try {
    const report = await prisma.resourceReport.create({
      data: {
        resourceId,
        userId: parseInt(userId, 10),
        reason,
        details
      }
    });
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error reporting resource:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a resource
app.put('/api/resources/:id', async (req, res) => {
  const resourceId = parseInt(req.params.id, 10);
  const { userId, title, description, subject, tag } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });

  try {
    const existing = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Resource not found' });
    if (existing.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ success: false, message: 'Unauthorized update' });
    }

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: { 
        title: title || existing.title,
        description: description || existing.description,
        subject: subject || existing.subject,
        tag: tag || existing.tag
      },
      include: {
        user: { select: { id: true, name: true, picture: true } },
        _count: { select: { likes: true, dislikes: true } },
        likes: { select: { userId: true } },
        dislikes: { select: { userId: true } }
      }
    });

    res.json({ success: true, resource });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a resource
app.delete('/api/resources/:id', async (req, res) => {
  const resourceId = parseInt(req.params.id, 10);
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });

  try {
    const existing = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Resource not found' });
    if (existing.userId !== parseInt(userId, 10)) {
       return res.status(403).json({ success: false, message: 'Unauthorized deletion' });
    }

    await prisma.resource.delete({ where: { id: resourceId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark doubt as resolved
app.put('/api/doubts/:id/resolve', async (req, res) => {
  const doubtId = parseInt(req.params.id, 10);
  const { userId } = req.body;
  try {
    const existing = await prisma.doubt.findUnique({ where: { id: doubtId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Doubt not found' });
    if (existing.userId !== parseInt(userId, 10)) {
       return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const doubt = await prisma.doubt.update({
      where: { id: doubtId },
      data: { status: 'Resolved' },
      include: {
        user: { select: { id: true, name: true, picture: true } },
        _count: { select: { replies: true } }
      }
    });
    res.json({ success: true, doubt });
  } catch (error) {
    console.error('Error resolving doubt:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// --- Highlighting API ---

// Create a new highlight
app.post('/api/highlights', async (req, res) => {
  const { userId, resourceId, text, pageIndex, color, position, content } = req.body;
  if (!userId || !resourceId || (!text && !position)) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const highlight = await prisma.highlight.create({
      data: {
        userId: parseInt(userId, 10),
        resourceId: parseInt(resourceId, 10),
        text,
        pageIndex: parseInt(pageIndex, 10) || 0,
        color: color || 'yellow',
        position: position ? (typeof position === 'string' ? position : JSON.stringify(position)) : undefined,
        content: content ? (typeof content === 'string' ? content : JSON.stringify(content)) : undefined
      },
      include: {
        resource: { select: { title: true } }
      }
    });
    res.json({ success: true, highlight });
  } catch (error) {
    console.error('Error creating highlight:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all highlights for a user
app.get('/api/highlights/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const resourceId = req.query.resourceId ? parseInt(req.query.resourceId, 10) : undefined;

  try {
    const whereClause = { userId };
    if (resourceId) {
      whereClause.resourceId = resourceId;
    }

    const highlights = await prisma.highlight.findMany({
      where: whereClause,
      include: {
        resource: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, highlights });
  } catch (error) {
    console.error('Error fetching highlights:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a highlight
app.delete('/api/highlights/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { userId } = req.body; // Basic auth check

  try {
    const existing = await prisma.highlight.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Highlight not found' });
    
    if (existing.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.highlight.delete({ where: { id } });
    res.json({ success: true, message: 'Highlight deleted' });
  } catch (error) {
    console.error('Error deleting highlight:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- Timetable & Goals API ---

// Get Timetable Data
app.get('/api/timetable/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  try {
    const user = await validateUser(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let tasks = await prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    const schedules = await prisma.scheduleSlot.findMany({ where: { userId }, orderBy: { time: 'asc' } });
    
    // Daily Reset Logic: If a task was marked done on a previous day, reset it to undone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tasksToReset = tasks.filter(t => t.done && new Date(t.updatedAt) < today);
    if (tasksToReset.length > 0) {
      await prisma.task.updateMany({
        where: { 
          id: { in: tasksToReset.map(t => t.id) },
          userId: userId
        },
        data: { done: false }
      });
      // Update the local tasks list to reflect the reset without an extra query
      tasks = tasks.map(t => (t.done && new Date(t.updatedAt) < today) ? { ...t, done: false } : t);
    }
    
    res.json({ 
      success: true, 
      tasks, 
      schedules, 
      stats: { streak: user.streak, focusTime: user.focusTime } 
    });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add Task
app.post('/api/tasks', async (req, res) => {
  const { userId, title, subject, color } = req.body;
  if (!userId || !title || !subject) return res.status(400).json({ success: false, message: 'Missing fields' });
  
  try {
    const user = await validateUser(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const task = await prisma.task.create({
      data: { userId: parseInt(userId, 10), title, subject, color: color || 'text-slate-500' }
    });
    res.json({ success: true, task });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle Task
app.put('/api/tasks/:id/toggle', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const { userId, done } = req.body;
  try {
    const user = await validateUser(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing || existing.userId !== parseInt(userId, 10)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { done }
    });
    res.json({ success: true, task });
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add Schedule
app.post('/api/schedule', async (req, res) => {
  const { userId, day, time, title, type, duration, theme } = req.body;
  if (!userId || !day || !time || !title || !type || !duration || !theme) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }
  
  try {
    const user = await validateUser(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const schedule = await prisma.scheduleSlot.create({
      data: { userId: parseInt(userId, 10), day, time, title, type, duration, theme }
    });
    res.json({ success: true, schedule });
  } catch (error) {
    console.error('Error adding schedule:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- PaperAI Chat API ---

// Helper: get or extract text content for a resource
async function getResourceTextContent(resourceId) {
  const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
  if (!resource) return { resource: null, text: '' };

  // Return cached text if available
  if (resource.textContent) return { resource, text: resource.textContent };

  // Only extract for PDFs
  if (resource.fileType !== 'pdf' || !resource.fileUrl) return { resource, text: '' };

  try {
    const extractedText = await extractTextFromPdf(resource.fileUrl, { maxPages: 10 });
    if (extractedText) {
      // Cache for future requests
      await prisma.resource.update({
        where: { id: resourceId },
        data: { textContent: extractedText },
      });
    }
    return { resource, text: extractedText };
  } catch (err) {
    console.error('Text extraction failed:', err);
    return { resource, text: '' };
  }
}

// POST /api/ai/chat — Send a message to PaperAI
app.post('/api/ai/chat', async (req, res) => {
  const { userId, resourceId, message, chatId } = req.body;

  if (!userId || !resourceId || !message) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const userIdInt = parseInt(userId, 10);
    const resourceIdInt = parseInt(resourceId, 10);

    const user = await validateUser(userIdInt);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Get or create chat
    let chat;
    if (chatId) {
      chat = await prisma.chat.findUnique({ where: { id: parseInt(chatId, 10) } });
    }
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userId: userIdInt,
          resourceId: resourceIdInt,
          title: message.substring(0, 80),
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        chatId: chat.id,
        userId: userIdInt,
        role: 'user',
        content: message,
      },
    });

    // Gather context: highlights + document text
    const highlights = await prisma.highlight.findMany({
      where: { userId: userIdInt, resourceId: resourceIdInt },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const { resource, text: documentText } = await getResourceTextContent(resourceIdInt);

    const highlightsContext = highlights.length > 0
      ? highlights.map((h, i) => `[#${i + 1}, Page ${h.pageIndex + 1}]: "${h.text?.substring(0, 200)}${(h.text?.length || 0) > 200 ? '...' : ''}"`).join('\n')
      : 'No highlights saved yet.';

    const docContext = documentText
      ? `\n\nDocument excerpt (first ~10 pages):\n${documentText.substring(0, 12000)}`
      : '';

    // Build conversation history
    const previousMessages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' },
      take: 40,
    });

    const conversationHistory = previousMessages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const systemPrompt = `You are PaperAI, an AI study assistant inside a PDF viewer. Help students understand their materials.

Context:
- Document: "${resource?.title || 'Unknown'}" (${resource?.subject || 'General'})
- Student's highlights (numbered to match their sidebar):
${highlightsContext}
${docContext}

RULES:
1. NEVER repeat or echo the highlighted text back. The student can already see it. Jump straight to explanation.
2. When the student says "explain highlight #N", look up highlight #N from the list above and explain the concept directly.
3. Be concise and educational. Use bullet points for clarity.
4. Use LaTeX for math: \\(inline\\) and \\[display\\] notation.
5. If quoting a highlight, use only a short phrase, not the full text.
6. Format with markdown: **bold**, *italic*, bullet points, numbered lists.
7. Keep responses focused — aim for 200-400 words unless more detail is requested.`;

    // Check if API key exists
    if (!process.env.DEEPSEEK_API_KEY) {
      // Fallback: echo back a helpful message without AI
      const fallbackReply = `I'm PaperAI! 🤖 I see you asked: "${message}"

I currently don't have an API key configured, so I can't generate AI responses yet. To enable me:

1. Get a DeepSeek API key from [platform.deepseek.com](https://platform.deepseek.com)
2. Add it to your \`.env\` file as \`DEEPSEEK_API_KEY=your_key_here\`
3. Restart the server

**Your highlights are still being tracked!** You have ${highlights.length} highlight(s) saved for this document.`;

      const aiMessage = await prisma.message.create({
        data: {
          chatId: chat.id,
          userId: userIdInt,
          role: 'assistant',
          content: fallbackReply,
        },
      });

      return res.json({
        success: true,
        chatId: chat.id,
        message: aiMessage,
      });
    }

    // Call DeepSeek API
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
      ],
      max_tokens: 2048,
      temperature: 0.7,
    });

    const aiContent = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Save AI response
    const aiMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        userId: userIdInt,
        role: 'assistant',
        content: aiContent,
      },
    });

    res.json({
      success: true,
      chatId: chat.id,
      message: aiMessage,
    });
  } catch (error) {
    console.error('PaperAI chat error:', error);
    res.status(500).json({ success: false, message: 'AI service error: ' + error.message });
  }
});

// GET /api/chats/:userId/:resourceId — Get all chats for a user+resource
app.get('/api/chats/:userId/:resourceId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const resourceId = parseInt(req.params.resourceId, 10);

  try {
    const chats = await prisma.chat.findMany({
      where: { userId, resourceId },
      include: {
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ success: true, chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/chats/:chatId/messages — Get messages for a chat
app.get('/api/chats/:chatId/messages', async (req, res) => {
  const chatId = parseInt(req.params.chatId, 10);

  try {
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/chats/:chatId — Delete a chat and all its messages
app.delete('/api/chats/:chatId', async (req, res) => {
  const chatId = parseInt(req.params.chatId, 10);
  const { userId } = req.body;

  try {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    if (chat.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.chat.delete({ where: { id: chatId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- Exam Management API ---

// Create an exam (centralized storage)
app.post('/api/exams', async (req, res) => {
  const { userId, name, template, data, questionCount, subjects, isPublic } = req.body;
  
  if (!userId || !name || !data) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const exam = await prisma.exam.create({
      data: {
        userId: parseInt(userId, 10),
        name,
        template: template || 'custom',
        data: typeof data === 'string' ? data : JSON.stringify(data),
        questionCount: parseInt(questionCount, 10) || 0,
        subjects: Array.isArray(subjects) ? JSON.stringify(subjects) : subjects,
        isPublic: isPublic === true
      }
    });
    res.json({ success: true, exam });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get personal uploads for a user
app.get('/api/exams/user/:userId', async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      where: { userId: parseInt(req.params.userId, 10) },
      orderBy: { createdAt: 'desc' },
      select: {
          id: true, name: true, template: true, questionCount: true, subjects: true, createdAt: true, isPublic: true, downloads: true
      }
    });
    res.json({ success: true, exams });
  } catch (error) {
    console.error('Error fetching user exams:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Browse/Smart Search Exams
app.get('/api/exams', async (req, res) => {
  const { query, template } = req.query;
  try {
    const where = { isPublic: true };
    if (template && template !== 'All') where.template = template;
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { subjects: { contains: query } }
      ];
    }

    const exams = await prisma.exam.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { name: true } } }
    });
    res.json({ success: true, exams });
  } catch (error) {
    console.error('Error searching exams:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Trending Exams
app.get('/api/exams/trending', async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      where: { isPublic: true },
      orderBy: { downloads: 'desc' },
      take: 5,
      include: { user: { select: { name: true } } }
    });
    res.json({ success: true, exams });
  } catch (error) {
    console.error('Error fetching trending exams:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get full exam data by ID (for loading into portal)
app.get('/api/exams/:id', async (req, res) => {
    try {
        const exam = await prisma.exam.findUnique({
            where: { id: parseInt(req.params.id, 10) }
        });
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
        
        // Return full data
        res.json({ success: true, exam });
    } catch (error) {
        console.error('Error fetching exam data:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete an exam
app.delete('/api/exams/:id', async (req, res) => {
  const { userId } = req.body;
  try {
    const exam = await prisma.exam.findUnique({ where: { id: parseInt(req.params.id, 10) } });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    if (exam.userId !== parseInt(userId, 10)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    await prisma.exam.delete({ where: { id: parseInt(req.params.id, 10) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Increment downloads
app.post('/api/exams/:id/download', async (req, res) => {
    try {
        await prisma.exam.update({
            where: { id: parseInt(req.params.id, 10) },
            data: { downloads: { increment: 1 } }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// PDF Upload & Processing API (Microservice bridge to server.py)
app.post('/api/upload-pdf', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post('http://localhost:5000/api/upload-pdf', formData, {
      headers: formData.getHeaders(),
    });

    res.json({ success: true, jobId: response.data.jobId });
  } catch (error) {
    console.error('OCR service error:', error.message);
    res.status(500).json({ success: false, message: 'OCR Service offline' });
  }
});

app.get('/api/status/:id', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/status/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Microservice error' });
  }
});

// Serve OCR images downloaded by Python script
app.use('/ocr_imgs', express.static(path.join(__dirname, 'ocr_imgs')));

// Production: Serve frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 8080; // Railway uses 8080 by default often, or PORT env
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
