export type MemberLevel = 'basic' | 'silver' | 'gold' | 'platinum';

export interface Member {
  id: string;
  name: string;
  avatar: string;
  level: MemberLevel;
  weeklyQuota: number;
  usedQuota: number;
  remainingQuota: number;
  joinDate: string;
  currentLevelSince: string;
}

export interface LevelChangeRecord {
  id: string;
  memberId: string;
  fromLevel: MemberLevel;
  toLevel: MemberLevel;
  changeDate: string;
  reason: string;
  quotaBefore: number;
  quotaAfter: number;
  quotaCarryOver: number;
  note: string;
}

export const LEVEL_CONFIG: Record<MemberLevel, { label: string; weeklyQuota: number; color: string }> = {
  basic: { label: '基础会员', weeklyQuota: 2, color: '#8E8EA0' },
  silver: { label: '白银会员', weeklyQuota: 4, color: '#A0AEC0' },
  gold: { label: '黄金会员', weeklyQuota: 8, color: '#F6AD55' },
  platinum: { label: '铂金会员', weeklyQuota: 14, color: '#6C5CE7' },
};
