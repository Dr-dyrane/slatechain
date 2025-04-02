// app/api/models/OTP.ts
import mongoose, { Document, Schema } from "mongoose";

interface IOTP extends Document {
	phoneNumber: string;
	otp: string;
	expiresAt: Date;
}

const otpSchema = new Schema<IOTP>({
	phoneNumber: {
		type: String,
		required: true,
		unique: true, // Ensure one OTP per phone number at a time
	},
	otp: {
		type: String,
		required: true,
	},
	expiresAt: {
		type: Date,
		required: true,
	},
});

const OTP = mongoose.models.OTP || mongoose.model<IOTP>("OTP", otpSchema);

export default OTP;
