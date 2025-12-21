
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
  // Cal AI style: Rounded-full, cleaner transitions
  const baseStyles = "w-full py-3.5 px-6 rounded-full font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-black text-white hover:bg-gray-900 shadow-lg shadow-gray-200/50",
    secondary: "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-200/50",
    outline: "border border-gray-200 text-gray-900 hover:border-gray-400 bg-transparent",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
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
      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-0 text-gray-900 font-medium placeholder-gray-400 focus:ring-2 focus:ring-black/5 outline-none transition-all"
    />
  </div>
);

export const NavItem = ({ Icon, label, active, onClick }: { Icon: LucideIcon; label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center space-y-1.5 w-full py-1 transition-all duration-300 ${
      active ? 'text-black scale-105' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} className={active ? "fill-black/5" : ""} />
    {/* Label removed for cleaner look or kept very small */}
    {/* <span className="text-[10px] font-medium">{label}</span> */}
  </button>
);
