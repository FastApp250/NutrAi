
import React from 'react';
import { LucideIcon } from 'lucide-react';

export const Logo = ({ size = "medium", className = "" }: { size?: "small" | "medium" | "large"; className?: string }) => {
  const dims = {
    small: { icon: 20, text: "text-lg" },
    medium: { icon: 32, text: "text-3xl" },
    large: { icon: 48, text: "text-5xl" }
  };
  
  const s = dims[size];

  return (
    <div className={`flex items-center gap-2.5 font-extrabold tracking-tight text-gray-900 ${className} select-none`}>
      <div className="relative text-green-600 flex items-center justify-center">
        {/* Abstract Leaf/Brain SVG */}
        <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeOpacity="0.1"/>
            <path d="M12 6V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M12 12L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M12 12L7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
        </svg>
      </div>
      <span className={s.text}>
        Nitr<span className="text-green-600">Ai</span>
      </span>
    </div>
  );
};

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button'
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) => {
  // Cal AI / Liquid Glass Style: Rounded-full, backdrop blur, transparency, borders
  const baseStyles = "w-full py-4 px-6 rounded-full font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 backdrop-blur-xl border";
  
  const variants = {
    // Black with glass effect
    primary: "bg-black/80 border-white/20 text-white hover:bg-black/90",
    
    // Green with glass effect
    secondary: "bg-green-600/80 border-white/20 text-white hover:bg-green-600/90",
    
    // Outline glass
    outline: "bg-white/30 border-gray-200 text-gray-900 hover:bg-white/50 hover:border-gray-400",
    
    // Ghost (minimal glass on hover)
    ghost: "bg-transparent border-transparent text-gray-600 hover:bg-gray-100/50",
    
    // Danger glass
    danger: "bg-red-50/80 border-red-100 text-red-600 hover:bg-red-100/80"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', onClick }: { children?: React.ReactNode; className?: string; onClick?: () => void }) => (
  // Softer shadows, larger border radius
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
  >
    {children}
  </div>
);

export const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  min,
  max
}: {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}) => (
  <div className="mb-5">
    <label className="block text-sm font-semibold text-gray-900 mb-2 ml-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      className="w-full px-5 py-4 rounded-2xl bg-white/50 backdrop-blur-md border border-gray-100 text-gray-900 font-medium placeholder-gray-400 focus:ring-2 focus:ring-black/10 focus:bg-white/80 outline-none transition-all shadow-sm"
    />
  </div>
);

export const NavItem = ({ Icon, label, active, onClick }: { Icon: LucideIcon; label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 py-2 transition-all duration-200 ${
      active ? 'text-black' : 'text-gray-400'
    }`}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    <span className={`text-[11px] font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
  </button>
);
