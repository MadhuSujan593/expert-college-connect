const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSuperAdmin() {
  try {
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: {
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true
      }
    });
    
    console.log('Super Admin users found:');
    superAdmins.forEach(user => {
      console.log(`- Email: ${user.email}`);
      console.log(`- Name: ${user.fullName}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- Active: ${user.isActive}`);
      console.log(`- Email Verified: ${user.isEmailVerified}`);
      console.log(`- Phone Verified: ${user.isPhoneVerified}`);
      console.log('---');
    });
    
    if (superAdmins.length === 0) {
      console.log('No Super Admin users found!');
    }
    
  } catch (error) {
    console.error('Error checking Super Admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperAdmin();


