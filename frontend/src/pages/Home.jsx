import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Vote, ChevronDown, Send, CheckCircle, Mail, Phone, MapPin, Shield, Users, Clock, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  
  // FAQ accordion state
  const [activeFaq, setActiveFaq] = useState(null);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactName && contactEmail && contactMessage) {
      setSubmitted(true);
      // Simulate form submission
      setTimeout(() => {
        setContactName('');
        setContactEmail('');
        setContactMessage('');
      }, 2000);
    }
  };

  const faqs = [
    {
      q: "How does VoteChain protect my ballot anonymity?",
      a: "VoteChain employs a decoupled ledger system. When you vote, we record that you voted in a general 'VoterLedger' (to prevent double-voting), but we append your vote to the candidate completely anonymously. There is zero database link connecting your voter profile to your specific candidate selection."
    },
    {
      q: "Can I vote multiple times in the same election?",
      a: "No. The system performs strict atomic verification. Once you cast a vote, your status is permanently set to 'Ballot Recorded' for that specific election in our secure ledger. Any duplicate requests are blocked instantly at the database level."
    },
    {
      q: "Can I vote in any active election?",
      a: "No. You can only vote in elections where the administrator has added your email address to the list of eligible voters. Eligible elections will be clearly marked on your Dashboard."
    },
    {
      q: "Why can't I see the results of an active election?",
      a: "To prevent strategic voting and preserve the integrity of the polls, election results are kept hidden from voters until the election has officially closed. Once the scheduled end time passes, results are automatically compiled and announced on your dashboard."
    },
    {
      q: "How do I register as an eligible voter?",
      a: "The election commission or administrator pre-registers eligible voter email listings. Simply create your account using your pre-registered email, set up your secure password, and access your dashboard."
    }
  ];

  return (
    <div className="home-container animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section glass-panel">
        <div className="hero-content">
          <div className="logo-badge">
            <Vote size={36} className="logo-badge-icon animate-pulse" />
            <span>VOTECHAIN LEDGER</span>
          </div>
          <h1>Decentralized Integrity.<br />Absolute Secrecy.</h1>
          <p className="hero-subtitle">
            Welcome to VoteChain, the next generation MERN-stack e-voting portal. Experience cryptographically secure polls, real-time result compilation, and absolute voter privacy.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="hero-btn primary">
                <span>Voter Dashboard</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hero-btn primary">
                  <span>Access Dashboard</span>
                </Link>
                <Link to="/register" className="hero-btn secondary">
                  <span>Register Credentials</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="features-section">
        <div className="section-title text-center">
          <h2>Engineered for Democratic Trust</h2>
          <p>Advanced security architecture designed to make voting accessible, transparent, and resilient.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-panel">
            <Shield className="feature-icon" size={32} />
            <h3>Double-Voting Guard</h3>
            <p>Atomically records your ballot casting state. Duplicate submissions are checked and blocked instantly.</p>
          </div>

          <div className="feature-card glass-panel">
            <Users className="feature-icon" size={32} />
            <h3>Voter Privacy Secrecy</h3>
            <p>Balances auditing ledger checks with ballot secrecy by decoupling the voter identity from the selected nominee.</p>
          </div>

          <div className="feature-card glass-panel">
            <Clock className="feature-icon" size={32} />
            <h3>Time-locked Results</h3>
            <p>Restricts visibility of result metrics until voting concludes, ensuring fair and uninfluenced outcomes.</p>
          </div>

          <div className="feature-card glass-panel">
            <Award className="feature-icon" size={32} />
            <h3>Live Recharts Analytics</h3>
            <p>Once polls close, result trends are rendered instantly through interactive SVG visualizations.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="section-title text-center">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about the system mechanics and security protocols.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item glass-panel ${activeFaq === index ? 'active' : ''}`}>
              <button onClick={() => toggleFaq(index)} className="faq-question">
                <span>{faq.q}</span>
                <ChevronDown className="faq-chevron" size={18} />
              </button>
              <div className="faq-answer">
                <div className="faq-answer-content">
                  <p>{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="section-title text-center">
          <h2>Connect with the Commission</h2>
          <p>Need support or have an audit inquiry? Reach out to our system coordinators.</p>
        </div>

        <div className="contact-grid">
          {/* Info Card */}
          <div className="contact-info-card glass-panel">
            <h3>Contact Information</h3>
            <p className="contact-muted">Our technical helpdesk operates 24/7 during active election cycles.</p>
            
            <div className="info-details">
              <div className="info-detail-item">
                <Mail className="detail-icon" size={20} />
                <div>
                  <h4>Email Support</h4>
                  <p>bhimireddymanasa23@gmail.com</p>
                </div>
              </div>

              <div className="info-detail-item">
                <Phone className="detail-icon" size={20} />
                <div>
                  <h4>Emergency Operations</h4>
                  <p>
                    +91 7981241598
                  </p>
                </div>
              </div>

              <div className="info-detail-item">
                <MapPin className="detail-icon" size={20} />
                <div>
                  <h4>HQ Address</h4>
                  <p>Guntur,Andhra Pradesh
            
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="contact-form-card glass-panel">
            <h3>Send an Inquiry</h3>
            {submitted ? (
              <div className="contact-success-state animate-scale-up">
                <CheckCircle size={48} className="text-success" />
                <h4>Inquiry Logged</h4>
                <p>Thank you. Your message has been cryptographically signed and dispatched to our helpdesk.</p>
                <button onClick={() => setSubmitted(false)} className="hero-btn primary mt-4">
                  <span>Send Another Message</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="contact-form">
                <div className="input-group">
                  <label htmlFor="contact-name">Full Name</label>
                  <input
                    type="text"
                    id="contact-name"
                    placeholder="E.g. Jane Doe"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="contact-email">Email Address</label>
                  <input
                    type="email"
                    id="contact-email"
                    placeholder="voter@election.org"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="contact-msg">Message Detail</label>
                  <textarea
                    id="contact-msg"
                    rows="4"
                    placeholder="State your technical support request or ledger feedback..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="form-submit-btn">
                  <span>Dispatched Inquiry</span>
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
