# Electro Anbari Store - Setup Guide

## Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/electro-anbari-store?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (0.0.0.0/0 for development)
5. Get your connection string and update `MONGODB_URI`

### 4. Run the Application

```bash
npm run dev
```

### 5. Set up Admin Account

Visit `http://localhost:3000/admin/setup` and create your admin account.

**OR** use the command line:

```bash
npm run setup-admin
```

This will create an admin with:
- Email: `admin@electroanbari.com`
- Password: `admin123456`

**⚠️ Important: Change the password after first login!**

## Application Structure

### Pages
- `/` - Home page with store information
- `/admin/login` - Admin login page
- `/admin/setup` - Admin account setup
- `/admin/dashboard` - Admin dashboard

### API Endpoints
- `POST /api/admin/setup` - Create admin account
- `POST /api/admin/login` - Admin login
- `GET /api/admin/check` - Check if admin exists
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Database Models
- **Admin** - Store administrators
- **Product** - Laptop products
- **Brand** - Laptop brands
- **Category** - Product categories
- **Order** - Customer orders
- **Stock** - stock management

## Features Implemented

✅ **MongoDB Atlas Connection** - Secure cloud database connection
✅ **Admin Authentication** - NextAuth.js with JWT
✅ **Admin Dashboard** - Statistics and quick actions
✅ **Protected Routes** - Middleware protection for admin routes
✅ **Responsive Design** - Mobile-friendly UI with Tailwind CSS
✅ **Password Security** - bcryptjs hashing
✅ **Error Handling** - Comprehensive error management
✅ **Professional UI** - Modern, clean design

## Next Steps

1. **Add Products** - Implement product management
2. **Order System** - Build order processing
3. **stock Management** - Stock tracking
4. **Customer Portal** - Public-facing store
5. **Payment Integration** - Payment processing
6. **Email Notifications** - Order confirmations

## Troubleshooting

### MongoDB Connection Issues
- Check your connection string
- Verify IP whitelist
- Ensure database user has proper permissions

### Authentication Issues
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain
- Clear browser cookies if needed

### Build Issues
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+ required)
- Clear `.next` folder and rebuild

## Support

For issues or questions:
1. Check the console for error messages
2. Verify environment variables
3. Check MongoDB Atlas connection
4. Review the README.md for detailed information

---

**Ready to go!** 🚀 Your laptop store management system is now set up and ready for development.
