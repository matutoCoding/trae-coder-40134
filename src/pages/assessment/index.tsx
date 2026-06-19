import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import { getAssessmentStatusText } from '@/utils';
import type { Assessment, AssessmentStatus } from '@/types/assessment';
import styles from './index.module.scss';

const AssessmentPage: React.FC = () => {
  const { assessments, member, addAssessment } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [bpmTarget, setBpmTarget] = useState('');
  const [bpmActual, setBpmActual] = useState('');
  const [accuracy, setAccuracy] = useState('');
  const [examiner, setExaminer] = useState('');

  const myAssessments = assessments
    .filter(a => a.memberId === member.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const statusClass: Record<string, string> = {
    passed: styles.assessPassed,
    failed: styles.assessFailed,
    pending: styles.assessPending,
  };

  const handleOpenForm = () => {
    setShowForm(true);
    setBpmTarget('');
    setBpmActual('');
    setAccuracy('');
    setExaminer('');
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handleSubmit = () => {
    const target = Number(bpmTarget);
    const actual = Number(bpmActual);
    const acc = Number(accuracy);

    if (!bpmTarget || !bpmActual || !accuracy || !examiner) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    if (isNaN(target) || isNaN(actual) || isNaN(acc)) {
      Taro.showToast({ title: '请输入有效数字', icon: 'none' });
      return;
    }

    if (acc < 0 || acc > 100) {
      Taro.showToast({ title: '准确率应在0-100之间', icon: 'none' });
      return;
    }

    let status: AssessmentStatus = 'pending';
    let note = '';
    if (acc >= 80 && Math.abs(actual - target) <= 5) {
      status = 'passed';
      note = '节奏稳定，准确率达标';
    } else if (acc >= 60) {
      status = 'passed';
      note = '基本达标，仍有提升空间';
    } else {
      status = 'failed';
      note = '准确率不足，需加强练习';
    }

    if (Math.abs(actual - target) > 10) {
      note = `速度偏差较大(目标${target}/实际${actual})，需调整`;
    }

    const newAssessment: Assessment = {
      id: `AS${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      date: dayjs().format('YYYY-MM-DD'),
      bpmTarget: target,
      bpmActual: actual,
      accuracy: acc,
      status,
      examiner,
      note,
    };

    addAssessment(newAssessment);
    console.info('[Assessment] 考核登记', newAssessment);

    Taro.showToast({ title: '考核登记成功', icon: 'success' });
    setShowForm(false);
  };

  return (
    <View className={styles.page}>
      <Text className={styles.title}>节奏考核记录</Text>

      {showForm && (
        <View className={styles.formCard}>
          <Text className={styles.formTitle}>📝 登记考核</Text>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>目标BPM</Text>
            <Input
              className={styles.formInput}
              type="number"
              placeholder="请输入目标BPM"
              value={bpmTarget}
              onInput={(e) => setBpmTarget(e.detail.value)}
            />
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>实际BPM</Text>
            <Input
              className={styles.formInput}
              type="number"
              placeholder="请输入实际BPM"
              value={bpmActual}
              onInput={(e) => setBpmActual(e.detail.value)}
            />
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>准确率(%)</Text>
            <Input
              className={styles.formInput}
              type="digit"
              placeholder="请输入0-100之间的数值"
              value={accuracy}
              onInput={(e) => setAccuracy(e.detail.value)}
            />
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>考核人</Text>
            <Input
              className={styles.formInput}
              placeholder="请输入考核人姓名"
              value={examiner}
              onInput={(e) => setExaminer(e.detail.value)}
            />
          </View>

          <View className={styles.formActions}>
            <View className={styles.cancelBtn} onClick={handleCancelForm}>
              <Text className={styles.cancelBtnText}>取消</Text>
            </View>
            <View className={styles.submitBtn} onClick={handleSubmit}>
              <Text className={styles.submitBtnText}>提交</Text>
            </View>
          </View>
        </View>
      )}

      {!showForm && (
        <View className={styles.registerBtn} onClick={handleOpenForm}>
          <Text className={styles.registerBtnText}>📝 登记考核</Text>
        </View>
      )}

      <Text className={styles.listTitle}>考核历史</Text>
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
    </View>
  );
};

export default AssessmentPage;
