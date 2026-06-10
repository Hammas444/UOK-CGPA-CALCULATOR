// src/utils/gradeLogic.js

export const calculateGrade = (score) => {
  const s = parseFloat(score);
  if (isNaN(s)) return { point: 0, grade: '-' };

  if (s >= 90) return { point: 4.0, grade: 'A+' };
  if (s >= 85) return { point: 4.0, grade: 'A' };
  if (s >= 80) return { point: 3.8, grade: 'A-' };
  if (s >= 75) return { point: 3.4, grade: 'B+' };
  if (s >= 71) return { point: 3.0, grade: 'B' };
  if (s >= 68) return { point: 2.8, grade: 'B-' };
  if (s >= 64) return { point: 2.4, grade: 'C+' };
  if (s >= 61) return { point: 2.0, grade: 'C' };
  if (s >= 57) return { point: 1.8, grade: 'C-' };
  if (s >= 53) return { point: 1.4, grade: 'D+' };
  if (s >= 45) return { point: 1.0, grade: 'D' };
  return { point: 0.0, grade: 'F' };
};

export const calculateFinalCGPA = (semesters) => {
  let totalWeightedGPA = 0;
  let totalCredits = 0;

  semesters.forEach(sem => {
    const gpa = parseFloat(sem.gpa);
    const cr = parseFloat(sem.credits);
    if (!isNaN(gpa) && !isNaN(cr) && cr > 0) {
      totalWeightedGPA += (gpa * cr);
      totalCredits += cr;
    }
  });

  return totalCredits > 0 ? (totalWeightedGPA / totalCredits).toFixed(2) : "0.00";
};