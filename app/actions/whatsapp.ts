// app/actions/whatsapp.ts

import axios from "axios";

// Send OTP via WhatsApp (Meta first, then Twilio as a fallback)
export async function sendOTP(phoneNumber: string, otp: string): Promise<void> {
	// Meta WhatsApp API credentials
	const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
	const phoneNumberId = process.env.NEXT_PUBLIC_PHONE_NUMBER_ID;
	const apiUrl = process.env.NEXT_PUBLIC_API_URL;

	// Twilio API credentials
	const twilioSid = process.env.TWILIO_ACCOUNT_SID;
	const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
	const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

	// Check Meta WhatsApp API variables
	if (!accessToken || !phoneNumberId || !apiUrl) {
		console.error("Missing environment variables for WhatsApp API (Meta)");
		return;
	}

	const metaUrl = `${apiUrl}/${phoneNumberId}/messages`;
	const metaMessageData = {
		messaging_product: "whatsapp",
		to: phoneNumber,
		text: {
			body: `Your OTP code is: ${otp}`,
		},
	};

	try {
		// Attempt to send via Meta WhatsApp API
		const metaResponse = await axios.post(metaUrl, metaMessageData, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});

		console.log("OTP sent successfully via Meta WhatsApp:", metaResponse.data);
	} catch (metaError: any) {
		console.error(
			"Error sending OTP via Meta WhatsApp:",
			metaError.response ? metaError.response.data : metaError.message
		);

		// Fall back to Twilio if Meta WhatsApp fails
		try {
			if (!twilioSid || !twilioAuthToken || !twilioNumber) {
				console.error("Missing environment variables for Twilio API");
				return;
			}

			const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
			const twilioMessageData = new URLSearchParams({
				To: `whatsapp:${phoneNumber}`,
				From: `whatsapp:${twilioNumber}`,
				Body: `Your OTP code is: ${otp}`,
			});

			const twilioResponse = await axios.post(twilioUrl, twilioMessageData, {
				auth: {
					username: twilioSid,
					password: twilioAuthToken,
				},
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			});

			console.log("OTP sent successfully via Twilio:", twilioResponse.data);
		} catch (twilioError: any) {
			console.error(
				"Error sending OTP via Twilio:",
				twilioError.response ? twilioError.response.data : twilioError.message
			);
		}
	}
}
