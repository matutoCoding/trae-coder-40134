import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { getAssessmentStatusText } from '@/utils';
import styles from './index.module.scss';

const AssessmentPage: React.FC = () => {
  const { assessments, member } = useAppStore();

  const myAssessments = assessments
    .filter(a => a.memberId === member.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const statusClass = {
    passed: styles.assessPassed,
    failed: styles.assessFailed,
    pending: styles.assessPending,
  };

  const handleRegister = () => {
    Taro.showToast({ title: '考核登记已提交', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <Text className={styles.title}>节奏考核记录</Text>
      {myAssessments.length > 0 ? (
        myAssessments.map(assessment => (
          <View key={assessment.id} className={styles.assessCard}>
            <View className={styles.assessHeader}>
              <Text className={styles.assessDate}>{assessment.date}</Text>
              <View className={classnames(styles.assessStatus, statusClass[assessment.status])}>
                <Text>{getAssessmentStatusText(assessment.status)}</Text>
              </View>
            </View>
            <View className={styles.assessRow}>
              <Text className={styles.assessLabel}>目标BPM</Text>
              <Text className={styles.assessValue}>{assessment.bpmTarget}</Text>
            </View>
            <View className={styles.assessRow}>
              <Text className={styles.assessLabel}>实际BPM</Text>
              <Text className={styles.assessValue}>{assessment.bpmActual}</Text>
            </View>
            <View className={styles.assessRow}>
              <Text className={styles.assessLabel}>准确率</Text>
              <Text className={styles.assessValue}>{assessment.accuracy}%</Text>
            </View>
            <View className={styles.assessRow}>
              <Text className={styles.assessLabel}>考核人</Text>
              <Text className={styles.assessValue}>{assessment.examiner}</Text>
            </View>
            <Text className={styles.assessNote}>{assessment.note}</Text>
          </View>
        ))
      ) : (
        <View className={styles.emptyTip}>
          <Text className={styles.emptyText}>暂无考核记录</Text>
        </View>
      )}
      <View className={styles.registerBtn} onClick={handleRegister}>
        <Text className={styles.registerBtnText}>📝 登记考核</Text>
      </View>
    </View>
  );
};

export default AssessmentPage;
