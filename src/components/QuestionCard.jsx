import styles from "./QuestionCard.module.css";

export default function QuestionCard({
  q,
  index,
  answers,
  result,
  onSelect,
  disabled,
}) {
  function parseQuotes(text) {
    if (!text) return text;

    return text.replace(/<<([\s\S]*?)>>/g, "<blockquote>$1</blockquote>");
  }

  function splitStatement(text) {
    if (!text) return { intro: text, question: "" };

    const matches = [...text.matchAll(/\.(?=\s+\S)/g)];
    if (matches.length === 0) {
      return { intro: "", question: text };
    }

    const lastMatch = matches[matches.length - 1].index;
    const intro = text.slice(0, lastMatch + 1).trim();
    const question = text.slice(lastMatch + 1).trim();

    return { intro, question };
  }

  const statementWithQuotes = parseQuotes(q.statement);

  const { intro, question } = splitStatement(statementWithQuotes);

  return (
    <div className={styles.questionCard}>
      <h3 className={styles.questionNumber}>Questão {index + 1}</h3>

      <div className={styles.statement}>
        {intro && (
          <p dangerouslySetInnerHTML={{ __html: intro }} />
        )}
        {question && (
          <p dangerouslySetInnerHTML={{ __html: question }} />
        )}
      </div>

      <div className={styles.options}>
        {["A", "B", "C", "D", "E"].map((letter) => {
          const optionText = q[`option_${letter.toLowerCase()}`];
          if (!optionText) return null;

          const isSelected =
            answers?.[q.id || q.question_id] === letter ||
            q.selected_option === letter;

          const isCorrect = q.correct_option === letter;
          const isWrongSelected = result && isSelected && !isCorrect;

          let className = styles.optionBtn;
          if (!result && isSelected) className += ` ${styles.selected}`;
          if (result && isCorrect) className += ` ${styles.correct}`;
          if (result && isWrongSelected) className += ` ${styles.wrong}`;

          return (
            <button
              key={letter}
              className={className}
              disabled={disabled}
              onClick={() =>
                onSelect && onSelect(q.id || q.question_id, letter)
              }
            >
              <strong>{letter + `)`}</strong> {optionText}
            </button>
          );
        })}
      </div>

      {q.exam_name && <p className={styles.exam}>{q.exam_name}</p>}
    </div>
  );
}