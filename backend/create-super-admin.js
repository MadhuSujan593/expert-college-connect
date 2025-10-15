const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('Creating Super Admin user...');
    
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });
    
    if (existingSuperAdmin) {
      console.log('Super Admin already exists:', existingSuperAdmin.email);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        id: require('crypto').randomUUID(),
        email: 'superadmin@expertcollegeconnect.com',
        fullName: 'Super Administrator',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        updatedAt: new Date(),
      }
    });
    
    console.log('✅ Super Admin created successfully!');
    console.log('Email:', superAdmin.email);
    console.log('Password: admin123');
    console.log('Role:', superAdmin.role);
    console.log('\n⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();










