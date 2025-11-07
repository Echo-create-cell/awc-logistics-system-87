# AWC Logistics System - cPanel Deployment Guide

## 📋 Overview
This guide will walk you through deploying the AWC Logistics System to your cPanel hosting at africaworldcargo.com.

---

## 🔐 System User Credentials

After deployment, use these credentials to log in:

### Admin Account
- **Email:** admin@awclogistics.com
- **Password:** password
- **Role:** Administrator (Full system access)

### Sales Director Account
- **Email:** john@awclogistics.com
- **Password:** password
- **Role:** Sales Director

### Sales Agent Account
- **Email:** mike@awclogistics.com
- **Password:** password
- **Role:** Sales Agent

### Finance Officer Account
- **Email:** lisa@awclogistics.com
- **Password:** password
- **Role:** Finance Officer

### Partner Account
- **Email:** alex@partner.com
- **Password:** password
- **Role:** Partner

> ⚠️ **IMPORTANT SECURITY:** Change all passwords immediately after first login!

---

## 📦 Pre-Deployment Preparation

### Step 1: Build the React Frontend
On your local machine, run:

```bash
npm install
npm run build
```

This creates a `dist` folder with your production-ready React app.

---

## 🚀 cPanel Deployment Steps

### Step 2: Access Your cPanel
1. Go to: https://www.africaworldcargo.com:2083
2. Log in with your cPanel credentials

---

### Step 3: Create MySQL Database

#### 3.1 Create Database
1. In cPanel, go to **MySQL® Databases**
2. Under "Create New Database":
   - Database Name: `awc_logistics_db`
   - Click **Create Database**
3. Note the full database name (usually: `cpanelusername_awc_logistics_db`)

#### 3.2 Create Database User
1. Scroll to "MySQL Users" section
2. Create new user:
   - Username: `awc_user`
   - Password: Generate a strong password
   - Click **Create User**
3. **SAVE THESE CREDENTIALS** - you'll need them!

#### 3.3 Add User to Database
1. Scroll to "Add User to Database"
2. Select:
   - User: `awc_user`
   - Database: `awc_logistics_db`
3. Click **Add**
4. Select **ALL PRIVILEGES**
5. Click **Make Changes**

#### 3.4 Import Database Schema
1. Go to **phpMyAdmin** in cPanel
2. Select your database (`cpanelusername_awc_logistics_db`)
3. Click **Import** tab
4. Click **Choose File**
5. Select `database/awc_logistics_enhanced.sql` from your project
6. Click **Go** at the bottom
7. Wait for "Import has been successfully finished"

---

### Step 4: Upload Backend Files (PHP)

