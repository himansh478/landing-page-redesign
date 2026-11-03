'use client';

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceBookingForm } from './ServiceBookingForm';

const ALL_SERVICES = [
  'Vlog Edit', 'Documentary Edit', 'Reel Edit', 'Custom Edit', 'Wedding Edit',
  'Professional Shoot', 'Wedding Shoot', 'Insta & YouTube Video Shoot', 'Commercial Shoot',
  'Corporate Event Shoot', 'Marketing Shoot', 'Religious Shoot', 'Political Shoot', 'Cinematic Shoot'
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
      <div className="relative w-full max-w-sm md:ml-4" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-ink/45" aria-hidden="true" />
          <input
            type="text"
            aria-label="Search services"
            className="w-full h-10 bg-paper border border-ink/15 text-ink placeholder:text-ink/45 rounded-md pl-9 pr-4 !text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-editorial focus:border-editorial/40 transition-colors"
            placeholder="Search services..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
          />
        </div>

        <AnimatePresence>
          {isOpen && query.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-paper border border-ink/15 rounded-md overflow-hidden shadow-[0_18px_40px_-12px_rgb(var(--ink-rgb)/0.25)] z-50"
            >
              <div className="max-h-60 overflow-y-auto">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectService(service)}
                      className="w-full text-left px-4 py-3 !text-sm text-ink/75 hover:bg-editorial hover:text-ivory transition-colors border-b border-ink/10 last:border-0"
                    >
                      {service}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-ink/50 text-center">No matching services</div>
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
