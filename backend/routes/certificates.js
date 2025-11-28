import express from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Certificate from '../models/Certificate.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Contestant from '../models/Contestant.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Generate Certificate
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    // Get project with owner info
    const project = await Project.findById(projectId).populate('owner', 'name');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify user is the owner
    if (project.owner._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only project owner can generate certificate' });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({ project: projectId });

    if (certificate) {
      return res.json({
        certificateUrl: certificate.certificateUrl,
        certificateId: certificate.certificateId,
        message: 'Certificate already exists'
      });
    }

    // Generate unique certificate ID
    const certificateId = `NIAT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const fileName = `${certificateId}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Certificate Design
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Border
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
       .lineWidth(3)
       .stroke('#2563eb');

    doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
       .lineWidth(1)
       .stroke('#2563eb');

    // Header
    doc.fontSize(40)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('CERTIFICATE', 0, 80, { align: 'center' });

    doc.fontSize(20)
       .font('Helvetica')
       .fillColor('#64748b')
       .text('OF ACHIEVEMENT', 0, 130, { align: 'center' });

    // Institute Name
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#0f172a')
       .text('NIAT Institute', 0, 180, { align: 'center' });

    // Divider
    doc.moveTo(200, 220)
       .lineTo(pageWidth - 200, 220)
       .stroke('#cbd5e1');

    // Body Text
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#475569')
       .text('This is to certify that', 0, 250, { align: 'center' });

    // Student Name
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor('#0f172a')
       .text(project.owner.name, 0, 290, { align: 'center' });

    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#475569')
       .text('has successfully completed the project', 0, 340, { align: 'center' });

    // Project Title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#2563eb')
       .text(project.title, 0, 380, { align: 'center', width: pageWidth });

    // Tech Stack
    if (project.techStack && project.techStack.length > 0) {
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#64748b')
         .text(`Technologies: ${project.techStack.join(', ')}`, 0, 430, { 
           align: 'center',
           width: pageWidth 
         });
    }

    // Date
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#475569')
       .text(`Date: ${date}`, 0, 480, { align: 'center' });

    // Certificate ID
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#94a3b8')
       .text(`Certificate ID: ${certificateId}`, 0, pageHeight - 80, { align: 'center' });

    // Footer
    doc.fontSize(10)
       .font('Helvetica-Oblique')
       .fillColor('#cbd5e1')
       .text('ProConnect - NIAT Institute', 0, pageHeight - 50, { align: 'center' });

    doc.end();

    // Wait for PDF to be written
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Save certificate to database
    certificate = new Certificate({
      user: req.user.userId,
      project: projectId,
      certificateUrl: `/uploads/certificates/${fileName}`,
      certificateId
    });

    await certificate.save();

    res.status(201).json({
      certificateUrl: certificate.certificateUrl,
      certificateId: certificate.certificateId,
      message: 'Certificate generated successfully'
    });

  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's certificates
router.get('/my-certificates', authenticateToken, async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user.userId })
      .populate('project', 'title imageUrl createdAt')
      .sort({ createdAt: -1 });

    const formattedCertificates = certificates.map(cert => ({
      id: cert._id,
      certificateId: cert.certificateId,
      certificateUrl: cert.certificateUrl,
      projectTitle: cert.project.title,
      projectImage: cert.project.imageUrl,
      createdAt: cert.createdAt
    }));

    res.json(formattedCertificates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download certificate
router.get('/:certificateId/download', authenticateToken, async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ 
      certificateId: req.params.certificateId 
    });

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const filePath = path.join(__dirname, '..', certificate.certificateUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Certificate file not found' });
    }

    res.download(filePath, `${certificate.certificateId}.pdf`);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if certificate exists for project
