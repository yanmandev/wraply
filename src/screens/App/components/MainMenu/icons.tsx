import type { SVGProps } from 'react';

// Иконки главного меню из прототипа docs/crm.html
type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  'aria-hidden': true,
};

export const LeadsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" strokeLinejoin="round" />
  </svg>
);

export const DealsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
  </svg>
);

export const TasksIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="m8 12 3 3 5-6" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChatsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12z" strokeLinejoin="round" />
  </svg>
);

export const DiskIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
  </svg>
);

export const KbIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path
      d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2V5zM19 16H6a2 2 0 0 0-2 2"
      strokeLinejoin="round"
    />
  </svg>
);

export const ProfileIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20c1.4-3.2 4.2-5 7.5-5s6.1 1.8 7.5 5" strokeLinecap="round" />
  </svg>
);

export const ThemeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path
      d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19"
      strokeLinecap="round"
    />
  </svg>
);

export const ExitIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path
      d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h11"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ExpandIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
  </svg>
);

export const CollapseIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const UsersIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 19.5c.9-3 3.2-4.7 6-4.7s5.1 1.7 6 4.7" strokeLinecap="round" />
    <path d="M15.5 4.9a3.2 3.2 0 0 1 0 6.2M17.5 14.9c1.7.6 2.9 2.2 3.5 4.6" strokeLinecap="round" />
  </svg>
);
