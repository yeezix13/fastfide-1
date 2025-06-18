
interface MerchantLogoProps {
  logoUrl?: string | null;
  merchantName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-xl',
};

const MerchantLogo = ({ logoUrl, merchantName, size = 'md', className = '' }: MerchantLogoProps) => {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`Logo ${merchantName}`}
        className={`${sizeClasses[size]} object-contain rounded-lg ${className}`}
      />
    );
  }

  // Fallback vers les initiales si pas de logo
  return (
    <div className={`${sizeClasses[size]} bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold ${className}`}>
      {merchantName.substring(0, 2).toUpperCase()}
    </div>
  );
};

export default MerchantLogo;