#### 4.1 Access File Manager
1. In cPanel, open **File Manager**
2. Navigate to `public_html` (or your domain's root directory)

#### 4.2 Create Directory Structure
Create these folders:
- `public_html/api/`
- `public_html/api/auth/`
- `public_html/api/quotations/`
- `public_html/api/invoices/`
- `public_html/api/users/`
- `public_html/api/clients/`
- `public_html/config/`

#### 4.3 Upload PHP Files
Upload from your project to cPanel:

**Config Files:**
- `config/database.php` → `public_html/config/database.php`

**API Files:**
- `api/auth/login.php` → `public_html/api/auth/login.php`
- `api/auth/logout.php` → `public_html/api/auth/logout.php`
- `api/auth/session.php` → `public_html/api/auth/session.php`
- `api/quotations/index.php` → `public_html/api/quotations/index.php`
- `api/invoices/index.php` → `public_html/api/invoices/index.php`
- `api/users/index.php` → `public_html/api/users/index.php`
- `api/clients/index.php` → `public_html/api/clients/index.php`

**Root Files:**
- `.htaccess` → `public_html/.htaccess`
- `index.php` → `public_html/index.php`

---

### Step 5: Configure Database Connection

#### 5.1 Edit database.php
1. In File Manager, navigate to `public_html/config/database.php`
2. Right-click → **Edit**
3. Update these values:

```php
<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'cpanelusername_awc_logistics_db'); // Your full database name
define('DB_USER', 'cpanelusername_awc_user'); // Your full username
define('DB_PASS', 'your_database_password'); // Password you created
define('DB_CHARSET', 'utf8mb4');

// CORS settings - UPDATE THIS TO YOUR DOMAIN
define('ALLOWED_ORIGIN', 'https://www.africaworldcargo.com');

// Create database connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch(PDOException $e) {
    http_response_code(500);
    die(json_encode(['error' => 'Database connection failed']));
}
?>
```

4. **Save Changes**

---

### Step 6: Upload React Frontend

#### 6.1 Upload Built Files
1. In File Manager, go to `public_html`
2. Upload ALL files from your local `dist` folder:
   - `index.html`
   - `assets/` folder (contains all JS, CSS)
   - Any other files/folders in `dist`

#### 6.2 Update API Configuration
1. Locate `public_html/assets/index-[hash].js` (the main JS file)
2. If needed, you can edit it to ensure API calls point to:
   - `https://www.africaworldcargo.com/api/`

---

### Step 7: Configure .htaccess for React Router

Create/edit `public_html/.htaccess`:

```apache
# Enable RewriteEngine
RewriteEngine On

# Security headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"

# CORS headers for API
<FilesMatch "\.(php)$">
    Header set Access-Control-Allow-Origin "https://www.africaworldcargo.com"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header set Access-Control-Allow-Credentials "true"
</FilesMatch>

# Handle preflight OPTIONS requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# API routing - don't redirect API calls
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^ - [L]

# React Router - redirect all non-file requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]
```

---

### Step 8: Set Proper Permissions

1. In File Manager, select `public_html` folder
2. Right-click → **Permissions**
3. Set:
   - Folders: `755`
   - Files: `644`
   - PHP files: `644`
4. Apply recursively

---

### Step 9: Configure PHP Settings (if needed)

If you encounter PHP version issues:

1. In cPanel, go to **Select PHP Version**
2. Choose **PHP 7.4** or higher
3. Enable extensions:
   - ✅ pdo
   - ✅ pdo_mysql
   - ✅ json
   - ✅ mbstring
   - ✅ openssl
4. Click **Save**

---

## 🧪 Testing Your Deployment

### Test 1: API Endpoints
Visit these URLs in your browser:

1. **Auth Session Check:**
   ```
   https://www.africaworldcargo.com/api/auth/session.php
   ```
   Should return: `{"authenticated":false}`

2. **Database Connection Test:**
   Create `public_html/test-db.php`:
   ```php
   <?php
   require_once __DIR__ . '/config/database.php';
   echo "Database connected successfully!";
   ?>
   ```
   Visit: https://www.africaworldcargo.com/test-db.php
   Delete this file after testing!

### Test 2: Frontend Application
1. Visit: https://www.africaworldcargo.com
2. You should see the login page
3. Try logging in with admin credentials:
   - Email: `admin@awclogistics.com`
   - Password: `password`

---

## 🔧 Troubleshooting

### Issue: "Database connection failed"
**Solution:**
- Verify database credentials in `config/database.php`
- Check database name includes cPanel prefix
- Confirm user has ALL PRIVILEGES

### Issue: "404 Not Found" for API calls
**Solution:**
- Check `.htaccess` file exists in `public_html`
- Verify `RewriteEngine On` is present
- Check Apache mod_rewrite is enabled (contact hosting support)

### Issue: CORS errors in browser console
**Solution:**
- Update `ALLOWED_ORIGIN` in `config/database.php`
- Ensure domain matches exactly (with/without www)
- Check `.htaccess` CORS headers

### Issue: React Router 404s on refresh
**Solution:**
- Verify `.htaccess` redirect rules
- Check all `dist` files uploaded correctly
- Ensure `index.html` exists in root

### Issue: Session not persisting
**Solution:**
- Check PHP session settings in cPanel
- Verify cookies are allowed for your domain
- Check browser console for cookie errors

---

## 🔒 Post-Deployment Security Checklist

### Immediate Actions:
1. ✅ Change all default user passwords
2. ✅ Remove `test-db.php` if created
3. ✅ Verify `.htaccess` security headers
4. ✅ Enable HTTPS/SSL certificate in cPanel
5. ✅ Backup database regularly

### Recommended Security:
1. **Enable SSL:**
   - In cPanel → **SSL/TLS Status**
   - Enable for your domain
   - Force HTTPS redirect

2. **Set Strong Database Password:**
   - Use 16+ characters
   - Mix uppercase, lowercase, numbers, symbols

3. **Restrict PHP File Access:**
   - Only allow execution in necessary directories
   - Block direct access to `config/` folder

4. **Regular Backups:**
   - Use cPanel backup feature
   - Schedule weekly database exports
   - Keep off-site copies

---

## 📞 Support Resources

### cPanel Documentation:
- https://docs.cpanel.net/

### PHP Version Issues:
- Contact your hosting provider to enable required PHP extensions

### SSL Certificate:
- Use cPanel's free AutoSSL or Let's Encrypt

### Database Issues:
- Check phpMyAdmin for error logs
- Review MySQL error logs in cPanel

---

## 🎉 Deployment Complete!

Your AWC Logistics System should now be live at:
**https://www.africaworldcargo.com**

### Next Steps:
1. Log in as admin
2. Change all default passwords
3. Test all features:
   - Create quotations
   - Generate invoices
   - Manage users
   - Run reports
4. Train your team on the new system

---

## 📋 Quick Reference

### Production URLs:
- **Frontend:** https://www.africaworldcargo.com
- **API Base:** https://www.africaworldcargo.com/api/
- **cPanel:** https://www.africaworldcargo.com:2083

### Database Info:
- **Host:** localhost
- **Database:** cpanelusername_awc_logistics_db
- **User:** cpanelusername_awc_user

### Default Admin:
- **Email:** admin@awclogistics.com
- **Password:** password (CHANGE THIS!)

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-07  
**System:** AWC Logistics Management System
