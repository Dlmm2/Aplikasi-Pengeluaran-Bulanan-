import React from 'react';
import {
  UtensilsCrossed,
  Car,
  Zap,
  ShoppingCart,
  Film,
  HeartPulse,
  GraduationCap,
  TrendingUp,
  Gift,
  Package,
  Briefcase,
  Laptop,
  Award,
  Coins,
  Wallet,
  Smartphone,
  Building2,
  Banknote,
  CreditCard,
  CircleDollarSign,
  type LucideProps
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'UtensilsCrossed':
      return <UtensilsCrossed {...props} />;
    case 'Car':
      return <Car {...props} />;
    case 'Zap':
      return <Zap {...props} />;
    case 'ShoppingCart':
      return <ShoppingCart {...props} />;
    case 'Film':
      return <Film {...props} />;
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'GraduationCap':
      return <GraduationCap {...props} />;
    case 'TrendingUp':
      return <TrendingUp {...props} />;
    case 'Gift':
      return <Gift {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'Laptop':
      return <Laptop {...props} />;
    case 'Award':
      return <Award {...props} />;
    case 'Coins':
      return <Coins {...props} />;
    case 'Smartphone':
      return <Smartphone {...props} />;
    case 'Building2':
      return <Building2 {...props} />;
    case 'Banknote':
      return <Banknote {...props} />;
    case 'CreditCard':
      return <CreditCard {...props} />;
    case 'Wallet':
      return <Wallet {...props} />;
    case 'Package':
    default:
      return <CircleDollarSign {...props} />;
  }
};
