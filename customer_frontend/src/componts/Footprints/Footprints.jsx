import "bootstrap/dist/css/bootstrap.min.css";
import './RestaurantFootprints.css';

import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";

const Footprints = () => {
  const navigate = useNavigate();
  
  // Animation on scroll effect
  useEffect(() => {
    const achievementItems = document.querySelectorAll('.achievement-circle');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, { threshold: 0.3 });
    
    achievementItems.forEach(item => {
      observer.observe(item);
    });
    
    return () => {
      achievementItems.forEach(item => {
        observer.unobserve(item);
      });
    };
  }, []);

  return (
    <section className="restaurant-achievements py-5">
      <div className="container text-center">
        {/* Fashion Header */}
        <div className="restaurant-header mb-5">
          <h1 className="restaurant-title">
            Lithu Fashions
          </h1>
          <div className="restaurant-subtitle-container">
            <span className="restaurant-subtitle-decoration">•</span>
            <p className="restaurant-subtitle">
              Elegant Styles, Timeless Designs & Fashion Excellence
            </p>
            <span className="restaurant-subtitle-decoration">•</span>
          </div>
        </div>
        
        <h6 className="restaurant-tagline">A Journey of Style and Creativity</h6>
        <h2 className="restaurant-section-title mb-4">
          Our Fashion Story
        </h2>
        
        <div className="row justify-content-center mt-5">
          {/* Experience Circle */}
          <div className="col-md-4 col-sm-6 mb-4">
            <div className="achievement-circle experience-bg">
              <div className="achievement-content">
                <h3 className="achievement-number">8+</h3>
                <p className="achievement-text">Years in Fashion Industry</p>
              </div>
              <div className="achievement-icon">
                <i className="bi bi-award"></i>
              </div>
            </div>
          </div>
          
          {/* Designs Circle */}
          <div className="col-md-4 col-sm-6 mb-4">
            <div className="achievement-circle dishes-bg">
              <div className="achievement-content">
                <h3 className="achievement-number">500+</h3>
                <p className="achievement-text">Unique Designs Created</p>
              </div>
              <div className="achievement-icon">
                <i className="bi bi-book"></i>
              </div>
            </div>
          </div>
          
          {/* Customers Circle */}
          <div className="col-md-4 col-sm-6 mb-4">
            <div className="achievement-circle customers-bg">
              <div className="achievement-content">
                <h3 className="achievement-number">10K+</h3>
                <p className="achievement-text">Satisfied Customers</p>
              </div>
              <div className="achievement-icon">
                <i className="bi bi-people"></i>
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured Items Section */}
        <div className="featured-items-section mt-5 mb-4">
          <div className="featured-items-header">
            <span className="featured-items-line"></span>
            <h3 className="featured-items-title">Our Specialties</h3>
            <span className="featured-items-line"></span>
          </div>
          
          <div className="row mt-4">
            <div className="col-md-4 mb-4">
              <div className="featured-item">
                <div className="featured-item-icon">👗</div>
                <h4 className="featured-item-title">Designer Collections</h4>
                <p className="featured-item-description">
                  Trendsetting styles crafted with artistic vision
                </p>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="featured-item">
                <div className="featured-item-icon">🧵</div>
                <h4 className="featured-item-title">Premium Fabrics</h4>
                <p className="featured-item-description">
                  High-quality materials for exceptional comfort and style
                </p>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="featured-item">
                <div className="featured-item-icon">👔</div>
                <h4 className="featured-item-title">Custom Tailoring</h4>
                <p className="featured-item-description">
                  Personalized fittings for your perfect look
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Shop Now Button */}
        <div className="mt-4 mb-5">
          <button
            className="reservation-button"
            onClick={() => navigate("/collections")}
          >
            <span className="reservation-button-icon">🛍️</span> 
            Shop Our Collection
          </button>
        </div>
        
        {/* Testimonial */}
        <div className="testimonial-container">
          <div className="testimonial-quote-mark">"</div>
          <p className="testimonial-text">
            Every garment tells a story of creativity and craftsmanship. 
            We invite you to experience the extraordinary style of Lithu Fashions.
          </p>
          <p className="testimonial-author">
            - Lead Designer, Lithu Fashions
          </p>
          <div className="testimonial-quote-mark closing-mark">"</div>
        </div>
      </div>
    </section>
  );
};

export default Footprints;