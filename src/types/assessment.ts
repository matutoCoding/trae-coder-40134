export type AssessmentStatus = 'passed' | 'failed' | 'pending';

export interface Assessment {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  bpmTarget: number;
  bpmActual: number;
  accuracy: number;
  status: AssessmentStatus;
  examiner: string;
  note: string;
}
