# Skin Essentials by Her - Developer Documentation

Welcome to the Skin Essentials by Her documentation hub. This repository contains comprehensive documentation for the entire platform.

## Quick Start

1. **[Getting Started Guide](#getting-started)** - Setup and installation
2. **[Architecture Overview](#architecture)** - System design and components
3. **[API Documentation](#api-documentation)** - REST and internal APIs
4. **[Development Guides](#development-guides)** - Code standards and conventions

## Table of Contents

### Getting Started
- [Production Setup](production-setup.md) - Environment configuration and deployment
- [Facebook Meta Setup](facebook-meta-setup.md) - Facebook integration configuration

### Architecture
- [Social Media Architecture](social-media-architecture.md) - Social media messaging system
- [Developer Mode](developer-mode.md) - Monitoring and operations center

### API Documentation
- [Developer API](developer-api.md) - System monitoring and developer operations API
- [iProgSMS API](iprogsms.md) - SMS messaging service integration
- [Viber API](viber-api.md) - Viber messaging service integration

### Development Guides
- [Code Standards](code-standards.md) - Naming conventions and best practices
- [Design System](design-system.md) - UI components and styling guidelines
- [Animation Specifications](animation-specs.md) - Motion and transition guidelines

## Project Structure

```
skin-essentials-website-v3/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   └── actions/           # Server actions
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and services
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Business logic services
│   └── utils/            # Helper functions
└── docs/                 # Documentation
```

## Key Technologies

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Real-time**: Supabase Realtime
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner (Toast)
- **Icons**: Lucide React

## Development Workflow

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables (see [production-setup.md](production-setup.md))
4. Run development server: `npm run dev`

### Code Standards

Follow the guidelines in [code-standards.md](code-standards.md):
- Use `camelCase` for variables/functions
- Use `PascalCase` for components
- File names match their default export
- Hooks start with `use-`

### Testing

Run tests with:
```bash
npm test
```

### Deployment

See [production-setup.md](production-setup.md) for CI/CD and deployment instructions.

## Security Considerations

- All API endpoints implement proper authentication
- Environment variables are never committed to version control
- Webhooks verify signatures
- User access tokens are stored server-side only
- HIPAA compliance for medical records

## Monitoring & Operations

The platform includes a comprehensive [Developer Mode](developer-mode.md) with:
- System health monitoring
- Real-time error logging
- Audit trail access
- Slack integration for alerts

Access the developer dashboard at `/admin/developer`

## Social Media Integration

The platform integrates with multiple social media platforms:

- **Facebook/Meta**: Real-time messaging via webhooks and Graph API
- **SMS**: iProgSMS for appointment reminders
- **Viber**: Optional messaging platform

See [social-media-architecture.md](social-media-architecture.md) for details.

## API Reference

### Internal APIs

| Endpoint | Purpose |
|----------|---------|
| `/api/system/health` | System health check |
| `/api/system/logs` | Error and audit log access |
| `/api/social/sync` | Social media sync |
| `/api/webhooks/facebook` | Facebook webhook handler |

### External Integrations

| Service | Documentation |
|---------|---------------|
| iProgSMS | [iprogsms.md](iprogsms.md) |
| Viber | [viber-api.md](viber-api.md) |

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Review [Developer Mode](developer-mode.md) health status

2. **Webhook Failures**
   - Verify webhook tokens
   - Check Facebook app settings
   - Review error logs

3. **Build Errors**
   - Clear cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check for type errors

## Support

For issues or questions:
1. Check existing documentation
2. Review error logs in Developer Mode
3. Create a GitHub issue with detailed description

## License

Proprietary - All rights reserved

---

**Last Updated**: January 17, 2026
