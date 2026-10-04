// Line icons for the payment screens (same stroke style as the sidebar icons).
const Icon = ({ size = 18, children, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {children}
  </svg>
);

export const CheckIcon = (p) => <Icon size={12} strokeWidth="3" {...p}><path d="M20 6 9 17l-5-5" /></Icon>;
export const BackIcon = (p) => <Icon size={16} strokeWidth="2.2" {...p}><path d="m9 18 6-6-6-6" /></Icon>;
export const ShieldIcon = (p) => <Icon size={15} {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></Icon>;
export const PhoneIcon = (p) => <Icon {...p}><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" /></Icon>;
export const PostIcon = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Icon>;
export const CardIcon = (p) => <Icon {...p}><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20M6 15h4" /></Icon>;
export const CopyIcon = (p) => <Icon size={13} {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Icon>;
export const UploadIcon = (p) => <Icon size={20} {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></Icon>;
export const AlertIcon = (p) => <Icon size={14} {...p}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></Icon>;
export const ClockIcon = (p) => <Icon size={28} {...p}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Icon>;
export const BigCheckIcon = (p) => <Icon size={30} strokeWidth="2.4" {...p}><path d="M20 6 9 17l-5-5" /></Icon>;
export const CrossIcon = (p) => <Icon size={28} strokeWidth="2.4" {...p}><path d="M18 6 6 18M6 6l12 12" /></Icon>;
export const LockIcon = (p) => <Icon size={28} {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Icon>;
export const SendIcon = (p) => <Icon size={28} {...p}><path d="m22 2-7 20-4-9-9-4 20-7z" /><path d="M22 2 11 13" /></Icon>;
export const CoinsIcon = (p) => <Icon {...p}><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" /></Icon>;
export const LayersIcon = (p) => <Icon {...p}><path d="m12 2 10 5-10 5L2 7z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></Icon>;
export const WalletIcon = (p) => <Icon {...p}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></Icon>;
export const ChevronIcon = (p) => <Icon size={16} strokeWidth="2.2" {...p}><path d="m15 18-6-6 6-6" /></Icon>;
export const ArrowBackIcon = (p) => <Icon {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Icon>;
export const CloseIcon = (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12" /></Icon>;
export const ExternalIcon = (p) => <Icon size={15} {...p}><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></Icon>;

export const METHOD_ICONS = { baridimob: PhoneIcon, ccp: PostIcon, slickpay: CardIcon };
