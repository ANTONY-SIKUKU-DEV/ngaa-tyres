require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const nodemailer = require('nodemailer');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
  })
);
app.use(express.json());

// ==========================================
// Email Notification Setup (Nodemailer)
// ==========================================

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'antonysikuku02@gmail.com';
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const mailTransporter =
  GMAIL_USER && GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD,
        },
      })
    : null;

async function sendLeadNotification(subject, textBody) {
  if (!mailTransporter) {
    console.warn('Email notification skipped: GMAIL_USER or GMAIL_APP_PASSWORD missing in .env');
    return;
  }

  try {
    await mailTransporter.sendMail({
      from: `"Ng'aa Tyres Alerts" <${GMAIL_USER}>`,
      to: NOTIFY_EMAIL,
      subject,
      text: textBody,
    });
    console.log(`Notification email sent to ${NOTIFY_EMAIL}`);
  } catch (err) {
    console.error('Failed to send notification email:', err.message);
  }
}

// ==========================================
// Mongoose Schemas & Models
// ==========================================

const callbackSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    tyre: {
      id: Number,
      brand: { type: String, trim: true },
      model: { type: String, trim: true },
      size: { type: String, trim: true },
      price: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Customer',
    },
    phone: {
      type: String,
      required: [true, 'Phone or contact detail is required'],
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
      default: 'General Inquiry',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    source: {
      type: String,
      enum: ['services', 'about', 'contact', 'website'],
      default: 'website',
    },
    status: {
      type: String,
      enum: ['new', 'replied', 'resolved'],
      default: 'new',
    },
  },
  { timestamps: true }
);

const Callback = mongoose.model('Callback', callbackSchema);
const Inquiry = mongoose.model('Inquiry', inquirySchema);

// ==========================================
// Routes
// ==========================================

// Health & database status check
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'ok' : 'degraded',
    dbConnected: isDbConnected,
    service: "Ng'aa Tyres API",
  });
});

// Create a callback lead from the tyre modal
app.post('/api/callbacks', async (req, res) => {
  try {
    const { phone, tyre } = req.body;

    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Please provide a valid phone number.' });
    }

    const created = await Callback.create({
      phone: phone.trim(),
      tyre: tyre && typeof tyre === 'object' ? tyre : {},
    });

    const tyreLabel =
      created.tyre && (created.tyre.brand || created.tyre.model || created.tyre.size)
        ? `${created.tyre.brand || ''} ${created.tyre.model || ''} (${created.tyre.size || 'N/A'})`.trim()
        : 'General Callback';

    sendLeadNotification(
      `New Callback Request: ${created.phone}`,
      `A customer requested a callback on Ng'aa Tyres.\n\nPhone: ${created.phone}\nTyre: ${tyreLabel}\nStatus: ${created.status}\nReceived: ${created.createdAt}`
    );

    return res.status(201).json({
      message: 'Callback request received. We will call you shortly.',
      data: created,
    });
  } catch (err) {
    console.error('Error creating callback:', err.message);
    return res.status(500).json({ error: 'Failed to save callback request.' });
  }
});

// View saved callbacks
app.get('/api/callbacks', async (req, res) => {
  try {
    const callbacks = await Callback.find().sort({ createdAt: -1 }).limit(50);
    return res.json({ count: callbacks.length, data: callbacks });
  } catch (err) {
    console.error('Error fetching callbacks:', err.message);
    return res.status(500).json({ error: 'Failed to fetch callback requests.' });
  }
});

// Create a general service or contact inquiry
app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, phone, topic, message, source } = req.body;

    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const created = await Inquiry.create({
      name: name && name.trim() ? name.trim() : 'Customer',
      phone: phone.trim(),
      topic: topic && topic.trim() ? topic.trim() : 'General Inquiry',
      message: message.trim(),
      source: ['services', 'about', 'contact', 'website'].includes(source)
        ? source
        : 'website',
    });

    sendLeadNotification(
      `New Inquiry (${created.topic}): ${created.phone}`,
      `A new inquiry was submitted on Ng'aa Tyres.\n\nName: ${created.name}\nPhone: ${created.phone}\nTopic: ${created.topic}\nSource: ${created.source}\nMessage: ${created.message}\nReceived: ${created.createdAt}`
    );

    return res.status(201).json({
      message: 'Inquiry sent successfully.',
      data: created,
    });
  } catch (err) {
    console.error('Error creating inquiry:', err.message);
    return res.status(500).json({ error: 'Failed to submit inquiry.' });
  }
});

// View saved inquiries
app.get('/api/inquiries', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(50);
    return res.json({ count: inquiries.length, data: inquiries });
  } catch (err) {
    console.error('Error fetching inquiries:', err.message);
    return res.status(500).json({ error: 'Failed to fetch inquiries.' });
  }
});

// 404 fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ==========================================
// Start Server After DB Connection
// ==========================================

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Ng'aa Tyres backend listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });