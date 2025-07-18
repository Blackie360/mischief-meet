import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendBookingConfirmation({
  to,
  hostName,
  guestName,
  guestEmail,
  eventTitle,
  eventDate,
  eventTime,
  duration,
  meetingLink,
  isHost = false,
}: {
  to: string
  hostName: string
  guestName: string
  guestEmail: string
  eventTitle: string
  eventDate: string
  eventTime: string
  duration: number
  meetingLink?: string
  isHost?: boolean
}) {
  const subject = isHost
    ? `New booking: ${eventTitle} with ${guestName}`
    : `Booking confirmed: ${eventTitle} with ${hostName}`

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">MeetMischief</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Meeting ${isHost ? "Scheduled" : "Confirmed"}</p>
      </div>
      
      <div style="padding: 40px 20px; background: white;">
        <h2 style="color: #333; margin-bottom: 20px;">
          ${isHost ? `New booking from ${guestName}` : `Your meeting is confirmed!`}
        </h2>
        
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #334155; margin: 0 0 15px 0; font-size: 18px;">${eventTitle}</h3>
          <div style="color: #64748b; line-height: 1.6;">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${eventDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${eventTime}</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> ${duration} minutes</p>
            <p style="margin: 5px 0;"><strong>${isHost ? "Guest" : "Host"}:</strong> ${isHost ? `${guestName} (${guestEmail})` : hostName}</p>
          </div>
        </div>

        ${
          meetingLink
            ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${meetingLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Join Meeting
            </a>
          </div>
        `
            : ""
        }

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            ${
              isHost
                ? "You can manage your bookings and availability from your dashboard."
                : "Please save this information to your calendar. If you need to reschedule or cancel, please contact the host directly."
            }
          </p>
        </div>
      </div>
      
      <div style="background: #f1f5f9; padding: 20px; text-align: center;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          This email was sent by MeetMischief. If you have any questions, please contact support.
        </p>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: htmlContent,
    })

    console.log("Email sent successfully:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Failed to send email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
