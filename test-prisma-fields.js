// Test script to verify Prisma client field availability
const { PrismaClient } = require('@prisma/client');

async function testPrismaFields() {
  const prisma = new PrismaClient();
  
  console.log('=== PRISMA CLIENT FIELD VERIFICATION ===\n');
  
  try {
    // Test 1: Check if we can select the problematic fields
    console.log('Test 1: Attempting to select defaultDuration and allowedDurations...');
    
    const testQuery = {
      where: { email: 'test@example.com' }, // Use a non-existent email to avoid actual data
      select: {
        id: true,
        email: true,
        name: true,
        defaultDuration: true,
        allowedDurations: true,
      }
    };
    
    console.log('Query structure:', JSON.stringify(testQuery, null, 2));
    
    // This should fail if the fields are not recognized by the client
    const result = await prisma.user.findUnique(testQuery);
    console.log('✅ Query executed successfully (no user found, but fields are recognized)');
    console.log('Result:', result);
    
  } catch (error) {
    console.log('❌ Query failed with error:');
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
  }
  
  // Test 2: Check available fields on the User model
  console.log('\nTest 2: Checking Prisma client User model structure...');
  try {
    // Get the Prisma client's internal field definitions
    const userFields = Object.keys(prisma.user.fields || {});
    console.log('Available User fields in Prisma client:', userFields);
    
    const hasDefaultDuration = userFields.includes('defaultDuration');
    const hasAllowedDurations = userFields.includes('allowedDurations');
    
    console.log('defaultDuration field present:', hasDefaultDuration ? '✅' : '❌');
    console.log('allowedDurations field present:', hasAllowedDurations ? '✅' : '❌');
    
  } catch (error) {
    console.log('Could not access field information:', error.message);
  }
  
  await prisma.$disconnect();
}

testPrismaFields().catch(console.error);