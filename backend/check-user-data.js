const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserData() {
  try {
    console.log('🔍 Checking user and expert profile data...');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
      }
    });

    console.log('📋 Users found:', users.length);
    users.forEach(user => {
      console.log(`👤 User: ${user.email}`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Full Name: ${user.fullName}`);
      console.log(`   - Phone: ${user.phone}`);
      console.log(`   - Role: ${user.role}`);
      console.log('---');
    });

    // Get expert profiles
    const expertProfiles = await prisma.expertprofile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
          }
        }
      }
    });

    console.log('📋 Expert profiles found:', expertProfiles.length);
    expertProfiles.forEach(profile => {
      console.log(`🎓 Expert Profile: ${profile.user.email}`);
      console.log(`   - User Full Name: ${profile.user.fullName}`);
      console.log(`   - User Phone: ${profile.user.phone}`);
      console.log(`   - Primary Expertise: ${profile.primaryExpertise}`);
      console.log(`   - Experience: ${profile.experience}`);
      console.log(`   - Location: ${profile.location}`);
      console.log(`   - Bio: ${profile.bio}`);
      console.log(`   - Hourly Rate: ${profile.hourlyRate}`);
      console.log(`   - Profile Picture: ${profile.profilePicture}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserData();
