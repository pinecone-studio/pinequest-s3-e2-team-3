"use client";

import { useState, useMemo, useRef } from "react";
import { ExamChart }        from "./Examchart";
import { StudentGradeList } from "./StudentGradeList";
import { QuestionDetail }   from "./QuestionDetail";
import {
  useGetQuestionsForSessionQuery,
  useGetStudentAnswersQuery,
  useGetStudentsByClassQuery,
} from "@/gql/graphql";
import { getTopHard, calcClassAvg } from "./mock";
import type { Student, Question, QuestionStat, HardQuestion, MaterialTabProps } from "./mock";

export const MaterialTab = ({
  classId,
  className = "",
  examSessionId,
  examId,
}: MaterialTabProps) => {

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: questionsData, loading: qLoading } = useGetQuestionsForSessionQuery({
    variables: { examId: examId! },
    skip: !examId,
    fetchPolicy: "cache-and-network",
  });

  const { data: answersData, loading: aLoading } = useGetStudentAnswersQuery({
    variables: { sessionId: examSessionId, examId },
    skip: !examSessionId && !examId,
    fetchPolicy: "cache-and-network",
  });

  const { data: studentsData, loading: sLoading } = useGetStudentsByClassQuery({
    variables: { classId: classId! },
    skip: !classId,
    fetchPolicy: "cache-and-network",
  });

  // ── Transform ──────────────────────────────────────────────────────────────
  const questions: Question[] = useMemo(() => {
    return (questionsData?.questions ?? []).map((q, i) => ({
      id:           q.id,
      no:           i + 1,
      text:         q.question,
      score:        1,
      options:      q.answers,
      correct:      q.correctIndex,
      variation:    q.variation,
      attachmentUrl: q.attachmentUrl ?? null,
    }));
  }, [questionsData?.questions]);

  const students: Student[] = useMemo(() => {
    const rawStudents = studentsData?.studentsByClass ?? [];
    const rawAnswers  = answersData?.studentAnswers   ?? [];
    const rawQs       = questionsData?.questions      ?? [];

    if (!rawQs.length) {
      return rawStudents.map((s) => ({ id: s.id, name: s.name, score: 0, variant: "—" }));
    }

    const correctByQId      = new Map(rawQs.map((q) => [q.id, q.correctIndex]));
    const answersByStudent  = new Map<string, typeof rawAnswers>();
    for (const ans of rawAnswers) {
      if (!ans.studentId) continue;
      if (!answersByStudent.has(ans.studentId)) answersByStudent.set(ans.studentId, []);
      answersByStudent.get(ans.studentId)!.push(ans);
    }

    return rawStudents.map((s) => {
      const myAnswers = answersByStudent.get(s.id) ?? [];
      const correct   = myAnswers.filter(
        (a) => a.questionId && correctByQId.get(a.questionId) === a.answerIndex,
      ).length;
      const score = rawQs.length > 0 ? Math.round((correct / rawQs.length) * 100) : 0;

      const variantCounts = new Map<string, number>();
      for (const a of myAnswers) {
        const v = rawQs.find((q) => q.id === a.questionId)?.variation ?? "А";
        variantCounts.set(v, (variantCounts.get(v) ?? 0) + 1);
      }
      const variant = [...variantCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "А";

      return { id: s.id, name: s.name, score, variant };
    });
  }, [studentsData?.studentsByClass, answersData?.studentAnswers, questionsData?.questions]);

  const qStats: QuestionStat[] = useMemo(() => {
    const rawAnswers = answersData?.studentAnswers ?? [];
    const rawQs      = questionsData?.questions    ?? [];
    if (!rawQs.length) return [];

    const correctByQId = new Map(rawQs.map((q) => [q.id, q.correctIndex]));
    const wrongCount   = new Map<string, number>();
    for (const ans of rawAnswers) {
      if (!ans.questionId) continue;
      const correct = correctByQId.get(ans.questionId);
      if (correct !== undefined && ans.answerIndex !== correct) {
        wrongCount.set(ans.questionId, (wrongCount.get(ans.questionId) ?? 0) + 1);
      }
    }

    return rawQs.map((q, i) => ({
      q:     `${q.variation ?? "А"}-${i + 1}`,
      wrong: wrongCount.get(q.id) ?? 0,
    }));
  }, [answersData?.studentAnswers, questionsData?.questions]);

  const classAvg = useMemo(() => calcClassAvg(students), [students]);

  const [topHard]           = useState<HardQuestion[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const activeStudent = selectedStudent ?? students[0] ?? null;

  const computedTopHard = useMemo(() => {
    if (qStats.length && questions.length) return getTopHard(qStats, questions, 3);
    return topHard;
  }, [qStats, questions, topHard]);

  // ── Loading ────────────────────────────────────────────────────────────────
  const isLoading = qLoading || aLoading || sLoading;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-72 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-96 bg-gray-100 rounded-2xl" />
          <div className="h-96 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!examId) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        Шалгалт сонгогдоогүй байна.
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        Энэ шалгалтанд асуулт олдсонгүй.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Chart */}
      <ExamChart
        className={className}
        topHard={computedTopHard}
        students={students}
        qStats={qStats}
        classAvg={classAvg}
      />

      {/* Students + Questions — equal height, both scrollable */}
      {activeStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ height: 520 }}>
          <StudentGradeList
            students={students}
            selected={activeStudent}
            onSelect={setSelectedStudent}
            className={className}
            examTitle="Явцын шалгалт"
          />
          <QuestionDetail
            student={activeStudent}
            questions={questions}
            qStats={qStats}
            studentAnswers={answersData?.studentAnswers ?? []}
            classInfo={className}
          />
        </div>
      )}

      {/*
      ── AI SECTIONS COMMENTED OUT ─────────────────────────────────────────────

      <HardQuestionAccordion ... />
      <AIReportCards ... />

      ─────────────────────────────────────────────────────────────────────── */}

    </div>
  );
};
