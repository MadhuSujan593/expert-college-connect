import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.application.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.collegeprofile.deleteMany();
  await prisma.expertprofile.deleteMany();
  await prisma.expertskill.deleteMany();
  await prisma.service.deleteMany();
  await prisma.workexperience.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleared');

  // Create College Admin Users
  console.log('🏫 Creating college admin accounts...');
  
  const collegeAdmin1 = await prisma.user.create({
    data: {
      id: 'college-admin-1',
      email: 'admin@mit.edu',
      phone: '+1234567890',
      password: await bcrypt.hash('password123', 10),
      fullName: 'Dr. Sarah Johnson',
      isEmailVerified: true,
      isPhoneVerified: true,
      role: 'COLLEGE_ADMIN',
      profileImage: null,
      timezone: 'America/New_York',
      language: 'en',
      updatedAt: new Date()
    }
  });

  const collegeAdmin2 = await prisma.user.create({
    data: {
      id: 'college-admin-2',
      email: 'admin@stanford.edu',
      phone: '+1234567891',
      password: await bcrypt.hash('password123', 10),
      fullName: 'Prof. Michael Chen',
      isEmailVerified: true,
      isPhoneVerified: true,
      role: 'COLLEGE_ADMIN',
      profileImage: null,
      timezone: 'America/Los_Angeles',
      language: 'en',
      updatedAt: new Date()
    }
  });

  const collegeAdmin3 = await prisma.user.create({
    data: {
      id: 'college-admin-3',
      email: 'admin@harvard.edu',
      phone: '+1234567892',
      password: await bcrypt.hash('password123', 10),
      fullName: 'Dr. Emily Rodriguez',
      isEmailVerified: true,
      isPhoneVerified: true,
      role: 'COLLEGE_ADMIN',
      profileImage: null,
      timezone: 'America/New_York',
      language: 'en',
      updatedAt: new Date()
    }
  });

  console.log('✅ College admin accounts created');

  // Create College Profiles
  console.log('🏛️ Creating college profiles...');
  
  const mitProfile = await prisma.collegeprofile.create({
    data: {
      id: 'mit-profile-1',
      userId: collegeAdmin1.id,
      institutionName: 'Massachusetts Institute of Technology',
      contactPersonName: 'Dr. Sarah Johnson',
      institutionType: 'UNIVERSITY',
      accreditation: 'New England Commission of Higher Education',
      website: 'https://mit.edu',
      address: '77 Massachusetts Avenue',
      city: 'Cambridge',
      state: 'MA',
      country: 'USA',
      postalCode: '02139',
      phone: '+1-617-253-1000',
      logoUrl: null,
      description: 'Leading research university in science, technology, and engineering',
      isProfileComplete: true,
      isVerified: true,
      verificationDate: new Date(),
      updatedAt: new Date()
    }
  });

  const stanfordProfile = await prisma.collegeprofile.create({
    data: {
      id: 'stanford-profile-1',
      userId: collegeAdmin2.id,
      institutionName: 'Stanford University',
      contactPersonName: 'Prof. Michael Chen',
      institutionType: 'UNIVERSITY',
      accreditation: 'WASC Senior College and University Commission',
      website: 'https://stanford.edu',
      address: '450 Serra Mall',
      city: 'Stanford',
      state: 'CA',
      country: 'USA',
      postalCode: '94305',
      phone: '+1-650-723-2300',
      logoUrl: null,
      description: 'Prestigious private research university in Silicon Valley',
      isProfileComplete: true,
      isVerified: true,
      verificationDate: new Date(),
      updatedAt: new Date()
    }
  });

  const harvardProfile = await prisma.collegeprofile.create({
    data: {
      id: 'harvard-profile-1',
      userId: collegeAdmin3.id,
      institutionName: 'Harvard University',
      contactPersonName: 'Dr. Emily Rodriguez',
      institutionType: 'UNIVERSITY',
      accreditation: 'New England Commission of Higher Education',
      website: 'https://harvard.edu',
      address: '1350 Massachusetts Avenue',
      city: 'Cambridge',
      state: 'MA',
      country: 'USA',
      postalCode: '02138',
      phone: '+1-617-495-1000',
      logoUrl: null,
      description: 'Ivy League university with global reputation for excellence',
      isProfileComplete: true,
      isVerified: true,
      verificationDate: new Date(),
      updatedAt: new Date()
    }
  });

  console.log('✅ College profiles created');

  // Create Expert Users
  console.log('👨‍💼 Creating expert accounts...');
  
  const expert1 = await prisma.user.create({
    data: {
      id: 'expert-1',
      email: 'john.doe@tech.com',
      phone: '+1234567893',
      password: await bcrypt.hash('password123', 10),
      fullName: 'John Doe',
      isEmailVerified: true,
      isPhoneVerified: true,
      role: 'EXPERT',
      profileImage: null,
      timezone: 'America/New_York',
      language: 'en',
      updatedAt: new Date()
    }
  });

  const expert2 = await prisma.user.create({
    data: {
      id: 'expert-2',
      email: 'jane.smith@ai.com',
      phone: '+1234567894',
      password: await bcrypt.hash('password123', 10),
      fullName: 'Jane Smith',
      isEmailVerified: true,
      isPhoneVerified: true,
      role: 'EXPERT',
      profileImage: null,
      timezone: 'America/Los_Angeles',
      language: 'en',
      updatedAt: new Date()
    }
  });

  const expert3 = await prisma.user.create({
    data: {
      id: 'expert-3',
      email: 'alex.wong@data.com',
      phone: '+1234567895',
      password: await bcrypt.hash('password123', 10),
      fullName: 'Alex Wong',
      isEmailVerified: true,
      isPhoneVerified: true,
      role: 'EXPERT',
      profileImage: null,
      timezone: 'America/Chicago',
      language: 'en',
      updatedAt: new Date()
    }
  });

  console.log('✅ Expert accounts created');

  // Create Expert Profiles
  console.log('👨‍💻 Creating expert profiles...');
  
  const expertProfile1 = await prisma.expertprofile.create({
    data: {
      id: 'expert-profile-1',
      userId: expert1.id,
      jobTitle: 'Senior Software Engineer',
      company: 'Google',
      experience: '8 years',
      location: 'New York, NY',
      website: 'https://johndoe.dev',
      primaryExpertise: 'Software Development',
      bio: 'Full-stack developer with expertise in React, Node.js, and cloud technologies. Passionate about creating scalable web applications.',
      hourlyRate: 150.00,
      availableFor: ['CONSULTING', 'WORKSHOP', 'MENTORING'],
      preferredMode: 'REMOTE',
      resumeUrl: null,
      profilePicture: null,
      isProfileComplete: true,
      isVerified: true,
      verificationDate: new Date(),
      updatedAt: new Date()
    }
  });

  const expertProfile2 = await prisma.expertprofile.create({
    data: {
      id: 'expert-profile-2',
      userId: expert2.id,
      jobTitle: 'AI Research Scientist',
      company: 'OpenAI',
      experience: '6 years',
      location: 'San Francisco, CA',
      website: 'https://janesmith.ai',
      primaryExpertise: 'Artificial Intelligence',
      bio: 'Leading researcher in machine learning and natural language processing. Published multiple papers in top AI conferences.',
      hourlyRate: 200.00,
      availableFor: ['RESEARCH', 'WORKSHOP', 'GUEST_LECTURE'],
      preferredMode: 'HYBRID',
      resumeUrl: null,
      profilePicture: null,
      isProfileComplete: true,
      isVerified: true,
      verificationDate: new Date(),
      updatedAt: new Date()
    }
  });

  const expertProfile3 = await prisma.expertprofile.create({
    data: {
      id: 'expert-profile-3',
      userId: expert3.id,
      jobTitle: 'Data Science Lead',
      company: 'Microsoft',
      experience: '7 years',
      location: 'Seattle, WA',
      website: 'https://alexwong.data',
      primaryExpertise: 'Data Science',
      bio: 'Experienced data scientist specializing in big data analytics, machine learning, and business intelligence solutions.',
      hourlyRate: 175.00,
      availableFor: ['CONSULTING', 'TRAINING', 'INDUSTRY_PROJECT'],
      preferredMode: 'REMOTE',
      resumeUrl: null,
      profilePicture: null,
      isProfileComplete: true,
      isVerified: true,
      verificationDate: new Date(),
      updatedAt: new Date()
    }
  });

  console.log('✅ Expert profiles created');

  // Create Expert Skills
  console.log('🛠️ Creating expert skills...');
  
  await prisma.expertskill.createMany({
    data: [
      { id: 'skill-1', expertProfileId: expertProfile1.id, skillName: 'React', skillLevel: 'EXPERT' },
      { id: 'skill-2', expertProfileId: expertProfile1.id, skillName: 'Node.js', skillLevel: 'EXPERT' },
      { id: 'skill-3', expertProfileId: expertProfile1.id, skillName: 'TypeScript', skillLevel: 'ADVANCED' },
      { id: 'skill-4', expertProfileId: expertProfile1.id, skillName: 'AWS', skillLevel: 'ADVANCED' },
      
      { id: 'skill-5', expertProfileId: expertProfile2.id, skillName: 'Python', skillLevel: 'EXPERT' },
      { id: 'skill-6', expertProfileId: expertProfile2.id, skillName: 'TensorFlow', skillLevel: 'EXPERT' },
      { id: 'skill-7', expertProfileId: expertProfile2.id, skillName: 'PyTorch', skillLevel: 'ADVANCED' },
      { id: 'skill-8', expertProfileId: expertProfile2.id, skillName: 'NLP', skillLevel: 'EXPERT' },
      
      { id: 'skill-9', expertProfileId: expertProfile3.id, skillName: 'Python', skillLevel: 'EXPERT' },
      { id: 'skill-10', expertProfileId: expertProfile3.id, skillName: 'SQL', skillLevel: 'EXPERT' },
      { id: 'skill-11', expertProfileId: expertProfile3.id, skillName: 'Machine Learning', skillLevel: 'ADVANCED' },
      { id: 'skill-12', expertProfileId: expertProfile3.id, skillName: 'Tableau', skillLevel: 'ADVANCED' }
    ]
  });

  console.log('✅ Expert skills created');

  // Create Sample Requirements
  console.log('📋 Creating sample requirements...');
  
  await prisma.requirement.createMany({
    data: [
      {
        id: 'req-1',
        collegeProfileId: mitProfile.id,
        title: 'Advanced Machine Learning Workshop',
        description: 'We need an expert to conduct a 3-day workshop on advanced machine learning techniques for our computer science students. The workshop should cover deep learning, neural networks, and practical applications.',
        category: 'DATA_SCIENCE_AI',
        subcategory: 'Machine Learning',
        budget: 5000.00,
        budgetType: 'FIXED',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isUrgent: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'req-2',
        collegeProfileId: stanfordProfile.id,
        title: 'Cybersecurity Guest Lecture Series',
        description: 'Looking for a cybersecurity expert to deliver a series of guest lectures on modern security threats, ethical hacking, and defense strategies. This will be part of our cybersecurity course.',
        category: 'CYBERSECURITY',
        subcategory: 'Security',
        budget: 3000.00,
        budgetType: 'FIXED',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        isUrgent: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'req-3',
        collegeProfileId: harvardProfile.id,
        title: 'Data Science Consulting Project',
        description: 'Our business school needs help analyzing student performance data and creating predictive models for academic success. We need a data scientist to work with our faculty on this research project.',
        category: 'DATA_SCIENCE_AI',
        subcategory: 'Data Analysis',
        budget: 8000.00,
        budgetType: 'RANGE',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        isUrgent: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  });

  console.log('✅ Sample requirements created');

  // Create Sample Services
  console.log('🛍️ Creating sample services...');
  
  await prisma.service.createMany({
    data: [
      {
        id: 'service-1',
        expertProfileId: expertProfile1.id,
        title: 'Full-Stack Web Development Consultation',
        description: 'Comprehensive consultation for building scalable web applications. Includes architecture review, technology stack recommendations, and development best practices.',
        category: 'SOFTWARE_DEVELOPMENT',
        subcategory: 'Web Development',
        price: 200.00,
        priceType: 'FIXED',
        duration: 120, // 2 hours
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'service-2',
        expertProfileId: expertProfile2.id,
        title: 'AI Strategy Workshop',
        description: 'Interactive workshop to help organizations understand AI opportunities and create implementation roadmaps. Covers current AI trends and practical applications.',
        category: 'DATA_SCIENCE_AI',
        subcategory: 'AI Strategy',
        price: 500.00,
        priceType: 'FIXED',
        duration: 180, // 3 hours
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'service-3',
        expertProfileId: expertProfile3.id,
        title: 'Data Analytics Training',
        description: 'Customized training program for teams to learn data analysis techniques. Includes hands-on exercises with real datasets and industry best practices.',
        category: 'DATA_SCIENCE_AI',
        subcategory: 'Data Analytics',
        price: 300.00,
        priceType: 'FIXED',
        duration: 240, // 4 hours
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  });

  console.log('✅ Sample services created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Created:');
  console.log('- 3 College Admin accounts');
  console.log('- 3 Expert accounts');
  console.log('- 3 College profiles');
  console.log('- 3 Expert profiles');
  console.log('- 12 Expert skills');
  console.log('- 3 Sample requirements');
  console.log('- 3 Sample services');
  
  console.log('\n🔑 Login Credentials:');
  console.log('College Admins:');
  console.log('- admin@mit.edu / password123');
  console.log('- admin@stanford.edu / password123');
  console.log('- admin@harvard.edu / password123');
  
  console.log('\nExperts:');
  console.log('- john.doe@tech.com / password123');
  console.log('- jane.smith@ai.com / password123');
  console.log('- alex.wong@data.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
