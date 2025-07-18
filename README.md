# 🎭 MeetMischief - Calendly Clone

A modern, playful scheduling application built with Next.js, featuring beautiful animations and a delightful user experience.

## ✨ Features

- 🔐 **Email-based Authentication** - Secure login with NextAuth.js
- 📅 **Availability Management** - Set weekly schedules and time slots
- 🔗 **Public Booking Pages** - Shareable links for easy scheduling
- 📧 **Email Notifications** - Automatic confirmations using Nodemailer
- 🎨 **Beautiful UI** - Animated particles and smooth interactions
- 📱 **Fully Responsive** - Optimized for all devices
- 🎭 **Playful Design** - Cheeky branding with professional functionality

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Email account for SMTP (Gmail recommended)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd meetmischief
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your actual values in `.env.local`:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - Email SMTP settings for your provider

4. **Set up the database**
   \`\`\`bash
   # Run the database setup scripts
   npm run db:setup
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📧 Email Setup

### Gmail Configuration

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password in `EMAIL_SERVER_PASSWORD`

### Other Email Providers

Update the SMTP settings in your `.env.local`:
- **Outlook**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Use your provider's settings

## 🗄️ Database Schema

The application uses these main tables:
- `users` - User profiles and authentication
- `availability` - Weekly schedule settings
- `bookings` - Meeting appointments
- `blocked_dates` - Unavailable dates

## 🎯 Usage

### For Hosts

1. **Sign up** with your email address
2. **Set availability** in the dashboard
3. **Share your booking link**: `yourdomain.com/your-username`
4. **Manage bookings** from your dashboard

### For Guests

1. **Visit a booking link**
2. **Select date and time**
3. **Fill in your details**
4. **Receive confirmation email**

## 🛠️ Development

### Project Structure

\`\`\`
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard
│   └── [username]/        # Public booking pages
├── components/            # Reusable components
├── lib/                   # Utilities and configurations
├── scripts/               # Database setup scripts
└── types/                 # TypeScript definitions
\`\`\`

### Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:setup     # Set up database tables
\`\`\`

### Adding New Features

1. **API Routes**: Add to `app/api/`
2. **Components**: Create in `components/`
3. **Database**: Update scripts in `scripts/`
4. **Types**: Define in `types/`

## 🎨 Customization

### Branding

- Update colors in `tailwind.config.ts`
- Modify animations in `app/globals.css`
- Change fonts in `app/layout.tsx`

### Email Templates

- Edit templates in `lib/email.ts`
- Customize styling with inline CSS

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - automatic on git push

### Other Platforms

- **Netlify**: Use `npm run build` output
- **Railway**: Connect PostgreSQL addon
- **DigitalOcean**: Use App Platform

## 🔧 Troubleshooting

### Common Issues

**Authentication not working**
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your domain

**Emails not sending**
- Verify SMTP credentials
- Check email provider settings
- Test with a simple email first

**Database connection failed**
- Confirm `DATABASE_URL` format
- Check database is running
- Verify network access

**Booking times not showing**
- Ensure availability is set in dashboard
- Check timezone settings
- Verify database has availability data

### Getting Help

1. Check the [Issues](link-to-issues) page
2. Review the troubleshooting section
3. Join our [Discord](link-to-discord) community

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
- Animations inspired by modern design trends

---

**Made with 💜 and a little mischief**
