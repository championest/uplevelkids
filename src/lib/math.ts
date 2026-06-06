export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

export type DifficultyLevel = 
  | '1-digit' | '2-digit' | '3-digit' // For Addition/Subtraction
  | 'table-1-5' | 'table-1-12' | 'table-1-25'; // For Multiplication/Division

export interface Problem {
  id: string;
  question: string;
  answer: number;
}

export const generateProblem = (
  operation: Operation,
  difficulty: DifficultyLevel,
  customTables?: number[]
): Problem => {
  let a = 0;
  let b = 0;
  let question = '';
  let answer = 0;

  const pickTable = (): number => {
    if (customTables && customTables.length > 0) {
      return customTables[Math.floor(Math.random() * customTables.length)];
    }
    const maxTable = difficulty === 'table-1-5' ? 5 : difficulty === 'table-1-12' ? 12 : 25;
    return Math.floor(Math.random() * maxTable) + 1;
  };

  switch (operation) {
    case 'addition':
    case 'subtraction': {
      const max = difficulty === '1-digit' ? 10 : difficulty === '2-digit' ? 100 : 1000;
      const min = difficulty === '1-digit' ? 1 : difficulty === '2-digit' ? 10 : 100;

      a = Math.floor(Math.random() * (max - min)) + min;
      b = Math.floor(Math.random() * (max - min)) + min;

      if (operation === 'addition') {
        question = `${a} + ${b}`;
        answer = a + b;
      } else {
        if (a < b) [a, b] = [b, a];
        question = `${a} - ${b}`;
        answer = a - b;
      }
      break;
    }

    case 'multiplication': {
      a = pickTable();
      b = Math.floor(Math.random() * 12) + 1;
      question = `${a} × ${b}`;
      answer = a * b;
      break;
    }

    case 'division': {
      const divisor = pickTable();
      const multiplier = Math.floor(Math.random() * 12) + 1;
      const dividend = divisor * multiplier;
      question = `${dividend} ÷ ${divisor}`;
      answer = multiplier;
      break;
    }
  }

  return {
    id: Math.random().toString(36).substring(7),
    question,
    answer,
  };
};
