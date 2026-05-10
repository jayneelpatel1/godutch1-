export type ActivityType =
  | 'expense_added'
  | 'expense_edited'
  | 'expense_created'
  | 'expense_updated'
  | 'expense_deleted'
  | 'settlement'
  | 'settlement_made'
  | 'settlement_deleted'
  | 'member_joined'
  | 'member_added'
  | 'member_left'
  | 'group_created'
  | 'group_deleted';

/** Maps a logical activity type to the DB-compatible type */
export function mapToDbType(type: string): string {
  const map: Record<string, string> = {
    expense_created: 'expense_added',
    expense_updated: 'expense_edited',
    expense_deleted: 'expense_added',
    group_created: 'member_joined',
    group_deleted: 'member_left',
    member_added: 'member_joined',
    settlement_made: 'settlement',
    settlement_deleted: 'settlement',
  };
  return map[type] || type;
}

export interface Activity {
  id: string;
  userId: string;
  groupId?: string;
  type: ActivityType;
  description: string;
  createdAt: string;
}

export interface ActivityInput {
  userId: string;
  groupId?: string;
  type: ActivityType;
  description: string;
}
