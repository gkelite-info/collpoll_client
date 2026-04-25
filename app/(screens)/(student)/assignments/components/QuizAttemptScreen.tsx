"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Loader } from "../../calendar/right/timetable";
import { fetchQuestionsWithOptionsByQuizId } from "@/lib/helpers/quiz/quizQuestionAPI";
import toast from "react-hot-toast";
import { saveBulkSubmissionAnswers } from "@/lib/helpers/quiz/quizSubmissionAnswerAPI";
import { getStudentAttemptCount, saveQuizSubmission } from "@/lib/helpers/quiz/quizSubmissionAPI";
import { useStudent } from "@/app/utils/context/student/useStudent";
import { QuizAttemptShimmer } from "./shimmer/QuizAttemptShimmer";
import { fetchQuizById } from "@/lib/helpers/quiz/quizAPI";
import {
  startOrGetQuizSession,
  endQuizSession,
  getSessionStartTime,
} from "@/lib/helpers/quiz/quizSessionAPI";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle } from "@phosphor-icons/react";

// ─── Exit Warning Modal ───────────────────────────────────────────────────────
function QuizExitWarningModal({
  countdown,
  onStay,
  onSubmit,
}: {
  countdown: number;
  onStay: () => void;
  onSubmit: () => void;
}) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white rounded-2xl w-full max-w-[420px] p-8 shadow-2xl border border-gray-100"
        >
          <div className="flex flex-col items-center text-center mt-2">
            {/* ✅ Countdown ring */}
            <div className="relative w-20 h-20 mb-5">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke="#fee2e2"
                  strokeWidth="6"
                />
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / 10)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-red-500">
                  {countdown}
                </span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ⚠️ Don't Switch Tabs!
            </h3>

            <p className="text-[15px] text-gray-500 mb-2 leading-relaxed">
              You switched away from the quiz window. Your quiz will be{" "}
              <span className="font-semibold text-red-500">
                automatically submitted
              </span>{" "}
              in{" "}
              <span className="font-bold text-red-600">{countdown} seconds</span>{" "}
              if you don't return.
            </p>

            <p className="text-xs text-gray-400 mb-8">
              Switching tabs or windows during a quiz is not allowed.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={onSubmit}
                className="flex-1 px-4 py-3 font-semibold text-white rounded-xl bg-red-500 hover:bg-red-600 transition-all cursor-pointer"
              >
                Submit Now
              </button>
              <button
                onClick={onStay}
                className="flex-1 px-4 py-3 font-semibold text-white rounded-xl bg-[#43C17A] hover:bg-green-600 transition-all cursor-pointer"
              >
                Return to Quiz
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Refresh Modal ────────────────────────────────────────────────────────────
function QuizRefreshModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white rounded-2xl w-full max-w-[400px] p-8 shadow-2xl border border-gray-100"
        >
          <div className="flex flex-col items-center text-center mt-2">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5 ring-8 ring-red-50/50">
              <XCircle size={32} weight="duotone" className="text-[#FF2A2A]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Quiz Interrupted
            </h3>
            <p className="text-[15px] text-gray-500 mb-8 leading-relaxed">
              Your quiz session was interrupted due to a{" "}
              <span className="font-semibold text-gray-700">page refresh</span>.
              Your progress has been auto-submitted. Please check your attempted
              quizzes or retry from ongoing quizzes.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={onCancel}
                className="w-full px-4 py-3 font-semibold text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Stay Here
              </button>
              <button
                onClick={onConfirm}
                className="w-full px-4 py-3 font-semibold text-white rounded-xl transition-all bg-[#16284F] hover:bg-opacity-90 shadow-sm shadow-slate-200 cursor-pointer"
              >
                Go to Ongoing Quizzes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Session storage key ──────────────────────────────────────────────────────
const QUIZ_SESSION_KEY = "quiz_in_progress";

