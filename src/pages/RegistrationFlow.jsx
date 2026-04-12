import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  checkNicknameAvailability, 
  registerBusinessAccount, 
  getActivities, 
  getInterests, 
  saveUserInterests 
} from '../api/registration';
import './RegistrationFlow.css';

/**
 * Custom hook for debouncing values
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

/**
 * Business Account Registration Flow Component
 * 3-Step Wizard: Selection -> Data Entry -> Interests
 */
export default function RegistrationFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  
  // Registration Data State
  const [formData, setFormData] = useState({
    role: '',
    name: '',
    userName: '',
    gender: 'Male',
    age: '',
    country: '',
    city: '',
    activityType: '',
    bio: '',
    website: '',
    establishmentType: 'Establishment',
    nonProfitType: 'Charity',
    managerRole: 'Owner',
    socialLinks: {
      twitter: '',
      instagram: '',
      snapchat: '',
      tiktok: '',
      facebook: '',
      youtube: '',
      telegram: ''
    },
    mobileNumber: '+966' // Initial prefix for KSA
  });

  // Data list states
  const [nicknameAvailable, setNicknameAvailable] = useState(null); // null, 'loading', 'available', 'taken'
  const [activities, setActivities] = useState([]);
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);

  const debouncedNickname = useDebounce(formData.userName, 500);

  // Check Nickname Availability on debounce
  useEffect(() => {
    if (debouncedNickname && debouncedNickname.length >= 3) {
      validateNickname(debouncedNickname);
    } else {
      setNicknameAvailable(null);
    }
  }, [debouncedNickname]);

  const validateNickname = async (name) => {
    setNicknameAvailable('loading');
    try {
      const res = await checkNicknameAvailability(name.startsWith('@') ? name : `@${name}`);
      setNicknameAvailable(res.available ? 'available' : 'taken');
    } catch (err) {
      console.error("[NicknameCheck] Error:", err);
      setNicknameAvailable(null);
    }
  };

  // Fetch initial data (Activities & Interests)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [actRes, intRes] = await Promise.all([getActivities(), getInterests()]);
        setActivities(actRes.data?.activities || []);
        setInterests(intRes.data?.interests || []);
      } catch (err) {
        toast.error("Failed to load required setup data.");
      }
    };
    fetchInitialData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested states (socialLinks)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
    setStep(2);
  };

  const handleRegister = async () => {
    // Basic validation
    if (nicknameAvailable !== 'available') {
      toast.error("Please choose an available nickname.");
      return;
    }
    if (!formData.name || !formData.activityType || !formData.mobileNumber) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerBusinessAccount(formData);
      setToken(res.token);
      toast.success("Profile saved! Please select your interests.");
      setStep(3);
    } catch (err) {
      // Toast notification is handled by API interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (id) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFinalize = async () => {
    if (selectedInterests.length === 0) {
      toast.error("Please select at least one interest to finish.");
      return;
    }

    setLoading(true);
    try {
      await saveUserInterests(selectedInterests, token);
      toast.success("Account setup complete!");
      setStep(4);
    } catch (err) {
      // Interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      {/* Progress Indicator */}
      <div className="registration-progress">
        <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }}></div>
      </div>

      <div className={`registration-card animate-fade-in`}>
        
        {/* Step 1: Registration Type Selection */}
        {step === 1 && (
          <div className="step-selection">
            <header className="step-header">
              <h1>Register Your Business</h1>
              <p>Select the type of account that matches your activity.</p>
            </header>
            <div className="type-grid">
              {[
                { id: 'individual', title: 'Individual', icon: '👤', desc: 'Freelancer / solo professional' },
                { id: 'entity', title: 'Entity', icon: '🏢', desc: 'Company / Establishment / Bank' },
                { id: 'non_profit', title: 'Non-Profit', icon: '🤝', desc: 'Charity / Government Agency' }
              ].map(type => (
                <div 
                  key={type.id} 
                  className={`type-card ${formData.role === type.id ? 'active' : ''}`}
                  onClick={() => handleRoleSelect(type.id)}
                >
                  <span className="type-icon">{type.icon}</span>
                  <h3>{type.title}</h3>
                  <p>{type.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Data Entry */}
        {step === 2 && (
          <div className="step-data">
            <header className="step-header">
              <h1>Tell Us About You</h1>
              <p>Provide details for your {formData.role.replace('_', ' ')} profile.</p>
            </header>
            
            <div className="registration-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  name="name" 
                  placeholder="Official business name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="form-group">
                <label>Handle (@nickname) *</label>
                <div className="nickname-input-wrapper">
                  <span className="nickname-at">@</span>
                  <input 
                    name="userName" 
                    placeholder="unique_handle" 
                    value={formData.userName.replace(/^@/, '')} 
                    onChange={(e) => handleInputChange({ target: { name: 'userName', value: e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() }})} 
                  />
                </div>
                {nicknameAvailable === 'loading' && <span className="validation-status loading">Checking handle...</span>}
                {nicknameAvailable === 'available' && <span className="validation-status success">✓ Handle available</span>}
                {nicknameAvailable === 'taken' && <span className="validation-status error">✗ Already in use</span>}
              </div>

              {/* Conditional: Individual Specific */}
              {formData.role === 'individual' && (
                <>
                  <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Age</label>
                    <input name="age" type="number" placeholder="Years" value={formData.age} onChange={handleInputChange} />
                  </div>
                </>
              )}

              {/* Conditional: Entity Specific */}
              {formData.role === 'entity' && (
                <div className="form-group">
                  <label>Entity Type</label>
                  <select name="establishmentType" value={formData.establishmentType} onChange={handleInputChange}>
                    {['Establishment', 'Company', 'Bank', 'Office'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conditional: Non-Profit Specific */}
              {formData.role === 'non_profit' && (
                <div className="form-group">
                  <label>Sector Sub-type</label>
                  <select name="nonProfitType" value={formData.nonProfitType} onChange={handleInputChange}>
                    {['Charity', 'Government Agency'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Shared Role for Entities */}
              {['entity', 'non_profit'].includes(formData.role) && (
                <div className="form-group">
                  <label>Your Role</label>
                  <select name="managerRole" value={formData.managerRole} onChange={handleInputChange}>
                    {['Owner', 'Authorized Representative'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Mobile Number *</label>
                <input name="mobileNumber" placeholder="+966XXXXXXXXX" value={formData.mobileNumber} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>City</label>
                <input name="city" placeholder="e.g. Riyadh" value={formData.city} onChange={handleInputChange} />
              </div>

              <div className="form-group full-width">
                <label>Activity Type (Category) *</label>
                <select name="activityType" value={formData.activityType} onChange={handleInputChange}>
                  <option value="">Select principal category...</option>
                  {activities.map(act => (
                    <option key={act._id} value={act._id}>{act.name.en}</option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label>Extended Bio</label>
                <textarea 
                  name="bio" 
                  rows="3" 
                  placeholder="Describe your services or business mission in detail..."
                  value={formData.bio}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Website / E-commerce Store</label>
                <input name="website" placeholder="https://yourstore.com" value={formData.website} onChange={handleInputChange} />
              </div>

              {/* Social Media Grid */}
              <div className="social-links-section">
                <label>Social Media (Handles only)</label>
                <div className="social-grid">
                  {Object.keys(formData.socialLinks).map(platform => (
                    <div className="social-input" key={platform}>
                      <span className="social-icon-box">@</span>
                      <input 
                        name={`socialLinks.${platform}`} 
                        placeholder={platform.charAt(0).toUpperCase() + platform.slice(1)} 
                        value={formData.socialLinks[platform]}
                        onChange={handleInputChange}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button 
                className="btn-primary" 
                onClick={handleRegister}
                disabled={loading || nicknameAvailable !== 'available'}
              >
                {loading ? 'Processing...' : 'Next: Set Interests'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Interest Selection (UI Design Optimized) */}
        {step === 3 && (
          <div className="step-interests">
            <header className="step-header">
              <h1>Select Your Interests</h1>
              <p>Pick hashtags that reflect your content focus.</p>
            </header>
            
            <div className="interests-grid">
              {interests.map(interest => (
                <div 
                  key={interest._id} 
                  className={`interest-item ${selectedInterests.includes(interest._id) ? 'selected' : ''}`}
                  onClick={() => handleInterestToggle(interest._id)}
                >
                  <span className="interest-icon">{interest.icon}</span>
                  <span className="interest-name">{interest.name}</span>
                </div>
              ))}
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button 
                className="btn-primary" 
                onClick={handleFinalize}
                disabled={loading || selectedInterests.length === 0}
              >
                {loading ? 'Finalizing...' : 'Complete Account'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Final Success State */}
        {step === 4 && (
          <div className="step-success" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '6rem', marginBottom: '1.5rem' }}>🌟</div>
            <h1>Registration Successful!</h1>
            <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>Your business profile is now active. You can start creating content and managing your shop.</p>
            <button className="btn-primary" onClick={() => window.location.href = '/'}>
              Go to Homepage
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
