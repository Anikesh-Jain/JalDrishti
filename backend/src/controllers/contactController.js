const mongoose = require('mongoose');
const { ContactInquiry } = require('../models');
const {
  sendContactInquiryNotification,
  sendCitizenInquiryReply
} = require('../services/emailService');

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const VALID_STATUSES = ['New', 'In Review', 'Awaiting Response', 'Resolved'];

/**
 * Submit a public contact inquiry
 * POST /api/contact
 */
const submitInquiry = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        error: 'Name is required and must be at least 2 characters long'
      });
    }

    if (name.trim().length > 80) {
      return res.status(400).json({
        error: 'Name cannot exceed 80 characters'
      });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        error: 'A valid email address is required'
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({
        error: 'Message is required and must be at least 10 characters long'
      });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({
        error: 'Message cannot exceed 2000 characters'
      });
    }

    const cleanSubject = (subject && typeof subject === 'string')
      ? subject.trim().substring(0, 150)
      : 'General Water Quality Inquiry';

    // Generate unique human-readable reference ID
    const timestampStr = Date.now().toString(36).toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referenceId = `INQ-${timestampStr}-${randomSuffix}`;

    const inquiry = await ContactInquiry.create({
      referenceId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: cleanSubject,
      message: message.trim(),
      status: 'New',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || null
    });

    // Fire-and-forget notification attempt to administrators
    sendContactInquiryNotification({ inquiry }).catch((err) => {
      console.error('[ContactController Notification Warning]:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. Your inquiry has been received by the JalDrishti project team.',
      inquiryId: inquiry._id,
      referenceId: inquiry.referenceId
    });
  } catch (error) {
    console.error('[ContactController Submit Error]:', error.message);
    return res.status(500).json({
      error: 'An unexpected error occurred while saving your inquiry. Please try again.'
    });
  }
};

/**
 * List all submitted inquiries (Admin only)
 * GET /api/contact
 */
const getInquiries = async (req, res) => {
  try {
    const { status, q, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (status && VALID_STATUSES.includes(status)) {
      filter.status = status;
    }

    if (q && typeof q === 'string' && q.trim()) {
      const searchRegex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { referenceId: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex }
      ];
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [inquiries, total, countNew, countReview, countAwaiting, countResolved] = await Promise.all([
      ContactInquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      ContactInquiry.countDocuments(filter),
      ContactInquiry.countDocuments({ status: 'New' }),
      ContactInquiry.countDocuments({ status: 'In Review' }),
      ContactInquiry.countDocuments({ status: 'Awaiting Response' }),
      ContactInquiry.countDocuments({ status: 'Resolved' })
    ]);

    // Backfill any legacy inquiry records missing referenceId
    const formattedInquiries = inquiries.map((inq) => {
      if (!inq.referenceId) {
        inq.referenceId = `INQ-${inq._id.toString().substring(18).toUpperCase()}`;
      }
      return inq;
    });

    return res.status(200).json({
      inquiries: formattedInquiries,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1
      },
      counts: {
        all: countNew + countReview + countAwaiting + countResolved,
        new: countNew,
        inReview: countReview,
        awaitingResponse: countAwaiting,
        resolved: countResolved
      }
    });
  } catch (error) {
    console.error('[ContactController GetInquiries Error]:', error.message);
    return res.status(500).json({
      error: 'Failed to retrieve contact inquiries'
    });
  }
};

/**
 * Get single inquiry details (Admin only)
 * GET /api/contact/:id
 */
const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid inquiry identifier' });
    }

    const inquiry = await ContactInquiry.findById(id).lean();
    if (!inquiry) {
      return res.status(404).json({ error: 'Contact inquiry not found' });
    }

    if (!inquiry.referenceId) {
      inquiry.referenceId = `INQ-${inquiry._id.toString().substring(18).toUpperCase()}`;
    }

    return res.status(200).json({ inquiry });
  } catch (error) {
    console.error('[ContactController GetById Error]:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve inquiry details' });
  }
};

/**
 * Update inquiry status and admin notes (Admin only)
 * PATCH /api/contact/:id
 */
