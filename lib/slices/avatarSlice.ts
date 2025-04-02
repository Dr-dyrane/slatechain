// lib/slices/avatarSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../api/apiClient/[...live]";

interface AvatarState {
	isUploading: boolean;
	avatarUrl: string | null;
	error: string | null;
}

const initialState: AvatarState = {
	isUploading: false,
	avatarUrl: null,
	error: null,
};

interface AvatarUploadResponse {
	code: string;
	message: string;
	avatarUrl: string;
}

export const uploadAvatar = createAsyncThunk<
	{ avatarUrl: string },
	File,
	{ rejectValue: string }
>("avatar/uploadAvatar", async (file, { rejectWithValue }) => {
	try {
		const formData = new FormData();
		formData.append("avatar", file);

		const response = await apiClient.post<AvatarUploadResponse>(
			"/avatars/upload",
			formData
		);

		return { avatarUrl: response.avatarUrl };
	} catch (error: any) {
		return rejectWithValue(error.message || "Failed to upload avatar");
	}
});

const avatarSlice = createSlice({
	name: "avatar",
	initialState,
	reducers: {
		clearAvatarError: (state) => {
			state.error = null;
		},
		setAvatarUrl: (state, action) => {
			state.avatarUrl = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(uploadAvatar.pending, (state) => {
				state.isUploading = true;
				state.error = null;
			})
			.addCase(uploadAvatar.fulfilled, (state, action) => {
				state.isUploading = false;
				state.avatarUrl = action.payload.avatarUrl;
			})
			.addCase(uploadAvatar.rejected, (state, action) => {
				state.isUploading = false;
				state.error = action.payload || "Failed to upload avatar";
			});
	},
});

export const { clearAvatarError, setAvatarUrl } = avatarSlice.actions;
export default avatarSlice.reducer;
