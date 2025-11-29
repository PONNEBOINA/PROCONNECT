import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  techStack: [{
    type: String
  }],
  githubUrl: {
    type: String,
    default: ''
  },
  projectUrl: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  visibility: {
    type: String,
    enum: ['public', 'friends'],
    default: 'public'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  challenges: {
    faced: {
      type: String,
      default: ''
    },
    learned: {
      type: String,
      default: ''
    },
    explored: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for likes count
projectSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comments count
projectSchema.virtual('commentsCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

export default mongoose.model('Project', projectSchema);
