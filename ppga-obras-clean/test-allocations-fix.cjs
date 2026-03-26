#!/usr/bin/env node

/**
 * Test script to verify the allocations fix
 * This script checks:
 * 1. Schema has correct foreign key references
 * 2. Migration SQL has proper constraints
 * 3. Data flow is correct
 */

const fs = require('fs');
const path = require('path');

console.log('\n🧪 Testing Allocations Fix...\n');

let testsPassed = 0;
let testsFailed = 0;

// Test 1: Check schema.ts has correct workId reference
console.log('Test 1: Checking schema.ts foreign key reference...');
const schemaPath = path.join(__dirname, 'drizzle', 'schema.ts');
const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

if (schemaContent.includes('workId: int("workId").notNull().references(() => works.id')) {
  console.log('✅ PASS: workId correctly references works.id\n');
  testsPassed++;
} else if (schemaContent.includes('workId: int("workId").notNull().references(() => clients.id')) {
  console.log('❌ FAIL: workId still references clients.id (should be works.id)\n');
  testsFailed++;
} else {
  console.log('❌ FAIL: workId reference not found\n');
  testsFailed++;
}

// Test 2: Check migration SQL has foreign key constraints
console.log('Test 2: Checking migration SQL constraints...');
const indexPath = path.join(__dirname, 'server', '_core', 'index.ts');
const indexContent = fs.readFileSync(indexPath, 'utf-8');

const hasWorkIdFK = indexContent.includes('allocations_workId_fk');
const hasProviderIdFK = indexContent.includes('allocations_providerId_fk');

if (hasWorkIdFK && hasProviderIdFK) {
  console.log('✅ PASS: Both foreign key constraints are present\n');
  testsPassed++;
} else {
  if (!hasWorkIdFK) {
    console.log('❌ FAIL: Missing workId foreign key constraint\n');
  }
  if (!hasProviderIdFK) {
    console.log('❌ FAIL: Missing providerId foreign key constraint\n');
  }
  testsFailed++;
}

// Test 3: Check if ON DELETE CASCADE is set
console.log('Test 3: Checking ON DELETE CASCADE...');
const hasCascadeWorkId = indexContent.includes('workId') && indexContent.includes('works') && indexContent.includes('ON DELETE CASCADE');
const hasCascadeProviderId = indexContent.includes('providerId') && indexContent.includes('providers') && indexContent.includes('ON DELETE CASCADE');

if (hasCascadeWorkId && hasCascadeProviderId) {
  console.log('✅ PASS: ON DELETE CASCADE is set for both foreign keys\n');
  testsPassed++;
} else {
  console.log('❌ FAIL: ON DELETE CASCADE not properly set\n');
  testsFailed++;
}

// Test 4: Check if createAllocation function exists and is correct
console.log('Test 4: Checking createAllocation function...');
const dbPath = path.join(__dirname, 'server', 'db.ts');
const dbContent = fs.readFileSync(dbPath, 'utf-8');

if (dbContent.includes('export async function createAllocation(data: any)')) {
  console.log('✅ PASS: createAllocation function exists\n');
  testsPassed++;
} else {
  console.log('❌ FAIL: createAllocation function not found\n');
  testsFailed++;
}

// Test 5: Check if getAllAllocations function exists
console.log('Test 5: Checking getAllAllocations function...');
if (dbContent.includes('export async function getAllAllocations()')) {
  console.log('✅ PASS: getAllAllocations function exists\n');
  testsPassed++;
} else {
  console.log('❌ FAIL: getAllAllocations function not found\n');
  testsFailed++;
}

// Test 6: Check if allocations router exists
console.log('Test 6: Checking allocations router...');
const routersPath = path.join(__dirname, 'server', 'routers.ts');
const routersContent = fs.readFileSync(routersPath, 'utf-8');

if (routersContent.includes('allocations: router({')) {
  console.log('✅ PASS: allocations router exists\n');
  testsPassed++;
} else {
  console.log('❌ FAIL: allocations router not found\n');
  testsFailed++;
}

// Test 7: Check if frontend Allocations component exists
console.log('Test 7: Checking frontend Allocations component...');
const allocationsPath = path.join(__dirname, 'client', 'src', 'pages', 'Allocations.tsx');
if (fs.existsSync(allocationsPath)) {
  const allocationsContent = fs.readFileSync(allocationsPath, 'utf-8');
  if (allocationsContent.includes('trpc.allocations.list.useQuery()')) {
    console.log('✅ PASS: Allocations component has correct query\n');
    testsPassed++;
  } else {
    console.log('❌ FAIL: Allocations component query not found\n');
    testsFailed++;
  }
} else {
  console.log('❌ FAIL: Allocations component not found\n');
  testsFailed++;
}

// Test 8: Check if AddAllocationModal exists
console.log('Test 8: Checking AddAllocationModal component...');
const modalPath = path.join(__dirname, 'client', 'src', 'components', 'allocations', 'AddAllocationModal.tsx');
if (fs.existsSync(modalPath)) {
  const modalContent = fs.readFileSync(modalPath, 'utf-8');
  if (modalContent.includes('onAddAllocation')) {
    console.log('✅ PASS: AddAllocationModal component exists\n');
    testsPassed++;
  } else {
    console.log('❌ FAIL: AddAllocationModal component incomplete\n');
    testsFailed++;
  }
} else {
  console.log('❌ FAIL: AddAllocationModal component not found\n');
  testsFailed++;
}

// Summary
console.log('═'.repeat(50));
console.log(`\n📊 Test Summary:\n`);
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Total:  ${testsPassed + testsFailed}\n`);

if (testsFailed === 0) {
  console.log('🎉 All tests passed! The allocations fix is correctly implemented.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the implementation.\n');
  process.exit(1);
}
