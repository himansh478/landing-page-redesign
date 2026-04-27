import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceBookingForm } from './ServiceBookingForm';

const ALL_SERVICES = [
  'Vlog Edit',
  'Documentary Edit',
  'Reel Edit',
  'AI Edit',
  'Custom Edit',
  'Wedding Edit',
  'Professional Shoot',
  'Wedding Shoot',
  'Insta & YouTube Video Shoot',
  'Commercial Shoot',
  'Corporate Event Shoot',
  'Marketing Shoot',
  'Religious Shoot',
  'Political Shoot',
  'Cinematic Shoot'
];

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredServices = ALL_SERVICES.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectService = (service: string) => {
    setQuery(service);
    setSelectedService(service);
    setIsOpen(false);
    setIsFormOpen(true);
  };

  return (
    <>
      <div className="relative w-full max-w-sm ml-4" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            className="w-full bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all font-medium shadow-sm"
            placeholder="Search services (e.g., Vlog Edit)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
        </div>

        {/* dropdown */}
        <AnimatePresence>
          {isOpen && query.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl z-50"
            >
              <div className="max-h-60 overflow-y-auto">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectService(service)}
                      className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-b border-slate-100 last:border-0"
                    >
                      {service}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-400 text-center">
                    No matching services found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedService && (
        <ServiceBookingForm
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          selectedService={selectedService}
        />
      )}
    </>
  );
}
