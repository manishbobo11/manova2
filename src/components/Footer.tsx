import { Link } from 'react-router-dom';
import { footerLinks, type FooterLink } from '../config/footerLinks';

interface FooterLinkComponentProps {
  item: FooterLink;
  section: string;
}

const FooterLinkComponent = ({ item, section }: FooterLinkComponentProps) => {
  const baseClasses = "text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white rounded transition-colors";
  
  const handleClick = () => {
    // Analytics tracking
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture("footer_click", {
        label: item.label,
        href: item.href,
        section: section
      });
    }
  };

  if (item.type === 'internal') {
    return (
      <Link
        to={item.href}
        className={baseClasses}
        aria-label={item.label}
        onClick={handleClick}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <a
      href={item.href}
      target={item.href.startsWith('http') ? '_blank' : undefined}
      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className={baseClasses}
      aria-label={item.label}
      onClick={handleClick}
    >
      {item.label}
    </a>
  );
};

const Footer = () => {
  return (
    <footer className="w-full bg-[#101828] py-16">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-16">
          {/* Brand Section */}
          <div className="mb-8 lg:mb-0">
            <div className="flex items-center mb-6">
              <img
                src="/logo/manova-logo.png"
                alt="Manova Logo"
                className="w-[35px] h-[35px] mr-3 object-contain"
              />
              <span className="text-[20px] font-bold font-inter text-white">
                Manova
              </span>
            </div>
            <p className="text-[16px] font-normal font-inter text-white leading-5 max-w-[827px]">
              Empowering mental wellness through AI-driven insights and
              compassionate support. Your journey to better mental health
              starts here.
            </p>
          </div>
          {/* Connect Section */}
          <div className="text-center lg:text-right">
            <h3 className="text-[16px] font-bold font-inter text-white mb-4">
              Connect with Us
            </h3>
            <div className="space-y-2">
              {footerLinks.connect.map((item) => (
                <div key={item.label}>
                  <FooterLinkComponent item={item} section="connect" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="w-full h-px bg-[#B3B2B2] mb-16"></div>
        
        {/* Links Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {Object.entries(footerLinks)
            .filter(([section]) => section !== 'connect') // Connect section is already rendered above
            .map(([section, items]) => (
              <div key={section}>
                <h4 className="text-[16px] font-bold font-inter text-white mb-6 capitalize">
                  {section}
                </h4>
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.label}>
                      <FooterLinkComponent item={item} section={section} />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          }
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-[#B3B2B2] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[14px] font-normal font-inter text-[#B3B2B2]">
              © {new Date().getFullYear()} Manova. All rights reserved.
            </div>
            <div className="text-[14px] font-normal font-inter text-[#B3B2B2]">
              Made with ❤️ for mental wellness
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;