import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { User, Briefcase, Mail, Phone, MapPin, Wrench, Camera, Link as LinkIcon, Map, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type LoginMode = 'select' | 'customer' | 'work';

export function GlobalAuthGate() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<LoginMode>('select');

  useEffect(() => {
    // Check if user is already authenticated
    const isAuth = localStorage.getItem('isSiteAuthenticated');
    if (isAuth === 'true') {
      return;
    }

    // Pop up after 1 minute (60,000ms)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 60000);

    return () => clearTimeout(timer);
  }, []);

  const handleCustomerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Data saved locally — connect to backend/CRM when ready
    localStorage.setItem('isSiteAuthenticated', 'true');
    setIsOpen(false);
  };

  const handleWorkSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Data saved locally — connect to backend/CRM when ready
    localStorage.setItem('isSiteAuthenticated', 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md bg-white border-0 shadow-2xl rounded-[32px] overflow-hidden p-0 [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black text-slate-900 text-center tracking-tight">
              {mode === 'select' && 'Welcome '}
              {mode === 'customer' && 'Login as Customer'}
              {mode === 'work' && 'Login for Work'}
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-medium">
              {mode === 'select' && 'Please identify yourself to continue accessing the website.'}
              {mode !== 'select' && 'Complete the form below to unlock access.'}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {mode === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid gap-4"
              >
                <button
                  onClick={() => setMode('customer')}
                  className="flex items-center justify-between w-full p-6 bg-slate-50 hover:bg-purple-50 hover:ring-2 hover:ring-purple-500 rounded-2xl transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-500 group-hover:text-purple-600 transition-colors">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-purple-700">Login as Customer</h3>
                      <p className="text-sm text-slate-500">I am looking to book a service.</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setMode('work')}
                  className="flex items-center justify-between w-full p-6 bg-slate-50 hover:bg-indigo-50 hover:ring-2 hover:ring-indigo-500 rounded-2xl transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-500 group-hover:text-indigo-600 transition-colors">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-700">Login for Work</h3>
                      <p className="text-sm text-slate-500">I am a professional looking to collaborate.</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            )}

            {mode === 'customer' && (
              <motion.form
                key="customer"
                onSubmit={handleCustomerSubmit}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="email"
                      name="email"
                      placeholder="Gmail Address"
                      className="w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="tel"
                      name="phone"
                      placeholder="Calling Number"
                      className="w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setMode('select')}
                    className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-purple-500/30"
                  >
                    Continue to Site
                  </button>
                </div>
              </motion.form>
            )}

            {mode === 'work' && (
              <motion.form
                key="work"
                onSubmit={handleWorkSubmit}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-3 max-h-[50vh] overflow-y-auto px-1 -mx-1 pb-2">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="text" name="fullName" placeholder="Full Name" className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="tel" name="whatsapp" placeholder="WhatsApp Number" className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="text" name="location" placeholder="Exact Location Address" className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input required type="text" name="state" placeholder="State" className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input required type="text" name="district" placeholder="District" className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="relative">
                    <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="text" name="skills" placeholder="Primary Skills (e.g. Editing, Camera)" className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="relative">
                     <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="text" name="equipment" placeholder="Equipments available?" className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="relative">
                     <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="url" name="portfolio" placeholder="Portfolio Link (Insta, YouTube, Drive)" className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setMode('select')}
                    className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/30"
                  >
                    Apply & Login
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
