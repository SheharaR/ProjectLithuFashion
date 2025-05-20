import "./Footer.css";

import { FaClock, FaEnvelope, FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhone, FaPinterest } from "react-icons/fa";

import React from "react";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <h1 className="footer-logo">Lithu Fashions</h1>
          <p>
            Experience fashion excellence at Lithu Fashions. We are passionate about 
            creating timeless styles with premium fabrics, innovative designs, 
            and exceptional craftsmanship.
          </p>
          <div className="footer-social-icons">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="social-icon" />
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="social-icon" />
            </a>
            <a href="https://www.pinterest.com/" target="_blank" rel="noopener noreferrer">
              <FaPinterest className="social-icon" />
            </a>
          </div>
        </div>
        <div className="footer-content-center">
          <h2>Quick Links</h2>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#collections">Collections</a></li>
            <li><a href="#new-arrivals">New Arrivals</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>Visit Us</h2>
          <ul>
            <div className="contact">
              <a href="tel:+15551234567" className="contact1">
                <FaPhone className="contact-icon" />
                <div>
                  +1 (555) 123-4567 <br /> 
                  +1 (555) 987-6543
                </div>
              </a>
            </div>
            <div className="contact">
              <a href="mailto:info@lithufashions.com" className="contact">
                <FaEnvelope className="contact-icon" />
                info@lithufashions.com
              </a>
            </div>
            <div className="contact">
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="contact">
                <FaMapMarkerAlt className="contact-icon" />
                123 Fashion Avenue,<br />Style City, CA 90210
              </a>
            </div>
            <div className="contact">
              <a href="#hours" className="contact">
                <FaClock className="contact-icon" />
                <div>
                  Mon-Fri: 10am-8pm<br />
                  Sat: 10am-9pm<br />
                  Sun: 11am-6pm
                </div>
              </a>
            </div>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">© {new Date().getFullYear()} Lithu Fashions™. All Rights Reserved.</p>
    </div>
  );
};

export default Footer;