// ─── Main component ───────────────────────────────────────────────────────────
function QuizAttemptScreenContent({
  quiz,
  onSubmitSuccess,
}: {
  quiz: any;
  onSubmitSuccess?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, { optionId?: number; writtenAnswer?: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { studentId } = useStudent();

  const [quizMeta, setQuizMeta] = useState<any>(null);
  const maxAttempts = quizMeta?.maxAttempts ?? quiz?.maxAttempts ?? 3;
  const durationMinutes = quizMeta?.durationMinutes ?? quiz?.durationMinutes ?? 30;

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const [showRefreshModal, setShowRefreshModal] = useState(false);

  // ✅ Exit warning modal states
  const [showExitWarningModal, setShowExitWarningModal] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(10);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const answersRef = useRef<Record<number, { optionId?: number; writtenAnswer?: string }>>({});
  const questionsRef = useRef<any[]>([]);
  const attemptCountRef = useRef(0);
  const isSubmittingRef = useRef(false);
  const hasAutoSubmittedRef = useRef(false);
  const isSubmitCalledRef = useRef(false);
  const studentIdRef = useRef(studentId);
  const quizIdRef = useRef(quiz?.id);
  const quizMetaRef = useRef<any>(null);
  const tabSwitchCountRef = useRef(0);

  // ─── Keep refs in sync ────────────────────────────────────────────────────
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { attemptCountRef.current = attemptCount; }, [attemptCount]);
  useEffect(() => { isSubmittingRef.current = isSubmitting; }, [isSubmitting]);
  useEffect(() => { hasAutoSubmittedRef.current = hasAutoSubmitted; }, [hasAutoSubmitted]);
  useEffect(() => { studentIdRef.current = studentId; }, [studentId]);
  useEffect(() => { quizMetaRef.current = quizMeta; }, [quizMeta]);

  // ─── Detect page refresh ──────────────────────────────────────────────────
  useEffect(() => {
    const wasInQuiz = sessionStorage.getItem(QUIZ_SESSION_KEY);
    if (wasInQuiz) {
      sessionStorage.removeItem(QUIZ_SESSION_KEY);
      setShowRefreshModal(true);
      setIsLoading(false);
      return;
    }
    sessionStorage.setItem(QUIZ_SESSION_KEY, "true");
    return () => {
      sessionStorage.removeItem(QUIZ_SESSION_KEY);
    };
  }, []);

  const handleRefreshModalConfirm = useCallback(() => {
    const params = new URLSearchParams();
    params.set("tab", "quiz");
    params.set("quizView", "ongoing");
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname]);

  const handleRefreshModalCancel = useCallback(() => {
    setShowRefreshModal(false);
  }, []);

  // ─── waitForNetwork ───────────────────────────────────────────────────────
  async function waitForNetwork(maxWaitMs = 10000): Promise<boolean> {
    const interval = 500;
    let waited = 0;
    while (waited < maxWaitMs) {
      if (navigator.onLine) return true;
      await new Promise((resolve) => setTimeout(resolve, interval));
      waited += interval;
    }
    return navigator.onLine;
  }

  // ─── handleSubmit via stable ref ──────────────────────────────────────────
  const handleSubmitRef = useRef<(() => Promise<void>) | null>(null);

  handleSubmitRef.current = async () => {
    const currentStudentId = studentIdRef.current;
    const currentQuizId = quizIdRef.current;

    if (!currentStudentId || !currentQuizId) {
      toast.error("Missing student or quiz info");
      return;
    }

    if (isSubmitCalledRef.current) return;
    isSubmitCalledRef.current = true;

    if (isSubmittingRef.current) return;

    // ✅ Wait for network before attempting submission
    toast("Checking connection...", { icon: "⏳", id: "submitting" });
    const isOnline = await waitForNetwork(10000);
    toast.dismiss("submitting");

    if (!isOnline) {
      toast.error("No internet connection. Please reconnect and try again.");
      isSubmitCalledRef.current = false;
      return;
    }

    try {
      setIsSubmitting(true);
      isSubmittingRef.current = true;

      const currentAnswers = answersRef.current;
      const currentQuestions = questionsRef.current;
      const currentAttemptCount = attemptCountRef.current;

      let totalMarksObtained = 0;
      const answersPayload = currentQuestions.map((q) => {
        const answer = currentAnswers[q.questionId];
        const marksPerQuestion =
          quizMetaRef.current?.marksPerQuestion ?? q.marks ?? 1;

        if (q.questionType === "Multiple Choice") {
          const selectedOption = q.quiz_question_options?.find(
            (o: any) => o.optionId === answer?.optionId,
          );
          const isCorrect = selectedOption?.isCorrect ?? false;
          if (isCorrect) totalMarksObtained += marksPerQuestion;
          return {
            questionId: q.questionId,
            selectedOptionId: answer?.optionId ?? null,
            writtenAnswer: null,
            isCorrect,
            marksObtained: isCorrect ? marksPerQuestion : 0,
          };
        } else {
          const correctOption = q.quiz_question_options?.find(
            (o: any) => o.isCorrect === true,
          );
          const isCorrect =
            !!answer?.writtenAnswer &&
            !!correctOption?.optionText &&
            answer.writtenAnswer.trim().toLowerCase() ===
            correctOption.optionText.trim().toLowerCase();
          if (isCorrect) totalMarksObtained += marksPerQuestion;
          return {
            questionId: q.questionId,
            selectedOptionId: null,
            writtenAnswer: answer?.writtenAnswer ?? null,
            isCorrect,
            marksObtained: isCorrect ? marksPerQuestion : 0,
          };
        }
      });

      const submissionResult = await saveQuizSubmission({
        quizId: currentQuizId,
        studentId: currentStudentId,
        totalMarksObtained,
        attemptNumber: currentAttemptCount + 1,
      });

      if (!submissionResult.success || !submissionResult.submissionId) {
        toast.error("Failed to submit quiz");
        isSubmitCalledRef.current = false;
        return;
      }

      await saveBulkSubmissionAnswers(
        submissionResult.submissionId,
        answersPayload,
      );

      await endQuizSession(
        currentQuizId,
        currentStudentId,
        currentAttemptCount + 1,
      );

      sessionStorage.removeItem(QUIZ_SESSION_KEY);
      toast.success("Quiz submitted successfully!");
      onSubmitSuccess?.();
    } catch (err) {
      console.error("handleSubmit error:", err);
      toast.error("Something went wrong");
      isSubmitCalledRef.current = false;
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const triggerSubmit = useCallback(() => {
    handleSubmitRef.current?.();
  }, []);

  // ─── Exit warning handlers ────────────────────────────────────────────────
  const handleExitWarningStay = useCallback(() => {
    setShowExitWarningModal(false);
    setWarningCountdown(10);
    if (warningTimerRef.current) {
      clearInterval(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    window.focus();
  }, []);

  const handleExitWarningSubmit = useCallback(() => {
    setShowExitWarningModal(false);
    setWarningCountdown(10);
    if (warningTimerRef.current) {
      clearInterval(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    hasAutoSubmittedRef.current = true;
    setHasAutoSubmitted(true);
    triggerSubmit();
  }, [triggerSubmit]);

  // ─── Load quiz data ───────────────────────────────────────────────────────
  useEffect(() => {
    if (showRefreshModal) return;
    if (!quiz?.id || !studentId) return;

    async function load() {
      try {
        setIsLoading(true);

        const [quizData, questionsData, count] = await Promise.all([
          fetchQuizById(quiz.id),
          fetchQuestionsWithOptionsByQuizId(quiz.id),
          getStudentAttemptCount(quiz.id, studentId as number),
        ]);

        setQuizMeta(quizData);
        quizMetaRef.current = quizData;
        setQuestions(questionsData);
        questionsRef.current = questionsData;
        setAttemptCount(count);
        attemptCountRef.current = count;

        const resolvedMaxAttempts = quizData?.maxAttempts ?? 3;
        const resolvedDuration = quizData?.durationMinutes ?? 30;

        if (count >= resolvedMaxAttempts) {
          setAlreadyAttempted(true);
          return;
        }

        const session = await startOrGetQuizSession(
          quiz.id,
          studentId as number,
          count + 1,
        );

        const startedAt = new Date(session.startedAt).getTime();
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        const totalSeconds = resolvedDuration * 60;
        const remaining = totalSeconds - elapsed;

        setTimeLeft(remaining <= 0 ? 0 : remaining);
      } catch (err) {
        console.error("load error:", err);
        toast.error("Failed to load quiz");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [quiz?.id, studentId, showRefreshModal]);

  // ─── autoSubmitOnce ───────────────────────────────────────────────────────
  const autoSubmitOnce = useCallback(() => {
    if (hasAutoSubmittedRef.current) return;
    hasAutoSubmittedRef.current = true;
    setHasAutoSubmitted(true);
    triggerSubmit();
  }, [triggerSubmit]);

  // ─── Warning countdown when modal opens ──────────────────────────────────
  useEffect(() => {
    if (!showExitWarningModal) return;

    setWarningCountdown(10);

    warningTimerRef.current = setInterval(() => {
      setWarningCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(warningTimerRef.current!);
          warningTimerRef.current = null;
          setShowExitWarningModal(false);
          hasAutoSubmittedRef.current = true;
          setHasAutoSubmitted(true);
          triggerSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (warningTimerRef.current) {
        clearInterval(warningTimerRef.current);
        warningTimerRef.current = null;
      }
    };
  }, [showExitWarningModal, triggerSubmit]);

  // ─── Timer + Visibility — single effect ──────────────────────────────────
  useEffect(() => {
    if (isLoading || timeLeft === null) return;

    if (timeLeft <= 0) {
      setTimeout(() => autoSubmitOnce(), 0);
      return;
    }

    let hiddenAt: number | null = null;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => autoSubmitOnce(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }

      if (document.visibilityState === "visible") {
        // ✅ Wait briefly for network to reconnect
        await new Promise((resolve) => setTimeout(resolve, 1500));

        try {
          const currentQuizId = quizIdRef.current;
          const currentStudentId = studentIdRef.current;
          const currentAttemptCount = attemptCountRef.current;

          if (!currentQuizId || !currentStudentId) return;

          const startedAtStr = await getSessionStartTime(
            currentQuizId,
            currentStudentId,
            currentAttemptCount + 1,
          );

          if (!startedAtStr) return;

          const resolvedDuration = quizMetaRef.current?.durationMinutes ?? 30;
          const totalSeconds = resolvedDuration * 60;
          const elapsed = Math.floor(
            (Date.now() - new Date(startedAtStr).getTime()) / 1000,
          );
          const remaining = totalSeconds - elapsed;

          if (remaining <= 0) {
            clearInterval(timer);
            clearInterval(pollTimer);
            setTimeLeft(0);
            setTimeout(() => autoSubmitOnce(), 0);
          } else {
            setTimeLeft(remaining);
          }

          hiddenAt = null;
        } catch (err) {
          console.error("visibility recalc error:", err);
        }
      }
    };

    // ✅ Poll every 10s as fallback for lid close
    const pollTimer = setInterval(async () => {
      try {
        const currentQuizId = quizIdRef.current;
        const currentStudentId = studentIdRef.current;
        const currentAttemptCount = attemptCountRef.current;

        if (!currentQuizId || !currentStudentId) return;

        const startedAtStr = await getSessionStartTime(
          currentQuizId,
          currentStudentId,
          currentAttemptCount + 1,
        );

        if (!startedAtStr) return;

        const resolvedDuration = quizMetaRef.current?.durationMinutes ?? 30;
        const totalSeconds = resolvedDuration * 60;
        const elapsed = Math.floor(
          (Date.now() - new Date(startedAtStr).getTime()) / 1000,
        );
        const remaining = totalSeconds - elapsed;

        if (remaining <= 0) {
          clearInterval(timer);
          clearInterval(pollTimer);
          setTimeLeft(0);
          setTimeout(() => autoSubmitOnce(), 0);
        }
      } catch (err) {
        console.error("poll timer error:", err);
      }
    }, 10000);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(timer);
      clearInterval(pollTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoading, timeLeft === null, autoSubmitOnce]);

  // ─── Navigation lock ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;

    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      if (!hasAutoSubmittedRef.current && !isSubmittingRef.current) {
        hasAutoSubmittedRef.current = true;
        setHasAutoSubmitted(true);
        toast("Quiz auto-submitted on back navigation.", { icon: "⚠️" });
        triggerSubmit();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isInput = tag === "input" || tag === "textarea";
      if (
        (e.altKey && e.key === "ArrowLeft") ||
        (!isInput && e.key === "Backspace")
      ) {
        e.preventDefault();
        if (!hasAutoSubmittedRef.current && !isSubmittingRef.current) {
          hasAutoSubmittedRef.current = true;
          setHasAutoSubmitted(true);
          toast("Quiz auto-submitted on navigation.", { icon: "⚠️" });
          triggerSubmit();
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Your quiz is in progress. Leaving will auto-submit.";
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoading, triggerSubmit]);

  useEffect(() => {
    if (isLoading) return;

    const handleWindowBlur = () => {
      if (hasAutoSubmittedRef.current || isSubmittingRef.current) return;

      if (tabSwitchCountRef.current >= 3) {
        hasAutoSubmittedRef.current = true;
        setHasAutoSubmitted(true);
        setTimeout(() => triggerSubmit(), 0);
        return;
      }

      tabSwitchCountRef.current += 1;
      setShowExitWarningModal(true);
    };

    window.addEventListener("blur", handleWindowBlur);
    return () => window.removeEventListener("blur", handleWindowBlur);
  }, [isLoading, triggerSubmit]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const handleOptionChange = (questionId: number, optionId: number) => {
    setAnswers((prev: any) => ({ ...prev, [questionId]: { optionId } }));
  };

  const handleWrittenAnswerChange = (questionId: number, text: string) => {
    setAnswers((prev: any) => ({ ...prev, [questionId]: { writtenAnswer: text } }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const totalSeconds = durationMinutes * 60;
  const timerPercent =
    timeLeft !== null ? (timeLeft / totalSeconds) * 100 : 100;
  const timerColor =
    timerPercent > 50
      ? { bg: "bg-[#182142]", text: "text-[#87cefa]", ring: "border-[#87cefa]" }
      : timerPercent > 20
        ? { bg: "bg-[#7a4a00]", text: "text-yellow-300", ring: "border-yellow-300" }
        : { bg: "bg-[#5c1010]", text: "text-red-400", ring: "border-red-400" };

  const progressCount = Object.keys(answers).length;
  const progressPercentage =
    questions.length > 0 ? (progressCount / questions.length) * 100 : 0;

  // ─── Renders ──────────────────────────────────────────────────────────────
  if (showRefreshModal) {
    return (
      <QuizRefreshModal
        onConfirm={handleRefreshModalConfirm}
        onCancel={handleRefreshModalCancel}
      />
    );
  }

  if (alreadyAttempted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-3 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#D5FFE7] flex items-center justify-center">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-[#282828]">All Attempts Used!</h2>
          <p className="text-sm text-gray-500 text-center">
            You have used all{" "}
            <span className="font-bold text-[#282828]">{maxAttempts} attempts</span>{" "}
            for this quiz.
            <br /> Check your score in Attempted Quizzes.
          </p>
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("action");
              params.delete("quizId");
              params.set("tab", "quiz");
              params.set("quizView", "attempted");
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="bg-[#43C17A] text-white px-6 py-2 rounded-md font-bold text-sm cursor-pointer hover:bg-[#35a868] transition-colors"
          >
            View Attempted Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) return <QuizAttemptShimmer />;

  return (
    <div className="flex flex-col h-full bg-[#f4f4f4] rounded-lg -m-2 p-4 relative">

      {/* ✅ Exit warning modal */}
      {showExitWarningModal && (
        <QuizExitWarningModal
          countdown={warningCountdown}
          onStay={handleExitWarningStay}
          onSubmit={handleExitWarningSubmit}
        />
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center lg:mb-1">
            <h2 className="text-xl font-bold text-[#282828]">
              {quiz?.courseName ?? "Quiz"}
            </h2>
          </div>
          <p className="text-sm font-medium text-[#282828]">
            {quiz?.topic || ""}
          </p>
        </div>

        {/* 🕐 Colorful Timer */}
        <div
          className={`flex flex-col items-center gap-1 ${timerColor.bg} px-4 py-2 rounded-xl border ${timerColor.ring} border-opacity-40 min-w-[90px]`}
        >
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${timerColor.text} opacity-70`}>
            Time Left
          </span>
          <span className={`font-bold text-2xl tabular-nums ${timerColor.text}`}>
            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
          </span>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timerPercent > 50
                ? "bg-[#87cefa]"
                : timerPercent > 20
                  ? "bg-yellow-300"
                  : "bg-red-400"
                }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-end mb-2">
          <span className="text-[#43C17A] font-bold text-base">
            {progressCount} of {questions.length}
          </span>
        </div>
        <div className="h-2.5 w-full bg-[#43C17A2B] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#43C17A] transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[60vh] pb-5 space-y-4 focus:outline-none">
        {questions.map((q) => (
          <div
            key={q.questionId}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
          >
            <h4 className="text-base font-semibold text-[#282828] mb-4">
              {q.questionText}
            </h4>

            {q.questionType === "Multiple Choice" ? (
              <div className="flex flex-col gap-3">
                {q.quiz_question_options
                  ?.filter(
                    (o: any) =>
                      !o.isCorrect || q.questionType === "Multiple Choice",
                  )
                  .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
                  .map((opt: any) => {
                    const isSelected =
                      answers[q.questionId]?.optionId === opt.optionId;
                    return (
                      <label
                        key={opt.optionId}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected
                            ? "border-[#43C17A]"
                            : "border-gray-400 group-hover:border-[#43C17A]"
                            }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-[#43C17A]" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${isSelected ? "text-[#282828]" : "text-gray-500"
                            }`}
                        >
                          {opt.optionText}
                        </span>
                        <input
                          type="radio"
                          name={`question-${q.questionId}`}
                          value={opt.optionId}
                          checked={isSelected}
                          onChange={() =>
                            handleOptionChange(q.questionId, opt.optionId)
                          }
                          className="hidden"
                        />
                      </label>
                    );
                  })}
              </div>
            ) : (
              <input
                type="text"
                value={answers[q.questionId]?.writtenAnswer ?? ""}
                onChange={(e) =>
                  handleWrittenAnswerChange(q.questionId, e.target.value)
                }
                placeholder="Type your answer here..."
                className="w-full border-b border-gray-300 pb-1 text-sm text-[#282828] outline-none focus:border-[#43C17A] bg-transparent"
              />
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-end">
        <button
          onClick={triggerSubmit}
          disabled={isSubmitting}
          className="bg-[#43C17A] cursor-pointer focus:outline-none text-white px-6 py-2.5 rounded-md font-bold text-sm disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}

export default function QuizAttemptScreen({
  quiz,
  onSubmitSuccess,
}: {
  quiz: any;
  onSubmitSuccess?: () => void;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center w-full h-full">
          <Loader />
        </div>
      }
    >
      <QuizAttemptScreenContent quiz={quiz} onSubmitSuccess={onSubmitSuccess} />
    </Suspense>
  );
}