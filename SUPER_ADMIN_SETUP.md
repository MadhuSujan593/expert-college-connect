# Super Admin Dashboard Setup

## Overview
The Super Admin dashboard provides comprehensive user management and platform monitoring capabilities for administrators.

## Features

### Dashboard Statistics
- Total users count
- College admins count
- Experts count
- Total applications
- Total requirements
- Total ratings
- Recent users (last 30 days)
- Active users (last 30 days)

### User Management
- View all users with pagination
- Filter users by role (USER, EXPERT, COLLEGE_ADMIN, SUPER_ADMIN)
- Search users by name, email, or phone
- Filter by active/inactive status
- View detailed user information
- Toggle user active/inactive status
- Delete users (soft delete)
- View user activity logs

### System Overview
- User statistics by role
- Application statistics
- Requirement statistics
- Rating statistics with averages

## Setup Instructions

### 1. Database Setup
The SUPER_ADMIN role is already included in the database schema. No additional migrations are needed.

### 2. Create Super Admin User
Run the following command to create a Super Admin user:

```bash
cd backend
node create-super-admin.js
```

This will create a Super Admin user with:
- Email: `superadmin@expertcollegeconnect.com`
- Password: `admin123`
- Role: `SUPER_ADMIN`

**⚠️ Important: Change the password after first login!**

### 3. Backend Setup
The Super Admin module is already integrated into the backend:
- `backend/src/super-admin/super-admin.module.ts`
- `backend/src/super-admin/super-admin.service.ts`
- `backend/src/super-admin/super-admin.controller.ts`

### 4. Frontend Setup
The Super Admin dashboard is available at `/dashboard/super-admin` and includes:
- Dashboard with statistics cards
- User management table with filtering
- User details modal
- Pagination controls

### 5. Access Control
- Only users with `SUPER_ADMIN` role can access the dashboard
- Protected by JWT authentication and role-based guards
- Automatic redirection to appropriate dashboard based on user role

## API Endpoints

### Dashboard
- `GET /api/v1/super-admin/dashboard` - Get dashboard statistics
- `GET /api/v1/super-admin/overview` - Get system overview

### User Management
- `GET /api/v1/super-admin/users` - Get all users with filtering
- `GET /api/v1/super-admin/users/:id` - Get user details
- `PUT /api/v1/super-admin/users/:id/toggle-status` - Toggle user status
- `DELETE /api/v1/super-admin/users/:id` - Delete user
- `GET /api/v1/super-admin/users/:id/activity` - Get user activity

### Statistics
- `GET /api/v1/super-admin/stats/users-by-role` - Get user counts by role
- `GET /api/v1/super-admin/recent-activity` - Get recent platform activity

## Usage

1. **Login as Super Admin**: Use the created credentials to log in
2. **Access Dashboard**: Navigate to `/dashboard/super-admin`
3. **Manage Users**: Use the user management table to view, filter, and manage users
4. **Monitor Activity**: View dashboard statistics and user activity

## Security Notes

- Super Admin has full access to all user data
- User deletion is soft delete (users are marked as deleted, not permanently removed)
- All actions are logged and can be audited
- Role-based access control ensures only Super Admins can access these features

## Troubleshooting

### Common Issues

1. **Cannot access Super Admin dashboard**
   - Ensure user has SUPER_ADMIN role
   - Check JWT token is valid
   - Verify backend is running

2. **User management not loading**
   - Check database connection
   - Verify Prisma client is working
   - Check backend logs for errors

3. **Permission denied errors**
   - Ensure user is authenticated
   - Verify user has correct role
   - Check JWT token expiration

### Support
For technical support or questions about the Super Admin dashboard, please check the backend logs and ensure all dependencies are properly installed.




