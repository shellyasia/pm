# Product Management System

A comprehensive admin panel for managing IoT products, orders, and user
accounts built with Next.js 14, TypeScript, and PostgreSQL.

## 🚀 Features

- **Product Management**: Create, edit, sync, and view IoT products with
  firmware information
- **Order Management**: Process and track orders with Excel import/export
  capabilities
- **User Management**: Manage user accounts and permissions
- **Attachment Handling**: Upload, download, and manage file attachments with
  secure hash-based storage
- **OAuth Authentication**: Secure login with JWT token-based authentication
- **Dashboard Analytics**: Real-time insights and statistics
- **Responsive UI**: Modern interface built with Radix UI and Tailwind CSS
- **Data Tables**: Advanced sorting, filtering, and pagination
- **Excel Integration**: Import/export order data with XLSX support

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Kysely query builder
- **Authentication**: JWT with OAuth flow
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: SWR for data fetching
- **File Processing**: XLSX, Cheerio, DOMPurify
- **Testing**: Jest, React Testing Library

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- PM2 (for production deployment)
- Docker & Docker Compose (optional, for containerized deployment)

## 🚀 Quick Start with Docker

The fastest way to get started:

```bash
# Clone the repository
git clone <repository-url>
cd pm.acme.cn

# Start with Docker Compose
docker-compose up -d

# Application will be available at http://localhost:3080
```

For detailed setup instructions, see the sections below.

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pm.acme.cn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory with the following
   variables:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/acme_pm

   # JWT Secret
   JWT_SECRET=your-secret-key-here

   # OAuth Configuration
   OAUTH_CLIENT_ID=your-client-id
   OAUTH_CLIENT_SECRET=your-client-secret
   OAUTH_REDIRECT_URI=http://localhost:3080/api/auth/callback

   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3080
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3080`

## 📦 Available Scripts

- `npm run dev` - Start development server on port 3080
- `npm run build` - Build for production
- `npm run build:analyze` - Build with bundle analyzer
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run db:migrate` - Run database migrations
- `npm run security:scan` - Run npm security audit
- `npm run restart:prod` - Restart PM2 process
- `npm run pm2:restart` - Build and restart PM2

## 🗂️ Project Structure

```
pm.acme.cn/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin panel routes
│   │   │   ├── dashboard/     # Analytics dashboard
│   │   │   ├── orders/        # Order management
│   │   │   ├── products/      # Product management
│   │   │   ├── users/         # User management
│   │   │   └── attachments/   # File management
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── orders/        # Order CRUD operations
│   │   │   ├── products/      # Product CRUD operations
│   │   │   ├── users/         # User management APIs
│   │   │   └── attachments/   # File upload/download
│   │   └── login/             # Login page
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   └── examples/          # Example components
│   ├── contexts/              # React contexts
│   │   ├── auth-context.tsx   # Authentication state
│   │   └── use-products.tsx   # Product data hooks
│   └── lib/
│       ├── auth/              # Authentication utilities
│       ├── db/                # Database layer
│       │   ├── migrations/    # Database migrations
│       │   └── table_*.ts     # Table definitions
│       ├── config/            # Configuration
│       └── confluence/        # External integrations
├── uploads/                   # File storage directory
└── public/                    # Static assets
```

## 🔐 Authentication

The application uses OAuth 2.0 flow with JWT tokens:

1. User initiates login
2. Redirected to OAuth provider
3. Callback receives authorization code
4. Exchange code for access token
5. JWT token issued for session management

## 💾 Database Schema

The application manages the following main entities:

- **Users**: User accounts and profiles
- **Products**: IoT product catalog with firmware info
- **Orders**: Customer orders with status tracking
- **Attachments**: File uploads with secure storage
- **OAuth States**: OAuth flow state management

## 🚢 Deployment

### Using PM2

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **Monitor**
   ```bash
   pm2 status
   pm2 logs pm.acme.cn
   ```

### Production Configuration

The project includes:

- `ecosystem.config.js` - PM2 configuration
- `pm.acme.cn.conf` - Nginx configuration template

## 🧪 Testing

Run tests with:

```bash
npm test
```

## 🔒 Security

- Input validation with Zod schemas
- XSS protection with DOMPurify
- SQL injection prevention via parameterized queries (Kysely)
- JWT-based authentication
- File upload validation
- Regular security audits via `npm run security:scan`

## 📝 API Endpoints

### Authentication

- `GET /api/auth/authorize-url` - Get OAuth authorization URL
- `GET /api/auth/callback` - OAuth callback handler
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout

### Products

- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `GET /api/products/spider-firmware` - Fetch firmware info

### Orders

- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order
- `PUT /api/orders/[id]` - Update order
- `DELETE /api/orders/[id]` - Delete order
- `POST /api/orders/bulk` - Bulk operations

### Users

- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/[id]` - Update user

### Attachments

- `GET /api/attachments` - List attachments
- `POST /api/attachments` - Upload file
- `GET /api/attachments/[id]` - Get attachment info
- `DELETE /api/attachments/[id]` - Delete attachment
- `GET /api/attachments/download/[hash]` - Download file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔄 CI/CD & Deployment

This project includes GitLab CI/CD configuration for automated testing and
deployment.

### Quick Setup

1. Enable GitLab runner for your project
2. Configure CI/CD variables in GitLab (**Settings** → **CI/CD** →
   **Variables**)
3. Push to `main` or `develop` branch

### Documentation

- **[CI/CD Setup Guide](CI-CD-SETUP.md)** - Complete setup instructions
- **[Quick Reference](CI-CD-QUICKREF.md)** - Common commands and workflows

### Deployment Options

- **PM2**: Traditional deployment with PM2 process manager
- **Docker**: Containerized deployment with Docker Compose
- **GitLab CI/CD**: Automated deployment pipeline

For detailed instructions, see [CI-CD-SETUP.md](CI-CD-SETUP.md).

## 📄 License

Copyright © 2025 ACME IoT. All rights reserved.

## 🐛 Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running and environment variables are correctly set.

### Port Already in Use

Change the port in `package.json` scripts or kill the process using port 3080:

```bash
lsof -ti:3080 | xargs kill -9
```

### Build Errors

Clear Next.js cache:

```bash
rm -rf .next
npm run build
```

## 📞 Support

For issues and questions, please open an issue in the repository.

---

Built with ❤️ using Next.js and TypeScript
