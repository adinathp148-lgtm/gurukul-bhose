import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Briefcase,
  Copy,
  KeyRound
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { createTelecallerAccount, getNextTelecallerEmployeeId } from '../../services/auth/authService';

export const CreateTelecallerPage = () => {
  const navigate = useNavigate();
  const { isMarathi } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    whatsappNumber: '',
    employeeId: 'TC-01',
    gender: 'Male',
    address: '',
    joiningDate: new Date().toISOString().split('T')[0],
    assignedDepartment: 'शालेय प्रवेश (5th - 10th)',
    initialPassword: '',
    accountStatus: 'active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadNextId = async () => {
      try {
        const nextId = await getNextTelecallerEmployeeId();
        if (isMounted && nextId) {
          setFormData(prev => ({ ...prev, employeeId: nextId }));
        }
      } catch (e) {
        console.error('Failed to load next employee ID:', e);
      }
    };
    loadNextId();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (formData.mobileNumber.length < 10) {
      setError(isMarathi ? 'कृपया १० अंकी वैध मोबाईल नंबर प्रविष्ट करा.' : 'Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    try {
      const res = await createTelecallerAccount(formData);
      if (res.success) {
        setCreatedResult(res);
      } else {
        setError(res.error || (isMarathi ? 'टेलिकॉलर खाते तयार करताना त्रुटी आली.' : 'Error creating telecaller account.'));
      }
    } catch (err) {
      setError(err.message || (isMarathi ? 'तांत्रिक अडचण आली.' : 'A technical error occurred.'));
    }
    setLoading(false);
  };

  const handleCopyLink = () => {
    if (createdResult?.resetLink) {
      navigator.clipboard.writeText(createdResult.resetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/telecallers"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-gurukul-navy-900 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {isMarathi ? 'नवीन टेलिकॉलर खाते नोंदणी (Add New Telecaller)' : 'Add New Telecaller Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isMarathi 
              ? 'नवीन समुपदेशकाची माहिती भरा, लॉगिन क्रेडेंशियल्स तयार करा व परवानग्या सेट करा'
              : 'Fill counselor details, set login credentials, and configure access permissions'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Success State */}
      {createdResult ? (
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl space-y-6">
          <div className="flex items-center gap-3 text-emerald-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-emerald-900">
                {isMarathi ? 'टेलिकॉलर खाते यशस्वीपणे तयार झाले!' : 'Telecaller Account Successfully Created!'}
              </h3>
              <p className="text-xs text-emerald-700">
                {isMarathi ? (
                  <>समुपदेशक <strong>{formData.fullName}</strong> ({formData.email}) आता पोर्टलवर लॉगिन करू शकतात.</>
                ) : (
                  <>Counselor <strong>{formData.fullName}</strong> ({formData.email}) can now log in to the portal.</>
                )}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-semibold block">{isMarathi ? 'कर्मचारी ID (Employee ID):' : 'Employee ID:'}</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{formData.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">{isMarathi ? 'लॉगिन ईमेल (Login Email):' : 'Login Email:'}</span>
                <span className="font-bold text-slate-900">{formData.email}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">{isMarathi ? 'नेमून दिलेला विभाग:' : 'Assigned Department:'}</span>
                <span className="font-medium text-slate-800">{formData.assignedDepartment}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">{isMarathi ? 'खाते स्थिती:' : 'Account Status:'}</span>
                <span className="font-bold text-emerald-600">Active</span>
              </div>
            </div>

            {createdResult.resetLink && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <span className="text-slate-700 font-bold block flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-gurukul-saffron-600" />
                  <span>{isMarathi ? 'पासवर्ड सेट / इनव्हिटेशन लिंक (Password Setup Link):' : 'Password Setup / Invitation Link:'}</span>
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdResult.resetLink}
                    className="flex-1 text-xs px-3 py-2 bg-white border rounded-lg font-mono text-slate-700 select-all"
                  />
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    <span>{copied ? (isMarathi ? 'कॉपी झाले!' : 'Copied!') : (isMarathi ? 'कॉपी करा' : 'Copy')}</span>
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">
                  {isMarathi 
                    ? 'ही लिंक नवीन समुपदेशकाला ईमेल अथवा WhatsApp द्वारे पाठवून त्यांचा पासवर्ड सेट करण्यास सांगा.'
                    : 'Share this link with the new counselor via Email or WhatsApp so they can set their password.'}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={async () => {
                setCreatedResult(null);
                let nextId = 'TC-01';
                try {
                  nextId = await getNextTelecallerEmployeeId();
                } catch (e) {}
                setFormData({
                  fullName: '',
                  email: '',
                  mobileNumber: '',
                  whatsappNumber: '',
                  employeeId: nextId,
                  gender: 'Male',
                  address: '',
                  joiningDate: new Date().toISOString().split('T')[0],
                  assignedDepartment: isMarathi ? 'शालेय प्रवेश (5th - 10th)' : 'School Admissions (5th - 10th)',
                  initialPassword: '',
                  accountStatus: 'active'
                });
              }}
            >
              {isMarathi ? 'आणखी एक टेलिकॉलर जोडा' : 'Add Another Telecaller'}
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/admin/telecallers')}
            >
              {isMarathi ? 'टेलिकॉलर यादीकडे जा →' : 'Go to Telecallers List →'}
            </Button>
          </div>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-gurukul-saffron-600" />
              <span>{isMarathi ? '१. प्राथमिक वैयक्तिक तपशील (Personal Information)' : '1. Personal Information'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'पूर्ण नाव (Full Name) *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isMarathi ? 'उदा. सचिन मारुती पाटील' : 'e.g. Sachin Maruti Patil'}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'कर्मचारी ID (Employee ID) *' : 'Employee ID *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="TC-01"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {isMarathi ? 'TC-01 पासून स्वयंचलित अनुक्रमांक (Auto-generated)' : 'Auto-generated sequential ID starting from TC-01'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'लिंग (Gender)' : 'Gender'}
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
                >
                  <option value="Male">{isMarathi ? 'पुरुष (Male)' : 'Male'}</option>
                  <option value="Female">{isMarathi ? 'महिला (Female)' : 'Female'}</option>
                  <option value="Other">{isMarathi ? 'इतर (Other)' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'रुजू तारीख (Joining Date) *' : 'Joining Date *'}
                </label>
                <input
                  type="date"
                  required
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>{isMarathi ? '२. संपर्क व लॉगिन तपशील (Contact & Credentials)' : '2. Contact & Credentials'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'अधिकृत ईमेल पत्ता (Official Email) *' : 'Official Email *'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="telecaller@gurukulbhose.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'मोबाईल नंबर (Calling Mobile) *' : 'Calling Mobile *'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder={isMarathi ? '१० अंकी मोबाईल नंबर' : '10-digit mobile number'}
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    mobileNumber: e.target.value,
                    whatsappNumber: formData.whatsappNumber || e.target.value 
                  })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'WhatsApp नंबर' : 'WhatsApp Number'}
                </label>
                <input
                  type="tel"
                  placeholder={isMarathi ? 'पालकांशी चॅटिंगसाठी WhatsApp' : 'WhatsApp for parent communication'}
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'प्रारंभिक पासवर्ड (ऐच्छिक - स्वयंचलित जनरेट होईल)' : 'Initial Password (Optional - auto-generated)'}
                </label>
                <input
                  type="password"
                  placeholder={isMarathi ? 'रिकामे सोडल्यास सिस्टीम पासवर्ड तयार करेल' : 'Leave empty for system generated password'}
                  value={formData.initialPassword}
                  onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Department & Address */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>{isMarathi ? '३. विभाग व पत्ता (Department & Address)' : '3. Department & Address'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'नेमून दिलेला विभाग (Assigned Department)' : 'Assigned Department'}
                </label>
                <select
                  value={formData.assignedDepartment}
                  onChange={(e) => setFormData({ ...formData, assignedDepartment: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
                >
                  <option value="शालेय प्रवेश (5th - 10th)">{isMarathi ? 'शालेय प्रवेश (5th - 10th)' : 'School Admissions (5th - 10th)'}</option>
                  <option value="कॉलेज प्रवेश (11th - 12th Science & Arts)">{isMarathi ? 'कॉलेज प्रवेश (11th - 12th Science & Arts)' : 'College Admissions (11th - 12th Science & Arts)'}</option>
                  <option value="टॅलेंट सर्च व स्कॉलरशिप">{isMarathi ? 'टॅलेंट सर्च व स्कॉलरशिप' : 'Talent Search & Scholarship'}</option>
                  <option value="स्पोर्ट्स व डिफेन्स अकॅडमी">{isMarathi ? 'स्पोर्ट्स व डिफेन्स अकॅडमी' : 'Sports & Defense Academy'}</option>
                  <option value="सर्वसाधारण प्रवेश चौकशी">{isMarathi ? 'सर्वसाधारण प्रवेश चौकशी' : 'General Admission Enquiries'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'खाते प्रारंभिक स्थिती' : 'Initial Account Status'}
                </label>
                <select
                  value={formData.accountStatus}
                  onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
                >
                  <option value="active">{isMarathi ? 'सक्रिय (Active - तात्काळ लॉगिन सक्षम)' : 'Active (Immediate login enabled)'}</option>
                  <option value="inactive">{isMarathi ? 'निष्क्रिय (Inactive - तात्पुरते बंद)' : 'Inactive (Temporarily disabled)'}</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isMarathi ? 'पत्ता (Residential Address)' : 'Residential Address'}
                </label>
                <textarea
                  rows="2"
                  placeholder={isMarathi ? 'उदा. मु. पो. भोसे, ता. मिरज, जि. सांगली' : 'e.g. At Post Bhose, Tal. Miraj, Dist. Sangli'}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t flex items-center justify-end gap-3">
            <Link to="/admin/telecallers">
              <Button variant="outline" size="md">
                {isMarathi ? 'रद्द करा' : 'Cancel'}
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="shadow-md"
            >
              <span>{isMarathi ? 'टेलिकॉलर खाते तयार करा (Submit & Create)' : 'Create Telecaller Account'}</span>
            </Button>
          </div>

        </form>
      )}

    </div>
  );
};