const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid inquiry identifier' });
    }

    const updateFields = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `Status must be one of: ${VALID_STATUSES.join(', ')}`
        });
      }
      updateFields.status = status;
    }

    if (adminNotes !== undefined) {
      updateFields.adminNotes = adminNotes ? String(adminNotes).trim() : null;
    }

    const updated = await ContactInquiry.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        error: 'Contact inquiry not found'
      });
    }

    if (!updated.referenceId) {
      updated.referenceId = `INQ-${updated._id.toString().substring(18).toUpperCase()}`;
      await updated.save();
    }

    return res.status(200).json({
      message: 'Inquiry updated successfully',
      inquiry: updated
    });
  } catch (error) {
    console.error('[ContactController UpdateInquiry Error]:', error.message);
    return res.status(500).json({
      error: 'Failed to update contact inquiry'
    });
  }
};

/**
 * Respond to an inquiry and record history / deliver email
 * POST /api/contact/:id/reply
 */
const replyToInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, sendEmail = false, newStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid inquiry identifier' });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Response message text is required' });
    }

    if (message.trim().length > 4000) {
      return res.status(400).json({ error: 'Response cannot exceed 4000 characters' });
    }

    const inquiry = await ContactInquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ error: 'Contact inquiry not found' });
    }

    const admin = req.user || {};
    const adminName = admin.name || 'Administrator';
    const adminEmail = admin.email || null;
    const adminId = admin._id || admin.id || null;

    let deliveryStatus = 'draft';
    let deliveryDetails = 'Response recorded in internal database.';
    let sentViaEmail = false;

    if (sendEmail) {
      const emailResult = await sendCitizenInquiryReply({
        to: inquiry.email,
        citizenName: inquiry.name,
        subject: inquiry.subject,
        responseMessage: message.trim(),
        referenceId: inquiry.referenceId || `INQ-${inquiry._id}`,
        adminName
      });

      deliveryStatus = emailResult.status;
      deliveryDetails = emailResult.details;
      sentViaEmail = emailResult.delivered;
    }

    const newReply = {
      response: message.trim(),
      adminId,
      adminName,
      adminEmail,
      createdAt: new Date(),
      sentViaEmail,
      deliveryStatus,
      deliveryDetails
    };

    inquiry.replies.push(newReply);

    // Update status if specified, or auto-advance
    if (newStatus && VALID_STATUSES.includes(newStatus)) {
      inquiry.status = newStatus;
    } else if (inquiry.status === 'New' || inquiry.status === 'In Review') {
      inquiry.status = 'Awaiting Response';
    }

    await inquiry.save();

    return res.status(200).json({
      success: true,
      message: sentViaEmail
        ? `Response successfully dispatched to ${inquiry.email}`
        : (deliveryStatus === 'not_configured'
          ? 'Response saved. (Outbound SMTP is not configured, email was not sent)'
          : 'Response recorded in database'),
      deliveryStatus,
      deliveryDetails,
      inquiry
    });
  } catch (error) {
    console.error('[ContactController Reply Error]:', error.message);
    return res.status(500).json({
      error: 'Failed to record response to inquiry'
    });
  }
};

/**
 * Retry email delivery for a previous reply
 * POST /api/contact/:id/reply/:replyId/retry
 */
const retryReplyEmail = async (req, res) => {
  try {
    const { id, replyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid inquiry identifier' });
    }

    const inquiry = await ContactInquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ error: 'Contact inquiry not found' });
    }

    const reply = inquiry.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply record not found' });
    }

    const emailResult = await sendCitizenInquiryReply({
      to: inquiry.email,
      citizenName: inquiry.name,
      subject: inquiry.subject,
      responseMessage: reply.response,
      referenceId: inquiry.referenceId || `INQ-${inquiry._id}`,
      adminName: reply.adminName || 'Administrator'
    });

    reply.deliveryStatus = emailResult.status;
    reply.deliveryDetails = emailResult.details;
    reply.sentViaEmail = emailResult.delivered;

    await inquiry.save();

    return res.status(200).json({
      success: true,
      message: emailResult.delivered
        ? `Email retry succeeded. Dispatched to ${inquiry.email}`
        : `Email retry status: ${emailResult.status}. ${emailResult.details}`,
      deliveryStatus: emailResult.status,
      deliveryDetails: emailResult.details,
      inquiry
    });
  } catch (error) {
    console.error('[ContactController Retry Error]:', error.message);
    return res.status(500).json({
      error: 'Failed to retry email delivery'
    });
  }
};

module.exports = {
  submitInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  replyToInquiry,
  retryReplyEmail
};
