/**
 * Mathematics Quiz Bank: Unit 1 (Applications of Matrices & Determinants)
 * Sourced directly from Tamil Nadu Class 12 Mathematics Vol 1
 */
import type { QuizQuestion } from "../types/prismate";

export const MATH_BB_QUESTIONS: QuizQuestion[] = [
  {
    "id": "math-u1-bb-01",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If |adj(adj A)| = |A|\u2079, then the order n of the square matrix A is:",
    "options": [
      "3",
      "4",
      "2",
      "5"
    ],
    "correctIndex": 1,
    "explanation": "By theorem, |adj(adj A)| = |A|^{(n-1)\u00b2}. Here (n-1)\u00b2 = 9 \u27f9 n - 1 = 3 \u27f9 n = 4.",
    "category": "bb",
    "sourcePage": 48
  },
  {
    "id": "math-u1-bb-02",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A is a 3\u00d73 non-singular matrix such that A A\u1d40 = A\u1d40 A and B = A\u207b\u00b9 A\u1d40, then B B\u1d40 is equal to:",
    "options": [
      "A",
      "B",
      "I\u2083",
      "B\u1d40"
    ],
    "correctIndex": 2,
    "explanation": "BB\u1d40 = (A\u207b\u00b9 A\u1d40)(A\u207b\u00b9 A\u1d40)\u1d40 = (A\u207b\u00b9 A\u1d40)(A (A\u207b\u00b9)\u1d40). Since A A\u1d40 = A\u1d40 A, A\u207b\u00b9 A\u1d40 = A\u1d40 A\u207b\u00b9. Multiplying gives I\u2083.",
    "category": "bb",
    "sourcePage": 48
  },
  {
    "id": "math-u1-bb-03",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A = [[3, 5], [1, 2]], B = adj A, and C = 3A, then |adj B| / |C| is equal to:",
    "options": [
      "1/3",
      "1/9",
      "1/4",
      "1"
    ],
    "correctIndex": 1,
    "explanation": "|A| = 3(2) - 5(1) = 1. For a 2\u00d72 matrix, |adj B| = |B|^(2-1) = |A|^(2-1) = 1. |C| = |3A| = 3\u00b2 |A| = 9(1) = 9. Hence |adj B|/|C| = 1/9.",
    "category": "bb",
    "sourcePage": 48
  },
  {
    "id": "math-u1-bb-04",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A [[1, -2], [1, 4]] = [[6, 0], [0, 6]], then A is equal to:",
    "options": [
      "[[1, -2], [1, 4]]",
      "[[1, 2], [-1, 4]]",
      "[[4, 2], [-1, 1]]",
      "[[4, -1], [2, 1]]"
    ],
    "correctIndex": 2,
    "explanation": "Let M = [[1, -2], [1, 4]]. Then AM = 6 I\u2082 \u27f9 A = 6 M\u207b\u00b9. |M| = 4 - (-2) = 6. M\u207b\u00b9 = (1/6)[[4, 2], [-1, 1]]. Thus A = [[4, 2], [-1, 1]].",
    "category": "bb",
    "sourcePage": 48
  },
  {
    "id": "math-u1-bb-05",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A = [[7, 3], [4, 2]], then 9I\u2082 - A is equal to:",
    "options": [
      "A\u207b\u00b9",
      "A\u207b\u00b9 / 2",
      "3 A\u207b\u00b9",
      "2 A\u207b\u00b9"
    ],
    "correctIndex": 3,
    "explanation": "Characteristic equation of A: \u03bb\u00b2 - (Tr A)\u03bb + |A| = 0. Tr A = 7 + 2 = 9; |A| = 14 - 12 = 2. So A\u00b2 - 9A + 2I\u2082 = 0 \u27f9 9I\u2082 - A = 2A\u207b\u00b9.",
    "category": "bb",
    "sourcePage": 48
  },
  {
    "id": "math-u1-bb-06",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A = [[2, 0], [1, 5]] and B = [[1, 4], [2, 0]], then |adj(AB)| is equal to:",
    "options": [
      "-40",
      "-80",
      "-60",
      "-20"
    ],
    "correctIndex": 1,
    "explanation": "|A| = 2(5) - 0 = 10, |B| = 0 - 8 = -8. |AB| = |A||B| = 10(-8) = -80. For order n = 2, |adj(AB)| = |AB|^(2-1) = -80.",
    "category": "bb",
    "sourcePage": 48
  },
  {
    "id": "math-u1-bb-07",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If P = [[1, x, 0], [1, 3, 0], [2, 4, -2]] is the adjoint of 3\u00d73 matrix A and |A| = 4, then x is:",
    "options": [
      "15",
      "12",
      "14",
      "11"
    ],
    "correctIndex": 3,
    "explanation": "|P| = |adj A| = |A|^(3-1) = 4\u00b2 = 16. Expanding |P| along third column: -2(3 - x) = 16 \u27f9 3 - x = -8 \u27f9 x = 11.",
    "category": "bb",
    "sourcePage": 48
  },
  {
    "id": "math-u1-bb-08",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A = [[3, 1, -1], [2, -2, 0], [1, 2, -1]] and A\u207b\u00b9 = [a_ij], then the value of a\u2082\u2083 is:",
    "options": [
      "0",
      "-2",
      "-3",
      "-1"
    ],
    "correctIndex": 3,
    "explanation": "a\u2082\u2083 is the (2,3) entry of A\u207b\u00b9 = (1/|A|) A\u2083\u2082 (cofactor of a\u2083\u2082). |A| = 3(2) - 1(-2) - 1(4 - (-2)) = 6 + 2 - 6 = 2. A\u2083\u2082 = - det([[3, -1], [2, 0]]) = -(0 - (-2)) = -2. So a\u2082\u2083 = -2 / 2 = -1.",
    "category": "bb",
    "sourcePage": 48
  },
  {
    "id": "math-u1-bb-09",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A, B, and C are invertible matrices of the same order, then which one of the following is NOT true?",
    "options": [
      "adj A = |A| A\u207b\u00b9",
      "adj(AB) = (adj A)(adj B)",
      "det(A\u207b\u00b9) = (det A)\u207b\u00b9",
      "(ABC)\u207b\u00b9 = C\u207b\u00b9 B\u207b\u00b9 A\u207b\u00b9"
    ],
    "correctIndex": 1,
    "explanation": "By the reversal law for adjoints, adj(AB) = (adj B)(adj A). Therefore statement (2) is false.",
    "category": "bb",
    "sourcePage": 48
  },
  {
    "id": "math-u1-bb-10",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If (AB)\u207b\u00b9 = [[12, -17], [-19, 27]] and A\u207b\u00b9 = [[1, -1], [-2, 3]], then B\u207b\u00b9 is:",
    "options": [
      "[[2, -5], [-3, 8]]",
      "[[8, 5], [3, 2]]",
      "[[3, 1], [2, 1]]",
      "[[-8, -5], [-3, 2]]"
    ],
    "correctIndex": 0,
    "explanation": "(AB)\u207b\u00b9 = B\u207b\u00b9 A\u207b\u00b9 \u27f9 B\u207b\u00b9 = (AB)\u207b\u00b9 A. Now A = (A\u207b\u00b9)\u207b\u00b9. Since |A\u207b\u00b9| = 3 - 2 = 1, A = [[3, 1], [2, 1]]. Multiplying [[12, -17], [-19, 27]] by [[3, 1], [2, 1]] yields [[2, -5], [-3, 8]].",
    "category": "bb",
    "sourcePage": 48
  },
  {
    "id": "math-u1-bb-11",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A\u1d40 A\u207b\u00b9 is symmetric, then A\u00b2 is equal to:",
    "options": [
      "A\u207b\u00b9",
      "(A\u1d40)\u00b2",
      "A\u1d40",
      "(A\u207b\u00b9)\u00b2"
    ],
    "correctIndex": 1,
    "explanation": "If M = A\u1d40 A\u207b\u00b9 is symmetric, then M = M\u1d40 \u27f9 A\u1d40 A\u207b\u00b9 = (A\u207b\u00b9)\u1d40 A = (A\u1d40)\u207b\u00b9 A. Pre-multiplying by A\u1d40 and post-multiplying by A gives (A\u1d40)\u00b2 = A\u00b2.",
    "category": "bb",
    "sourcePage": 49
  },
  {
    "id": "math-u1-bb-12",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A is a non-singular matrix such that A\u207b\u00b9 = [[5, 3], [-2, -1]], then (A\u1d40)\u207b\u00b9 is:",
    "options": [
      "[[\u22125, 3], [2, 1]]",
      "[[5, 3], [\u22122, \u22121]]",
      "[[\u22121, \u22123], [2, 5]]",
      "[[5, \u22122], [3, \u22121]]"
    ],
    "correctIndex": 3,
    "explanation": "By theorem, (A\u1d40)\u207b\u00b9 = (A\u207b\u00b9)\u1d40. Transposing [[5, 3], [-2, -1]] yields [[5, -2], [3, -1]].",
    "category": "bb",
    "sourcePage": 49
  },
  {
    "id": "math-u1-bb-13",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A = [[3/5, 4/5], [x, 3/5]] and A\u1d40 = A\u207b\u00b9, then the value of x is:",
    "options": [
      "-4/5",
      "-3/5",
      "3/5",
      "4/5"
    ],
    "correctIndex": 0,
    "explanation": "A is an orthogonal matrix, so A A\u1d40 = I\u2082. The dot product of row 1 and row 2 must be zero: (3/5)x + (4/5)(3/5) = 0 \u27f9 (3/5)x = -12/25 \u27f9 x = -4/5.",
    "category": "bb",
    "sourcePage": 49
  },
  {
    "id": "math-u1-bb-14",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A = [[1, tan(\u03b8/2)], [-tan(\u03b8/2), 1]] and AB = I\u2082, then B is:",
    "options": [
      "cos\u00b2(\u03b8/2) A",
      "cos\u00b2(\u03b8/2) A\u1d40",
      "(cos\u00b2 \u03b8) I",
      "sin\u00b2(\u03b8/2) A"
    ],
    "correctIndex": 1,
    "explanation": "|A| = 1 + tan\u00b2(\u03b8/2) = sec\u00b2(\u03b8/2). B = A\u207b\u00b9 = (1/|A|) adj A = (1/sec\u00b2(\u03b8/2)) [[1, -tan(\u03b8/2)], [tan(\u03b8/2), 1]] = cos\u00b2(\u03b8/2) A\u1d40.",
    "category": "bb",
    "sourcePage": 49
  },
  {
    "id": "math-u1-bb-15",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A = [[cos \u03b8, sin \u03b8], [-sin \u03b8, cos \u03b8]] and A(adj A) = [[k, 0], [0, k]], then k is:",
    "options": [
      "0",
      "sin \u03b8",
      "cos \u03b8",
      "1"
    ],
    "correctIndex": 3,
    "explanation": "By theorem, A(adj A) = |A| I\u2082. Here |A| = cos\u00b2 \u03b8 + sin\u00b2 \u03b8 = 1. Therefore k = |A| = 1.",
    "category": "bb",
    "sourcePage": 49
  },
  {
    "id": "math-u1-bb-16",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A = [[2, 3], [5, -2]] is such that \u03bb A\u207b\u00b9 = A, then \u03bb is:",
    "options": [
      "17",
      "14",
      "19",
      "21"
    ],
    "correctIndex": 2,
    "explanation": "\u03bb A\u207b\u00b9 = A \u27f9 A\u00b2 = \u03bb I\u2082. A\u00b2 = [[4 + 15, 6 - 6], [10 - 10, 15 + 4]] = [[19, 0], [0, 19]] = 19 I\u2082. Hence \u03bb = 19.",
    "category": "bb",
    "sourcePage": 49
  },
  {
    "id": "math-u1-bb-17",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If adj A = [[2, 3], [4, -1]] and adj B = [[1, -2], [-3, 1]], then adj(AB) is:",
    "options": [
      "[[\u22127, \u22121], [7, \u22129]]",
      "[[\u22126, 5], [\u22122, \u221210]]",
      "[[\u22127, 7], [\u22121, \u22129]]",
      "[[\u22126, \u22122], [5, \u221210]]"
    ],
    "correctIndex": 1,
    "explanation": "adj(AB) = (adj B)(adj A) = [[1, -2], [-3, 1]] [[2, 3], [4, -1]] = [[2 - 8, 3 + 2], [-6 + 4, -9 - 1]] = [[-6, 5], [-2, -10]].",
    "category": "bb",
    "sourcePage": 49
  },
  {
    "id": "math-u1-bb-18",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "The rank of the matrix [[1, 2, 3, 4], [2, 4, 6, 8], [-1, -2, -3, -4]] is:",
    "options": [
      "1",
      "2",
      "4",
      "3"
    ],
    "correctIndex": 0,
    "explanation": "R\u2082 = 2R\u2081 and R\u2083 = -R\u2081. Performing R\u2082 \u2192 R\u2082 - 2R\u2081 and R\u2083 \u2192 R\u2083 + R\u2081 reduces the matrix to a single non-zero row. Hence rank \u03c1(A) = 1.",
    "category": "bb",
    "sourcePage": 49
  },
  {
    "id": "math-u1-bb-19",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If x\u1d43 y\u1d47 = e\u1d50, x\u1d9c y\u1d48 = e\u207f, \u0394\u2081 = |[[m, b], [n, d]]|, \u0394\u2082 = |[[a, m], [c, n]]|, \u0394\u2083 = |[[a, b], [c, d]]|, then the values of x and y are respectively:",
    "options": [
      "e^(\u0394\u2082/\u0394\u2081), e^(\u0394\u2083/\u0394\u2081)",
      "log(\u0394\u2081/\u0394\u2083), log(\u0394\u2082/\u0394\u2083)",
      "log(\u0394\u2082/\u0394\u2081), log(\u0394\u2083/\u0394\u2081)",
      "e^(\u0394\u2081/\u0394\u2083), e^(\u0394\u2082/\u0394\u2083)"
    ],
    "correctIndex": 3,
    "explanation": "Taking natural logs: a ln x + b ln y = m and c ln x + d ln y = n. By Cramer's Rule, ln x = \u0394\u2081/\u0394\u2083 and ln y = \u0394\u2082/\u0394\u2083 \u27f9 x = e^(\u0394\u2081/\u0394\u2083), y = e^(\u0394\u2082/\u0394\u2083).",
    "category": "bb",
    "sourcePage": 49
  },
  {
    "id": "math-u1-bb-20",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "Which of the following statements is/are correct? (i) Adjoint of a symmetric matrix is symmetric (ii) Adjoint of a diagonal matrix is diagonal (iii) adj(\u03bbA) = \u03bb\u207f adj A (iv) A(adj A) = (adj A)A = |A| I",
    "options": [
      "Only (i)",
      "(ii) and (iii)",
      "(iii) and (iv)",
      "(i), (ii) and (iv)"
    ],
    "correctIndex": 3,
    "explanation": "Statement (iii) is incorrect because adj(\u03bbA) = \u03bb\u207f\u207b\u00b9 adj A. Statements (i), (ii), and (iv) are all verified theorems.",
    "category": "bb",
    "sourcePage": 50
  },
  {
    "id": "math-u1-bb-21",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "By the Rouch\u00e9-Capelli theorem, if \u03c1(A) = \u03c1([A | B]), then the system of linear equations AX = B is:",
    "options": [
      "consistent and has a unique solution",
      "consistent",
      "consistent and has infinitely many solution",
      "inconsistent"
    ],
    "correctIndex": 1,
    "explanation": "Equality of coefficient matrix rank and augmented matrix rank \u03c1(A) = \u03c1([A | B]) is the necessary and sufficient condition for consistency.",
    "category": "bb",
    "sourcePage": 50
  },
  {
    "id": "math-u1-bb-22",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If 0 \u2264 \u03b8 \u2264 \u03c0 and the homogeneous system x + (sin \u03b8)y - (cos \u03b8)z = 0, (cos \u03b8)x - y + z = 0, (sin \u03b8)x + y - z = 0 has a non-trivial solution, then \u03b8 is:",
    "options": [
      "2\u03c0/3",
      "3\u03c0/4",
      "5\u03c0/6",
      "\u03c0/4"
    ],
    "correctIndex": 3,
    "explanation": "For non-trivial solution, |A| = 0. Expanding the determinant gives 1(1 - 1) - sin \u03b8(-cos \u03b8 - sin \u03b8) - cos \u03b8(cos \u03b8 + sin \u03b8) = 0 \u27f9 sin\u00b2 \u03b8 + cos\u00b2 \u03b8 + sin \u03b8 cos \u03b8 - cos\u00b2 \u03b8 = 0 \u27f9 sin \u03b8(sin \u03b8 - cos \u03b8) = 0 \u27f9 tan \u03b8 = 1 \u27f9 \u03b8 = \u03c0/4.",
    "category": "bb",
    "sourcePage": 50
  },
  {
    "id": "math-u1-bb-23",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "The augmented matrix of a system is [[1, 2, 7, 3], [0, 1, 4, 6], [0, 0, \u03bb - 7, \u03bc + 5]]. The system has infinitely many solutions if:",
    "options": [
      "\u03bb = 7, \u03bc \u2260 -5",
      "\u03bb = -7, \u03bc = 5",
      "\u03bb \u2260 7, \u03bc \u2260 -5",
      "\u03bb = 7, \u03bc = -5"
    ],
    "correctIndex": 3,
    "explanation": "Infinitely many solutions occur when rank \u03c1(A) = \u03c1([A|B]) < 3. This requires both \u03bb - 7 = 0 and \u03bc + 5 = 0, so \u03bb = 7 and \u03bc = -5.",
    "category": "bb",
    "sourcePage": 50
  },
  {
    "id": "math-u1-bb-24",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "Let A = [[2, -1, 1], [-1, 2, -1], [1, -1, 2]] and 4B = [[3, 1, -1], [1, 3, x], [-1, 1, 3]]. If B is the inverse of A, then the value of x is:",
    "options": [
      "2",
      "4",
      "3",
      "1"
    ],
    "correctIndex": 3,
    "explanation": "Since AB = I\u2083, A(4B) = 4I\u2083. Multiplying row 2 of A by column 3 of (4B): (-1)(-1) + 2(x) + (-1)(3) = 0 \u27f9 1 + 2x - 3 = 0 \u27f9 2x = 2 \u27f9 x = 1.",
    "category": "bb",
    "sourcePage": 50
  },
  {
    "id": "math-u1-bb-25",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A = [[3, -3, 4], [2, -3, 4], [0, -1, 1]], then adj(adj A) is:",
    "options": [
      "A",
      "2A",
      "-A",
      "[[3, -3, 4], [0, -1, 1], [2, -3, 4]]"
    ],
    "correctIndex": 0,
    "explanation": "|A| = 3(-3 + 4) - (-3)(2 - 0) + 4(-2 - 0) = 3 + 6 - 8 = 1. By theorem, for n = 3, adj(adj A) = |A|^(3-2) A = 1 \u00b7 A = A.",
    "category": "bb",
    "sourcePage": 50
  }
];

