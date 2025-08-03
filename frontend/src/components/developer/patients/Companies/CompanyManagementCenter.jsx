import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../login/AuthContext';
import logoImg from '../../../../assets/LogoMHC.jpeg';
import CompanyRegistrationForm from './CompanyRegistrationForm';
import CompanyProfileModal from './CompanyProfileModal';
import CompanyAccessLoading from './CompanyAccessLoading';
import '../../../../styles/developer/Patients/Companies/CompanyManagementCenter.scss';

const CompanyManagementCenter = ({ onSelectCompany }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgencyState, setSelectedAgencyState] = useState('all');
  const [selectedCompanyType, setSelectedCompanyType] = useState('all');
  const [selectedPaymentState, setSelectedPaymentState] = useState('all');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedCompanyProfile, setSelectedCompanyProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const userMenuRef = useRef(null);

  const agencyStates = ['all', 'CA', 'FL', 'NY', 'TX', 'IL'];
  const companyTypes = [
    'all', 'Home Healthcare', 'Hospital', 'Medical Center', 
    'Rehabilitation Center', 'Nursing Home', 'Physical Therapy Clinic',
    'Occupational Therapy Clinic', 'Speech Therapy Clinic', 'Multi-Specialty Care Center'
  ];
  const paymentStates = ['all', 'Active', 'Suspended', 'Unpaid'];

  const userData = {
    name: currentUser?.fullname || currentUser?.username || 'User',
    avatar: getInitials(currentUser?.fullname || currentUser?.username || 'User'),
    email: currentUser?.email || 'user@motivehomecare.com',
    role: currentUser?.role || 'Developer',
    status: 'online'
  };

  function getInitials(name) {
    if (!name) return "U";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  useEffect(() => {
    loadCompaniesData();
  }, []);

  const loadCompaniesData = () => {
    setIsLoading(true);
    
    // Mock data with required example
    const mockCompanies = [
      {
        id: 1,
        companyName: 'Motive Home Care',
        fullCompanyName: 'Motive Home Care, LLC',
        address: {
          street: '123 Healthcare Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA',
        },
        contact: {
          managerName: 'Alex Martinez',
          position: 'CEO',
          phone: '(323) 555-0123',
          email: 'amartinez@motivehomecare.com',
        },
        website: 'www.motivehomecare.com',
        taxID: '87-1234567',
        foundedYear: '2018',
        companyType: 'Home Healthcare',
        specialties: ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy'],
        logo: null,
        status: 'Active',
        staffCount: 28,
        activePatients: 145,
        inactivePatients: 12,
        paymentState: 'Active'
      },
      {
        id: 2,
        companyName: 'Healing Hands Therapy',
        fullCompanyName: 'Healing Hands Therapy Services, Inc.',
        address: {
          street: '456 Wellness Blvd',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        contact: {
          managerName: 'Robert Johnson',
          position: 'Director',
          phone: '(212) 555-1234',
          email: 'robert@healinghands.com',
        },
        website: 'www.healinghandstherapy.com',
        taxID: '82-7654321',
        foundedYear: '2010',
        companyType: 'Rehabilitation Center',
        specialties: ['Physical Therapy', 'Occupational Therapy'],
        logo: null,
        status: 'Active',
        staffCount: 35,
        activePatients: 210,
        inactivePatients: 8,
        paymentState: 'Suspended'
      },
      {
        id: 3,
        companyName: 'RehabCare Plus',
        fullCompanyName: 'RehabCare Plus, Inc.',
        address: {
          street: '789 Recovery Road',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          country: 'USA',
        },
        contact: {
          managerName: 'Sarah Miller',
          position: 'Managing Director',
          phone: '(305) 555-6789',
          email: 'sarah@rehabcareplus.com',
        },
        website: 'www.rehabcareplus.com',
        taxID: '91-4567890',
        foundedYear: '2015',
        companyType: 'Multi-Specialty Care Center',
        specialties: ['Physical Therapy', 'Speech Therapy', 'Pediatric Care'],
        logo: null,
        status: 'Active',
        staffCount: 42,
        activePatients: 178,
        inactivePatients: 15,
        paymentState: 'Unpaid'
      },
      {
        id: 4,
        companyName: 'Elite Care Services',
        fullCompanyName: 'Elite Care Services, LLC',
        address: {
          street: '321 Senior Avenue',
          city: 'Houston',
          state: 'TX',
          zipCode: '77001',
          country: 'USA',
        },
        contact: {
          managerName: 'David Garcia',
          position: 'CEO',
          phone: '(713) 555-9876',
          email: 'david@elitecare.com',
        },
        website: 'www.elitecareservices.com',
        taxID: '73-8901234',
        foundedYear: '2019',
        companyType: 'Home Healthcare',
        specialties: ['Elderly Care', 'Nursing Care', 'Rehabilitative Care'],
        logo: null,
        status: 'Active',
        staffCount: 18,
        activePatients: 95,
        inactivePatients: 5,
        paymentState: 'Active'
      }
    ];
    
    setTimeout(() => {
      setCompanies(mockCompanies);
      setFilteredCompanies(mockCompanies);
      setIsLoading(false);
    }, 2500);
  };

  useEffect(() => {
    let filtered = [...companies];

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contact.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.address.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedAgencyState !== 'all') {
      filtered = filtered.filter(company => company.address.state === selectedAgencyState);
    }

    if (selectedCompanyType !== 'all') {
      filtered = filtered.filter(company => company.companyType === selectedCompanyType);
    }

    if (selectedPaymentState !== 'all') {
      filtered = filtered.filter(company => company.paymentState === selectedPaymentState);
    }

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, selectedAgencyState, selectedCompanyType, selectedPaymentState]);

  const calculateStats = () => {
    const totalClients = companies.length;
    const totalSuspended = companies.filter(c => c.paymentState === 'Suspended').length;
    const totalUnpaid = companies.filter(c => c.paymentState === 'Unpaid').length;
    
    return { totalClients, totalSuspended, totalUnpaid };
  };

  const stats = calculateStats();

  const handleViewPatients = (company) => {
    onSelectCompany(company);
  };

  const handleOpenProfile = (company) => {
    setSelectedCompanyProfile(company);
  };

  const handleCreateNewCompany = () => {
    setShowRegistrationForm(true);
  };

  const handleCloseRegistrationForm = () => {
    setShowRegistrationForm(false);
    loadCompaniesData();
  };

  const handleCloseProfile = () => {
    setSelectedCompanyProfile(null);
  };

  const handleMainMenuTransition = () => {
    const baseRole = currentUser?.role?.split(' - ')[0].toLowerCase() || 'developer';
    navigate(`/${baseRole}/homePage`);
  };

  if (isLoading) {
    return <CompanyAccessLoading />;
  }

  const renderCustomHeader = () => {
    return (
      <header className="custom-company-header">
        <div className="header-container">
          <div className="logo-container">
            <div className="logo-glow"></div>
            <img src={logoImg} alt="TherapySync Logo" className="logo" />
          </div>
          
          <div className="simple-nav">
            <button 
              className="nav-option main-menu"
              onClick={handleMainMenuTransition}
            >
              <i className="fas fa-home"></i>
              <span>Main Menu</span>
            </button>
            <button 
              className="nav-option company active"
              onClick={() => {/* Ya estamos aquí */}}
            >
              <i className="fas fa-building"></i>
              <span>Company</span>
            </button>
          </div>
          
          <div className="user-controls">
            <div className="user-menu-container" ref={userMenuRef}>
              <div 
                className={`user-menu-trigger ${showUserMenu ? 'active' : ''}`}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  <span>{userData.avatar}</span>
                  <div className={`avatar-status ${userData.status}`}></div>
                </div>
                <div className="user-details">
                  <span className="user-name">{userData.name}</span>
                  <span className="user-role">{userData.role}</span>
                </div>
                <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'}`}></i>
              </div>
              
              {showUserMenu && (
                <div className="user-menu">
                  <div className="menu-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        <span>{userData.avatar}</span>
                        <div className={`avatar-status ${userData.status}`}></div>
                      </div>
                      <div className="user-data">
                        <h4>{userData.name}</h4>
                        <p>{userData.email}</p>
                        <span className="role-badge">{userData.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="menu-actions">
                    <button className="menu-action logout" onClick={() => {}}>
                      <i className="fas fa-sign-out-alt"></i>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  };

  if (showRegistrationForm) {
    return (
      <div className="company-management-wrapper">
        {renderCustomHeader()}
        <CompanyRegistrationForm 
          onCancel={handleCloseRegistrationForm}
          onSave={handleCloseRegistrationForm}
        />
      </div>
    );
  }

  if (selectedCompanyProfile) {
    return (
      <CompanyProfileModal 
        company={selectedCompanyProfile}
        onClose={handleCloseProfile}
      />
    );
  }

  return (
    <div className="company-management-center">
      {renderCustomHeader()}

      {/* Main Content */}
      <main className="clinical-main">
        <div className="clinical-container">
          {/* Page Title */}
          <div className="clinical-page-header">
            <div className="page-title-section">
              <div className="title-icon">
                <i className="fas fa-building"></i>
              </div>
              <div className="title-content">
                <h1>Host Company Management Center</h1>
                <p>Manage home healthcare companies and their therapeutic teams</p>
              </div>
            </div>
          </div>

          {/* Statistics Dashboard */}
          <div className="clinical-stats-grid">
            <div className="clinical-stat-card total-clients">
              <div className="stat-header">
                <div className="stat-icon">
                  <i className="fas fa-building"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Clients</h3>
                  <div className="stat-number">{stats.totalClients}</div>
                </div>
              </div>
              <div className="stat-trend">
                <i className="fas fa-arrow-up"></i>
                <span>+2.5% from last month</span>
              </div>
            </div>

            <div className="clinical-stat-card total-suspended">
              <div className="stat-header">
                <div className="stat-icon">
                  <i className="fas fa-pause-circle"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Suspended</h3>
                  <div className="stat-number">{stats.totalSuspended}</div>
                </div>
              </div>
              <div className="stat-trend warning">
                <i className="fas fa-exclamation-triangle"></i>
                <span>Requires attention</span>
              </div>
            </div>

            <div className="clinical-stat-card total-unpaid">
              <div className="stat-header">
                <div className="stat-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Unpaid</h3>
                  <div className="stat-number">{stats.totalUnpaid}</div>
                </div>
              </div>
              <div className="stat-trend critical">
                <i className="fas fa-arrow-down"></i>
                <span>Critical status</span>
              </div>
            </div>

            <div className="clinical-stat-card create-new-company" onClick={handleCreateNewCompany}>
              <div className="stat-header">
                <div className="stat-icon">
                  <i className="fas fa-plus-circle"></i>
                </div>
                <div className="stat-info">
                  <h3>Create New Company</h3>
                  <div className="create-action">
                    <span>Click to register</span>
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters Section */}
          <div className="clinical-filters-panel">
            <div className="filters-header">
              <h3>Advanced Search & Filters</h3>
              <div className="results-count">
                Showing {filteredCompanies.length} of {companies.length} companies
              </div>
            </div>

            <div className="filters-grid">
              <div className="search-section">
                <div className="search-input-group">
                  <div className="search-icon">
                    <i className="fas fa-search"></i>
                  </div>
                  <input
                    type="text"
                    placeholder="Intelligent agency search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="clinical-search-input"
                  />
                  {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>

              <div className="filter-section">
                <div className="filter-group">
                  <label>Agency State</label>
                  <select 
                    value={selectedAgencyState} 
                    onChange={(e) => setSelectedAgencyState(e.target.value)}
                    className="clinical-select"
                  >
                    {agencyStates.map(state => (
                      <option key={state} value={state}>
                        {state === 'all' ? 'All States' : state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Company Type</label>
                  <select 
                    value={selectedCompanyType} 
                    onChange={(e) => setSelectedCompanyType(e.target.value)}
                    className="clinical-select"
                  >
                    {companyTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Payment Status</label>
                  <select 
                    value={selectedPaymentState} 
                    onChange={(e) => setSelectedPaymentState(e.target.value)}
                    className="clinical-select"
                  >
                    {paymentStates.map(state => (
                      <option key={state} value={state}>
                        {state === 'all' ? 'All Statuses' : state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Companies Grid */}
          <div className="clinical-companies-grid">
            {filteredCompanies.map(company => (
              <div key={company.id} className={`clinical-company-card ${company.paymentState.toLowerCase()}-status`}>
                <div className="company-card-header">
                  <div className="company-identity">
                    <div className="company-logo">
                      {company.logo ? (
                        <img src={company.logo} alt={company.companyName} />
                      ) : (
                        <div className="logo-placeholder">
                          {company.companyName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="company-title">
                      <h3>{company.companyName}</h3>
                      <span className="company-type">{company.companyType}</span>
                    </div>
                  </div>
                  <div className="payment-status">
                    <span className={`status-badge ${company.paymentState.toLowerCase()}`}>
                      {company.paymentState}
                    </span>
                  </div>
                </div>

                <div className="company-card-body">
                  <div className="company-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <i className="fas fa-user-tie"></i>
                        <span>{company.contact.managerName}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-phone"></i>
                        <span>{company.contact.phone}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-item">
                        <i className="fas fa-envelope"></i>
                        <span>{company.contact.email}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-globe"></i>
                        <span>{company.website}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-item location">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{company.address.city}, {company.address.state}</span>
                      </div>
                    </div>
                  </div>

                  <div className="company-metrics">
                    <div className="metric-item">
                      <div className="metric-value">{company.staffCount}</div>
                      <div className="metric-label">Staff</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-value">{company.activePatients}</div>
                      <div className="metric-label">Active Patients</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-value">{company.inactivePatients}</div>
                      <div className="metric-label">Inactive Patients</div>
                    </div>
                  </div>
                </div>

                <div className="company-card-actions">
                  <button 
                    className="clinical-btn primary"
                    onClick={() => handleViewPatients(company)}
                  >
                    <i className="fas fa-users"></i>
                    View Patients
                  </button>
                  <button 
                    className="clinical-btn secondary"
                    onClick={() => handleOpenProfile(company)}
                  >
                    <i className="fas fa-id-card"></i>
                    Profile
                  </button>
                </div>
              </div>
            ))}
            
            {filteredCompanies.length === 0 && (
              <div className="no-results-message">
                <div className="no-results-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h3>No companies found</h3>
                <p>Try adjusting your search filters</p>
                <button 
                  className="clinical-btn primary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedAgencyState('all');
                    setSelectedCompanyType('all');
                    setSelectedPaymentState('all');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyManagementCenter;