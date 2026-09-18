'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function recordShare(platform: 'WHATSAPP' | 'FACEBOOK' | 'NATIVE') {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('You must be signed in to earn rewards!');
  }

  try {
    // Check if already shared on this platform
    const existingShare = await db.userShare.findUnique({
      where: {
        userId_platform: {
          userId: user.id,
          platform: platform,
        },
      },
    });

    if (existingShare) {
      return { success: false, message: 'You have already earned the reward for this platform!' };
    }

    // Record the share
    await db.userShare.create({
      data: {
        userId: user.id,
        platform: platform,
      },
    });

    // Calculate total discount (1% per platform)
    const totalShares = await db.userShare.count({
      where: { userId: user.id },
    });

    revalidatePath('/');
    revalidatePath('/products');

    return {
      success: true,
      discount: totalShares * 1, // 1% per share
      message: `Awesome! You've earned a 1% discount for sharing on ${platform.toLowerCase()}!`
    };
  } catch (error) {
    console.error('Error recording share:', error);
    throw new Error('Something went wrong recording your share.');
  }
}
