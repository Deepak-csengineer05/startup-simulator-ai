import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allows null for email/password users
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        select: false // Don't include password by default in queries
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    picture: {
        type: String,
        default: ''
    },
    authProvider: {
        type: String,
        enum: ['google', 'local'],
        default: 'local'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for user's sessions
userSchema.virtual('sessions', {
    ref: 'Session',
    localField: '_id',
    foreignField: 'userId'
});

// JSON transformation
userSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.googleId;
        delete ret.password;
        return ret;
    }
});

const User = mongoose.model('User', userSchema);

export default User;
