import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import { 
  Loader2, CheckCircle, AlertTriangle, FileText, UploadCloud, 
  MapPin, User, FileBarChart, Crosshair, CreditCard, ShieldAlert,
  ChevronRight, Check
} from 'lucide-react';

export const NewCasePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<'clean' | 'mismatch' | 'fraud' | 'custom'>('custom');

  // Form State
  const [formData, setFormData] = useState({
    district: '',
    taluk: '',
    village: '',
    sroOffice: '',
    applicantName: '',
    applicantPhone: '',
    applicantEmail: '',
    primarySurveyNo: '',
    subdivisionNo: '',
    propertyExtent: '',
    conveyanceValue: '',
    notes: '',
    propertyType: 'Agricultural', 
    registrationDate: new Date().toISOString().split('T')[0],
  });

  const [uploadedDocs, setUploadedDocs] = useState({
    patta: false,
    chitta: false,
    ec: false,
    saleDeed: false,
    fmb: false, 
    aadhaar: false, 
  });

  const [logs, setLogs] = useState<string[]>([
    '[System] Ready for new application ingestion.',
    '[System] Awaiting data entry and document upload...'
  ]);

  const handleSelectScenario = (scenario: 'clean' | 'mismatch' | 'fraud' | 'custom') => {
    setSelectedScenario(scenario);
    if (scenario === 'clean') {
      setFormData({
        district: 'Madurai',
        taluk: 'Madurai North',
        village: '088 - Othakadai Village',
        sroOffice: 'SRO Madurai North (TN-MDU-SRO-01)',
        applicantName: 'Arun Kumar Sundaram',
        applicantPhone: '9842100001',
        applicantEmail: 'arun.kumar@gmail.com',
        primarySurveyNo: '101/1',
        subdivisionNo: '1',
        propertyExtent: '2,400 sq.ft (5.51 cents)',
        conveyanceValue: '₹ 38,00,000',
        notes: 'Clear title conveyance deed with completely concordant Patta and EC.',
        propertyType: 'Residential',
        registrationDate: new Date().toISOString().split('T')[0],
      });
      setUploadedDocs({ patta: true, chitta: true, ec: true, saleDeed: true, fmb: true, aadhaar: true });
      setLogs([
        '[10:25:10] Loaded preset: Clean Match.',
        '[10:25:11] All document slots mapped to dummy secure store.',
        '[10:25:12] Ready for instant statutory clearance.'
      ]);
    } else if (scenario === 'mismatch') {
      setFormData({
        district: 'Chengalpattu',
        taluk: 'Sriperumbudur',
        village: '042 - Nemilichery Village',
        sroOffice: 'SRO Tambaram (TN-CHG-SRO-03)',
        applicantName: 'Saravana Kumar Narayanan',
        applicantPhone: '9842104091',
        applicantEmail: 'sk.narayanan@gov-mail.in',
        primarySurveyNo: '124/2A',
        subdivisionNo: '2A',
        propertyExtent: '2,400 sq.ft (5.51 cents)',
        conveyanceValue: '₹ 48,50,000',
        notes: 'Survey 124/2A vs 124/3 conflict flagged between Revenue Patta and Sub-Registrar EC.',
        propertyType: 'Commercial',
        registrationDate: new Date().toISOString().split('T')[0],
      });
      setUploadedDocs({ patta: true, chitta: true, ec: true, saleDeed: true, fmb: false, aadhaar: true });
      setLogs([
        '[10:24:00] Loaded preset: Survey Conflict.',
        '[10:24:01] Simulated mismatch ready to trigger Heuristic Rule #1.'
      ]);
    } else if (scenario === 'fraud') {
      setFormData({
        district: 'Kancheepuram',
        taluk: 'Kancheepuram',
        village: '019 - Sirukaveripakkam',
        sroOffice: 'SRO Kancheepuram (TN-KCH-SRO-02)',
        applicantName: 'M. Ramesh Babu',
        applicantPhone: '9842107777',
        applicantEmail: 'ramesh.babu@outlook.com',
        primarySurveyNo: '205/3',
        subdivisionNo: '3',
        propertyExtent: '3,200 sq.ft (7.35 cents)',
        conveyanceValue: '₹ 62,00,000',
        notes: 'Potential duplicate application detected with concurrent pending registration.',
        propertyType: 'Agricultural',
        registrationDate: new Date().toISOString().split('T')[0],
      });
      setUploadedDocs({ patta: true, chitta: true, ec: true, saleDeed: true, fmb: false, aadhaar: false });
      setLogs([
        '[10:26:01] Loaded preset: Duplicate Application Hazard.',
        '[10:26:02] Watch for entity collision during AI cross-verification.'
      ]);
    } else {
      setFormData({
        district: '', taluk: '', village: '', sroOffice: '',
        applicantName: '', applicantPhone: '', applicantEmail: '',
        primarySurveyNo: '', subdivisionNo: '', propertyExtent: '',
        conveyanceValue: '', notes: '', propertyType: 'Residential',
        registrationDate: new Date().toISOString().split('T')[0],
      });
      setUploadedDocs({ patta: false, chitta: false, ec: false, saleDeed: false, fmb: false, aadhaar: false });
      setLogs(['[System] Form cleared. Ready for custom input.']);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if(selectedScenario !== 'custom') {
        setSelectedScenario('custom');
    }
  };

  const handleDocToggle = (doc: keyof typeof uploadedDocs) => {
    setUploadedDocs(prev => ({ ...prev, [doc]: !prev[doc] }));
    if(selectedScenario !== 'custom') {
        setSelectedScenario('custom');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setLogs(prev => [...prev, '[System] Initiating Application Submit...']);
      
      let app;
      if (selectedScenario === 'clean') {
        app = await applicationService.seedDemoCase('case_1');
      } else if (selectedScenario === 'mismatch') {
        app = await applicationService.seedDemoCase('case_2');
      } else if (selectedScenario === 'fraud') {
        app = await applicationService.seedDemoCase('case_3');
      } else {
        setLogs(prev => [...prev, '[System] Creating custom application via API...']);
        app = await applicationService.createApplication({
          applicant_name: formData.applicantName || 'Unknown Applicant',
          applicant_phone: formData.applicantPhone || '0000000000',
          applicant_email: formData.applicantEmail || 'none@example.com',
          district: formData.district || 'Unknown District',
          taluk: formData.taluk || 'Unknown Taluk',
          village: formData.village || 'Unknown Village',
          primary_survey_no: formData.primarySurveyNo || '0',
          subdivision_number: formData.subdivisionNo || '0',
          property_extent: formData.propertyExtent || '0',
          notes: formData.notes || 'Custom application'
        });
      }

      setLogs(prev => [...prev, `[System] Application Created: ID ${app.id}`]);
      setLogs(prev => [...prev, '[System] Running AI Verification Engine...']);
      
      await applicationService.runVerification(app.id);
      
      setLogs(prev => [...prev, '[System] Verification Complete. Redirecting...']);
      setTimeout(() => {
        navigate(`/cases/${app.id}`);
      }, 800);
      
    } catch (err: any) {
      console.error('Failed to create case', err);
      setLogs(prev => [...prev, `[Error] Failed: ${err.message}`]);
      alert('Error creating case. Ensure backend is running.');
      setLoading(false);
    } 
  };

  const InputField = ({ label, name, type = 'text', placeholder, icon: Icon, required = false }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">{label} {required && '*'}</label>
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-[#86868b]" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={(formData as any)[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white focus:ring-4 focus:ring-[#0071e3]/10 text-[#1d1d1f] text-sm rounded-xl block ${Icon ? 'pl-9' : 'pl-4'} p-3 transition-all outline-none`}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans pb-24 text-[#1d1d1f]">
      {/* Top Ribbon & Stepper */}
      <section className="bg-white px-6 py-8 border-b border-[#d2d2d7]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#f5f5f7] text-[#1d1d1f] font-semibold text-[10px] px-2 py-1 rounded-md tracking-widest uppercase">
                TN-REV-2024-INGEST
              </span>
              <span className="text-[#86868b] font-medium text-xs uppercase tracking-wider">
                Form 1-A Statutory Lodgement
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
              New Case Ingestion & Verification
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mr-2">Presets:</span>
            <button onClick={() => handleSelectScenario('clean')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${selectedScenario === 'clean' ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}>
              <CheckCircle className="w-4 h-4" /> Clean Match
            </button>
            <button onClick={() => handleSelectScenario('mismatch')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${selectedScenario === 'mismatch' ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}>
              <AlertTriangle className="w-4 h-4" /> Survey Conflict
            </button>
            <button onClick={() => handleSelectScenario('fraud')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${selectedScenario === 'fraud' ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}>
              <ShieldAlert className="w-4 h-4" /> Duplicate
            </button>
          </div>
        </div>

        {/* Apple-style Stepper */}
        <div className="max-w-7xl mx-auto mt-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center font-semibold text-sm">1</div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Jurisdiction & Identity</span>
              <span className="text-xs text-[#86868b]">Form Formulated</span>
            </div>
          </div>
          <div className="h-px bg-[#d2d2d7] flex-1 hidden md:block"></div>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-semibold text-sm">2</div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#0071e3]">Multi-Doc Ingestion</span>
              <span className="text-xs text-[#0071e3]">Documents Tracked</span>
            </div>
          </div>
          <div className="h-px bg-[#d2d2d7] flex-1 hidden md:block"></div>
          <div className="flex items-center gap-3 flex-1 opacity-50">
            <div className="w-8 h-8 rounded-full bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] flex items-center justify-center font-semibold text-sm">3</div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Rapid OCR</span>
              <span className="text-xs text-[#86868b]">Pending</span>
            </div>
          </div>
          <div className="h-px bg-[#d2d2d7] flex-1 hidden md:block"></div>
          <div className="flex items-center gap-3 flex-1 opacity-50">
            <div className="w-8 h-8 rounded-full bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] flex items-center justify-center font-semibold text-sm">4</div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">AI Verification</span>
              <span className="text-xs text-[#86868b]">10-Point Rules</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Workspace */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column */}
        <form onSubmit={handleSubmit} className="xl:col-span-8 flex flex-col gap-8">
          
          {/* Section I: Jurisdiction & Identity */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50">
            <h2 className="text-xl font-semibold tracking-tight mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#86868b]" />
              I. Revenue Jurisdiction & Identity
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <InputField label="Full Name" name="applicantName" placeholder="e.g. Arun Kumar" required />
              <InputField label="Phone Number" name="applicantPhone" placeholder="e.g. 9842100001" type="tel" required />
              <InputField label="Email Address" name="applicantEmail" placeholder="e.g. name@domain.com" type="email" />
              <InputField label="Aadhaar / UIDAI Status" name="aadhaarStatus" placeholder="OTP e-KYC Verified" />
            </div>

            <div className="h-px bg-[#f5f5f7] w-full my-6"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Revenue District *</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white focus:ring-4 focus:ring-[#0071e3]/10 text-[#1d1d1f] text-sm rounded-xl p-3 transition-all outline-none"
                >
                  <option value="" disabled>Select District</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Chengalpattu">Chengalpattu</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Coimbatore">Coimbatore</option>
                </select>
              </div>
              <InputField label="Taluk Division" name="taluk" placeholder="e.g. Madurai North" required />
              <InputField label="Village & SRO Office" name="village" placeholder="e.g. 088 - Othakadai" required />
            </div>
          </div>

          {/* Section II: Survey & Value */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50">
            <h2 className="text-xl font-semibold tracking-tight mb-6 flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-[#86868b]" />
              II. Survey & Valuation Parameters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              <InputField label="Primary Survey No" name="primarySurveyNo" placeholder="e.g. 101/1" required />
              <InputField label="Sub-division" name="subdivisionNo" placeholder="e.g. 1" />
              <InputField label="Property Extent" name="propertyExtent" placeholder="e.g. 2,400 sq.ft" required />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Property Type</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white focus:ring-4 focus:ring-[#0071e3]/10 text-[#1d1d1f] text-sm rounded-xl p-3 transition-all outline-none"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Agricultural">Agricultural</option>
                </select>
              </div>
              
              <InputField label="Conveyance Value" name="conveyanceValue" placeholder="e.g. ₹ 38,00,000" required />
              <InputField label="Registration Date" name="registrationDate" type="date" required />
            </div>

            <div className="mt-5 flex flex-col gap-1.5">
               <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Additional Remarks</label>
               <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Any surveyor notes..."
                  className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white focus:ring-4 focus:ring-[#0071e3]/10 text-[#1d1d1f] text-sm rounded-xl p-3 transition-all outline-none resize-none"
                ></textarea>
            </div>
          </div>

          {/* Section III: 4-Slot Multi-Document Ingestion Matrix */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#86868b]" />
                III. Statutory Multi-Document Ingestion Matrix
              </h2>
              <span className="text-xs font-semibold text-[#0071e3] bg-[#0071e3]/10 px-3 py-1 rounded-full">
                PyMuPDF + Tesseract Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: 'patta', title: 'Patta Extract' },
                { id: 'chitta', title: 'Chitta Register' },
                { id: 'ec', title: 'Encumbrance (EC)' },
                { id: 'saleDeed', title: 'Sale Deed' },
                { id: 'fmb', title: 'FMB Sketch' },
                { id: 'aadhaar', title: 'Aadhaar Card' },
              ].map((doc, idx) => (
                <div 
                  key={doc.id}
                  onClick={() => handleDocToggle(doc.id as any)}
                  className={`relative p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 ${
                    (uploadedDocs as any)[doc.id] 
                      ? 'border-[#0071e3] bg-[#0071e3]/5 shadow-sm' 
                      : 'border-[#d2d2d7] bg-[#f5f5f7] hover:border-[#86868b]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Slot {idx + 1}</span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${(uploadedDocs as any)[doc.id] ? 'bg-[#0071e3] text-white' : 'border border-[#d2d2d7] bg-white'}`}>
                      {(uploadedDocs as any)[doc.id] && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                  <span className="font-semibold text-sm">{doc.title}</span>
                  <p className="text-xs text-[#86868b]">{(uploadedDocs as any)[doc.id] ? 'Document attached & validated.' : 'Click to simulate upload.'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-lg px-8 py-5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Executing 10-Point Rules...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Run Automated Verification</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Telemetry & Logs */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          
          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50">
            <h3 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
              <FileBarChart className="w-5 h-5 text-[#86868b]" />
              Pipeline Telemetry
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
               <div className="bg-[#f5f5f7] p-4 rounded-2xl flex flex-col">
                  <span className="text-xs font-semibold text-[#86868b] uppercase">OCR Confidence</span>
                  <span className="text-2xl font-bold mt-1">96.8%</span>
               </div>
               <div className="bg-[#f5f5f7] p-4 rounded-2xl flex flex-col">
                  <span className="text-xs font-semibold text-[#86868b] uppercase">Identity Match</span>
                  <span className="text-2xl font-bold mt-1">94.2%</span>
               </div>
               <div className="bg-[#f5f5f7] p-4 rounded-2xl flex flex-col">
                  <span className="text-xs font-semibold text-[#86868b] uppercase">Flags Detected</span>
                  <span className="text-2xl font-bold mt-1 text-[#e30000]">
                    {selectedScenario === 'clean' ? '0' : selectedScenario === 'custom' ? '-' : '1'}
                  </span>
               </div>
               <div className="bg-[#f5f5f7] p-4 rounded-2xl flex flex-col">
                  <span className="text-xs font-semibold text-[#86868b] uppercase">Entities</span>
                  <span className="text-2xl font-bold mt-1">42</span>
               </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm p-3 bg-[#f5f5f7] rounded-xl">
                <span className="font-medium text-[#86868b]">Survey No. Concordance</span>
                <span className="font-semibold">Checking...</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-[#f5f5f7] rounded-xl">
                <span className="font-medium text-[#86868b]">Extent Conversion Unit</span>
                <span className="font-semibold">Pending</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50 flex flex-col h-full min-h-[300px]">
            <h3 className="text-lg font-semibold tracking-tight mb-4 flex items-center justify-between">
              Execution Stream
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
            </h3>
            
            <div className="bg-[#f5f5f7] rounded-2xl p-4 flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed text-[#1d1d1f] space-y-2 border border-[#d2d2d7]/50">
              {logs.map((log, idx) => (
                <div key={idx} className={`${log.includes('Error') || log.includes('Conflict') ? 'text-[#e30000] font-semibold' : log.includes('Success') || log.includes('Clean') ? 'text-[#0071e3] font-semibold' : ''} break-words`}>
                  {log}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-[#86868b] mt-4">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewCasePage;