export const MATH_FORMULA_QUESTIONS: QuizQuestion[] = [
  {
    "id": "math-u1-f01-q",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "For any non-singular square matrix A of order n, what is the formula for A\u207b\u00b9?",
    "options": [
      "A\u207b\u00b9 = (1/|A|) adj A",
      "A\u207b\u00b9 = |A| adj A",
      "A\u207b\u00b9 = (1/|A|\u00b2) adj A",
      "A\u207b\u00b9 = adj(A\u207b\u00b9)/|A|"
    ],
    "correctIndex": 0,
    "explanation": "The inverse of non-singular matrix A is given by A\u207b\u00b9 = (1/|A|) adj A, where |A| \u2260 0.",
    "category": "formula",
    "sourcePage": 5
  },
  {
    "id": "math-u1-f02-q",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "If A is a square matrix of order n, what is the value of |adj A| in terms of |A|?",
    "options": [
      "|A|\u207f\u207b\u00b9",
      "|A|\u207f",
      "|A|\u207f\u207a\u00b9",
      "|A|\u00b2"
    ],
    "correctIndex": 0,
    "explanation": "Since A(adj A) = |A| I\u2099, taking determinants gives |A| |adj A| = |A|\u207f \u27f9 |adj A| = |A|\u207f\u207b\u00b9.",
    "category": "formula",
    "sourcePage": 8
  },
  {
    "id": "math-u1-f03-q",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "In Cramer's Rule for solving AX = B, each unknown x_i is evaluated as:",
    "options": [
      "x_i = \u0394_i / \u0394",
      "x_i = \u0394 / \u0394_i",
      "x_i = \u0394 \u00b7 \u0394_i",
      "x_i = \u0394_i - \u0394"
    ],
    "correctIndex": 0,
    "explanation": "Cramer's rule expresses each variable as the ratio of modified determinant \u0394_i to system determinant \u0394 (provided \u0394 \u2260 0).",
    "category": "formula",
    "sourcePage": 34
  },
  {
    "id": "math-u1-f04-q",
    "subject": "mathematics",
    "topic": "Unit 1: Matrices & Determinants",
    "question": "Under what condition does the homogeneous system AX = O have a non-trivial solution?",
    "options": [
      "|A| = 0",
      "|A| \u2260 0",
      "|A| > 0",
      "A must be orthogonal"
    ],
    "correctIndex": 0,
    "explanation": "A homogeneous system AX = O has a non-trivial (non-zero) solution if and only if rank \u03c1(A) < n, which corresponds to det(A) = 0.",
    "category": "formula",
    "sourcePage": 43
  }
];

export function getMathBBQuestions(): QuizQuestion[] {
  return MATH_BB_QUESTIONS;
}

export function getMathFormulaQuestions(): QuizQuestion[] {
  return MATH_FORMULA_QUESTIONS;
}
