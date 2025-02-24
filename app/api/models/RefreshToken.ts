import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	tokenId: { type: String, required: true, unique: true },
	token: { type: String, required: true },
	expiresAt: { type: Date, required: true },
});

export default mongoose.models.RefreshToken ||
	mongoose.model("RefreshToken", RefreshTokenSchema);
