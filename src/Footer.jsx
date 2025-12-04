import React from 'react';
import { Gem } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <div className="footer-logo-icon">
            <Gem size={20} />
          </div>
          <span>KL Scents PH</span>
        </div>
        <p className="footer-tagline">Experience luxury in every drop</p>
        <p className="footer-copyright">© 2024 KL Scents PH. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;