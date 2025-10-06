import { Resend } from "resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { to, subject, type, data } = payload;

    if (!to || !subject || !type || !data) {
      throw new Error("Missing required email parameters");
    }

    let emailContent = "";
    if (type === "verification") {
      emailContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px; }
              .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .otp { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Verify Your Email Address</h2>
              </div>
              <div class="content">
                <p>Thank you for registering! Please use the following verification code to complete your registration:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <div class="otp">${data.otp}</div>
                </div>
                <p>This code will expire in ${data.expiresIn}.</p>
                <p><strong>Important:</strong></p>
                <ul>
                  <li>Never share this code with anyone</li>
                  <li>Our team will never ask for this code</li>
                  <li>If you didn't request this code, please ignore this email</li>
                </ul>
              </div>
              <div class="footer">
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else if (type === "competition_registration") {
      const { competitionDetails } = data;
      emailContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #10B981; color: white; padding: 20px; border-radius: 8px; }
              .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Competition Registration Confirmed!</h2>
              </div>
              <div class="content">
                <p>Congratulations! You have successfully registered for the competition:</p>
                <div class="details">
                  <h3>${competitionDetails.title}</h3>
                  <p><strong>Start Time:</strong> ${competitionDetails.startTime}</p>
                  <p><strong>End Time:</strong> ${competitionDetails.endTime}</p>
                  <p><strong>Entry Fee:</strong> $${competitionDetails.entryFee}</p>
                  <p><strong>Prize Money:</strong> $${competitionDetails.prizeMoney}</p>
                </div>
                <p>Good luck with the competition!</p>
              </div>
              <div class="footer">
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) throw new Error("RESEND_API_KEY is not defined in Edge Function environment");

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "QuizMaster <team@lordsandkingsagro.com>", // You can use your verified domain here
      to: [email],
      subject: subject,
      html: emailContent,
    });

    if (error) {
      console.error("Resend email error:", error);
      throw new Error("Failed to send email with Resend");
    }

    return new Response(
      JSON.stringify({ message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error", details: error.toString() }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
