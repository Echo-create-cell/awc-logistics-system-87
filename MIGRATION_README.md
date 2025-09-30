# AWC Logistics - Supabase to MySQL Migration Guide

## Overview
This project has been configured to run with **both React and PHP** in a hybrid architecture, migrating from Supabase to MySQL.

## System Architecture

### Backend (PHP + MySQL)
- **Database**: MySQL (using `awc_logistics_db` schema)
- **API**: RESTful PHP endpoints in `/api` folder
- **Authentication**: PHP session-based authentication
- **Location**: All PHP files in root directory

### Frontend (React)
- **Framework**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API
- **Location**: All files in `/src` directory

---

## Setup Instructions

### 1. Database Setup

#### Import the MySQL Schema
```bash
mysql -u root -p < database/awc_logistics_enhanced.sql
```

#### Update Database Credentials
Edit `config/database.php` and update:
```php
private $host = "localhost";        // Your MySQL host
private $db_name = "awc_logistics_db";  // Database name
private $username = "root";          // MySQL username
private $password = "";              // MySQL password
```

### 2. Web Server Configuration

#### Apache Configuration
Create a `.htaccess` file in the root directory:
```apache
# Enable CORS for React app
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"

# PHP API routing
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/$1 [L]
```

#### Enable PHP Sessions
Ensure `session.save_path` is set in your `php.ini`:
```ini
session.save_path = "/tmp"
session.gc_maxlifetime = 1440
```

### 3. Update API Configuration

Edit `src/config/api.ts` and update the API base URL:

```typescript
// For local development
export const API_BASE_URL = 'http://localhost/api';

// For production
export const API_BASE_URL = 'https://yourdomain.com/api';
```

### 4. Install Frontend Dependencies

```bash
npm install
# or
bun install
```

### 5. Start Development Servers

#### PHP Server (Backend)
```bash
# Option 1: Using Apache/Nginx
# Place project in web root (htdocs/www)

# Option 2: PHP Built-in Server
php -S localhost:8000
```

#### React Dev Server (Frontend)
```bash
npm run dev
# or
bun run dev
```

---

## API Endpoints

### Authentication
- **POST** `/api/auth/login.php` - User login
- **POST** `/api/auth/logout.php` - User logout
- **GET** `/api/auth/session.php` - Check session status

### Quotations
- **GET** `/api/quotations/index.php` - Get all quotations
- **POST** `/api/quotations/index.php` - Create quotation
- **PUT** `/api/quotations/index.php` - Update quotation
- **DELETE** `/api/quotations/index.php?id={id}` - Delete quotation

### Invoices
- **GET** `/api/invoices/index.php` - Get all invoices
- **POST** `/api/invoices/index.php` - Create invoice
- **PUT** `/api/invoices/index.php` - Update invoice
- **DELETE** `/api/invoices/index.php?id={id}` - Delete invoice

### Users (Admin only)
- **GET** `/api/users/index.php` - Get all users
- **POST** `/api/users/index.php` - Create user
- **PUT** `/api/users/index.php` - Update user
- **DELETE** `/api/users/index.php?id={id}` - Delete user

### Clients
- **GET** `/api/clients/index.php` - Get all clients
- **POST** `/api/clients/index.php` - Create client
- **PUT** `/api/clients/index.php` - Update client
- **DELETE** `/api/clients/index.php?id={id}` - Delete client

---

## File Structure

```
project-root/
├── api/                          # PHP API endpoints
│   ├── auth/
│   │   ├── login.php
│   │   ├── logout.php
│   │   └── session.php
│   ├── quotations/
│   │   └── index.php
│   ├── invoices/
│   │   └── index.php
│   ├── users/
│   │   └── index.php
│   └── clients/
│       └── index.php
├── config/
│   └── database.php              # MySQL connection config
├── database/
│   └── awc_logistics_enhanced.sql  # MySQL schema
├── src/                          # React frontend
│   ├── components/
│   ├── hooks/
│   │   ├── usePHPQuotations.ts   # PHP API hook for quotations
│   │   └── usePHPInvoices.ts     # PHP API hook for invoices
│   ├── contexts/
│   │   └── AuthContext.tsx       # Updated for PHP auth
│   ├── config/
│   │   └── api.ts                # API configuration
│   └── ...
├── MIGRATION_README.md           # This file
└── README.md
```

---

## Default Users

After importing the MySQL schema, these users will be available:

| Email | Password | Role |
|-------|----------|------|
| admin@awclogistics.com | password | admin |
| john@awclogistics.com | password | sales_director |
| mike@awclogistics.com | password | sales_agent |
| lisa@awclogistics.com | password | finance_officer |
| alex@partner.com | password | partner |

**Note**: The default password is hashed as `password`. You can change this by running:
```php
echo password_hash('your_password', PASSWORD_DEFAULT);
```

---

## CORS Configuration

### For Local Development
If you encounter CORS errors, make sure:

1. **PHP files have CORS headers**:
```php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
```

2. **React dev server proxy** (in `vite.config.ts`):
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});
```

### For Production
Configure your web server (Apache/Nginx) to handle CORS headers properly.

---

## Troubleshooting

### Issue: "Database connection failed"
- Check MySQL is running: `sudo service mysql status`
- Verify credentials in `config/database.php`
- Ensure database exists: `SHOW DATABASES;`

### Issue: "Unauthorized" errors
- Check PHP sessions are working: `<?php session_start(); var_dump($_SESSION); ?>`
- Verify session cookie is being set in browser dev tools
- Ensure `session.cookie_domain` in php.ini matches your domain

### Issue: CORS errors
- Add CORS headers to all PHP files
- Check browser console for specific CORS error
- Use browser extension like "CORS Unblock" for local development

### Issue: React app can't connect to PHP API
- Verify `API_BASE_URL` in `src/config/api.ts`
- Check PHP server is running
- Test API directly: `curl http://localhost:8000/api/auth/session.php`

---

## Migration Checklist

- [ ] Import MySQL schema
- [ ] Update database credentials in `config/database.php`
- [ ] Configure web server (Apache/Nginx)
- [ ] Update `API_BASE_URL` in `src/config/api.ts`
- [ ] Install npm dependencies
- [ ] Start PHP server
- [ ] Start React dev server
- [ ] Test login functionality
- [ ] Test quotations CRUD
- [ ] Test invoices CRUD
- [ ] Test user management (admin)

---

## Security Recommendations

1. **Change default passwords** for all users
2. **Use HTTPS** in production
3. **Enable SQL injection protection** (PDO prepared statements - already implemented)
4. **Implement rate limiting** on login endpoint
5. **Set secure session cookies**:
```php
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);  // Only if using HTTPS
```

---

## Next Steps

1. Test all functionality in development
2. Deploy to production server
3. Configure production database
4. Set up SSL certificates
5. Configure domain DNS
6. Monitor error logs

---

## Support

For issues or questions, refer to:
- PHP documentation: https://www.php.net/docs.php
- React documentation: https://react.dev/
- MySQL documentation: https://dev.mysql.com/doc/
