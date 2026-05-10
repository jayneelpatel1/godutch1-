/**
 * @file Test helper for the activity system.
 * @description Creates a test activity for the currently logged-in user.
 *              Used during development to verify the activity feed works end-to-end.
 */

import { createActivity } from './activityService';
import { useAuthStore } from '@/store/authStore';

export async function testCreateActivity() {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) {
    console.error('[testActivity] No user logged in');
    return;
  }

  const result = await createActivity({
    userId,
    type: 'group_created',
    description: 'Test Activity: This is a test activity to verify the activity system works',
  });

  if (result.error) {
    console.error('[testActivity] Failed:', result.error);
  } else {
    console.log('[testActivity] Success! Activity created:', result.activity);
  }
}
