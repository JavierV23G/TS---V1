import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../../login/AuthContext';
import '../../../styles/admin/support/PremiumUserSupportCenter.scss';

const PremiumUserSupportCenter = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  
  // Estados principales del sistema
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'create', 'my-tickets', 'knowledge-base'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados del dashboard
  const [userStats, setUserStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: '0h',
    satisfactionScore: 0
  });
  
  // Estados de tickets
  const [userTickets, setUserTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketFilters, setTicketFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    dateRange: 'all'
  });
  
  // Estados del formulario avanzado
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: '',
    attachments: [],
    urgency: 'standard',
    affectedSystems: [],
    reproductionSteps: '',
    expectedBehavior: '',
    actualBehavior: '',
    browserInfo: '',
    deviceInfo: ''
  });
  
  // Estados de comunicación
  const [replyText, setReplyText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  
  // Estados de animación y UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Referencias
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const formRef = useRef(null);
  const ticketListRef = useRef(null);
  
  // Categorías avanzadas con subcategorías
  const ticketCategories = useMemo(() => [
    {
      id: 'technical',
      name: 'Technical Issues',
      icon: 'cogs',
      color: '#3B82F6',
      description: 'System bugs, errors, or technical problems',
      subcategories: [
        { id: 'system-error', name: 'System Errors', priority: 'high' },
        { id: 'performance', name: 'Performance Issues', priority: 'medium' },
        { id: 'integration', name: 'Integration Problems', priority: 'high' },
        { id: 'ui-bug', name: 'UI/UX Bugs', priority: 'medium' }
      ]
    },
    {
      id: 'account',
      name: 'Account & Access',
      icon: 'user-shield',
      color: '#10B981',
      description: 'Login, permissions, and account management',
      subcategories: [
        { id: 'login-issue', name: 'Login Problems', priority: 'high' },
        { id: 'permissions', name: 'Permission Requests', priority: 'medium' },
        { id: 'password', name: 'Password Reset', priority: 'low' },
        { id: 'profile', name: 'Profile Updates', priority: 'low' }
      ]
    },
    {
      id: 'billing',
      name: 'Billing & Payments',
      icon: 'credit-card',
      color: '#F59E0B',
      description: 'Payment, invoicing, and subscription questions',
      subcategories: [
        { id: 'payment-failed', name: 'Payment Issues', priority: 'high' },
        { id: 'invoice', name: 'Invoice Questions', priority: 'medium' },
        { id: 'subscription', name: 'Subscription Changes', priority: 'medium' },
        { id: 'refund', name: 'Refund Requests', priority: 'low' }
      ]
    },
    {
      id: 'feature',
      name: 'Feature Requests',
      icon: 'lightbulb',
      color: '#8B5CF6',
      description: 'Suggest new features or improvements',
      subcategories: [
        { id: 'new-feature', name: 'New Feature', priority: 'low' },
        { id: 'enhancement', name: 'Enhancement', priority: 'low' },
        { id: 'workflow', name: 'Workflow Improvement', priority: 'medium' },
        { id: 'integration-request', name: 'Integration Request', priority: 'medium' }
      ]
    },
    {
      id: 'training',
      name: 'Training & Support',
      icon: 'graduation-cap',
      color: '#EC4899',
      description: 'How-to questions and usage guidance',
      subcategories: [
        { id: 'how-to', name: 'How-to Questions', priority: 'low' },
        { id: 'best-practices', name: 'Best Practices', priority: 'low' },
        { id: 'training-request', name: 'Training Request', priority: 'medium' },
        { id: 'documentation', name: 'Documentation', priority: 'low' }
      ]
    },
    {
      id: 'security',
      name: 'Security Concerns',
      icon: 'shield-alt',
      color: '#EF4444',
      description: 'Security issues, vulnerabilities, or concerns',
      subcategories: [
        { id: 'security-breach', name: 'Security Breach', priority: 'critical' },
        { id: 'suspicious-activity', name: 'Suspicious Activity', priority: 'high' },
        { id: 'data-concern', name: 'Data Privacy', priority: 'high' },
        { id: 'compliance', name: 'Compliance Question', priority: 'medium' }
      ]
    }
  ], []);

  // Prioridades con características avanzadas
  const priorityLevels = useMemo(() => [
    { 
      id: 'low', 
      name: 'Low', 
      color: '#10B981', 
      description: 'General questions, minor issues',
      responseTime: '24-48 hours',
      icon: 'chevron-down'
    },
    { 
      id: 'medium', 
      name: 'Medium', 
      color: '#3B82F6', 
      description: 'Standard support requests',
      responseTime: '8-24 hours',
      icon: 'minus'
    },
    { 
      id: 'high', 
      name: 'High', 
      color: '#F59E0B', 
      description: 'Important issues affecting work',
      responseTime: '2-8 hours',
      icon: 'arrow-up'
    },
    { 
      id: 'critical', 
      name: 'Critical', 
      color: '#EF4444', 
      description: 'System down, blocking issues',
      responseTime: '15-30 minutes',
      icon: 'exclamation-triangle'
    }
  ], []);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadUserData();
      loadKnowledgeBase();
    }
  }, [isOpen]);

  // Auto-detectar información del sistema
  useEffect(() => {
    if (isOpen) {
      detectSystemInfo();
    }
  }, [isOpen]);

  // Manejar búsqueda en tiempo real
  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Función para cargar datos del usuario
  const loadUserData = async () => {
    setIsLoadingTickets(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generar tickets más realistas y variados
      const mockTickets = generateAdvancedMockTickets();
      setUserTickets(mockTickets);
      
      // Calcular estadísticas avanzadas
      const stats = calculateUserStats(mockTickets);
      setUserStats(stats);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Generar tickets mock más avanzados
  const generateAdvancedMockTickets = () => {
    const tickets = [];
    const statuses = ['new', 'open', 'in-progress', 'pending', 'resolved', 'closed'];
    const currentTime = Date.now();
    
    for (let i = 1; i <= 15; i++) {
      const category = ticketCategories[Math.floor(Math.random() * ticketCategories.length)];
      const subcategory = category.subcategories[Math.floor(Math.random() * category.subcategories.length)];
      const priority = priorityLevels[Math.floor(Math.random() * priorityLevels.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const createdAt = new Date(currentTime - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const updatedAt = new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      tickets.push({
        id: `TKT-${String(1000 + i).padStart(4, '0')}`,
        subject: generateRealisticSubject(category.id, subcategory.name),
        category: category.id,
        subcategory: subcategory.id,
        priority: priority.id,
        status,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        description: generateDetailedDescription(category.id),
        tags: generateTags(),
        satisfaction: status === 'resolved' ? Math.floor(Math.random() * 3) + 3 : null,
        assignedAgent: status !== 'new' ? {
          name: 'Luis Nava',
          avatar: 'LN',
          role: 'Senior Developer',
          specialties: ['System Integration', 'Performance Optimization']
        } : null,
        responses: generateTicketResponses(status, createdAt),
        attachments: Math.random() > 0.7 ? generateAttachments() : [],
        relatedTickets: Math.random() > 0.8 ? [`TKT-${String(Math.floor(Math.random() * 1000) + 1000).padStart(4, '0')}`] : [],
        estimatedResolution: calculateEstimatedResolution(priority.id),
        actualResolution: status === 'resolved' ? Math.floor(Math.random() * 48) : null
      });
    }
    
    return tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  };

  // Generar respuestas realistas para tickets
  const generateTicketResponses = (status, createdAt) => {
    const responses = [{
      id: 1,
      author: currentUser?.first_name + ' ' + currentUser?.last_name || 'User',
      role: currentUser?.role || 'Agency User',
      content: 'Initial ticket description and details about the issue.',
      timestamp: createdAt.toISOString(),
      type: 'user',
      reactions: [],
      edited: false
    }];

    if (status !== 'new') {
      responses.push({
        id: 2,
        author: 'Luis Nava',
        role: 'Senior Developer',
        content: 'Thank you for reporting this issue. I\'ve reviewed your request and I\'m investigating the problem. I\'ll update you with my findings shortly.',
        timestamp: new Date(createdAt.getTime() + Math.random() * 2 * 60 * 60 * 1000).toISOString(),
        type: 'staff',
        reactions: [],
        edited: false,
        internalNote: false
      });

      if (status === 'resolved' || status === 'closed') {
        responses.push({
          id: 3,
          author: 'Luis Nava',
          role: 'Senior Developer',
          content: 'I\'ve identified and resolved the issue. The fix has been deployed and should be working now. Please test and let me know if you encounter any further problems.',
          timestamp: new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          type: 'staff',
          reactions: [{ emoji: '👍', count: 1, users: ['user'] }],
          edited: false,
          resolution: true
        });
      }
    }

    return responses;
  };

  // Calcular estadísticas del usuario
  const calculateUserStats = (tickets) => {
    const total = tickets.length;
    const open = tickets.filter(t => ['new', 'open', 'in-progress', 'pending'].includes(t.status)).length;
    const resolved = tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length;
    
    const resolvedTickets = tickets.filter(t => t.actualResolution);
    const avgResolution = resolvedTickets.length > 0 
      ? Math.round(resolvedTickets.reduce((sum, t) => sum + t.actualResolution, 0) / resolvedTickets.length)
      : 0;
    
    const satisfactionScores = tickets.filter(t => t.satisfaction).map(t => t.satisfaction);
    const avgSatisfaction = satisfactionScores.length > 0
      ? satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
      : 0;

    return {
      totalTickets: total,
      openTickets: open,
      resolvedTickets: resolved,
      avgResponseTime: `${avgResolution}h`,
      satisfactionScore: avgSatisfaction
    };
  };

  // Detectar información del sistema automáticamente
  const detectSystemInfo = () => {
    const browserInfo = `${navigator.userAgent}`;
    const deviceInfo = `${navigator.platform} - Screen: ${screen.width}x${screen.height}`;
    
    setTicketForm(prev => ({
      ...prev,
      browserInfo,
      deviceInfo
    }));
  };

  // Búsqueda avanzada
  const performSearch = async () => {
    setIsSearching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const results = [
        ...userTickets.filter(ticket => 
          ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        ...knowledgeBase.filter(article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ];
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Cargar base de conocimientos
  const loadKnowledgeBase = async () => {
    try {
      const articles = [
        {
          id: 1,
          title: 'How to Reset Your Password',
          category: 'account',
          content: 'Step-by-step guide to reset your password...',
          views: 1245,
          helpful: 89,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Troubleshooting Login Issues',
          category: 'technical',
          content: 'Common solutions for login problems...',
          views: 867,
          helpful: 76,
          lastUpdated: new Date().toISOString()
        }
      ];
      
      setKnowledgeBase(articles);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    }
  };

  // Manejar transiciones suaves entre vistas
  const handleViewChange = useCallback((newView) => {
    if (newView === activeView) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveView(newView);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 200);
  }, [activeView]);

  // Envío de ticket con progreso
  const handleAdvancedSubmit = async (e) => {
    e.preventDefault();
    
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      showNotification('Please complete all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress(0);

    try {
      // Simular progreso de envío
      const progressSteps = [
        { step: 'Validating form data...', progress: 20 },
        { step: 'Uploading attachments...', progress: 40 },
        { step: 'Creating ticket...', progress: 60 },
        { step: 'Notifying support team...', progress: 80 },
        { step: 'Finalizing...', progress: 100 }
      ];

      for (const { step, progress } of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setSubmitProgress(progress);
      }

      // Mostrar confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      // Reset form
      setTicketForm({
        subject: '',
        category: '',
        priority: 'medium',
        description: '',
        attachments: [],
        urgency: 'standard',
        affectedSystems: [],
        reproductionSteps: '',
        expectedBehavior: '',
        actualBehavior: '',
        browserInfo: ticketForm.browserInfo,
        deviceInfo: ticketForm.deviceInfo
      });

      showNotification('Ticket created successfully! We\'ll respond within 2 hours.', 'success');
      
      // Recargar datos
      setTimeout(() => {
        loadUserData();
        handleViewChange('my-tickets');
      }, 2000);

    } catch (error) {
      console.error('Error submitting ticket:', error);
      showNotification('Error creating ticket. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  // Sistema de notificaciones
  const showNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Funciones auxiliares para generar contenido realista
  const generateRealisticSubject = (category, subcategory) => {
    const subjects = {
      technical: [
        `System error when accessing ${subcategory}`,
        `Performance issues with ${subcategory} module`,
        `Integration failure in ${subcategory}`,
        `UI bug in ${subcategory} component`
      ],
      account: [
        `Cannot login to the system`,
        `Need additional permissions for ${subcategory}`,
        `Password reset not working`,
        `Profile information update required`
      ],
      billing: [
        `Payment processing failed`,
        `Invoice discrepancy for ${subcategory}`,
        `Subscription upgrade request`,
        `Refund request for ${subcategory}`
      ]
    };
    
    const categorySubjects = subjects[category] || [`Issue with ${subcategory}`];
    return categorySubjects[Math.floor(Math.random() * categorySubjects.length)];
  };

  const generateDetailedDescription = (category) => {
    const descriptions = {
      technical: 'I encountered a technical issue while using the system. The problem occurs consistently and affects my ability to complete my work efficiently.',
      account: 'I need assistance with my account access. This is preventing me from using the system effectively.',
      billing: 'I have a question regarding billing and payment processing that needs clarification.',
      feature: 'I would like to suggest an improvement to the current system functionality.',
      training: 'I need guidance on how to properly use a specific feature of the system.',
      security: 'I have identified a potential security concern that needs immediate attention.'
    };
    
    return descriptions[category] || 'General support request requiring assistance.';
  };

  const generateTags = () => {
    const allTags = ['urgent', 'recurring', 'workflow', 'integration', 'mobile', 'desktop', 'api', 'database'];
    const numTags = Math.floor(Math.random() * 3) + 1;
    return allTags.sort(() => 0.5 - Math.random()).slice(0, numTags);
  };

  const generateAttachments = () => {
    return [
      { name: 'screenshot.png', size: '2.4 MB', type: 'image' },
      { name: 'error_log.txt', size: '156 KB', type: 'text' }
    ];
  };

  const calculateEstimatedResolution = (priority) => {
    const estimates = {
      low: 48,
      medium: 24,
      high: 8,
      critical: 2
    };
    return estimates[priority] || 24;
  };

  // Drag and drop para archivos
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    
    if (validFiles.length !== files.length) {
      showNotification('Some files were too large (max 10MB)', 'warning');
    }
    
    setTicketForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles.map(file => ({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.type.split('/')[0],
        file
      }))]
    }));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="premium-support-overlay" onClick={onClose}>
      <div className="premium-support-modal" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        )}

        {/* Notifications */}
        <div className="notifications-container">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification ${notification.type}`}
            >
              <div className="notification-content">
                <i className={`fas fa-${
                  notification.type === 'success' ? 'check-circle' :
                  notification.type === 'error' ? 'exclamation-circle' :
                  notification.type === 'warning' ? 'exclamation-triangle' :
                  'info-circle'
                }`}></i>
                <span>{notification.message}</span>
              </div>
              <button
                className="notification-close"
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>

        {/* Header with advanced search */}
        <div className="premium-header">
          <div className="header-content">
            <div className="brand-title">
              <div className="brand-icon">
                <i className="fas fa-headset"></i>
                <div className="pulse-ring"></div>
              </div>
              <div className="brand-text">
                <h2>Premium Support Center</h2>
                <p>Enterprise-grade technical assistance</p>
              </div>
            </div>

            <div className="header-search">
              <div className="search-container">
                <div className="search-input-wrapper">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search tickets, articles, or solutions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="premium-search-input"
                  />
                  {isSearching && <i className="fas fa-spinner fa-spin search-loading"></i>}
                </div>
                
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.slice(0, 5).map((result, index) => (
                      <div key={index} className="search-result-item">
                        <i className={`fas fa-${result.subject ? 'ticket-alt' : 'book-open'}`}></i>
                        <div className="result-content">
                          <span className="result-title">
                            {result.subject || result.title}
                          </span>
                          <span className="result-type">
                            {result.subject ? 'Ticket' : 'Knowledge Base'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button className="premium-close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Advanced Navigation */}
          <div className="premium-nav">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'tachometer-alt', badge: null },
              { id: 'create', label: 'Create Ticket', icon: 'plus-circle', badge: null },
              { id: 'my-tickets', label: 'My Tickets', icon: 'list-alt', badge: userStats.openTickets },
              { id: 'knowledge-base', label: 'Knowledge Base', icon: 'book-open', badge: null }
            ].map(nav => (
              <button
                key={nav.id}
                className={`nav-item ${activeView === nav.id ? 'active' : ''}`}
                onClick={() => handleViewChange(nav.id)}
              >
                <i className={`fas fa-${nav.icon}`}></i>
                <span>{nav.label}</span>
                {nav.badge > 0 && <span className="nav-badge">{nav.badge}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`premium-content ${isTransitioning ? 'transitioning' : ''}`}>
          
          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <div className="dashboard-view">
              <div className="dashboard-grid">
                
                {/* User Stats */}
                <div className="stats-section">
                  <h3>Your Support Overview</h3>
                  <div className="stats-grid">
                    <div className="stat-card total">
                      <div className="stat-icon">
                        <i className="fas fa-ticket-alt"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-number">{userStats.totalTickets}</span>
                        <span className="stat-label">Total Tickets</span>
                      </div>
                    </div>
                    
                    <div className="stat-card open">
                      <div className="stat-icon">
                        <i className="fas fa-folder-open"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-number">{userStats.openTickets}</span>
                        <span className="stat-label">Open Tickets</span>
                      </div>
                    </div>
                    
                    <div className="stat-card resolved">
                      <div className="stat-icon">
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-number">{userStats.resolvedTickets}</span>
                        <span className="stat-label">Resolved</span>
                      </div>
                    </div>
                    
                    <div className="stat-card satisfaction">
                      <div className="stat-icon">
                        <i className="fas fa-star"></i>
                      </div>
                      <div className="stat-content">
                        <span className="stat-number">{userStats.satisfactionScore.toFixed(1)}</span>
                        <span className="stat-label">Satisfaction</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="activity-section">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    {userTickets.slice(0, 5).map(ticket => (
                      <div key={ticket.id} className="activity-item">
                        <div className="activity-icon">
                          <i className="fas fa-comment"></i>
                        </div>
                        <div className="activity-content">
                          <p><strong>{ticket.subject}</strong></p>
                          <span className="activity-time">
                            {new Date(ticket.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className={`activity-status ${ticket.status}`}>
                          {ticket.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="action-buttons">
                    <button 
                      className="action-btn primary"
                      onClick={() => handleViewChange('create')}
                    >
                      <i className="fas fa-plus"></i>
                      Create New Ticket
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={() => handleViewChange('knowledge-base')}
                    >
                      <i className="fas fa-search"></i>
                      Search Solutions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Ticket View - Enhanced */}
          {activeView === 'create' && (
            <div className="create-ticket-view">
              {isSubmitting ? (
                <div className="submission-progress">
                  <div className="progress-container">
                    <div className="progress-circle">
                      <svg viewBox="0 0 36 36" className="circular-chart">
                        <path
                          className="circle-bg"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="circle"
                          strokeDasharray={`${submitProgress}, 100`}
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="progress-text">
                        <span className="progress-percentage">{submitProgress}%</span>
                        <span className="progress-label">Creating...</span>
                      </div>
                    </div>
                    <p className="progress-message">
                      {submitProgress === 100 ? 'Ticket created successfully!' : 'Processing your request...'}
                    </p>
                  </div>
                </div>
              ) : (
                <form 
                  ref={formRef}
                  onSubmit={handleAdvancedSubmit} 
                  className="premium-ticket-form"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {/* Form content continues... */}
                  <div className="form-section">
                    <h3>
                      <i className="fas fa-edit"></i>
                      Ticket Details
                    </h3>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Subject *</label>
                        <input
                          type="text"
                          value={ticketForm.subject}
                          onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Brief description of your issue..."
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group half">
                        <label>Category *</label>
                        <div className="category-selector">
                          {ticketCategories.map(category => (
                            <div
                              key={category.id}
                              className={`category-option ${ticketForm.category === category.id ? 'selected' : ''}`}
                              onClick={() => setTicketForm(prev => ({ ...prev, category: category.id }))}
                              style={{ borderColor: ticketForm.category === category.id ? category.color : '#E2E8F0' }}
                            >
                              <div className="category-icon" style={{ backgroundColor: category.color }}>
                                <i className={`fas fa-${category.icon}`}></i>
                              </div>
                              <div className="category-info">
                                <span className="category-name">{category.name}</span>
                                <span className="category-desc">{category.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="form-group half">
                        <label>Priority</label>
                        <div className="priority-selector">
                          {priorityLevels.map(priority => (
                            <button
                              key={priority.id}
                              type="button"
                              className={`priority-option ${ticketForm.priority === priority.id ? 'selected' : ''}`}
                              onClick={() => setTicketForm(prev => ({ ...prev, priority: priority.id }))}
                              style={{
                                borderColor: ticketForm.priority === priority.id ? priority.color : '#E2E8F0',
                                backgroundColor: ticketForm.priority === priority.id ? `${priority.color}15` : 'transparent'
                              }}
                            >
                              <i className={`fas fa-${priority.icon}`} style={{ color: priority.color }}></i>
                              <div className="priority-content">
                                <span className="priority-name">{priority.name}</span>
                                <span className="priority-time">{priority.responseTime}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Please provide detailed information about your issue..."
                        rows="6"
                        required
                      />
                    </div>
                  </div>

                  {/* File Upload Area */}
                  <div className="form-section">
                    <h3>
                      <i className="fas fa-paperclip"></i>
                      Attachments
                    </h3>
                    
                    <div className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}>
                      <div className="drop-zone-content">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <p>
                          <strong>Drop files here</strong> or{' '}
                          <button
                            type="button"
                            className="browse-files-btn"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            browse
                          </button>
                        </p>
                        <span className="file-restrictions">
                          Supported: Images, PDFs, Documents (Max 10MB)
                        </span>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          setTicketForm(prev => ({
                            ...prev,
                            attachments: [...prev.attachments, ...files.map(file => ({
                              name: file.name,
                              size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                              type: file.type.split('/')[0],
                              file
                            }))]
                          }));
                        }}
                        style={{ display: 'none' }}
                      />
                    </div>

                    {ticketForm.attachments.length > 0 && (
                      <div className="attached-files">
                        {ticketForm.attachments.map((file, index) => (
                          <div key={index} className="attached-file">
                            <div className="file-icon">
                              <i className={`fas fa-${
                                file.type === 'image' ? 'image' :
                                file.type === 'application' ? 'file-pdf' :
                                'file-alt'
                              }`}></i>
                            </div>
                            <div className="file-info">
                              <span className="file-name">{file.name}</span>
                              <span className="file-size">{file.size}</span>
                            </div>
                            <button
                              type="button"
                              className="remove-file"
                              onClick={() => {
                                setTicketForm(prev => ({
                                  ...prev,
                                  attachments: prev.attachments.filter((_, i) => i !== index)
                                }));
                              }}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Section */}
                  <div className="submit-section">
                    <div className="submit-info">
                      <div className="estimated-response">
                        <i className="fas fa-clock"></i>
                        <span>
                          Estimated response time:{' '}
                          <strong>
                            {priorityLevels.find(p => p.id === ticketForm.priority)?.responseTime || '24 hours'}
                          </strong>
                        </span>
                      </div>
                      
                      <div className="support-hours">
                        <i className="fas fa-calendar-alt"></i>
                        <span>Support hours: Mon-Fri 8AM-6PM EST</span>
                      </div>
                    </div>
                    
                    <button type="submit" className="premium-submit-btn" disabled={isSubmitting}>
                      <i className="fas fa-paper-plane"></i>
                      Create Support Ticket
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* My Tickets View - Enhanced */}
          {activeView === 'my-tickets' && (
            <div className="my-tickets-view">
              {!selectedTicket ? (
                <>
                  {/* Filters and Controls */}
                  <div className="tickets-controls">
                    <div className="filters-section">
                      <div className="filter-group">
                        <label>Status</label>
                        <select
                          value={ticketFilters.status}
                          onChange={(e) => setTicketFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                          <option value="all">All Status</option>
                          <option value="new">New</option>
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      
                      <div className="filter-group">
                        <label>Priority</label>
                        <select
                          value={ticketFilters.priority}
                          onChange={(e) => setTicketFilters(prev => ({ ...prev, priority: e.target.value }))}
                        >
                          <option value="all">All Priorities</option>
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="view-controls">
                      <button className="refresh-btn" onClick={loadUserData}>
                        <i className={`fas fa-sync-alt ${isLoadingTickets ? 'fa-spin' : ''}`}></i>
                        Refresh
                      </button>
                    </div>
                  </div>

                  {/* Tickets List */}
                  <div className="enhanced-tickets-list" ref={ticketListRef}>
                    {isLoadingTickets ? (
                      <div className="premium-loading">
                        <div className="loading-animation">
                          <div className="loading-ring"></div>
                          <div className="loading-ring"></div>
                          <div className="loading-ring"></div>
                        </div>
                        <p>Loading your tickets...</p>
                      </div>
                    ) : userTickets.length > 0 ? (
                      <div className="tickets-grid">
                        {userTickets
                          .filter(ticket => 
                            (ticketFilters.status === 'all' || ticket.status === ticketFilters.status) &&
                            (ticketFilters.priority === 'all' || ticket.priority === ticketFilters.priority)
                          )
                          .map(ticket => (
                            <div
                              key={ticket.id}
                              className={`premium-ticket-card ${ticket.status}`}
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              <div className="ticket-header">
                                <div className="ticket-id">{ticket.id}</div>
                                <div className="ticket-priority">
                                  <span 
                                    className="priority-indicator"
                                    style={{ backgroundColor: priorityLevels.find(p => p.id === ticket.priority)?.color }}
                                  ></span>
                                  {ticket.priority}
                                </div>
                              </div>
                              
                              <h4 className="ticket-subject">{ticket.subject}</h4>
                              
                              <div className="ticket-meta">
                                <div className="meta-row">
                                  <div className="meta-item">
                                    <i className="fas fa-folder"></i>
                                    <span>{ticketCategories.find(c => c.id === ticket.category)?.name}</span>
                                  </div>
                                  <div className="meta-item">
                                    <i className="fas fa-clock"></i>
                                    <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                
                                {ticket.assignedAgent && (
                                  <div className="assigned-agent">
                                    <div className="agent-avatar">{ticket.assignedAgent.avatar}</div>
                                    <span>{ticket.assignedAgent.name}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="ticket-footer">
                                <div className={`status-badge ${ticket.status}`}>
                                  {ticket.status.replace('-', ' ')}
                                </div>
                                
                                {ticket.responses.length > 1 && (
                                  <div className="responses-count">
                                    <i className="fas fa-comments"></i>
                                    <span>{ticket.responses.length - 1}</span>
                                  </div>
                                )}
                                
                                {ticket.tags.length > 0 && (
                                  <div className="ticket-tags">
                                    {ticket.tags.slice(0, 2).map(tag => (
                                      <span key={tag} className="tag">{tag}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="premium-empty-state">
                        <div className="empty-illustration">
                          <i className="fas fa-inbox"></i>
                        </div>
                        <h3>No Support Tickets</h3>
                        <p>You haven't created any support tickets yet. Create your first ticket to get started.</p>
                        <button 
                          className="create-ticket-btn"
                          onClick={() => handleViewChange('create')}
                        >
                          <i className="fas fa-plus"></i>
                          Create Your First Ticket
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Enhanced Ticket Detail View */
                <div className="premium-ticket-detail">
                  {/* Detail Header */}
                  <div className="detail-header">
                    <button 
                      className="back-btn"
                      onClick={() => setSelectedTicket(null)}
                    >
                      <i className="fas fa-arrow-left"></i>
                      Back to tickets
                    </button>
                    
                    <div className="ticket-summary">
                      <div className="summary-main">
                        <h2>{selectedTicket.subject}</h2>
                        <div className="ticket-badges">
                          <span className={`status-badge ${selectedTicket.status}`}>
                            {selectedTicket.status.replace('-', ' ')}
                          </span>
                          <span 
                            className="priority-badge"
                            style={{ 
                              backgroundColor: `${priorityLevels.find(p => p.id === selectedTicket.priority)?.color}20`,
                              color: priorityLevels.find(p => p.id === selectedTicket.priority)?.color
                            }}
                          >
                            {selectedTicket.priority} priority
                          </span>
                        </div>
                      </div>
                      
                      <div className="summary-meta">
                        <div className="meta-item">
                          <span className="label">Ticket ID:</span>
                          <span className="value">{selectedTicket.id}</span>
                        </div>
                        <div className="meta-item">
                          <span className="label">Created:</span>
                          <span className="value">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="meta-item">
                          <span className="label">Last Updated:</span>
                          <span className="value">{new Date(selectedTicket.updatedAt).toLocaleDateString()}</span>
                        </div>
                        {selectedTicket.assignedAgent && (
                          <div className="meta-item">
                            <span className="label">Assigned to:</span>
                            <div className="assigned-info">
                              <div className="agent-avatar">{selectedTicket.assignedAgent.avatar}</div>
                              <span className="agent-name">{selectedTicket.assignedAgent.name}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Conversation */}
                  <div className="premium-conversation">
                    <div className="conversation-header">
                      <h3>
                        <i className="fas fa-comments"></i>
                        Conversation ({selectedTicket.responses.length})
                      </h3>
                      
                      {selectedTicket.estimatedResolution && (
                        <div className="resolution-estimate">
                          <i className="fas fa-clock"></i>
                          <span>Est. resolution: {selectedTicket.estimatedResolution}h</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="conversation-timeline">
                      {selectedTicket.responses.map((response, index) => (
                        <div
                          key={response.id}
                          className={`timeline-message ${response.type === 'staff' ? 'staff' : 'user'}`}
                        >
                          <div className="message-avatar">
                            <div className="avatar-circle">
                              {response.type === 'staff' ? response.author.split(' ').map(n => n[0]).join('') : (currentUser?.first_name?.[0] || 'U')}
                            </div>
                            {response.type === 'staff' && <div className="staff-indicator"></div>}
                          </div>
                          
                          <div className="message-content">
                            <div className="message-header">
                              <div className="author-info">
                                <span className="author-name">{response.author}</span>
                                <span className="author-role">{response.role}</span>
                                {response.type === 'staff' && selectedTicket.assignedAgent?.specialties && (
                                  <div className="specialties">
                                    {selectedTicket.assignedAgent.specialties.map(specialty => (
                                      <span key={specialty} className="specialty-tag">{specialty}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="message-meta">
                                <span className="timestamp">
                                  {new Date(response.timestamp).toLocaleString()}
                                </span>
                                {response.edited && <span className="edited-indicator">edited</span>}
                              </div>
                            </div>
                            
                            <div className="message-body">
                              <p>{response.content}</p>
                              
                              {response.resolution && (
                                <div className="resolution-marker">
                                  <i className="fas fa-check-circle"></i>
                                  <span>This message marked the ticket as resolved</span>
                                </div>
                              )}
                              
                              {response.reactions && response.reactions.length > 0 && (
                                <div className="message-reactions">
                                  {response.reactions.map((reaction, idx) => (
                                    <span key={idx} className="reaction">
                                      {reaction.emoji} {reaction.count}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Reply Section */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="premium-reply-section">
                      <div className="reply-header">
                        <h4>
                          <i className="fas fa-reply"></i>
                          Add Response
                        </h4>
                        
                        <div className="reply-options">
                          <button 
                            className="formatting-btn"
                            title="Add formatting"
                          >
                            <i className="fas fa-bold"></i>
                          </button>
                          <button 
                            className="emoji-btn"
                            title="Add emoji"
                          >
                            <i className="fas fa-smile"></i>
                          </button>
                          <button 
                            className="attach-btn"
                            title="Attach files"
                          >
                            <i className="fas fa-paperclip"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div className="reply-form">
                        <div className="reply-input-container">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your response here... You can provide additional details, ask questions, or clarify information."
                            rows="4"
                            className="premium-reply-input"
                          />
                          
                          <div className="input-footer">
                            <div className="character-count">
                              <span className={replyText.length > 1000 ? 'warning' : ''}>
                                {replyText.length}/2000
                              </span>
                            </div>
                            
                            <div className="reply-actions">
                              <button
                                className="cancel-reply"
                                onClick={() => setReplyText('')}
                                disabled={!replyText.trim()}
                              >
                                Cancel
                              </button>
                              
                              <button
                                className="send-reply"
                                onClick={() => {
                                  // Handle reply submission
                                  console.log('Sending reply:', replyText);
                                  setReplyText('');
                                }}
                                disabled={!replyText.trim()}
                              >
                                <i className="fas fa-paper-plane"></i>
                                Send Response
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Knowledge Base View */}
          {activeView === 'knowledge-base' && (
            <div className="knowledge-base-view">
              <div className="kb-header">
                <h3>
                  <i className="fas fa-book-open"></i>
                  Knowledge Base
                </h3>
                <p>Find answers to common questions and learn how to use our platform effectively.</p>
              </div>
              
              <div className="kb-categories">
                {ticketCategories.map(category => (
                  <div key={category.id} className="kb-category">
                    <div className="category-header" style={{ borderColor: category.color }}>
                      <div className="category-icon" style={{ backgroundColor: category.color }}>
                        <i className={`fas fa-${category.icon}`}></i>
                      </div>
                      <h4>{category.name}</h4>
                    </div>
                    
                    <div className="category-articles">
                      {knowledgeBase
                        .filter(article => article.category === category.id)
                        .map(article => (
                          <div key={article.id} className="kb-article">
                            <h5>{article.title}</h5>
                            <div className="article-meta">
                              <span className="views">
                                <i className="fas fa-eye"></i>
                                {article.views} views
                              </span>
                              <span className="helpful">
                                <i className="fas fa-thumbs-up"></i>
                                {article.helpful}% helpful
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumUserSupportCenter;