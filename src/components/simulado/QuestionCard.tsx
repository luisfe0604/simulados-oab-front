"use client";

import { forwardRef } from "react";
import { IconCheck, IconX } from "@/components/icons";
import type { OptionKey, RunnerQuestion, RunnerSubject } from "./types";
import styles from "./QuestionCard.module.css";

interface ReviewInfo {
  correct: string | null;
  selected: string | null;
}

interface QuestionCardProps {
  index: number;
  total: number;
  question: RunnerQuestion;
  selected: OptionKey | null;
  onSelect?: (key: OptionKey) => void;
  review?: ReviewInfo;
}

// Renderiza o enunciado com segurança: converte a convenção <<citação>> em
// blockquote construindo nós React (nunca dangerouslySetInnerHTML → sem XSS).
function renderStatement(text: string) {
  const parts = text.split(/<<([\s\S]*?)>>/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <blockquote key={i}>{part.trim()}</blockquote>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

const OPTION_KEYS: OptionKey[] = ["a", "b", "c", "d", "e"];

function getSubjects(q: RunnerQuestion): RunnerSubject[] {
  if (q.subjects) return q.subjects;
  return q.question_subjects?.map((qs) => qs.subjects) ?? [];
}

export const QuestionCard = forwardRef<HTMLDivElement, QuestionCardProps>(
  function QuestionCard({ index, total, question, selected, onSelect, review }, ref) {
    const subjects = getSubjects(question);
    const options = OPTION_KEYS.map((key) => ({
      key,
      text: question[`option_${key}` as const] as string | null,
    })).filter((o) => o.text);

    return (
      <article className={styles.card} ref={ref}>
        <div className={styles.head}>
          <span className={styles.num}>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <div className={styles.subjects}>
            {subjects.map((s) => (
              <span key={s.id} className={styles.subjectTag}>
                {s.name}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.statement}>{renderStatement(question.statement)}</div>

        <div className={styles.options}>
          {options.map(({ key, text }) => {
            let cls = styles.option;
            if (review) {
              const isCorrect = review.correct === key;
              const isSelectedWrong =
                review.selected === key && review.correct !== key;
              if (isCorrect) cls += ` ${styles.correct}`;
              else if (isSelectedWrong) cls += ` ${styles.wrong}`;
            } else if (selected === key) {
              cls += ` ${styles.selected}`;
            }

            return (
              <button
                key={key}
                type="button"
                className={cls}
                disabled={!!review}
                onClick={() => onSelect?.(key)}
                aria-pressed={selected === key}
              >
                <span className={styles.letter}>{key}</span>
                <span>{text}</span>
                {review && review.correct === key && (
                  <span className={`${styles.reviewMark} ${styles.ok}`}>
                    <IconCheck size={18} />
                  </span>
                )}
                {review &&
                  review.selected === key &&
                  review.correct !== key && (
                    <span className={`${styles.reviewMark} ${styles.no}`}>
                      <IconX size={18} />
                    </span>
                  )}
              </button>
            );
          })}
        </div>
      </article>
    );
  },
);
