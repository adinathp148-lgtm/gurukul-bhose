import React, { useState } from 'react';
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
import { createTelecallerAccount } from '../../services/auth/authService';

export const CreateTelecallerPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    whatsappNumber: '',
    employeeId: `TC-${Math.floor(100 + Math.random() * 900)}`,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (formData.mobileNumber.length < 10) {
      setError('कृपया १० अंकी वैध मोबाईल नंबर प्रविष्ट करा.');
      setLoading(false);
      return;
    }

    try {
      const res = await createTelecallerAccount(formData);
      if (res.success) {
        setCreatedResult(res);
      } else {
        setError(res.error || 'टेलिकॉलर खाते तयार करताना त्रुटी आली.');
      }
    } catch (err) {
      setError(err.message || 'तांत्रिक अडचण आली.');
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
            नवीन टेलिकॉलर खाते नोंदणी (Add New Telecaller)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            नवीन समुपदेशकाची माहिती भरा, लॉगिन क्रेडेंशियल्स तयार करा व परवानग्या सेट करा
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
                टेलिकॉलर खाते यशस्वीपणे तयार झाले!
              </h3>
              <p className="text-xs text-emerald-700">
                समुपदेशक <strong>{formData.fullName}</strong> ({formData.email}) आता पोर्टलवर लॉगिन करू शकतात.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-semibold block">कर्मचारी ID (Employee ID):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{formData.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">लॉगिन ईमेल (Login Email):</span>
                <span className="font-bold text-slate-900">{formData.email}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">नेमून दिलेला विभाग:</span>
                <span className="font-medium text-slate-800">{formData.assignedDepartment}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">खाते स्थिती:</span>
                <span className="font-bold text-emerald-600">Active</span>
              </div>
            </div>

            {createdResult.resetLink && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <span className="text-slate-700 font-bold block flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-gurukul-saffron-600" />
                  <span>पासवर्ड सेट / इनव्हिटेशन लिंक (Password Setup Link):</span>
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
                    <span>{copied ? 'कॉपी झाले!' : 'कॉपी करा'}</span>
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">
                  ही लिंक नवीन समुपदेशकाला ईमेल अथवा WhatsApp द्वारे पाठवून त्यांचा पासवर्ड सेट करण्यास सांगा.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setCreatedResult(null);
                setFormData({
                  fullName: '',
                  email: '',
                  mobileNumber: '',
                  whatsappNumber: '',
                  employeeId: `TC-${Math.floor(100 + Math.random() * 900)}`,
                  gender: 'Male',
                  address: '',
                  joiningDate: new Date().toISOString().split('T')[0],
                  assignedDepartment: 'शालेय प्रवेश (5th - 10th)',
                  initialPassword: '',
                  accountStatus: 'active'
                });
              }}
            >
              आणखी एक टेलिकॉलर जोडा
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/admin/telecallers')}
            >
              टेलिकॉलर यादीकडे जा →
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
              <span>१. प्राथमिक वैयक्तिक तपशील (Personal Information)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  पूर्ण नाव (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. सचिन मारुती पाटील"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  कर्मचारी ID (Employee ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="TC-101"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  लिंग (Gender)
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
                >
                  <option value="Male">पुरुष (Male)</option>
                  <option value="Female">महिला (Female)</option>
                  <option value="Other">इतर (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  रुजू तारीख (Joining Date) *
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
              <span>२. संपर्क व लॉगिन तपशील (Contact & Credentials)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  अधिकृत ईमेल पत्ता (Official Email) *
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
                  मोबाईल नंबर (Calling Mobile) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="१० अंकी मोबाईल नंबर"
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
                  WhatsApp नंबर
                </label>
                <input
                  type="tel"
                  placeholder="पालकांशी चॅटिंगसाठी WhatsApp"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  प्रारंभिक पासवर्ड (ऐच्छिक - स्वयंचलित जनरेट होईल)
                </label>
                <input
                  type="password"
                  placeholder="रिकामे सोडल्यास सिस्टीम पासवर्ड तयार करेल"
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
              <span>३. विभाग व पत्ता (Department & Address)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  नेमून दिलेला विभाग (Assigned Department)
                </label>
                <select
                  value={formData.assignedDepartment}
                  onChange={(e) => setFormData({ ...formData, assignedDepartment: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
                >
                  <option value="शालेय प्रवेश (5th - 10th)">शालेय प्रवेश (5th - 10th)</option>
                  <option value="कॉलेज प्रवेश (11th - 12th Science & Arts)">कॉलेज प्रवेश (11th - 12th Science & Arts)</option>
                  <option value="टॅलेंट सर्च व स्कॉलरशिप">टॅलेंट सर्च व स्कॉलरशिप</option>
                  <option value="स्पोर्ट्स व डिफेन्स अकॅडमी">स्पोर्ट्स व डिफेन्स अकॅडमी</option>
                  <option value="सर्वसाधारण प्रवेश चौकशी">सर्वसाधारण प्रवेश चौकशी</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  खाते प्रारंभिक स्थिती
                </label>
                <select
                  value={formData.accountStatus}
                  onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gurukul-saffron-500 focus:outline-none bg-white"
                >
                  <option value="active">सक्रिय (Active - तात्काळ लॉगिन सक्षम)</option>
                  <option value="inactive">निष्क्रिय (Inactive - तात्पुरते बंद)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  पत्ता (Residential Address)
                </label>
                <textarea
                  rows="2"
                  placeholder="उदा. मु. पो. भोसे, ता. मिरज, जि. सांगली"
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
                रद्द करा
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="shadow-md"
            >
              <span>टेलिकॉलर खाते तयार करा (Submit & Create)</span>
            </Button>
          </div>

        </form>
      )}

    </div>
  );
};
