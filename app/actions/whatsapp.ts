// app/actions/whatsapp.ts

import axios from "axios";

// Send OTP via WhatsApp
export async function sendOTP(phoneNumber: string, otp: string): Promise<void> {
	const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
	const phoneNumberId = process.env.NEXT_PUBLIC_PHONE_NUMBER_ID;
	const apiUrl = process.env.NEXT_PUBLIC_API_URL;

	if (!accessToken || !phoneNumberId || !apiUrl) {
		console.error("Missing environment variables for WhatsApp API");
		return;
	}

	const url = `${apiUrl}/${phoneNumberId}/messages`;

	const messageData = {
		messaging_product: "whatsapp",
		to: phoneNumber,
		text: {
			body: `Your OTP code is: ${otp}`,
		},
	};

	try {
		const response = await axios.post(url, messageData, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});

		console.log("OTP sent successfully:", response.data);
	} catch (error: any) {
		console.error(
			"Error sending OTP:",
			error.response ? error.response.data : error.message
		);
	}
}
