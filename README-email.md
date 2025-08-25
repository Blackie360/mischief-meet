## Email Notifications

Set environment variables:

- SMTP_HOST
- SMTP_PORT (e.g., 465 for SSL, 587 for STARTTLS)
- SMTP_USER
- SMTP_PASS
- SMTP_FROM (optional, defaults to SMTP_USER)
- SMTP_FROM_NAME (optional, defaults to "Mischief Meet")

Emails sent:
- Booking confirmation to attendee
- Booking notification to host
- Booking cancellation to attendee and host

Implementation:
- Transport and sender: `lib/mailer.js`
- Templates: `components/emails/*`


