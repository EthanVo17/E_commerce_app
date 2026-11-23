import axios from "axios";

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class SmsService {
  static async sendOtp(
    phoneNumber: string,
    otpCode: string,
  ): Promise<SmsSendResult> {
    const isDev = process.env.NODE_ENV !== "production";
    const provider = process.env.SMS_PROVIDER || (isDev ? "mock" : "esms");

    const message = `Ma xac thuc OTP cua ban la: ${otpCode}. Ma co hieu luc trong 3 phut. Khong chia se ma nay voi bat ky ai.`;

    // 1. Mock Mode (Development or Mock specified)
    if (provider === "mock" || isDev) {
      console.log("====================================================");
      console.log(`[SMS MOCK] 📱 Gửi SMS OTP đến: ${phoneNumber}`);
      console.log(`[SMS MOCK] 🔑 Mã OTP: >>> ${otpCode} <<<`);
      console.log(`[SMS MOCK] ⏰ Hạn sử dụng: 3 phút (180 giây)`);
      console.log("====================================================");
      return { success: true, messageId: `mock_${Date.now()}` };
    }

    // 2. Twilio Provider
    if (provider === "twilio") {
      try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromPhone = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromPhone) {
          console.warn(
            "[SmsService] Twilio credentials not set. Falling back to log.",
          );
          console.log(
            `[SMS TWILIO FALLBACK] Phone: ${phoneNumber}, OTP: ${otpCode}`,
          );
          return { success: true };
        }

        const auth = Buffer.from(`${accountSid}:${authToken}`).toString(
          "base64",
        );
        const params = new URLSearchParams();
        params.append("To", phoneNumber);
        params.append("From", fromPhone);
        params.append("Body", message);

        const response = await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          params.toString(),
          {
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 5000,
          },
        );

        return { success: true, messageId: response.data?.sid };
      } catch (err: any) {
        console.error("[SmsService Twilio Error]:", err.message);
        return { success: false, error: err.message };
      }
    }

    return { success: true };
  }
}
