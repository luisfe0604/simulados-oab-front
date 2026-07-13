// Formato das questões usado no runner (sem gabarito durante a prova).

export interface RunnerSubject {
  id: number;
  name: string;
}

export interface RunnerQuestion {
  id: number;
  statement: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string | null;
  option_e: string | null;
  question_subjects?: { subjects: RunnerSubject }[];
  subjects?: RunnerSubject[];
}

export type OptionKey = "a" | "b" | "c" | "d" | "e";

// Questão com gabarito, usada na tela de revisão (vem de GET /simulados/[id]).
export interface ReviewQuestion extends RunnerQuestion {
  correct_option: string | null;
  selected_option: string | null;
  is_correct: boolean | null;
}
