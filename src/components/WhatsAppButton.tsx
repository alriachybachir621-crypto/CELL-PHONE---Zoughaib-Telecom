import React from 'react';

export function WhatsAppIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.002 2.667C8.64 2.667 2.668 8.638 2.668 16c0 2.352.616 4.648 1.787 6.672L2.56 29.59l7.088-1.859A13.28 13.28 0 0 0 16.002 29.333c7.362 0 13.333-5.971 13.333-13.333S23.364 2.667 16.002 2.667zm0 24.442c-2.01 0-3.98-.539-5.702-1.56l-.409-.243-4.205 1.103 1.123-4.1-.266-.423a11.06 11.06 0 0 1-1.694-5.886c0-6.15 5.003-11.153 11.153-11.153 6.15 0 11.153 5.003 11.153 11.153 0 6.15-5.003 11.109-11.153 11.109zm6.118-8.352c-.335-.168-1.984-.979-2.292-1.091-.307-.112-.531-.168-.754.168-.224.335-.867 1.091-1.063 1.315-.196.224-.391.252-.726.084-.335-.168-1.416-.522-2.697-1.664-.997-.889-1.67-1.987-1.866-2.322-.196-.335-.021-.517.147-.684.151-.15.335-.391.503-.587.168-.196.224-.335.335-.559.112-.224.056-.419-.028-.587-.084-.168-.754-1.817-1.035-2.488-.272-.653-.549-.565-.754-.575-.195-.01-.419-.012-.642-.012s-.587.084-.894.419c-.307.335-1.174 1.147-1.174 2.796s1.202 3.243 1.37 3.467c.168.224 2.365 3.612 5.73 5.065.8.346 1.425.552 1.912.707.804.255 1.535.219 2.113.133.645-.096 1.984-.811 2.263-1.594.28-.783.28-1.454.196-1.594-.084-.14-.308-.224-.643-.391z" />
    </svg>
  );
}

interface FloatingWhatsAppProps {
  phoneDigits: string;
  label: string;
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppProps> = ({
  phoneDigits,
  label,
}) => {
  const clean = phoneDigits.replace(/[^0-9]/g, '') || '9613399309';
  return (
    <a
      href={`https://wa.me/${clean}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-5 end-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/35 transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#26286B]"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
};
