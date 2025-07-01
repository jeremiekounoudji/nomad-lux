# 🏨 Nomad Lux - Luxury Property Booking Platform

![Nomad Lux](https://img.shields.io/badge/Nomad%20Lux-Luxury%20Stays-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.3.4-646CFF?style=flat&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.4-06B6D4?style=flat&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat&logo=supabase)

A modern, Instagram-inspired luxury property booking platform built with React, Vite, Tailwind CSS, Hero UI, and Supabase. Features comprehensive admin panel, real-time messaging, secure payments, and mobile-first responsive design.

## ✨ Features

### 🏠 **Core Platform**
- **Property Management**: Advanced search, filtering, and booking system
- **User Authentication**: Secure sign-up/sign-in with email verification
- **Real-time Messaging**: Host-guest communication with instant notifications
- **Payment Integration**: Secure payments with Stripe Connect
- **Review System**: Comprehensive rating and review management
- **Geolocation Services**: Map integration with location-based search

### 👨‍💼 **Admin Panel**
- **Dashboard Analytics**: Real-time metrics and revenue tracking
- **User Management**: Comprehensive user administration with role-based access
- **Property Approval**: Multi-step property review and approval workflow
- **Booking Oversight**: Complete booking lifecycle management
- **Dispute Resolution**: Automated dispute handling with escalation
- **Financial Management**: Revenue tracking, payouts, and commission management

### 📱 **User Experience**
- **Mobile-First Design**: Instagram-inspired UI with bottom navigation
- **Progressive Web App**: Offline support and native app-like experience
- **Dark/Light Mode**: Automatic theme switching based on user preference
- **Multi-language Support**: Internationalization ready
- **Accessibility**: WCAG 2.1 AA compliant

## 🏗️ Architecture

### **Tech Stack**
```
Frontend:     React 18 + TypeScript + Vite
Styling:      Tailwind CSS + Hero UI Components
Backend:      Supabase (PostgreSQL + Auth + Storage + Edge Functions)
Payments:     Stripe Connect
Maps:         Google Maps API
Deployment:   Vercel (Frontend) + Supabase (Backend)
```

### **Project Structure**
```
nomad-lux/
├── docs/                     # Comprehensive documentation
├── src/
│   ├── components/
│   │   ├── features/         # Feature-specific components
│   │   │   ├── admin/        # Admin panel components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── booking/      # Booking system components
│   │   │   └── property/     # Property management components
│   │   ├── layout/           # Layout components
│   │   ├── shared/           # Reusable UI components
│   │   └── ui/               # Base UI components
│   ├── context/              # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── interfaces/           # TypeScript interfaces
│   ├── lib/                  # Utilities and configurations
│   ├── pages/                # Page components
│   ├── styles/               # Global styles and Tailwind config
│   └── utils/                # Helper functions
├── public/                   # Static assets
└── package.json
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Git
- Supabase account
- Stripe account (for payments)

### **Installation**
```bash
# Clone the repository
git clone https://github.com/jeremiekounoudji/nomad-lux.git
cd nomad-lux

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure your environment variables in .env.local
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# Start development server
npm run dev
```

### **Environment Setup**
The project uses a fallback configuration system. If `.env` files are not available, update `src/lib/config.ts` with your credentials:

```typescript
export const config = {
  supabase: {
    url: 'your_supabase_url',
    anonKey: 'your_supabase_anon_key'
  },
  // ... other configurations
}
```

## 🌿 Branch Workflow

We follow a structured Git workflow for organized development:

### **Branch Structure**
```
main                          # Stable production-ready code
├── prod                      # Production environment
├── test                      # Testing/staging environment  
├── dev                       # Development integration
└── feature/implement-all-ui  # Current feature development
```

### **Development Workflow**
1. **Feature Development**: Work on `feature/implement-all-ui`
2. **Integration**: Merge to `dev` for integration testing
3. **Quality Assurance**: Promote to `test` for QA testing
4. **Production**: Deploy from `prod` after thorough testing
5. **Hotfixes**: Create directly from `main` when needed

### **Commands**
```bash
# Switch to feature branch
git checkout feature/implement-all-ui

# Regular development workflow
git add .
git commit -m "feat: add new feature"
git push origin feature/implement-all-ui

# Create pull request to dev branch for integration
```

## 🗃️ Database Schema

### **Core Tables**
- **users**: User profiles with authentication and verification
- **properties**: Property listings with geolocation and media
- **bookings**: Booking management with payment tracking
- **reviews**: Rating and review system
- **messages**: Real-time messaging between users
- **admin_settings**: Configurable platform settings
- **admin_activities**: Audit trail for admin actions

### **Key Features**
- **Row Level Security (RLS)**: Fine-grained access control
- **Real-time Subscriptions**: Live updates for messaging and bookings
- **Full-text Search**: Advanced property and user search
- **Geospatial Queries**: Location-based property discovery
- **Audit Trails**: Complete action history for compliance

## 🔐 Authentication & Authorization

### **User Roles**
- **Guest**: Can browse and book properties
- **Host**: Can list properties and manage bookings
- **Both**: Combined guest and host privileges
- **Admin**: Platform administration access
- **Super Admin**: Full system access

### **Security Features**
- Email verification and phone verification
- Multi-factor authentication support
- Session management with automatic refresh
- Role-based access control (RBAC)
- Rate limiting and abuse prevention

## 🎨 UI/UX Guidelines

### **Design System**
- **Primary Color**: Custom blue theme with secondary sky blue accents
- **Typography**: Inter font family with script fonts for branding
- **Layout**: Mobile-first responsive design
- **Components**: Hero UI headless components with custom styling
- **Patterns**: Instagram-inspired feed layout with story carousels

### **Responsive Breakpoints**
```css
sm: 640px    # Small devices
md: 768px    # Medium devices  
lg: 1024px   # Large devices
xl: 1280px   # Extra large devices
2xl: 1536px  # 2X large devices
```

## 📊 Admin Panel Features

### **Dashboard**
- Real-time analytics and KPIs
- Revenue tracking and financial metrics
- User engagement statistics
- Booking conversion rates
- Property performance insights

### **Management Tools**
- **User Management**: Account status, verification, role assignment
- **Property Management**: Approval workflow, feature management
- **Booking Management**: Status tracking, refund processing
- **Content Moderation**: Review approval, image verification
- **Financial Management**: Commission tracking, payout management

## 🧪 Testing

### **Test Admin Account**
```
Email: admin@nomadlux.com
Password: admin123
Role: admin
```

### **Testing Strategy**
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API and database interaction testing
- **E2E Tests**: Full user journey testing
- **Performance Tests**: Load testing for high traffic scenarios

## 🚀 Deployment

### **Environment Configuration**
- **Development**: Local development with hot reload
- **Test**: Staging environment for QA testing
- **Production**: Optimized build with CDN and caching

### **Deployment Commands**
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **Technical Architecture**: System design and data flow
- **API Documentation**: Supabase functions and endpoints
- **Component Library**: UI component documentation
- **Admin Panel Guide**: Complete admin functionality guide
- **Deployment Guide**: Production deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch from `dev`
3. Make your changes
4. Run tests and ensure code quality
5. Submit a pull request to `dev`

### **Code Standards**
- TypeScript strict mode enabled
- ESLint and Prettier for code formatting
- Conventional commit messages
- Component and function documentation
- Test coverage for new features

## 🐛 Known Issues

Current TypeScript errors (269 total):
- Unused import warnings (TS6133) - Non-blocking
- Hero UI SelectItem value prop issues - Cosmetic
- Missing optional fields in some interfaces - Minor

These issues don't affect functionality and will be resolved in upcoming releases.

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For technical support or questions:
- **Email**: dev@nomadlux.com
- **Documentation**: `/docs` directory
- **Issues**: GitHub Issues tab

---

**Built with ❤️ by the Nomad Lux Team**

*Creating exceptional luxury travel experiences through technology.*

## Social Media Integration

### Open Graph Image Setup

For optimal social media sharing, add an Open Graph image to the `public` folder:

1. Create a high-quality image (1200x630px recommended) showcasing NomadLux
2. Save it as `public/og-image.jpg`
3. The image should include:
   - NomadLux branding/logo
   - Attractive property imagery
   - Clear, readable text
   - Brand colors matching the site theme

### Meta Tags

The application automatically updates meta tags for property pages to ensure rich link previews when sharing. Key features:

- Dynamic Open Graph tags for each property
- Twitter Card support
- Proper canonical URLs
- Property-specific titles and descriptions
- Automatic fallback to default site meta tags 