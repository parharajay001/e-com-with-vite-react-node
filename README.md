# E-Commerce Platform

A modern, full-stack e-commerce platform built with React, Node.js, and TypeScript using a monorepo architecture.

## 🏗️ Architecture

This project uses a monorepo structure powered by Turborepo and pnpm workspaces, consisting of multiple applications and shared packages:

### Applications

- `apps/frontend` - Admin dashboard interface
- `apps/frontend-user` - Customer-facing storefront
- `apps/backend` - REST API server

### Shared Packages

- `packages/config` - Shared configuration utilities
- `packages/router` - Centralized routing logic
- `packages/store` - Redux store configuration
- `packages/ui` - Shared UI component library

## 🚀 Tech Stack

### Frontend
- React 19.x with TypeScript
- Vite for build tooling
- Material-UI (MUI) for components
- AG Grid for data tables
- Formik + Joi for forms
- Redux Toolkit for state
- Tailwind CSS for styling
- Jest for testing

### Backend
- Express.js with TypeScript
- Prisma ORM
- MySQL database
- JWT authentication
- Winston logging
- Express security middleware

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- MySQL

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd e-com-with-vite-react-node
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp apps/backend/example.env apps/backend/.env
cp apps/frontend/example.env apps/frontend/.env
cp apps/frontend-user/example.env apps/frontend-user/.env
```

4. Initialize the database:
```bash
cd apps/backend
pnpm prisma migrate dev
pnpm prisma db seed
```

5. Start the development servers:
```bash
pnpm dev
```

## 🌟 Features

### Completed
- ✅ User authentication & authorization
- ✅ Role-based access control
- ✅ Product management
- ✅ Category management
- ✅ Order management
- ✅ Address management
- ✅ Admin dashboard

### In Progress
- 🔄 Shopping cart
- 🔄 Checkout process
- 🔄 User profiles
- 🔄 Product reviews
- 🔄 Payment integration

### Planned
- 📅 Multi-language support
- 📅 Dark/Light theme
- 📅 Advanced search
- 📅 Real-time tracking
- 📅 Analytics dashboard

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run frontend tests
pnpm --filter frontend test

# Run backend tests
pnpm --filter backend test
```

## 📦 Project Structure

```
├── apps/
│   ├── backend/          # Express.js API server
│   ├── frontend/         # Admin dashboard
│   └── frontend-user/    # Customer storefront
├── packages/
│   ├── config/          # Shared configuration
│   ├── router/          # Routing logic
│   ├── store/           # State management
│   └── ui/              # UI components
└── package.json         # Root package.json
```

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Security middleware (helmet, cors, rate-limiting)
- Input validation
- Secure password hashing

## 🚥 API Documentation

API documentation is available at `/api/docs` when running the backend server in development mode.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Turborepo](https://turbo.build/repo) for the build system
- [Vite](https://vitejs.dev/) for frontend tooling
- [Material-UI](https://mui.com/) for UI components
- [Prisma](https://www.prisma.io/) for database ORM
