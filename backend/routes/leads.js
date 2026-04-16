const express = require('express');
const Lead = require('../models/Lead');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all leads
router.get('/', authenticateToken, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leads' });
  }
});

// Create a lead
router.post('/', authenticateToken, async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Error creating lead', error: error.message });
  }
});

// Update lead status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, updatedAt: Date.now() },
      { new: true }
    );
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status' });
  }
});

// Add note to lead
router.post('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    lead.notes.push({ 
      text: req.body.text, 
      createdBy: req.user.username 
    });
    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Error adding note' });
  }
});

// Delete lead
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lead' });
  }
});

module.exports = router;