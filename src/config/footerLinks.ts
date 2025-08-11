export interface FooterLink {
  label: string;
  href: string;
  type: 'internal' | 'external';
}

export interface FooterLinks {
  product: FooterLink[];
  support: FooterLink[];
  company: FooterLink[];
  resources: FooterLink[];
  connect: FooterLink[];
}

export const footerLinks: FooterLinks = {
  product: [
    { label: "How It Works", href: "/how-it-works", type: "internal" },
    { label: "Dashboard", href: "/dashboard", type: "internal" },
    { label: "Community", href: "/community", type: "internal" },
    { label: "Therapist Booking", href: "/therapist-booking", type: "internal" }
  ],
  support: [
    { label: "Help Center", href: "/help", type: "internal" },
    { label: "Privacy Policy", href: "/privacy", type: "internal" },
    { label: "Terms of Service", href: "/terms", type: "internal" },
    { label: "Contact Us", href: "mailto:contact@manova.life", type: "external" }
  ],
  company: [
    { label: "About Us", href: "/about", type: "internal" },
    { label: "Articles", href: "/articles", type: "internal" }
  ],
  resources: [
    { label: "Wellness Check-in", href: "/survey", type: "internal" },
    { label: "Accessibility", href: "/accessibility", type: "internal" },
    { label: "Crisis Support (KIRAN 1800-599-0019)", href: "https://telemanas.mohfw.gov.in/", type: "external" },
    { label: "Cookie Policy", href: "/cookies", type: "internal" }
  ],
  connect: [
    { label: "contact@manova.life", href: "mailto:contact@manova.life", type: "external" }
  ]
} as const;