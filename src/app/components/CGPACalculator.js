'use client';
import { useState, useEffect } from 'react';
import { calculateFinalCGPA } from '../utils/gradeLogic';

export default function CGPACalculator() {
  const [semesters, setSemesters] = useState([{ id: 1, gpa: '', credits: '' }]);
  const [cgpa, setCgpa] = useState("0.00");

  useEffect(() => {
    setCgpa(calculateFinalCGPA(semesters));
  }, [semesters]);

  const addSemester = () => {
    setSemesters([...semesters, { id: Date.now(), gpa: '', credits: '' }]);
  };

  const updateSemester = (id, field, value) => {
    setSemesters(semesters.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mt-10">
      <div className="bg-emerald-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">CGPA Calculator</h2>
          <p className="opacity-80 text-sm">Combine all your semesters</p>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-widest opacity-70">Total CGPA</span>
          <div className="text-5xl font-black">{cgpa}</div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {semesters.map((sem, index) => (
          <div key={sem.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <div className="col-span-4 font-bold text-emerald-800">Semester {index + 1}</div>
            <input 
              type="number" step="0.01" placeholder="GPA (e.g. 3.5)"
              className="cgpa-input col-span-4 p-3 placeholder:text-emerald-400 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-emerald-500"
              onChange={(e) => updateSemester(sem.id, 'gpa', e.target.value)}
            />
            <input 
              type="number" placeholder="Total Credits"
              className="cgpa-input col-span-4 p-3 placeholder:text-emerald-400 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-emerald-500"
              onChange={(e) => updateSemester(sem.id, 'credits', e.target.value)}
            />
          </div>
        ))}

        <button 
          onClick={addSemester}
          className="w-full py-4 border-2 border-dashed border-emerald-300 rounded-2xl text-emerald-600 font-medium hover:bg-emerald-50 transition-all"
        >
          + Add Semester
        </button>
      </div>
    </div>
  );
}