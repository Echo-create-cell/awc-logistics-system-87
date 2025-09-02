# AWC Logistics Professional Suite - System User Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [User Credentials](#user-credentials)
3. [Role-Based Access Control](#role-based-access-control)
4. [System Features by Role](#system-features-by-role)
5. [Core Functionalities](#core-functionalities)
6. [User Interface Navigation](#user-interface-navigation)
7. [Security Features](#security-features)
8. [System Workflows](#system-workflows)

## System Overview

AWC Logistics Professional Suite is a comprehensive logistics management system designed to streamline quotation management, invoice generation, financial reporting, and user administration for Africa World Cargo (AWC) Logistics operations.

### Key Benefits
- **Role-based access control** with 6 distinct user types
- **Automated quotation-to-invoice workflow**
- **Real-time notifications and activity monitoring**
- **Comprehensive financial reporting**
- **Document management system**
- **Multi-currency support (USD primary)**
- **Secure authentication with Supabase**

## User Credentials

### Test/Demo Accounts

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | n.solange@africaworldcargo.com | Action@AWC | Full System Access |
| **Sales Director** | i.arnold@africaworldcargo.com | Director@AWC | Sales Management |
| **Sales Agent** | a.benon@africaworldcargo.com | Agent@AWC | Quotation Creation |
| **Sales Agent** | n.mariemerci@africaworldcargo.com | Agent2@AWC | Quotation Creation |
| **Finance Officer** | u.epiphanie@africaworldcargo.com | Finance@AWC | Financial Management |
| **Partner** | k.peter@africaworldcargo.com | Partner@AWC | Read-Only Access |

## Role-Based Access Control

### 1. Admin (Full Access)
- **Dashboard**: User activity monitoring and system logs
- **User Management**: Create, edit, delete users
- **Quotation Approvals**: Approve/reject all quotations
- **Invoice Management**: View and manage all invoices
- **Documents**: Full document access
- **Financial Reports**: Complete financial analytics
- **Settings**: System configuration

### 2. Sales Director
- **Dashboard**: Recent pending quotations overview
- **My Quotations**: View all quotations in system
- **Create Quotation**: Full quotation creation capabilities
- **Invoices**: Generate invoices from approved quotations
- **Reports**: Quotation performance reports

### 3. Sales Agent
- **Dashboard**: Personal quotation metrics
- **Approved Quotations**: View only approved quotations
- **Invoices**: View invoices related to their quotations

### 4. Finance Officer
- **Dashboard**: Financial metrics and KPIs
- **Financial Reports**: Comprehensive financial analytics
- **Invoice Management**: Full invoice management capabilities

### 5. Partner
- **Dashboard**: Business analytics and metrics
- **View Quotations**: Read-only quotation access
- **View Invoices**: Read-only invoice access
- **Documents**: Access to shared documents
- **Financial Reports**: Limited financial reporting

## System Features by Role

### Dashboard Features

#### Admin Dashboard
- **User Activity Monitor**: Real-time user activity tracking
- **System Logs**: Comprehensive system activity logs
- **Performance Metrics**: System-wide KPIs

#### Sales Director/Agent Dashboard
- **Recent Quotations**: Latest pending quotations
- **Quick Actions**: Fast access to create new quotations
- **Performance Summary**: Personal/team metrics

#### Finance Officer Dashboard
- **Monthly Revenue**: Current month financial performance
- **Pending Invoices**: Outstanding invoice summary
- **Overdue Tracking**: Overdue invoice alerts

#### Partner Dashboard
- **Business Analytics**: Partnership performance metrics
- **Data Filtering**: Advanced data export capabilities
- **Financial Insights**: Partnership financial reports

### Quotation Management

#### Creation Process
1. **Client Information**: Company details, contact person, TIN
2. **Shipment Details**: 
   - Freight Mode: Air/Sea/Road Freight
   - Request Type: Import/Export/Re-Import/Project/Local
   - Cargo Description and Volume
   - Origin and Destination
3. **Commodity Management**: Multi-commodity support with individual rates
4. **Pricing Calculation**: Automatic profit calculation and percentage
5. **Follow-up Scheduling**: Built-in follow-up date tracking

#### Approval Workflow
- **Pending Status**: Initial quotation state
- **Admin/Sales Director Review**: Approval or rejection process
- **Won/Lost Status**: Final quotation outcome
- **Rejection with Feedback**: Draft rejection for modifications

### Invoice Generation

#### Features
- **One-Time Generation**: Prevents duplicate invoices per quotation
- **Automatic Numbering**: Sequential invoice number generation
- **Multi-Item Support**: Multiple commodities per invoice
- **Tax Calculation**: Automated TVA/VAT calculations
- **Payment Tracking**: Due date and payment status monitoring

#### Invoice Details
- Client information pre-filled from quotation
- Delivery and validity dates
- AWB number tracking
- Payment conditions
- Subtotal, tax, and total calculations

### Financial Reports

#### Available Reports
- **Revenue Analytics**: Monthly/quarterly revenue tracking
- **Quotation Performance**: Win/loss ratios and trends
- **Invoice Status Reports**: Payment tracking and overdue analysis
- **User Activity Reports**: Performance by user/role
- **Partner Analytics**: Partnership performance metrics

#### Export Capabilities
- CSV export for all data tables
- Printable report formats
- Custom date range filtering
- Multi-currency reporting

### Document Management

#### Features
- **Secure Storage**: Role-based document access
- **Version Control**: Document history tracking
- **Category Management**: Organized document structure
- **Partner Sharing**: Controlled partner document access

## User Interface Navigation

### Sidebar Navigation
- **Professional Logo**: AWC Logistics branding with animations
- **Role Indicator**: Clear display of current user role and name
- **Menu Items**: Role-specific navigation options
- **Notification Panel**: Real-time system notifications
- **Quick Logout**: Secure session termination

### Table Management
- **Enhanced Search**: Multi-column search capabilities
- **Advanced Filtering**: Status, date, and custom filters
- **Pagination**: Efficient large dataset handling
- **Export Functions**: CSV download capabilities
- **Responsive Design**: Mobile and desktop optimization

### Modal Systems
- **Quotation Modal**: Full-featured quotation creation/editing
- **Invoice Modal**: Comprehensive invoice management
- **User Management**: Admin user creation and editing
- **Rejection Modal**: Structured rejection with feedback

## Security Features

### Authentication
- **Supabase Integration**: Enterprise-grade authentication
- **Role-Based Security**: Database-level access control
- **Session Management**: Secure token handling
- **Password Protection**: Encrypted credential storage

### Data Protection
- **Row Level Security (RLS)**: Database-level access control
- **API Security**: Authenticated API endpoints
- **Input Validation**: Comprehensive data validation
- **Audit Logging**: Complete activity tracking

### Access Control
- **User-Specific Data**: Users see only their relevant data
- **Admin Oversight**: Full administrative visibility
- **Partner Restrictions**: Limited read-only access
- **Finance Separation**: Dedicated financial user access

## System Workflows

### Quotation to Invoice Workflow
1. **Sales Agent** creates quotation with client and shipment details
2. **Admin/Sales Director** reviews and approves/rejects quotation
3. **Approved quotations** become available for invoice generation
4. **Sales Director/Agent** generates invoice from approved quotation
5. **System prevents** duplicate invoice generation
6. **Finance Officer** manages invoice payments and tracking

### User Management Workflow
1. **Admin** creates new user accounts with appropriate roles
2. **System** automatically sets up user profiles and permissions
3. **Users** receive credentials and access based on assigned role
4. **Admin** monitors user activity and can modify permissions
5. **Audit trail** maintains complete user activity history

### Document Management Workflow
1. **Authorized users** upload documents to appropriate categories
2. **System** applies role-based access controls
3. **Partners** access shared documents based on permissions
4. **Admin** manages document organization and access rights
5. **Version control** maintains document history

### Notification System
- **Real-time notifications** for quotation approvals/rejections
- **Overdue invoice alerts** for finance tracking
- **User activity notifications** for administrative oversight
- **System status updates** for maintenance and updates

## Best Practices

### For Sales Team
- Complete all required fields in quotations
- Use clear cargo descriptions and accurate volumes
- Set realistic follow-up dates
- Review profit margins before submission

### For Admin Users
- Regularly monitor user activity logs
- Review pending quotations promptly
- Maintain accurate user role assignments
- Monitor system performance metrics

### For Finance Officers
- Track invoice due dates actively
- Update payment status promptly
- Generate regular financial reports
- Monitor overdue accounts

### For Partners
- Use data export features for analysis
- Review available documents regularly
- Provide feedback through appropriate channels
- Utilize financial reports for planning

---

## Support and Training

For additional training or support:
- Contact system administrator: n.solange@africaworldcargo.com
- Technical support: Available through admin panel
- User training: Schedule through sales director
- System updates: Automatic deployment with notifications

---

*AWC Logistics Professional Suite - Streamlining Global Logistics Operations*