// models/User.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Define the interface for the User document (for TypeScript)
export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password?: string; // Make password optional for Google users
  profilePicture?: string;
  authProvider: 'email' | 'google'; // Track authentication method
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword?(candidatePassword: string): Promise<boolean>; // Make optional
}

// 2. Define the User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      minlength: [6, 'Password should be at least 6 characters'],
      // Remove required: true to make it optional for Google users
    },
    profilePicture: {
      type: String,
      default: ''
    },
    authProvider: {
      type: String,
      enum: ['email', 'google'], // Can be either email or Google
      default: 'email'
    },
    emailVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// 3. Middleware: Hash the password ONLY if provided and modified
userSchema.pre('save', async function (next) {
  // Only hash the password if it exists and has been modified
  if (!this.password || !this.isModified('password')) return next();

  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// 4. Method: Compare provided password with the hashed password in the database
// Only available for users who have a password (email auth users)
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // If user doesn't have a password (Google user), return false
  if (!this.password) return false;
  
  return await bcrypt.compare(candidatePassword, this.password);
};

// 5. Static method: Find or create Google user
userSchema.statics.findOrCreateGoogleUser = async function(googleUser: {
  email: string;
  name: string;
  picture?: string;
}) {
  try {
    // Try to find existing user
    let user = await this.findOne({ email: googleUser.email });
    
    if (user) {
      // Update user if they were previously email-only
      if (user.authProvider === 'email') {
        user.authProvider = 'google'; // Convert to Google auth
        user.emailVerified = true;
        if (googleUser.picture) user.profilePicture = googleUser.picture;
        await user.save();
      }
      return user;
    }
    
    // Create new Google user
    user = new this({
      name: googleUser.name,
      email: googleUser.email,
      profilePicture: googleUser.picture || '',
      authProvider: 'google',
      emailVerified: true,
      // No password needed for Google users
    });
    
    await user.save();
    return user;
    
  } catch (error) {
    console.error('Error in findOrCreateGoogleUser:', error);
    throw error;
  }
};

// Add this to your existing User model - quick fix
userSchema.statics.findOrCreateGoogleUser = async function(googleUser: any) {
  const user = await this.findOne({ email: googleUser.email });
  if (user) return user;
  
  return this.create({
    name: googleUser.name,
    email: googleUser.email,
    profilePicture: googleUser.picture,
    authProvider: 'google',
    emailVerified: true
  });
};
export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);