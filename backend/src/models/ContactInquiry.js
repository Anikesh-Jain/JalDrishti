const mongoose = require('mongoose');

const inquiryReplySchema = new mongoose.Schema(
  {
    response: {
      type: String,
      required: [true, 'Response message is required'],
      trim: true,
      maxlength: [4000, 'Response cannot exceed 4000 characters']
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    adminName: {
      type: String,
      trim: true,
      default: 'Administrator'
    },
    adminEmail: {
      type: String,
      trim: true,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    sentViaEmail: {
      type: Boolean,
      default: false
    },
    deliveryStatus: {
      type: String,
      enum: ['delivered', 'failed', 'not_configured', 'draft'],
      default: 'draft'
    },
    deliveryDetails: {
      type: String,
      trim: true,
      default: null
    }
  },
  { _id: true }
);

const contactInquirySchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [150, 'Subject cannot exceed 150 characters'],
      default: 'General Water Quality Inquiry'
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['New', 'In Review', 'Awaiting Response', 'Resolved'],
        message: '{VALUE} is not a valid inquiry status'
      },
      default: 'New'
    },
    adminNotes: {
      type: String,
      trim: true,
      default: null
    },
    replies: [inquiryReplySchema],
    ipAddress: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

contactInquirySchema.pre('save', function (next) {
  if (!this.referenceId) {
    const timestampStr = Date.now().toString(36).toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referenceId = `INQ-${timestampStr}-${randomSuffix}`;
  }
  next();
});

contactInquirySchema.index({ status: 1, createdAt: -1 });
contactInquirySchema.index({ email: 1 });

const ContactInquiry = mongoose.model('ContactInquiry', contactInquirySchema);

module.exports = ContactInquiry;
