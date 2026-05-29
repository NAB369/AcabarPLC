'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, FileText, CreditCard, BarChart3, Smartphone, CheckCircle2, Lock, Menu } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0e17', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <style>{`
        .section-padding { padding: 3rem 1.5rem; }
        .grid-responsive-2 { display: grid; grid-template-columns: 1fr; gap: 3rem; align-items: center; }
        .grid-responsive-4 { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        .nav-links { display: none; gap: 2rem; font-size: 0.875rem; color: #cbd5e1; }
        .nav-menu-btn { display: block; background: none; border: none; color: white; cursor: pointer; }
        .hero-title { font-size: clamp(2.5rem, 8vw, 4.5rem); font-weight: 900; line-height: 1.1; margin: 0; letter-spacing: -0.02em; color: white; }
        .hero-subtitle { font-size: clamp(1rem, 3vw, 1.125rem); color: #94a3b8; line-height: 1.6; max-width: 90%; margin: 0; }
        .section-title { font-size: clamp(2rem, 5vw, 3rem); font-weight: 900; color: white; line-height: 1.1; margin: 0 0 1rem 0; }
        .btn-group { display: flex; flex-direction: column; gap: 1rem; width: 100%; margin-top: 1rem; }
        .btn-group > * { width: 100%; text-align: center; justify-content: center; }
        .stats-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; margin-top: 2rem; }
        .stats-mini-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        .glass-card { background: linear-gradient(145deg, #151a28 0%, #0f131f 100%); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .badge-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; }
        
        @media (min-width: 768px) {
          .section-padding { padding: 4rem 3rem; }
          .grid-responsive-4 { grid-template-columns: repeat(2, 1fr); }
          .btn-group { flex-direction: row; width: auto; }
          .btn-group > * { width: auto; }
          .stats-grid { grid-template-columns: repeat(3, 1fr); gap: 3rem; }
          .stats-mini-grid { grid-template-columns: 1fr 1fr; }
          .glass-card { padding: 2.5rem; }
        }

        @media (min-width: 1024px) {
          .section-padding { padding: 6rem 4rem; }
          .nav-padding { padding: 1.5rem 4rem; }
          .grid-responsive-2 { grid-template-columns: 1fr 1fr; gap: 4rem; }
          .grid-responsive-4 { grid-template-columns: repeat(4, 1fr); }
          .nav-links { display: flex; }
          .nav-menu-btn { display: none; }
        }
      `}</style>
      
      {/* Navigation Bar */}
      <nav className="nav-padding" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: '#fbbf24', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#000', fontSize: '1.25rem', boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)' }}>
            A
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: 1 }}>Acabar Plc</div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.125rem' }}>Digital Lending Platform</div>
          </div>
        </div>

        <div className="nav-links">
          <a href="#features" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#cbd5e1'}>Features</a>
          <a href="#solutions" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#cbd5e1'}>Solutions</a>
          <a href="#security" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#cbd5e1'}>Security</a>
          <a href="#contact" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#cbd5e1'}>Contact</a>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/login" style={{ textDecoration: 'none', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.875rem', fontWeight: '600', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              Login
            </Link>
          </div>
          <Link href="/register" style={{ textDecoration: 'none', color: '#000', backgroundColor: '#fbbf24', padding: '0.5rem 1.5rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '700', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            Get Started
          </Link>
          <button className="nav-menu-btn"><Menu size={24} /></button>
        </div>
      </nav>

      {/* Main Content (Hero) */}
      <main className="section-padding" style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', width: '100%', maxWidth: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(0,0,0,0) 70%)', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}></div>

        <div className="grid-responsive-2" style={{ width: '100%', maxWidth: '1400px', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'inline-block', border: '1px solid rgba(251, 191, 36, 0.3)', color: '#fbbf24', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '500', marginBottom: '1.5rem' }}>
                Smart Lending Ecosystem for Cambodia
              </div>
              <h1 className="hero-title">
                Modern <span style={{ background: 'linear-gradient(90deg, #2dd4bf, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Digital</span><br />
                Lending<br />
                Experience
              </h1>
            </div>

            <p className="hero-subtitle">
              Acabar Plc empowers banks, MFIs, and fintech companies with a secure, scalable, and intelligent loan management platform built for the future of digital finance.
            </p>

            <div className="btn-group">
              <Link href="/register" style={{ textDecoration: 'none', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', color: '#000', padding: '0.875rem 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 10px 25px -5px rgba(251, 191, 36, 0.4)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                Request Demo
              </Link>
              <Link href="/login" style={{ textDecoration: 'none', background: 'transparent', color: 'white', padding: '0.875rem 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                Explore Platform
              </Link>
            </div>

            <div className="stats-grid">
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fbbf24' }}>24/7</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>Loan Access</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#60a5fa' }}>99.9%</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>System Uptime</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white' }}>AI</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>Smart Decisions</div>
              </div>
            </div>
          </div>

          {/* Right Column: Dashboard Preview */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '560px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Loan Portfolio</div>
                  <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.02em' }}>$12.5M</div>
                </div>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#fbbf24', borderRadius: '12px', display: 'flex', alignItems: 'center', justifySelf: 'flex-end', justifyContent: 'center', color: '#000', fontWeight: '900', fontSize: '1.125rem' }}>
                  WL
                </div>
              </div>

              <div style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <span style={{ color: '#e2e8f0' }}>Loan Approval Rate</span>
                  <span style={{ color: '#fbbf24', fontWeight: '700' }}>+18%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #fbbf24, #3b82f6)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div className="stats-mini-grid" style={{ marginBottom: '1.5rem' }}>
                <div style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Applications</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>8,540</div>
                </div>
                <div style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Disbursed</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>$3.8M</div>
                </div>
              </div>

              <div style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Credit Scoring</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '700' }}>Real-Time Analysis</div>
                </div>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#1e293b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', boxShadow: '0 0 15px rgba(245, 158, 11, 0.2)', flexShrink: 0 }}>
                  <Zap size={20} fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="section-padding" style={{ backgroundColor: '#06090f', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ color: '#fbbf24', fontSize: '0.875rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Platform Features
          </div>
          <h2 className="section-title">Built for Modern Lending Operations</h2>
          <p style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 3vw, 1.125rem)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
            Powerful modules designed for financial institutions seeking speed, automation, compliance, and customer satisfaction.
          </p>
        </div>

        <div className="grid-responsive-4" style={{ width: '100%', maxWidth: '1400px' }}>
          {[
            { icon: FileText, color: '#cbd5e1', title: 'Loan Origination', desc: 'Digital onboarding, KYC verification, approval workflow, and automated processing.' },
            { icon: CreditCard, color: '#60a5fa', title: 'Payment Gateway', desc: 'QR payment, bank transfer integration, and automated repayment collection.' },
            { icon: BarChart3, color: '#a78bfa', title: 'Risk Analytics', desc: 'AI-powered credit scoring, fraud detection, and intelligent monitoring.' },
            { icon: Smartphone, color: '#fbbf24', title: 'Mobile Experience', desc: 'Responsive customer portal with mobile-first banking-grade experience.' }
          ].map((feat, idx) => (
            <div key={idx} style={{ backgroundColor: '#0a0d14', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '24px', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'transform 0.3s, box-shadow 0.3s' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(0,0,0,0.5)'}} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: feat.color }}>
                <feat.icon size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 0.75rem 0', color: 'white' }}>{feat.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: '1.6', margin: 0 }}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Solutions & Security Section */}
      <section id="solutions" className="section-padding" style={{ backgroundColor: '#0a0e17', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4rem' }}>
        
        <div className="grid-responsive-2" style={{ width: '100%', maxWidth: '1400px' }}>
          <div>
            <div style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Enterprise Solutions
            </div>
            <h2 className="section-title" style={{ marginBottom: '2.5rem' }}>Complete Digital<br />Finance Ecosystem</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                'Multi-branch and multi-product management',
                'Automated collection and repayment tracking',
                'Advanced reporting and business intelligence',
                'Secure API integration with banking systems',
                'Cloud-native infrastructure and scalability'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', flexShrink: 0 }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span style={{ color: '#e2e8f0', fontSize: 'clamp(0.875rem, 2vw, 1rem)', fontWeight: '500' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card">
              <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Daily Transactions</div>
              <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3rem)', fontWeight: '900', color: 'white', marginBottom: '1rem' }}>125K+</div>
              <p style={{ color: '#cbd5e1', fontSize: '0.9375rem', margin: 0 }}>Securely processed through the Acabar Plc ecosystem.</p>
            </div>
            <div className="stats-mini-grid">
              <div style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '24px', padding: '2rem' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Active Users</div>
                <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: '900', color: 'white' }}>48K</div>
              </div>
              <div style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '24px', padding: '2rem' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Branches</div>
                <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: '900', color: 'white' }}>120+</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Banner */}
        <div id="security" className="glass-card" style={{ width: '100%', maxWidth: '1000px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}>
            <Lock size={40} color="#000" />
          </div>
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Banking-Grade Security &<br />Compliance</h2>
          <p style={{ color: '#94a3b8', fontSize: 'clamp(0.9375rem, 2vw, 1rem)', lineHeight: '1.6', maxWidth: '700px', margin: '0 0 3rem 0' }}>
            Acabar Plc is designed with enterprise-grade security architecture, encrypted infrastructure, audit logging, role-based access control, and compliance-ready standards for modern financial institutions.
          </p>
          <div className="badge-grid">
            {['Data Encryption', 'Role Permissions', 'Audit Trails', 'Cloud Security', 'API Protection'].map((badge, idx) => (
              <div key={idx} style={{ padding: '0.75rem 1.25rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '0.8125rem', fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section id="contact" className="section-padding" style={{ backgroundColor: '#06090f', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ color: '#fbbf24', fontSize: '0.875rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Start Your Digital Transformation
        </div>
        <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: '900', margin: '0 0 1.5rem 0', color: 'white', lineHeight: '1.1', maxWidth: '900px' }}>
          Ready to Transform <span style={{ background: 'linear-gradient(90deg, #2dd4bf, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lending<br />Operations?</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 3vw, 1.125rem)', maxWidth: '700px', margin: '0 0 3rem 0', lineHeight: '1.6' }}>
          Empower your organization with a modern loan management ecosystem tailored for banks, MFIs, and fintech institutions.
        </p>
        <div className="btn-group" style={{ justifyContent: 'center' }}>
          <button style={{ background: 'linear-gradient(90deg, #fbbf24, #60a5fa)', color: '#000', padding: '1rem 2.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Book a Demo
          </button>
          <button style={{ background: 'transparent', color: 'white', padding: '1rem 2.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            Contact Sales
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#06090f', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#fbbf24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#000', fontSize: '1rem' }}>
            A
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: 'white', lineHeight: 1 }}>Acabar Plc</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>© 2026 All Rights Reserved</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
          <a href="#" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>Privacy Policy</a>
          <a href="#" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>Terms</a>
          <a href="#" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>Support</a>
        </div>
      </footer>
    </div>
  );
}
