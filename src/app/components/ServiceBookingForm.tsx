import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from './ui/dialog';
import { supabase } from '../../lib/supabase';

interface ServiceBookingFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedService: string;
}

const shootTypes = [
  'Wedding Shoot',
  'Insta & YouTube Video Shoot',
  'Commercial Shoot',
  'Corporate Event Shoot',
  'Marketing Shoot',
  'Religious Shoot',
  'Political Shoot',
  'Cinematic Shoot',
];

const editingServices = [
  'Vlog Edit',
  'Documentary Edit',
  'Reel Edit',
  'AI Edit',
  'Custom Edit',
  'Wedding Edit',
  'Professional Shoot',
];

// common input styling
const fieldClass = "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all";
const selectClass = fieldClass + " [&>option]:bg-white";

// location suggestions for the datalist
const locationOptions = [
  'sehore', 'bhopal', 'Indore', 'Gwalior', 'Ujjain', 'Jabalpur',
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
];

export function ServiceBookingForm({ isOpen, onOpenChange, selectedService }: ServiceBookingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsappNumber: '',
    location: '',
    editingOption: selectedService || '',
    projectTitle: '',
    description: '',
    budget: '',
    timeline: '',
    referenceVideoLink: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // sync selected service when modal opens
  useEffect(() => {
    if (isOpen && selectedService) {
      setFormData(prev => ({ ...prev, editingOption: selectedService }));
    }
  }, [isOpen, selectedService]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isShootBooking = shootTypes.includes(formData.editingOption);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const commonData = {
      name: formData.name,
      email: formData.email,
      whatsapp_number: formData.whatsappNumber,
      location: formData.location,
      budget: formData.budget,
      timeline: formData.timeline,
      reference_video_link: formData.referenceVideoLink || null,
    };

    try {
      if (isShootBooking) {
        const { error } = await supabase.from('shoot_bookings').insert([{
          ...commonData,
          shoot_type: formData.editingOption,
          event_details: formData.description,
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('bookings').insert([{
          ...commonData,
          service_type: formData.editingOption,
          project_title: formData.projectTitle,
          description: formData.description,
        }]);
        if (error) throw error;
      }

      // reset on success
      setFormData({
        name: '', email: '', whatsappNumber: '', location: '',
        editingOption: selectedService || '',
        projectTitle: '', description: '', budget: '', timeline: '',
        referenceVideoLink: '',
      });
      onOpenChange(false);
      alert(`✅ ${isShootBooking ? 'Shoot' : 'Service'} booking saved successfully!`);
    } catch (err: any) {
      console.error('Supabase booking error:', err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/95 border border-slate-200 text-slate-900 max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
            Book Your <span className="text-gradient">Service</span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-light">
            Fill in the form below to request your service and we'll get back to you soon.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pr-4">
          {/* personal info */}
          <div className="space-y-4 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-indigo-500">👤</span> Personal Information
            </h3>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                placeholder="Enter your name" className={fieldClass} required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                placeholder="you@example.com" className={fieldClass} required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange}
                placeholder="+91 98765 43210 or 10 digit number" className={fieldClass} required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Location <span className="text-red-500">*</span>
              </label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange}
                placeholder="Select or type your location" list="locationList" className={fieldClass} required />
              <datalist id="locationList">
                {locationOptions.map(loc => <option key={loc} value={loc} />)}
              </datalist>
            </div>
          </div>

          {/* project / shoot details */}
          <div className="space-y-4 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-purple-500">🎬</span> {isShootBooking ? 'Shoot Details' : 'Project Details'}
            </h3>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                {isShootBooking ? 'Select Shoot' : 'Editing Service'} <span className="text-red-500">*</span>
              </label>
              <select name="editingOption" value={formData.editingOption} onChange={handleInputChange}
                className={selectClass} required>
                <option value="">Select a {isShootBooking ? 'shoot type' : 'service'}</option>
                {(isShootBooking ? shootTypes : editingServices).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {!isShootBooking && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Project Title</label>
                <input type="text" name="projectTitle" value={formData.projectTitle} onChange={handleInputChange}
                  placeholder="e.g., Summer Travel Vlog Series" className={fieldClass} />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                {isShootBooking ? 'Event/Project Details' : 'Project Description'}
              </label>
              <textarea name="description" value={formData.description} onChange={handleInputChange}
                placeholder={isShootBooking
                  ? "Tell us more about your shoot - location, date, special requirements..."
                  : "Describe your project, requirements, and specific needs..."
                }
                rows={3} className={fieldClass + " resize-none"} />
            </div>
          </div>

          {/* budget & timeline */}
          <div className="space-y-4 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-emerald-500">💰</span> Budget & Timeline
            </h3>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Budget Range <span className="text-red-500">*</span>
              </label>
              <select name="budget" value={formData.budget} onChange={handleInputChange} className={selectClass} required>
                <option value="">Select budget</option>
                <option value="₹0-500">₹0-500</option>
                <option value="₹500-1000">₹500-1000</option>
                <option value="₹1000-2500">₹1000-2500</option>
                <option value="₹2500-5000">₹2500-5000</option>
                <option value="₹5000+">₹5000+</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Required Timeline <span className="text-red-500">*</span>
              </label>
              <select name="timeline" value={formData.timeline} onChange={handleInputChange} className={selectClass} required>
                <option value="">Select timeline</option>
                <option value="Urgent (24-48 hours)">Urgent (24-48 hours)</option>
                <option value="ASAP (3-7 days)">ASAP (3-7 days)</option>
                <option value="1-2 weeks">1-2 weeks</option>
                <option value="2-4 weeks">2-4 weeks</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>

          {/* references */}
          <div className="space-y-4 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-orange-500">🔗</span> References & Links
            </h3>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Reference Video Link</label>
              <input type="url" name="referenceVideoLink" value={formData.referenceVideoLink} onChange={handleInputChange}
                placeholder="https://youtu.be/... or https://drive.google.com/..." className={fieldClass} />
            </div>
          </div>

          {submitError && (
            <p className="text-red-500 text-sm font-medium text-center">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 hover:bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-slate-200 mt-6 active:scale-95 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Save Booking'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
