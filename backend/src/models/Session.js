import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    ideaText: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },
    domainHint: {
        type: String,
        default: 'General',
        trim: true
    },
    tonePreference: {
        type: String,
        default: 'Professional',
        trim: true
    },
    status: {
        type: String,
        enum: ['created', 'processing', 'completed', 'partial', 'failed'],
        default: 'created',
        index: true
    },
    outputs: {
        refined_concept: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        brand_profile: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        landing_content: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        market_analysis: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        pitch_deck: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        business_model: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        risk_analysis: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        code_preview: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        }
    },
    error: {
        type: String,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for user's recent sessions
sessionSchema.index({ userId: 1, createdAt: -1 });

// JSON transformation
sessionSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;
