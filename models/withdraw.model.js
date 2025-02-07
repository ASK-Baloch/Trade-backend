import mongoose from 'mongoose';

const WithdrawSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Bank', 'Easypasa', 'JazzCash'],
        required: true
    },
    details: {
        type: Object
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date
    },
    // approvedBy:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Admin'
    // },

},
    {
        timestamps: true
    }
)

export const Withdraw = mongoose.model('Withdraw', WithdrawSchema);