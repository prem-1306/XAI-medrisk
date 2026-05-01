"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ChevronRight, ClipboardList, Info, Send, Sparkles, User, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COMMON_SYMPTOMS = [
  'Fever', 'Headache', 'Chest Pain', 'Fatigue', 'Dizziness',
  'Cough', 'Shortness of breath', 'Nausea', 'Body aches'
];

export default function InputForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    weight: '',
    height: '',
    systolic: '',
    diastolic: '',
    pulse_pressure: '',
    bmi: '',
    smoking: 'no',
    alcohol: 'no',
    exercise: 'medium',
    text_input: ''
  });

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  
  // Auto-calculation logic
  useEffect(() => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height) / 100; // cm to m
    if (w > 0 && h > 0) {
      const calculatedBmi = (w / (h * h)).toFixed(1);
      if (calculatedBmi !== formData.bmi) {
        setFormData(prev => ({ ...prev, bmi: calculatedBmi }));
      }
    }

    const sys = parseInt(formData.systolic);
    const dia = parseInt(formData.diastolic);
    if (!isNaN(sys) && !isNaN(dia)) {
      const pp = sys - dia;
      if (pp !== parseInt(formData.pulse_pressure)) {
        setFormData(prev => ({ ...prev, pulse_pressure: pp.toString() }));
      }
    }
  }, [formData.weight, formData.height, formData.systolic, formData.diastolic]);
  
  // New state for Virtual Doctor Consultation (Sequential)
  const [consultation, setConsultation] = useState({
    show: false,
    questions: [],
    currentIdx: 0,
    answers: [],
    currentAnswer: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const getCombinedData = (extraInfo = '') => {
    return `
Patient Data:
Name: ${formData.name || 'Anonymous'}
Age: ${formData.age}
Gender: ${formData.gender}
Weight: ${formData.weight} kg
Height: ${formData.height} cm
BMI: ${formData.bmi || 'Not calculated'}
Blood Pressure: ${formData.systolic && formData.diastolic ? `${formData.systolic}/${formData.diastolic} mmHg` : 'Not provided'}
Pulse Pressure: ${formData.pulse_pressure || 'Not calculated'} mmHg
Lifestyle: Smoking (${formData.smoking}), Alcohol (${formData.alcohol}), Exercise (${formData.exercise})
Symptoms: ${selectedSymptoms.join(', ')}
Initial description: ${formData.text_input}

=== Virtual Consultation Data ===
${extraInfo}
    `;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const initialData = getCombinedData();

    try {
      // Step 1: AI Evaluation (Interactivity)
      const evalResponse = await apiClient.post('/evaluate', {
        user_id: 'user_eval',
        text_input: initialData
      });

      // Check if we got an array of questions (new backend format)
      if (evalResponse.data.is_sufficient === false && evalResponse.data.follow_up_questions?.length > 0) {
        setConsultation({
          show: true,
          questions: evalResponse.data.follow_up_questions,
          currentIdx: 0,
          answers: [],
          currentAnswer: ''
        });
        setLoading(false);
        return;
      } else if (evalResponse.data.is_sufficient === false && evalResponse.data.follow_up_question) {
         // Fallback for old single-question string format just in case
         setConsultation({
          show: true,
          questions: [evalResponse.data.follow_up_question],
          currentIdx: 0,
          answers: [],
          currentAnswer: ''
        });
        setLoading(false);
        return;
      }

      // Step 2: Final Submission if sufficient
      await processFinalSubmission(initialData);
    } catch (err) {
      console.error(err);
      setError('Communication with AI Engine failed. Retrying...');
      setLoading(false);
    }
  };

  const processFinalSubmission = async (fullData) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/predict/async', {
        user_id: 'user_' + Math.floor(Math.random() * 10000),
        text_input: fullData
      });
      
      if (response.data.task_id) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('taskId', response.data.task_id);
          router.push('/analysis');
        }
      }
    } catch (err) {
      setError('Final analysis submission failed.');
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    const newAnswers = [
      ...consultation.answers, 
      { q: consultation.questions[consultation.currentIdx], a: consultation.currentAnswer }
    ];
    
    if (consultation.currentIdx + 1 < consultation.questions.length) {
      // Move to next question
      setConsultation({
        ...consultation,
        currentIdx: consultation.currentIdx + 1,
        answers: newAnswers,
        currentAnswer: ''
      });
    } else {
      // Done with all questions
      setConsultation({ ...consultation, show: false });
      
      // Format answers into a clean string for the backend
      const extraInfo = newAnswers.map(item => `Dr. AI: ${item.q}\nPatient: ${item.a}`).join('\n\n');
      const finalData = getCombinedData(extraInfo);
      processFinalSubmission(finalData);
    }
  };

  const handleSkipConsultation = () => {
    setConsultation({ ...consultation, show: false });
    // Process with whatever we have so far
    const extraInfo = consultation.answers.map(item => `Dr. AI: ${item.q}\nPatient: ${item.a}`).join('\n\n');
    const finalData = getCombinedData(extraInfo);
    processFinalSubmission(finalData);
  };

  return (
    <div className="page-transition" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
      
      {/* Virtual Doctor Chat Overlay */}
      <AnimatePresence>
        {consultation.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(242, 243, 249, 0.95)', backdropFilter: 'blur(16px)', 
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' 
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="card consultation-overlay"
              style={{ maxWidth: '650px', width: '100%', border: '2px solid var(--primary)', padding: '0', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            >
              {/* Header */}
              <div className="consultation-header" style={{ background: 'var(--surface-container-low)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--outline-variant)', flexShrink: 0 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Activity size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--primary)' }}>Virtual Dr. AI</h2>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '6px', height: '6px', background: 'var(--secondary)', borderRadius: '50%', display: 'inline-block' }}></span>
                    Consultation ({consultation.currentIdx + 1} of {consultation.questions.length})
                  </div>
                </div>
              </div>

              {/* Chat Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', flex: 1 }}>
                
                {/* AI Bubble */}
                <motion.div 
                  key={`q-${consultation.currentIdx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
                >
                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-container-low)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                     <Sparkles size={16} />
                   </div>
                   <div style={{ background: 'var(--surface-container-low)', padding: '1rem', borderRadius: '0 1rem 1rem 1rem', fontSize: '1rem', lineHeight: '1.5', color: 'var(--on-surface)', border: '1px solid rgba(0, 72, 141, 0.1)' }}>
                     {consultation.questions[consultation.currentIdx]}
                   </div>
                </motion.div>

                {/* User Input Area */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginTop: 'auto' }}
                >
                  <div style={{ flex: 1, position: 'relative' }}>
                    <textarea 
                      autoFocus
                      rows={2}
                      placeholder="Response..."
                      style={{ 
                        width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem 1rem 0 1rem', 
                        border: '1px solid var(--outline-variant)', background: 'white',
                        resize: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', fontSize: '1rem'
                      }}
                      value={consultation.currentAnswer}
                      onChange={(e) => setConsultation({...consultation, currentAnswer: e.target.value})}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (consultation.currentAnswer.trim()) handleNextQuestion();
                        }
                      }}
                    />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, flexShrink: 0 }}
                    onClick={handleNextQuestion} 
                    disabled={!consultation.currentAnswer.trim()}
                  >
                    <Send size={18} />
                  </button>
                </motion.div>
                
                <div style={{ textAlign: 'center' }}>
                   <button 
                     onClick={handleSkipConsultation}
                     style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer', opacity: 0.7 }}
                   >
                     Skip and generate report
                   </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-8">
        <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '1rem', background: 'rgba(0, 72, 141, 0.1)', color: 'var(--primary)', marginBottom: '1rem' }}>
          <ClipboardList size={32} />
        </div>
        <h1 className="text-2xl gradient-text">Health Risk Assessment</h1>
        <p className="text-muted">Fill in your details for a precision AI health analysis.</p>
      </div>

      <div className="card">
        {error && (
          <div className="mb-6 p-4" style={{ backgroundColor: 'rgba(186, 26, 26, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)', border: '1px solid var(--error)', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Info size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
              Personal Vitals
            </h3>
            <div className="form-group mb-6">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.6 }} />
                <input 
                  type="text" 
                  name="name" 
                  style={{ paddingLeft: '3rem' }}
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Enter your name for the report" 
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Age</label>
                <input type="number" name="age" required min="1" max="120" value={formData.age} onChange={handleChange} placeholder="Years" />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Weight (kg)</label>
                <input type="number" name="weight" required min="20" max="300" value={formData.weight} onChange={handleChange} placeholder="kg" />
              </div>
              <div className="form-group">
                <label>Height (cm)</label>
                <input type="number" name="height" required min="100" max="250" value={formData.height} onChange={handleChange} placeholder="cm" />
              </div>
            </div>

            <div className="grid-2" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)' }}>
              <div className="form-group">
                <label>Systolic BP (Optional)</label>
                <input type="number" name="systolic" value={formData.systolic} onChange={handleChange} placeholder="e.g. 120" />
              </div>
              <div className="form-group">
                <label>Diastolic BP (Optional)</label>
                <input type="number" name="diastolic" value={formData.diastolic} onChange={handleChange} placeholder="e.g. 80" />
              </div>
            </div>

            <div className="grid-2" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Calculated BMI</label>
                <input type="text" name="bmi" value={formData.bmi} readOnly placeholder="Auto-calculated" style={{ background: 'var(--surface-container-lowest)', cursor: 'not-allowed' }} />
              </div>
              <div className="form-group">
                <label>Pulse Pressure (mmHg)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    name="pulse_pressure" 
                    value={formData.pulse_pressure} 
                    onChange={handleChange} 
                    placeholder="Auto or Manual" 
                    style={{ background: 'var(--surface-container-low)' }} 
                  />
                  {!formData.systolic && !formData.diastolic && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Info size={12} />
                      Enter manually or auto-calculate via BP
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
              Lifestyle Factors
            </h3>
            <div className="grid-2">
              <div className="form-group">
                <label>Smoking</label>
                <select name="smoking" value={formData.smoking} onChange={handleChange}>
                  <option value="no">Non-Smoker</option>
                  <option value="yes">Smoker</option>
                </select>
              </div>
              <div className="form-group">
                <label>Alcohol</label>
                <select name="alcohol" value={formData.alcohol} onChange={handleChange}>
                  <option value="no">Non-Drinker</option>
                  <option value="yes">Regular Drinker</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Exercise Frequency</label>
              <select name="exercise" value={formData.exercise} onChange={handleChange}>
                <option value="low">Sedentary (Rarely)</option>
                <option value="medium">Moderate (1-3 times/week)</option>
                <option value="high">Active (4+ times/week)</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span>
              Symptoms & Context
            </h3>
            <div className="form-group">
              <label>Select Current Symptoms</label>
              <div className="chip-group">
                {COMMON_SYMPTOMS.map(sym => (
                  <div 
                    key={sym} 
                    className={`chip ${selectedSymptoms.includes(sym) ? 'selected' : ''}`}
                    onClick={() => toggleSymptom(sym)}
                  >
                    {sym}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group mt-4">
              <label>Detailed Description</label>
              <textarea 
                name="text_input" 
                rows={4} 
                value={formData.text_input} 
                onChange={handleChange}
                placeholder="Describe your health concerns in detail..."
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full py-4" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}></span>
                AI Analysis in Progress...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Begin Smart Analysis
                <ChevronRight size={20} />
              </span>
            )}
          </button>
        </form>
      </div>
      
      <p className="text-center text-light mt-8" style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', opacity: 0.7 }}>
        Medical Disclaimer: This AI tool is for informational purposes and not a substitute for professional medical advice.
      </p>
    </div>
  );
}
