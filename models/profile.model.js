import mongoose from 'mongoose';



const profileSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        commission: { type: mongoose.Schema.Types.ObjectId, ref: "Referral", required: true }
    }
)

export const Profile = mongoose.model('Profile', profileSchema);
