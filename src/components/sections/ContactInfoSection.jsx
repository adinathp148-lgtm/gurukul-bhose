import React from 'react';
import { Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { institutionInfo } from '../../data/initialData';

export const ContactInfoSection = ({ institution = institutionInfo }) => {
  const primaryPhone = institution?.phones?.[0] || '9850449800';
  const allPhones = Array.isArray(institution?.phones) && institution.phones.length > 0
    ? institution.phones.join(' / ')
    : '9850449800 / 9850449808 / 7020260968';

  const formattedAddress = typeof institution?.address === 'object'
    ? `${institution.address.line1 || ''}, ${institution.address.landmark ? institution.address.landmark + ', ' : ''}${institution.address.taluka ? 'ता. ' + institution.address.taluka + ', ' : ''}${institution.address.district ? 'जि. ' + institution.address.district : ''} ${institution.address.pincode ? '- ' + institution.address.pincode : ''}`
    : (institution?.address || 'दंडोबा डोंगर पायथ्याला, यल्लामा मंदिर जवळ, मिरज-पंढरपूर हायवे लगत, भोसे, ता. मिरज, जि. सांगली.');

  const workingHours = institution?.workingHours || institution?.officeHours || 'सोमवार - रविवार: ९ AM - ५ PM (७ दिवस सुरू)';
  const mapUrl = institution?.googleMapsUrl || 'https://maps.google.com/?q=Gurukul+Bhose+Miraj+Sangli';
  const mapEmbed = institution?.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15277.937222415177!2d74.75549!3d16.80287!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1230000000001%3A0x1!2sBhose%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin';

  return (
    <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-6 p-8 sm:p-10 space-y-6 flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gurukul-saffron-600 block">
            कॅम्पस संपर्क व पत्ता
          </span>
          <h2 className="text-2xl font-black text-gurukul-navy-900 mt-1">
            प्रत्यक्ष संस्थेला भेट द्या
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            पालकांनी पाल्यासह प्रत्यक्ष संस्थेला भेट देऊन निसर्गरम्य परिसर, वसतिगृह, वर्ग आणि क्रीडांगणाची पाहणी करावी.
          </p>

          <div className="mt-6 space-y-4 text-xs text-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-gurukul-saffron-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="leading-relaxed">
                <strong className="block text-slate-900">पत्ता (Address):</strong>
                {formattedAddress}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-gurukul-navy-900 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900">संपर्क क्रमांक (Phones):</strong>
                <span>{allPhones}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900">ईमेल (Email):</strong>
                <a href={`mailto:${institution?.email || 'contact@gurukulbhose.com'}`} className="text-gurukul-saffron-600 hover:underline">
                  {institution?.email || 'contact@gurukulbhose.com'}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900">कार्यालयीन वेळ (Working Hours):</strong>
                <span>{workingHours}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
          <a
            href={`tel:${primaryPhone}`}
            className="text-xs font-bold text-white bg-gurukul-navy-900 hover:bg-black px-4 py-2.5 rounded-lg transition-colors"
          >
            आत्ताच कॉल करा (Call Now)
          </a>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-slate-700 hover:text-gurukul-saffron-600 flex items-center gap-1"
          >
            <span>Google Maps उघडा</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Map iframe */}
      <div className="lg:col-span-6 min-h-[350px] bg-slate-100">
        <iframe
          src={mapEmbed}
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: '380px' }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Gurukul Bhose Campus Location"
        />
      </div>
    </section>
  );
};
