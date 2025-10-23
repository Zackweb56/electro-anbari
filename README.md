# Electro Anbari Store - Laptop Store Management System

A professional Next.js application for managing a laptop store with MongoDB Atlas integration and admin authentication.

## Features

- 🔐 **Admin Authentication** - Secure login system for store administrators
- 📊 **Admin Dashboard** - Comprehensive dashboard with statistics and quick actions
- 🛒 **Product Management** - Add, edit, and manage laptop products
- 📦 **Inventory Management** - Track stock levels and low stock alerts
- 📈 **Order Management** - Process and track customer orders
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🚀 **Next.js 15** - Latest Next.js features with App Router
- 🗄️ **MongoDB Atlas** - Cloud database with Mongoose ODM

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: NextAuth.js with JWT
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd electro-anbari-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your configuration:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/electro-anbari-store?retryWrites=true&w=majority
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```

4. **Set up MongoDB Atlas**
   - Create a new cluster on MongoDB Atlas
   - Create a database user
   - Whitelist your IP address
   - Get your connection string and update `MONGODB_URI`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Set up admin account**
   - Visit `http://localhost:3000/admin/setup`
   - Create your admin account
   - Login at `http://localhost:3000/admin/login`

## Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── admin/             # Admin pages
│   │   ├── dashboard/     # Admin dashboard
│   │   ├── login/         # Admin login
│   │   └── setup/         # Admin setup
│   ├── api/               # API routes
│   │   ├── admin/         # Admin API endpoints
│   │   └── auth/          # Authentication API
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── providers/         # Context providers
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── auth.js            # NextAuth configuration
│   ├── mongodb.js         # MongoDB connection
│   └── utils.js           # Helper functions
├── models/                # Mongoose models
│   ├── Admin.js           # Admin user model
│   ├── Brand.js           # Brand model
│   ├── Category.js        # Category model
│   ├── Order.js           # Order model
│   ├── Product.js         # Product model
│   └── Stock.js           # Stock model
└── middleware.js          # Next.js middleware
```

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints
- `POST /api/admin/login` - Admin login
- `POST /api/admin/setup` - Create admin account

### Admin Routes
- `/admin/login` - Admin login page
- `/admin/setup` - Admin setup page
- `/admin/dashboard` - Admin dashboard

## Database Models

### Admin
- `name` - Admin's full name
- `email` - Admin's email (unique)
- `password` - Hashed password
- `role` - Admin role (admin/superadmin)

### Product
- `name` - Product name
- `description` - Product description
- `price` - Product price
- `comparePrice` - Compare at price
- `images` - Product images array
- `brand` - Brand reference
- `category` - Category reference
- `specifications` - Laptop specifications
- `features` - Product features array
- `sku` - Product SKU (unique)
- `isActive` - Product status
- `isFeatured` - Featured product flag

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Protected admin routes
- Input validation and sanitization
- Secure MongoDB connection

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- ESLint configuration included
- Prettier recommended
- Component-based architecture
- Custom hooks for reusable logic

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email admin@electroanbari.com or create an issue in the repository.

---

**Electro Anbari Store** - Your trusted partner for premium electronics 🚀