import React, { useState } from 'react';
import './App.css';
import { TYRE_CATALOG } from './assets/tyres';

const API_URL = 'http://localhost:5000';
const SHOP_WHATSAPP = '0757972820';
const SHOP_FACEBOOK = `https://m.me/100089587897894?text=${encodeURIComponent(
  "Hello Ng'aa Tyres! I'd like to inquire about tyre availability and prices."
)}`;

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchWidth, setSearchWidth] = useState('');
  const [searchRim, setSearchRim] = useState('');

  // Callback modal state
  const [quoteModalTyre, setQuoteModalTyre] = useState(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [quoteSent, setQuoteSent] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  // Contact inquiry form state
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryTopic, setInquiryTopic] = useState('Free Tyre Fixing');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  const filteredTyres = TYRE_CATALOG.filter((tyre) => {
    const matchesBrand = selectedBrand === 'All' || tyre.brand === selectedBrand;
    const matchesWidth = searchWidth === '' || tyre.width === searchWidth;
    const matchesRim = searchRim === '' || tyre.rim === searchRim;
    return matchesBrand && matchesWidth && matchesRim;
  });

  const handleWhatsAppClick = (tyre) => {
    const pricePart = tyre.price ? ` listed at KES ${Number(tyre.price).toLocaleString()}` : '';
    const message = encodeURIComponent(
      `Hello Ng'aa Tyres! I saw your ad for the ${tyre.brand} ${tyre.model} (${tyre.size})${pricePart}. Is it in stock?`
    );
    window.open(`https://wa.me/${SHOP_WHATSAPP}?text=${message}`, '_blank');
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setQuoteError('');
    setIsSubmittingQuote(true);

    try {
      const response = await fetch(`${API_URL}/api/callbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customerPhone,
          tyre: quoteModalTyre
            ? {
                id: quoteModalTyre.id,
                brand: quoteModalTyre.brand,
                model: quoteModalTyre.model,
                size: quoteModalTyre.size,
                price: quoteModalTyre.price,
              }
            : {},
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not send callback request.');
      }

      setQuoteSent(true);
      setTimeout(() => {
        setQuoteSent(false);
        setQuoteModalTyre(null);
        setCustomerPhone('');
      }, 1800);
    } catch (err) {
      setQuoteError(err.message || 'Network error. Make sure the backend server is running.');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setInquiryError('');
    setIsSubmittingInquiry(true);

    try {
      const response = await fetch(`${API_URL}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName,
          phone: inquiryPhone,
          topic: inquiryTopic,
          message: inquiryMessage,
          source: activeTab === 'services' ? 'services' : 'contact',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not send inquiry.');
      }

      setInquirySent(true);
      setInquiryName('');
      setInquiryPhone('');
      setInquiryMessage('');
      setTimeout(() => setInquirySent(false), 3000);
    } catch (err) {
      setInquiryError(err.message || 'Network error. Make sure the backend server is running.');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const openHomeAndScroll = (sectionId) => {
    setActiveTab('home');
    setTimeout(() => {
      if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const openSingleTab = (e, tabName) => {
    e.preventDefault();
    setActiveTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderServicesSection = (isStandalone = false) => (
    <section
      id="services"
      className={`services-section ${isStandalone ? 'services-standalone' : ''}`}
    >
      <div className="section-container">
        {isStandalone && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => openHomeAndScroll(null)}
              className="btn btn-secondary"
            >
              ← Back to Homepage
            </button>
          </div>
        )}

        <div className="services-header">
          <span className="badge">Workshop & Fitment Bay</span>
          <h2>Our Tyre Services</h2>
          <p>
            Fast, reliable tyre care handled by experienced technicians while you wait.
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <span className="service-num">01</span>
            <h3>Free Tyre Fixing</h3>
            <p>
              Buy any tyre from Ng'aa Tyres and get professional hydraulic mounting and fitting on your vehicle completely free of charge.
            </p>
          </div>

          <div className="service-card">
            <span className="service-num">02</span>
            <h3>Puncture Repair</h3>
            <p>
              Quick, permanent tubeless puncture plugging, valve replacement, and air-leak sealing to get you back on the road safely.
            </p>
          </div>

          <div className="service-card">
            <span className="service-num">03</span>
            <h3>Nitrogen Inflation</h3>
            <p>
              Pure nitrogen filling for cooler running temperatures, longer-lasting tyre pressure, and improved fuel economy on highway trips.
            </p>
          </div>
        </div>

        <div className="services-cta">
          <p>Need tyre fixing, puncture repair, or nitrogen inflation today?</p>
          <a
            href={`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(
              "Hello Ng'aa Tyres! I'd like to inquire about your tyre services."
            )}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            Book via WhatsApp
          </a>
        </div>
      </div>
    </section>
  );

  const renderAboutSection = (isStandalone = false) => (
    <section
      id="about"
      className={`services-section ${isStandalone ? 'services-standalone' : ''}`}
    >
      <div className="section-container">
        {isStandalone && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => openHomeAndScroll(null)}
              className="btn btn-secondary"
            >
              ← Back to Homepage
            </button>
          </div>
        )}

        <div className="services-header">
          <span className="badge">Who We Are</span>
          <h2>About Ng'aa Tyres</h2>
          <p>
            Trusted genuine tyres, honest pricing, and quick drive-in fitment for everyday drivers, fleet operators, and commercial trucks.
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <span className="service-num">01</span>
            <h3>Genuine Imported Stock</h3>
            <p>
              We source reliable treads across passenger cars, SUVs, 15C vans, and heavy commercial sizes so you get strong mileage and road safety.
            </p>
          </div>

          <div className="service-card">
            <span className="service-num">02</span>
            <h3>Fast Turnaround</h3>
            <p>
              Pull in for quick tyre fitting, puncture repair, or nitrogen inflation without long queues or guesswork.
            </p>
          </div>

          <div className="service-card">
            <span className="service-num">03</span>
            <h3>Direct Chat Support</h3>
            <p>
              Check tyre sizes, stock availability, and package deals straight on WhatsApp or Facebook Messenger before you even drive over.
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  const renderContactSection = (isStandalone = false) => (
    <section
      id="contact"
      className={`services-section ${isStandalone ? 'services-standalone' : ''}`}
    >
      <div className="section-container">
        {isStandalone && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => openHomeAndScroll(null)}
              className="btn btn-secondary"
            >
              ← Back to Homepage
            </button>
          </div>
        )}

        <div className="services-header">
          <span className="badge">Reach Out Anytime</span>
          <h2>Contact Us</h2>
          <p>
            Open Mon – Sat: 8:00 AM – 6:00 PM. Message us directly for quotes, stock checks, or directions.
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <span className="service-num">CALL / WA</span>
            <h3>Phone & WhatsApp</h3>
            <p>0757972820</p>
            <div style={{ marginTop: '0.85rem' }}>
              <a
                href={`https://wa.me/${SHOP_WHATSAPP}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="service-card">
            <span className="service-num">FB CHAT</span>
            <h3>Facebook Messenger</h3>
            <p>Send us a direct message on Facebook for quick replies and tyre inquiries.</p>
            <div style={{ marginTop: '0.85rem' }}>
              <a
                href={SHOP_FACEBOOK}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
              >
                Message on Facebook
              </a>
            </div>
          </div>

          <div className="service-card">
            <span className="service-num">EMAIL</span>
            <h3>Email & Hours</h3>
            <p>antonysikuku02@gmail.com • Mon – Sat: 8:00 AM – 6:00 PM</p>
          </div>
        </div>

        <div className="service-card" style={{ marginTop: '1.75rem', maxWidth: '640px', marginInline: 'auto' }}>
          <h3>Send an Inquiry</h3>
          <p style={{ marginBottom: '1rem' }}>
            Leave your details and we will follow up via phone or WhatsApp.
          </p>

          {inquirySent && (
            <div className="success-msg" style={{ marginBottom: '0.9rem' }}>
              ✓ Inquiry saved! Our team will get back to you shortly.
            </div>
          )}

          {inquiryError && (
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              {inquiryError}
            </p>
          )}

          <form onSubmit={handleInquirySubmit} style={{ display: 'grid', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="Your name (optional)"
              value={inquiryName}
              onChange={(e) => setInquiryName(e.target.value)}
            />
            <input
              type="tel"
              required
              placeholder="Phone number (e.g. 0712 345 678)"
              value={inquiryPhone}
              onChange={(e) => setInquiryPhone(e.target.value)}
            />
            <select
              value={inquiryTopic}
              onChange={(e) => setInquiryTopic(e.target.value)}
            >
              <option value="Free Tyre Fixing">Free Tyre Fixing</option>
              <option value="Puncture Repair">Puncture Repair</option>
              <option value="Nitrogen Inflation">Nitrogen Inflation</option>
              <option value="Tyre Stock & Pricing">Tyre Stock & Pricing</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
            <textarea
              required
              rows={3}
              placeholder="Tell us the tyre size, vehicle model, or service you need..."
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={isSubmittingInquiry}
              className="btn btn-primary"
            >
              {isSubmittingInquiry ? 'Sending...' : 'Submit Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );

  return (
    <div>
      <nav className="navbar">
        <div className="nav-container">
          <div
            className="logo"
            style={{ cursor: 'pointer' }}
            onClick={() => openHomeAndScroll(null)}
          >
            NG'AA <span>TYRES</span>
          </div>

          <div className="nav-links">
            <a
              href="#deals"
              onClick={(e) => {
                e.preventDefault();
                openHomeAndScroll('deals');
              }}
            >
              Hot Deals
            </a>
            <a
              href="#services"
              className={activeTab === 'services' ? 'active-nav-link' : ''}
              onClick={(e) => openSingleTab(e, 'services')}
            >
              Services
            </a>
            <a
              href="#about"
              className={activeTab === 'about' ? 'active-nav-link' : ''}
              onClick={(e) => openSingleTab(e, 'about')}
            >
              About Us
            </a>
            <a
              href="#contact"
              className={activeTab === 'contact' ? 'active-nav-link' : ''}
              onClick={(e) => openSingleTab(e, 'contact')}
            >
              Contact Us
            </a>
          </div>
          <div className="nav-socials">
            <a
              href={SHOP_FACEBOOK}
              target="_blank"
              rel="noreferrer"
              className="social-icon-btn fb-btn"
              aria-label="Visit Ng'aa Tyres on Facebook"
              title="Facebook"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
              </svg>
            </a>

            <a
              href={`https://wa.me/${SHOP_WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className="social-icon-btn wa-btn"
              aria-label="Chat with Ng'aa Tyres on WhatsApp"
              title="WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.82 14.01c-.24.68-1.41 1.3-1.95 1.38-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.01-2.42.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.14-.3.3-.13.59.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.15.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.65-.14.27.1 1.69.8 1.98.94.29.15.48.22.55.34.07.12.07.7-.17 1.38z" />
              </svg>
            </a>
          </div>

          <a
            href={`https://wa.me/${SHOP_WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-whatsapp"
          >
            WhatsApp Us
          </a>
        </div>
      </nav>

      {activeTab === 'services' ? (
        renderServicesSection(true)
      ) : activeTab === 'about' ? (
        renderAboutSection(true)
      ) : activeTab === 'contact' ? (
        renderContactSection(true)
      ) : (
        <>
          {/* HERO SHOWCASE */}
          <header className="hero">
            <div className="hero-container">
              <div>
                <span className="badge">Genuine Imported Tyres • Best Local Prices</span>
                <h1>
                  Grip the Road With <span>Confidence.</span>
                </h1>
                <p>
                  From rugged 4x4 all-terrain treads to smooth highway tourers—Ng'aa Tyres stocks top global brands with professional mounting while you wait.
                </p>
                <div className="filter-box">
                  <label>Filter Advertised Stock by Size</label>
                  <div className="filter-controls">
                    <select value={searchWidth} onChange={(e) => setSearchWidth(e.target.value)}>
                      <option value="">All Widths</option>
                      <option value="195">195 mm</option>
                      <option value="205">205 mm</option>
                      <option value="225">225 mm</option>
                      <option value="235">235 mm</option>
                      <option value="245">245 mm</option>
                      <option value="265">265 mm</option>
                    </select>

                    <select value={searchRim} onChange={(e) => setSearchRim(e.target.value)}>
                      <option value="">All Rim Sizes</option>
                      <option value="15">R15</option>
                      <option value="16">R16</option>
                      <option value="17">R17</option>
                      <option value="18">R18</option>
                    </select>

                    <button
                      onClick={() => {
                        setSearchWidth('');
                        setSearchRim('');
                        setSelectedBrand('All');
                      }}
                      className="btn btn-secondary"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* FEATURED HERO DEAL */}
              <div className="hero-featured-card">
                <img
                  src="../images/main.jpeg"
                  alt="Featured Tyre Deal"
                />
                <div className="featured-info"></div>
              </div>
            </div>
          </header>

          {/* ADVERTISED CATALOG */}
          <section id="deals" className="section-container">
            <div className="catalog-header">
              <div>
                <h2>Featured Tyres</h2>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                  Click any tyre to inquire directly on WhatsApp or request a callback.
                </p>
              </div>

              <div className="brand-pills">
                {['All', 'Goddard', 'Comforser', 'Maxtrek', 'kapsen', 'Double Road', 'Zextour'].map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`pill ${selectedBrand === brand ? 'active' : ''}`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            <div className="tyre-grid">
              {filteredTyres.map((tyre) => (
                <div key={tyre.id} className="tyre-card">
                  <div>
                    <div className="card-image-wrapper">
                      <span className="category-tag">{tyre.category}</span>
                      <img src={tyre.image} alt={tyre.model} />
                    </div>

                    <div className="card-body">
                      <div className="card-meta">
                        <span className="brand-name">{tyre.brand}</span>
                        <span className="tyre-size">{tyre.size}</span>
                      </div>
                      <h3>{tyre.model}</h3>
                      <p className="tyre-description">{tyre.description}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setQuoteError('');
                            setQuoteModalTyre(tyre);
                          }}
                          className="btn btn-secondary"
                        >
                          Request Callback
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWhatsAppClick(tyre)}
                          className="btn btn-whatsapp"
                        >
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SERVICES ON HOMEPAGE */}
          {renderServicesSection(false)}

          {/* ABOUT US ON HOMEPAGE */}
          {renderAboutSection(false)}

          {/* CONTACT US ON HOMEPAGE */}
          {renderContactSection(false)}
        </>
      )}

      {/* FOOTER */}
      <footer id="location" className="footer">
        <div className="footer-container">
          <div>
            <div className="logo">
              NG'AA <span>TYRES</span>
            </div>
            <p>Open Mon – Sat: 8:00 AM – 6:00 PM</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'blue', fontWeight: 700 }}>Call / WhatsApp: 0757972820</p>
            <span style={{ fontSize: '0.8rem' }}>antonysikuku02@gmail.com</span>
          </div>
        </div>
      </footer>

      {/* CALLBACK MODAL */}
      {quoteModalTyre && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button onClick={() => setQuoteModalTyre(null)} className="close-btn">✕</button>
            <span className="brand-name">Quick Callback</span>
            <h3 style={{ marginTop: '4px' }}>
              {quoteModalTyre.brand} {quoteModalTyre.model} ({quoteModalTyre.size})
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '8px' }}>
              Enter your phone number and our team will call you within 10 minutes with a complete 4-tyre package quote.
            </p>

            {quoteSent ? (
              <div className="success-msg">✓ Request received! We will call you shortly.</div>
            ) : (
              <form onSubmit={handleQuoteSubmit}>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0712 345 678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                {quoteError && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    {quoteError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {isSubmittingQuote ? 'Sending...' : 'Send Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}