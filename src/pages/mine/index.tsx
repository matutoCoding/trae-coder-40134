import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import LevelBadge from '@/components/LevelBadge';
import QuotaProgress from '@/components/QuotaProgress';
import { LEVEL_CONFIG } from '@/types/member';
import type { MemberLevel } from '@/types/member';
import styles from './index.module.scss';

const ALL_LEVELS: MemberLevel[] = ['basic', 'silver', 'gold', 'platinum'];

const MinePage: React.FC = () => {
  const { member, bookings, changeLevel } = useAppStore();
  const levelConfig = LEVEL_CONFIG[member.level];
  const [showLevelModal, setShowLevelModal] = useState(false);

  const currentIndex = ALL_LEVELS.indexOf(member.level);

  const totalBookings = bookings.filter(
    b => b.memberId === member.id && b.status !== 'cancelled'
  ).length;

  const completedBookings = bookings.filter(
    b => b.memberId === member.id && b.status === 'completed'
  ).length;

  const handleLevelHistory = () => {
    Taro.navigateTo({ url: '/pages/levelHistory/index' });
  };

  const handleAssessment = () => {
    Taro.navigateTo({ url: '/pages/assessment/index' });
  };

  const handleBookingHistory = () => {
    Taro.switchTab({ url: '/pages/booking/index' });
  };

  const handleOpenLevelModal = () => {
    setShowLevelModal(true);
  };

  const handleCloseLevelModal = () => {
    setShowLevelModal(false);
  };

  const handleChangeLevel = (newLevel: MemberLevel) => {
    if (newLevel === member.level) {
      setShowLevelModal(false);
      return;
    }
    const targetIndex = ALL_LEVELS.indexOf(newLevel);
    const isUpgrade = targetIndex > currentIndex;
    const targetConfig = LEVEL_CONFIG[newLevel];

    let carryOverHint = '';
    if (isUpgrade) {
      const carryOver = Math.round(member.remainingQuota * (targetConfig.weeklyQuota / levelConfig.weeklyQuota) * 10) / 10;
      carryOverHint = `升级后额度为${targetConfig.weeklyQuota}h/周，剩余${member.remainingQuota}h按比例结转为${carryOver}h`;
    } else {
      if (newLevel === 'basic') {
        carryOverHint = `降级至基础会员，额度为${targetConfig.weeklyQuota}h/周，剩余额度将清零`;
      } else {
        const maxCarry = Math.round(targetConfig.weeklyQuota * 0.5 * 10) / 10;
        carryOverHint = `降级后额度为${targetConfig.weeklyQuota}h/周，剩余额度结转上限为${maxCarry}h`;
      }
    }

    Taro.showModal({
      title: isUpgrade ? '确认升级' : '确认降级',
      content: carryOverHint,
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          changeLevel(newLevel);
          console.info('[Mine] 等级变更', { from: member.level, to: newLevel });
          Taro.showToast({ title: isUpgrade ? '升级成功' : '降级成功', icon: 'success' });
          setShowLevelModal(false);
        }
      },
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.profileCard}>
        <Image
          className={styles.avatar}
          src={member.avatar}
          mode="aspectFill"
        />
        <View className={styles.profileInfo}>
          <Text className={styles.profileName}>{member.name}</Text>
          <View className={styles.profileLevel}>
            <LevelBadge level={member.level} size="medium" />
          </View>
          <Text className={styles.profileDate}>
            入会时间：{member.joinDate}
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>额度概览</Text>
        <View className={styles.quotaCard}>
          <QuotaProgress
            used={member.usedQuota}
            total={member.weeklyQuota}
            label="本周练习额度"
          />
          <View className={styles.levelInfo}>
            <Text className={styles.levelLabel}>当前等级</Text>
            <Text className={styles.levelQuota} style={{ color: levelConfig.color }}>
              {levelConfig.label}（{levelConfig.weeklyQuota}h/周）
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>会员等级</Text>
        <View className={styles.levelCard}>
          {ALL_LEVELS.map((lv) => {
            const cfg = LEVEL_CONFIG[lv];
            const isActive = lv === member.level;
            const lvIndex = ALL_LEVELS.indexOf(lv);
            const isUpgrade = lvIndex > currentIndex;
            return (
              <View
                key={lv}
                className={classnames(
                  styles.levelRow,
                  isActive && styles.levelRowActive
                )}
                onClick={() => !isActive && handleChangeLevel(lv)}
              >
                <View className={styles.levelRowLeft}>
                  <View className={styles.levelDot} style={{ background: cfg.color }} />
                  <Text className={styles.levelName} style={{ color: isActive ? cfg.color : '#1A1A2E' }}>
                    {cfg.label}
                  </Text>
                  <Text className={styles.levelWeekQuota}>{cfg.weeklyQuota}h/周</Text>
                </View>
                {isActive ? (
                  <Text className={styles.levelCurrent}>当前</Text>
                ) : (
                  <Text
                    className={classnames(
                      styles.levelAction,
                      isUpgrade ? styles.levelUpgrade : styles.levelDowngrade
                    )}
                  >
                    {isUpgrade ? '升级' : '降级'}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>功能菜单</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={handleLevelHistory}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>📋</Text>
              <Text className={styles.menuLabel}>等级变更记录</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleAssessment}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>🥁</Text>
              <Text className={styles.menuLabel}>节奏考核</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleBookingHistory}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>📅</Text>
              <Text className={styles.menuLabel}>预约记录</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>练习统计</Text>
        <View className={styles.summaryCard}>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>累计预约</Text>
            <Text className={styles.summaryValue}>{totalBookings}次</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>已完成</Text>
            <Text className={styles.summaryValue}>{completedBookings}次</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>当前等级</Text>
            <Text className={styles.summaryValue} style={{ color: levelConfig.color }}>
              {levelConfig.label}
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>等级有效期</Text>
            <Text className={styles.summaryValue}>{member.currentLevelSince} 起</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MinePage;
