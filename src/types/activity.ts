export type ActivityType =
  | 'expense_created'
  | 'expense_updated'
  | 'expense_deleted'
  | 'group_created'
  | 'group_deleted'
  | 'member_added'
  | 'settlement_made';

export interface Activity {
  id: string;
  userId: string;
  groupId?: string;
  groupName?: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityInput {
  userId: string;
  groupId?: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}
