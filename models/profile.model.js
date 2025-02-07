import mongoose from 'mongoose';



const profileSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        commission: { type: mongoose.Schema.Types.ObjectId, ref: "Referral", required: true },
        commission: {
            level1: { type: Number, default: 0 },
            level2: { type: Number, default: 0 },
            level3: { type: Number, default: 0 },
        },
    }
)

export const Profile = mongoose.model('Profile', profileSchema);
