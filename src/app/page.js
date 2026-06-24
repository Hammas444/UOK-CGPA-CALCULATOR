'use client';
import { useState, useEffect } from 'react';
import { calculateGrade, calculateFinalCGPA } from './utils/gradeLogic';

export default function CalculatorApp() {
  const [activeTab, setActiveTab] = useState('gpa');
  const [history, setHistory] = useState([]);
  
  // GPA Calculator States
  const [courses, setCourses] = useState([{ id: Date.now(), name: '', score: '', credits: '' }]);
  const [currentGpa, setCurrentGpa] = useState("0.00");
  const [semNo, setSemNo] = useState(1);

  // CGPA Calculator States
  const [semesters, setSemesters] = useState([{ id: Date.now() + 1, gpa: '', credits: '' }]);
  const [finalCgpa, setFinalCgpa] = useState("0.00");

  // Load History & Sync
  useEffect(() => {
    const saved = localStorage.getItem('calc_history');
    if (saved) {
      const parsedHistory = JSON.parse(saved);
      setHistory(parsedHistory);
      syncCgpaList(parsedHistory);
    }
  }, []);

  const syncCgpaList = (hist) => {
    const savedSems = hist.filter(item => item.type === 'GPA');
    if (savedSems.length > 0) {
      setSemesters(savedSems.map(s => ({
        id: s.id,
        gpa: s.result,
        credits: s.totalCr || 0,
        semNo: s.semNo
      })));
    } else {
      setSemesters([{ id: Date.now(), gpa: '', credits: '' }]);
    }
  };

  // Calculation Hooks
  useEffect(() => {
    let pts = 0, crs = 0;
    courses.forEach(c => {
      const { point } = calculateGrade(c.score);
      const cr = parseFloat(c.credits);
      if (cr > 0) { pts += (point * cr); crs += cr; }
    });
    setCurrentGpa(crs > 0 ? (pts / crs).toFixed(2) : "0.00");
  }, [courses]);

  useEffect(() => {
    setFinalCgpa(calculateFinalCGPA(semesters));
  }, [semesters]);

  // Save & Reset Logic
  const saveToHistory = () => {
    const totalCr = courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
    const newEntry = {
      id: Date.now(),
      type: activeTab.toUpperCase(),
      result: activeTab === 'gpa' ? currentGpa : finalCgpa,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      semNo: activeTab === 'gpa' ? semNo : null,
      totalCr: activeTab === 'gpa' ? totalCr : null,
      items: activeTab === 'gpa' ? [...courses] : [...semesters]
    };
    
    const updated = [newEntry, ...history];
    setHistory(updated);
    localStorage.setItem('calc_history', JSON.stringify(updated));
    syncCgpaList(updated);

    // RESET CALCULATOR AFTER SAVE
    if (activeTab === 'gpa') {
      setCourses([{ id: Date.now(), name: '', score: '', credits: '' }]);
      setSemNo(prev => (prev < 8 ? prev + 1 : 1)); // Auto-increment semester
    } else {
      setSemesters([{ id: Date.now(), gpa: '', credits: '' }]);
    }
  };

  const deleteHistoryItem = (id) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('calc_history', JSON.stringify(updated));
    
    // Clear calculator to prevent ghost data
    setCourses([{ id: Date.now(), name: '', score: '', credits: '' }]);
    syncCgpaList(updated);
  };

  const editHistoryItem = (item) => {
    setActiveTab(item.type.toLowerCase());
    if (item.type === 'GPA') {
      setCourses(item.items);
      setSemNo(item.semNo);
    } else {
      setSemesters(item.items);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-slate-50 p-3 sm:p-6 md:p-10 font-sans cursor-default">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Col: The Interface */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          
          {/* Tabs Control */}
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
            <button onClick={() => setActiveTab('gpa')} className={`flex-1 py-2.5 md:py-3 text-sm md:text-base font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'gpa' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Semester GPA</button>
            <button onClick={() => setActiveTab('cgpa')} className={`flex-1 py-2.5 md:py-3 text-sm md:text-base font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'cgpa' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Overall CGPA</button>
          </div>

          {/* Calculator Card Container */}
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            
            {/* Display Header */}
            <div className={`p-6 md:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 transition-colors ${activeTab === 'gpa' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
              <div className="w-full sm:w-auto">
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-2 block w-fit tracking-tighter">
                   {activeTab === 'gpa' ? `Entry: Semester ${semNo}` : 'Academic Profile'}
                </span>
                <h1 className="text-3xl md:text-4xl font-black">Calculator</h1>
                <button onClick={saveToHistory} className="w-full sm:w-auto mt-4 px-6 py-2 bg-white text-slate-900 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer block text-center">
                  Save & Clear
                </button>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto border-t border-white/20 sm:border-none pt-4 sm:pt-0">
                <div className="text-5xl md:text-7xl font-black tabular-nums tracking-tight">{activeTab === 'gpa' ? currentGpa : finalCgpa}</div>
              </div>
            </div>

            {/* Input Form Fields */}
            <div className="p-4 md:p-8 space-y-4 max-h-[500px] overflow-y-auto">
              {activeTab === 'gpa' ? (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase">Selected Semester</span>
                    <select value={semNo} onChange={(e) => setSemNo(Number(e.target.value))} className="w-full sm:w-auto bg-white border border-slate-200 rounded-lg px-3 py-1 text-sm font-black text-black outline-none cursor-pointer">
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                    </select>
                  </div>
                  
                  {courses.map((course) => (
                    <div key={course.id} className="flex flex-col sm:flex-row gap-3 p-3 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl border border-slate-100 sm:border-none animate-in slide-in-from-left-2">
                      <div className="w-full sm:flex-1">
                        <label className="block sm:hidden text-[10px] font-bold text-indigo-500 uppercase mb-1 ml-1">Course Name</label>
                        <input type="text" value={course.name} placeholder="Course Name" className="w-full p-3 bg-white sm:bg-slate-50 text-black rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 border border-slate-200 sm:border-none shadow-sm sm:shadow-none" onChange={(e) => setCourses(courses.map(c => c.id === course.id ? {...c, name: e.target.value} : c))} />
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <div className="flex-1 sm:w-24">
                          <label className="block sm:hidden text-[10px] font-bold text-indigo-500 uppercase mb-1 ml-1 text-center">Score</label>
                          <input type="number" value={course.score} placeholder="Score" className="w-full p-3 bg-white sm:bg-slate-100 text-black rounded-xl text-center font-bold outline-none border border-slate-200 sm:border-none shadow-sm sm:shadow-none" onChange={(e) => setCourses(courses.map(c => c.id === course.id ? {...c, score: e.target.value} : c))} />
                        </div>
                        <div className="flex-1 sm:w-20">
                          <label className="block sm:hidden text-[10px] font-bold text-indigo-500 uppercase mb-1 ml-1 text-center">Credits</label>
                          <input type="number" value={course.credits} placeholder="Cr" className="w-full p-3 bg-white sm:bg-slate-50 text-black rounded-xl text-center outline-none border border-slate-200 sm:border-none shadow-sm sm:shadow-none" onChange={(e) => setCourses(courses.map(c => c.id === course.id ? {...c, credits: e.target.value} : c))} />
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                semesters.map((sem, idx) => (
                  <div key={sem.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-3 items-start sm:items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-right-2">
                    <span className="w-full sm:col-span-3 font-black text-slate-400 uppercase text-xs">Sem {sem.semNo || idx+1}</span>
                    <div className="w-full sm:col-span-4">
                       <label className="block sm:hidden text-[10px] font-bold text-emerald-600 uppercase mb-1 ml-1">GPA</label>
                       <input type="number" placeholder="GPA" value={sem.gpa} step="0.01" className="w-full p-2.5 bg-white rounded-xl text-center font-bold text-emerald-600 shadow-sm border border-slate-200 sm:border-none" onChange={(e) => setSemesters(semesters.map(s => s.id === sem.id ? {...s, gpa: e.target.value} : s))} />
                    </div>
                    <div className="w-full sm:col-span-5">
                       <label className="block sm:hidden text-[10px] font-bold text-emerald-600 uppercase mb-1 ml-1">Total Credits</label>
                       <input type="number" placeholder="Total Credits" value={sem.credits} className="w-full p-2.5 bg-white rounded-xl text-center text-slate-600 shadow-sm font-bold border border-slate-200 sm:border-none" onChange={(e) => setSemesters(semesters.map(s => s.id === sem.id ? {...s, credits: e.target.value} : s))} />
                    </div>
                  </div>
                ))
              )}
              
              <button onClick={() => activeTab === 'gpa' ? setCourses([...courses, {id: Date.now(), name:'', score:'', credits:''}]) : setSemesters([...semesters, {id: Date.now(), gpa:'', credits:''}])}
                className="w-full py-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 transition-all cursor-pointer text-sm md:text-base">
                + Add Row
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: History */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2 pt-4 lg:pt-0">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Academic History</h3>
            <button onClick={() => {setHistory([]); localStorage.removeItem('calc_history'); syncCgpaList([]);}} className="text-[10px] font-bold text-red-400 hover:text-red-600 cursor-pointer uppercase">Reset</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {history.map((card) => (
              <div key={card.id} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 group relative transition-all hover:shadow-lg lg:hover:-translate-y-1">
                <div className={`absolute top-0 left-0 w-2 h-full rounded-l-[1.5rem] ${card.type === 'GPA' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.date}</span>
                    <h4 className="text-base md:text-lg font-black text-slate-800 leading-tight">{card.type === 'GPA' ? `Semester ${card.semNo}` : 'CGPA Calculation'}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{card.items.length} records</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-2xl md:text-3xl font-black mb-3 ${card.type === 'GPA' ? 'text-indigo-600' : 'text-emerald-600'}`}>{card.result}</div>
                    <div className="flex gap-2 justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => editHistoryItem(card)} className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all cursor-pointer active:scale-90 shadow-sm">
                         <svg xmlns="http://www.w3.org/2000/xl" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => deleteHistoryItem(card.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer active:scale-90 shadow-sm">
                         <svg xmlns="http://www.w3.org/2000/xl" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 0-2 2H7a2 2 0 0 0-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {history.length === 0 && <div className="sm:col-span-2 lg:col-span-1 text-center p-12 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-300 text-xs italic">Calculator history is empty.</div>}
          </div>
        </div>

      </div>
    </main>
  );
}
