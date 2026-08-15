import React from 'react';
import {
  ShoppingBag,
  Fuel,
  Utensils,
  Shirt,
  Home,
  Zap,
  Plane,
  Film,
  HeartPulse,
  PawPrint,
  Tag,
  CreditCard,
  Building2,
  Banknote,
  Smartphone,
  Wallet,
  ArrowRightLeft,
  CheckCircle2,
  Plus,
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-5 h-5', style }) => {
  switch (iconName) {
    case 'ShoppingBag':
      return <ShoppingBag className={className} style={style} />;
    case 'Fuel':
      return <Fuel className={className} style={style} />;
    case 'Utensils':
      return <Utensils className={className} style={style} />;
    case 'Shirt':
      return <Shirt className={className} style={style} />;
    case 'Home':
      return <Home className={className} style={style} />;
    case 'Zap':
      return <Zap className={className} style={style} />;
    case 'Plane':
      return <Plane className={className} style={style} />;
    case 'Film':
      return <Film className={className} style={style} />;
    case 'HeartPulse':
      return <HeartPulse className={className} style={style} />;
    case 'PawPrint':
      return <PawPrint className={className} style={style} />;
    case 'CreditCard':
      return <CreditCard className={className} style={style} />;
    case 'Building2':
      return <Building2 className={className} style={style} />;
    case 'Banknote':
      return <Banknote className={className} style={style} />;
    case 'Smartphone':
      return <Smartphone className={className} style={style} />;
    case 'Wallet':
      return <Wallet className={className} style={style} />;
    case 'ArrowRightLeft':
      return <ArrowRightLeft className={className} style={style} />;
    case 'CheckCircle2':
      return <CheckCircle2 className={className} style={style} />;
    case 'Plus':
      return <Plus className={className} style={style} />;
    case 'Tag':
    default:
      return <Tag className={className} style={style} />;
  }
};
