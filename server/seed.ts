import { db } from './db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('🌱 Starting seed...');

    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, 'ppga.eng.br@gmail.com'))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Ppga@2026', 10);

    // Create admin user
    await db.insert(users).values({
      name: 'Renato Araujo',
      email: 'ppga.eng.br@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'APPROVED',
      linkedType: null,
      linkedId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: ppga.eng.br@gmail.com');
    console.log('🔐 Password: Ppga@2026');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seed().then(() => {
  console.log('✨ Seed completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Seed error:', error);
  process.exit(1);
});
