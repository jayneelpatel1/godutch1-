import { createActivity } from './activityService';
import { useAuthStore } from '@/store/authStore';

export async function testCreateActivity() {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) {
    console.error('[testActivity] No user logged in');
    return;
  }

  console.log('[testActivity] Creating test activity for user:', userId);

  const result = await createActivity({
    userId,
    type: 'group_created',
    title: 'Test Activity',
    description: 'This is a test activity to verify the activity system works',
    metadata: { test: true },
  });

  if (result.error) {
    console.error('[testActivity] Failed:', result.error);
  } else {
    console.log('[testActivity] Success! Activity created:', result.activity);
  }
}