router.get('/check/:projectId', authenticateToken, async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ 
      project: req.params.projectId 
    });

    res.json({ 
      exists: !!certificate,
      certificateId: certificate?.certificateId,
      certificateUrl: certificate?.certificateUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate Contest Certificate (Winner or Participant - Unified Design)
router.post('/generate-contest', authenticateToken, async (req, res) => {
  try {
    const { projectId, certificateType, weekNumber, year } = req.body;

    if (!projectId || !certificateType) {
      return res.status(400).json({ message: 'Project ID and certificate type are required' });
    }

    // Get project with owner info
    const project = await Project.findById(projectId).populate('owner', 'name');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify user is the owner
    if (project.owner._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only project owner can generate certificate' });
    }

    // Generate unique certificate ID
    const certType = certificateType === 'winner' ? 'WINNER' : 'PARTICIPANT';
    const certificateId = `NIAT-POTW-${certType}-W${weekNumber}-${year}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const fileName = `${certificateId}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 40, bottom: 40, left: 40, right: 40 }
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const isWinner = certificateType === 'winner';

    // === UNIFIED CERTIFICATE DESIGN ===
    
    // Outer border (grander for winner)
    if (isWinner) {
      // Triple border for winner - more prestigious
      doc.rect(25, 25, pageWidth - 50, pageHeight - 50)
         .lineWidth(4)
         .stroke('#d97706'); // Amber
      
      doc.rect(32, 32, pageWidth - 64, pageHeight - 64)
         .lineWidth(2)
         .stroke('#fbbf24'); // Yellow
      
      doc.rect(38, 38, pageWidth - 76, pageHeight - 76)
         .lineWidth(1)
         .stroke('#fcd34d'); // Light yellow
    } else {
      // Clean double border for participant
      doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
         .lineWidth(2)
         .stroke('#3b82f6'); // Blue
      
      doc.rect(36, 36, pageWidth - 72, pageHeight - 72)
         .lineWidth(1)
         .stroke('#60a5fa'); // Light blue
    }

    // Background decorative elements for winner
    if (isWinner) {
      // Corner decorations
      const cornerSize = 40;
      doc.save();
      doc.fillColor('#fef3c7').opacity(0.3);
      // Top-left corner
      doc.polygon([50, 50], [50 + cornerSize, 50], [50, 50 + cornerSize]).fill();
      // Top-right corner
      doc.polygon([pageWidth - 50, 50], [pageWidth - 50 - cornerSize, 50], [pageWidth - 50, 50 + cornerSize]).fill();
      // Bottom-left corner
      doc.polygon([50, pageHeight - 50], [50 + cornerSize, pageHeight - 50], [50, pageHeight - 50 - cornerSize]).fill();
      // Bottom-right corner
      doc.polygon([pageWidth - 50, pageHeight - 50], [pageWidth - 50 - cornerSize, pageHeight - 50], [pageWidth - 50, pageHeight - 50 - cornerSize]).fill();
      doc.restore();
    }

    // Header section
    const headerY = isWinner ? 60 : 70;
    
    // Main title
    doc.fontSize(isWinner ? 48 : 40)
       .font('Helvetica-Bold')
       .fillColor(isWinner ? '#92400e' : '#1e40af')
       .text('PROJECT OF THE WEEK', 0, headerY, { align: 'center' });

    // Achievement type
    const achievementY = headerY + (isWinner ? 60 : 50);
    if (isWinner) {
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('#b45309')
         .text('CERTIFICATE', 0, achievementY, { align: 'center' });
      
      doc.fontSize(32)
         .font('Helvetica-Bold')
         .fillColor('#d97706')
         .text('WINNER', 0, achievementY + 35, { align: 'center' });
    } else {
      doc.fontSize(22)
         .font('Helvetica-Bold')
         .fillColor('#64748b')
         .text('CERTIFICATE', 0, achievementY, { align: 'center' });
      
      doc.fontSize(18)
         .font('Helvetica')
         .fillColor('#475569')
         .text('Certificate of Participation', 0, achievementY + 30, { align: 'center' });
    }

    // Institute name and week
    const instituteY = isWinner ? 180 : 165;
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#0f172a')
       .text('NIAT Institute', 0, instituteY, { align: 'center' });
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#64748b')
       .text(`Week ${weekNumber} • ${year}`, 0, instituteY + 20, { align: 'center' });

    // Decorative line
    const lineY = instituteY + 45;
    doc.moveTo(150, lineY)
       .lineTo(pageWidth - 150, lineY)
       .lineWidth(isWinner ? 2 : 1)
       .stroke(isWinner ? '#fbbf24' : '#cbd5e1');

    // Body text
    const bodyY = lineY + 25;
    doc.fontSize(13)
       .font('Helvetica')
       .fillColor('#475569')
       .text('This is to certify that', 0, bodyY, { align: 'center' });

    // Student name (prominent)
    doc.fontSize(isWinner ? 32 : 28)
       .font('Helvetica-Bold')
       .fillColor('#0f172a')
       .text(project.owner.name, 0, bodyY + 30, { align: 'center' });

    // Achievement description
    const descY = bodyY + 70;
    const achievementDesc = isWinner
      ? 'has been awarded the prestigious Project of the Week honor for the exceptional project'
      : 'has successfully participated in the Project of the Week contest with the project';
    
    doc.fontSize(13)
       .font('Helvetica')
       .fillColor('#475569')
       .text(achievementDesc, 60, descY, { align: 'center', width: pageWidth - 120 });

    // Project title (highlighted)
    doc.fontSize(isWinner ? 26 : 22)
       .font('Helvetica-Bold')
       .fillColor(isWinner ? '#b45309' : '#2563eb')
       .text(`"${project.title}"`, 60, descY + 40, { align: 'center', width: pageWidth - 120 });

    // Tech stack
    if (project.techStack && project.techStack.length > 0) {
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#64748b')
         .text(`Technologies: ${project.techStack.slice(0, 6).join(' • ')}`, 60, descY + 80, { 
           align: 'center',
           width: pageWidth - 120 
         });
    }

    // Winner-specific recognition
    if (isWinner) {
      doc.fontSize(11)
         .font('Helvetica-Oblique')
         .fillColor('#92400e')
         .text('Selected through AI-powered evaluation for outstanding innovation, quality, and community impact', 
           60, descY + 110, { align: 'center', width: pageWidth - 120 });
    }

    // Date and signature area
    const footerY = pageHeight - 100;
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#475569')
       .text(`Issued on: ${date}`, 0, footerY, { align: 'center' });

    // Certificate ID
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#94a3b8')
       .text(`Certificate ID: ${certificateId}`, 0, pageHeight - 60, { align: 'center' });

    // Footer
    doc.fontSize(9)
       .font('Helvetica-Oblique')
       .fillColor('#cbd5e1')
       .text('ProConnect • NIAT Institute • Project of the Week Contest', 0, pageHeight - 40, { align: 'center' });

    doc.end();

    // Wait for PDF to be written
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Save certificate to database
    const certificate = new Certificate({
      user: req.user.userId,
      project: projectId,
      certificateUrl: `/uploads/certificates/${fileName}`,
      certificateId
    });

    await certificate.save();

    res.status(201).json({
      certificateUrl: certificate.certificateUrl,
      certificateId: certificate.certificateId,
      certificateType,
      message: `${certificateType === 'winner' ? 'Winner' : 'Participant'} certificate generated successfully`
    });

  } catch (error) {
    console.error('Contest certificate generation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
