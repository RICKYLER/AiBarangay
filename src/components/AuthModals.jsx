import React, { useState } from 'react';
import { X, UserCheck, Shield, User, Building, Lock, Mail, ArrowRight } from 'lucide-react';

export default function AuthModals({ isOpen, mode, onClose }) {
  const [activeRole, setActiveRole] = useState('resident'); // 'resident' | 'official'
  const [activeTab, setActiveTab] = useState(mode || 'login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [barangayCode, setBarangayCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card auth-modal-card">
        
        {/* Close Button */}
        <button onClick={onClose} className="modal-close-btn">
          <X size={20} />
        </button>

        {/* Tab Header: Login vs Register */}
        <div className="auth-tabs flex-center">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Create Account
          </button>
        </div>

        {/* Role Selector: Resident vs Barangay Officer */}
        <div className="role-selector grid-2">
          <button
            className={`role-btn ${activeRole === 'resident' ? 'active-role' : ''}`}
            onClick={() => setActiveRole('resident')}
          >
            <User size={18} />
            <span>Barangay Resident</span>
          </button>

          <button
            className={`role-btn ${activeRole === 'official' ? 'active-role' : ''}`}
            onClick={() => setActiveRole('official')}
          >
            <Shield size={18} className="text-emerald" />
            <span>Barangay Officer / LGU</span>
          </button>
        </div>

        {isSuccess ? (
          <div className="auth-success text-center">
            <UserCheck size={48} className="text-emerald margin-auto" />
            <h3>Authentication Successful!</h3>
            <p>Welcome back, {fullName || (activeRole === 'official' ? 'Barangay Officer' : 'Resident')}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            
            {activeTab === 'register' && (
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User size={16} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Juan Dela Cruz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeRole === 'official' && activeTab === 'register' && (
              <div className="form-group">
                <label>Barangay LGU Authorization Code</label>
                <div className="input-with-icon">
                  <Building size={16} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. BRGY-MKT-9912"
                    value={barangayCode}
                    onChange={(e) => setBarangayCode(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-auth-submit">
              <span>{activeTab === 'login' ? 'Sign In to Portal' : 'Create Account'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

      </div>

      <style>{`
        .auth-modal-card {
          max-width: 480px;
          padding: 2rem;
        }

        .auth-tabs {
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 1rem;
          margin-bottom: 1.25rem;
        }

        .auth-tab {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 700;
          cursor: pointer;
          padding-bottom: 0.25rem;
          position: relative;
        }

        .auth-tab.active {
          color: var(--text-main);
        }

        .auth-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1rem;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--accent-emerald);
        }

        .role-selector {
          margin-bottom: 1.5rem;
          gap: 0.75rem;
        }

        .role-btn {
          background: rgba(11, 17, 32, 0.8);
          border: 1px solid var(--border-glass);
          color: var(--text-muted);
          padding: 0.65rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .role-btn.active-role {
          border-color: var(--accent-emerald);
          color: var(--text-main);
          background: rgba(16, 185, 129, 0.1);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon svg {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }

        .input-with-icon input {
          width: 100%;
          background: rgba(11, 17, 32, 0.8);
          border: 1px solid var(--border-glass-bright);
          border-radius: var(--radius-sm);
          color: var(--text-main);
          padding: 0.65rem 0.85rem 0.65rem 2.4rem;
          font-size: 0.88rem;
          outline: none;
        }

        .input-with-icon input:focus {
          border-color: var(--accent-emerald);
        }

        .btn-auth-submit {
          margin-top: 0.5rem;
        }

        .auth-success {
          padding: 2rem 0;
        }
      `}</style>
    </div>
  );
}
