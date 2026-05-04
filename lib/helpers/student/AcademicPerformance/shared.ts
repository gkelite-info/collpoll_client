export type AcademicPerformanceSubject = {
  subjectId: number;
  label: string;
};

export type AcademicPerformanceStats = {
  attendanceBySubject: Map<number, { attended: number; total: number }>;
  assignmentScoresBySubject: Map<number, { obtained: number; total: number }>;
  quizzesBySubject: Map<number, { obtained: number; total: number }>;
  discussionScoresBySubject: Map<number, { obtained: number; total: number }>;
  weightageConfigs: AcademicPerformanceWeightageConfig[];
};

export type AcademicPerformanceWeightageConfig = {
  collegeSubjectId: number;
  faculty_weightage_items:
    | {
        label: string;
        percentage: number;
      }[]
    | {
        label: string;
        percentage: number;
      }
    | null;
};

export type AcademicPerformanceDatum = {
  subject: string;
  value: number;
  full: number;
};

type ProgressWeights = {
  attendance: number;
  assignments: number;
  quiz: number;
  discussion: number;
};

const emptyWeights: ProgressWeights = {
  attendance: 0,
  assignments: 0,
  quiz: 0,
  discussion: 0,
};

const normalizeWeightageLabel = (label: string) => label.trim().toLowerCase();

export const buildProgressWeightsFromConfigs = (
  configs: AcademicPerformanceWeightageConfig[],
): ProgressWeights => {
  if (!configs.length) return { ...emptyWeights };

  const totals = { ...emptyWeights };
  let matchedConfigs = 0;

  for (const config of configs) {
    const items = Array.isArray(config.faculty_weightage_items)
      ? config.faculty_weightage_items
      : config.faculty_weightage_items
        ? [config.faculty_weightage_items]
        : [];

    const bucket = { ...emptyWeights };
    let hasRecognized = false;

    for (const item of items) {
      const normalized = normalizeWeightageLabel(item.label);

      if (normalized.includes("attendance")) {
        bucket.attendance += item.percentage;
        hasRecognized = true;
      } else if (normalized.includes("assignment")) {
        bucket.assignments += item.percentage;
        hasRecognized = true;
      } else if (normalized.includes("quiz")) {
        bucket.quiz += item.percentage;
        hasRecognized = true;
      } else if (normalized.includes("discussion")) {
        bucket.discussion += item.percentage;
        hasRecognized = true;
      }
    }

    if (!hasRecognized) continue;

    totals.attendance += bucket.attendance;
    totals.assignments += bucket.assignments;
    totals.quiz += bucket.quiz;
    totals.discussion += bucket.discussion;
    matchedConfigs += 1;
  }

  if (!matchedConfigs) return { ...emptyWeights };

  return {
    attendance: totals.attendance / matchedConfigs,
    assignments: totals.assignments / matchedConfigs,
    quiz: totals.quiz / matchedConfigs,
    discussion: totals.discussion / matchedConfigs,
  };
};

const percentage = (stats: { obtained: number; total: number }) =>
  stats.total > 0 ? Math.round((stats.obtained / stats.total) * 100) : null;

export function calculateAcademicPerformance(
  subjects: AcademicPerformanceSubject[],
  stats: AcademicPerformanceStats,
): AcademicPerformanceDatum[] {
  return subjects.map((subject) => {
    const attendanceStats = stats.attendanceBySubject.get(subject.subjectId) ?? {
      attended: 0,
      total: 0,
    };
    const assignmentStats = stats.assignmentScoresBySubject.get(
      subject.subjectId,
    ) ?? { obtained: 0, total: 0 };
    const quizStats = stats.quizzesBySubject.get(subject.subjectId) ?? {
      obtained: 0,
      total: 0,
    };
    const discussionStats = stats.discussionScoresBySubject.get(
      subject.subjectId,
    ) ?? { obtained: 0, total: 0 };

    const attendancePct =
      attendanceStats.total > 0
        ? Math.round((attendanceStats.attended / attendanceStats.total) * 100)
        : null;
    const assignmentPct = percentage(assignmentStats);
    const quizPct = percentage(quizStats);
    const discussionPct = percentage(discussionStats);

    const subjectConfigs = stats.weightageConfigs.filter(
      (config) => config.collegeSubjectId === subject.subjectId,
    );
    const weights = buildProgressWeightsFromConfigs(subjectConfigs);
    const totalConfiguredWeight =
      weights.attendance +
      weights.assignments +
      weights.quiz +
      weights.discussion;

    let value = 0;

    if (totalConfiguredWeight > 0) {
      if (attendancePct !== null && weights.attendance > 0) {
        value += (attendancePct / 100) * weights.attendance;
      }
      if (assignmentPct !== null && weights.assignments > 0) {
        value += (assignmentPct / 100) * weights.assignments;
      }
      if (quizPct !== null && weights.quiz > 0) {
        value += (quizPct / 100) * weights.quiz;
      }
      if (discussionPct !== null && weights.discussion > 0) {
        value += (discussionPct / 100) * weights.discussion;
      }

      value = Math.round(value);
    }

    return {
      subject: subject.label,
      value,
      full: 100,
    };
  });
}
