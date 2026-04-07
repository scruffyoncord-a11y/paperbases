import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

    res.json({ success: true, user });
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

    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, picture: user.picture, points: user.points } });
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

    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, picture: user.picture, points: user.points } });
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
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, picture: user.picture, points: user.points } });
  } catch (error) {
    console.error('Error validating user:', error);
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
      include: {
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
      include: {
        user: { select: { id: true, name: true, picture: true } },
        _count: { select: { likes: true } },
        likes: { select: { userId: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
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

    const resource = await prisma.resource.create({
      data: {
        userId: parseInt(userId, 10),
        title,
        description,
        subject,
        tag,
        fileUrl,
        fileType: fileType || 'pdf'
      },
      include: {
        user: { select: { id: true, name: true, picture: true } },
        _count: { select: { likes: true } },
        likes: { select: { userId: true } }
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
        _count: { select: { likes: true } },
        likes: { select: { userId: true } }
      }
    });

    res.json({ success: true, resource: updatedResource });
  } catch (error) {
    console.error('Error toggling like:', error);
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
  const { userId, resourceId, text, pageIndex, color } = req.body;
  if (!userId || !resourceId || !text) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const highlight = await prisma.highlight.create({
      data: {
        userId: parseInt(userId, 10),
        resourceId: parseInt(resourceId, 10),
        text,
        pageIndex: parseInt(pageIndex, 10) || 0,
        color: color || 'yellow'
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

    const tasks = await prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    const schedules = await prisma.scheduleSlot.findMany({ where: { userId }, orderBy: { time: 'asc' } });
    
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
