import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../login/AuthContext';
import TicketFilters from './TicketFilters';
import TicketList from './TicketList';
import TicketModal from './TicketModal';
import '../../../styles/developer/support/SupportDashboard.scss';

const SupportDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Estados principales
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
    avgResponseTime: '0h'
  });

  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    assignedTo: 'all'
  });

  // Simulación de carga inicial
  useEffect(() => {
    loadTickets();
  }, []);

  // Función para cargar tickets (simulada)
  const loadTickets = async () => {
    setIsLoading(true);
    try {
      // Simulamos llamada a API
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockTickets = generateMockTickets();
      setTickets(mockTickets);
      setFilteredTickets(mockTickets);
      calculateStats(mockTickets);
      
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generar tickets de muestra
  const generateMockTickets = () => {
    const categories = [
      { id: 'technical', name: 'Technical Issue', icon: 'cogs' },
      { id: 'account', name: 'Account Access', icon: 'user-shield' },
      { id: 'billing', name: 'Billing Support', icon: 'credit-card' },
      { id: 'feature', name: 'Feature Request', icon: 'lightbulb' },
      { id: 'bug', name: 'Bug Report', icon: 'bug' }
    ];

    const priorities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['new', 'open', 'in-progress', 'pending', 'resolved', 'closed'];
    
    const sampleUsers = [
      { name: 'Dr. Sarah Martinez', email: 's.martinez@clinic.com', role: 'Physical Therapist' },
      { name: 'John Rodriguez', email: 'j.rodriguez@clinic.com', role: 'Occupational Therapist' },
      { name: 'Emily Chen', email: 'e.chen@clinic.com', role: 'Speech Therapist' },
      { name: 'Michael Johnson', email: 'm.johnson@clinic.com', role: 'Administrator' },
      { name: 'Lisa Williams', email: 'l.williams@clinic.com', role: 'Billing Specialist' }
    ];

    const sampleSubjects = [
      'Unable to access patient records after login',
      'Billing discrepancy for Medicare patient',
      'System crashes when generating reports',
      'Request for exercise library expansion',
      'Patient portal not showing appointments',
      'Documentation template missing fields',
      'Insurance verification system timeout',
      'Mobile app not syncing with desktop'
    ];

    return Array.from({ length: 24 }, (_, index) => {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      const subject = sampleSubjects[Math.floor(Math.random() * sampleSubjects.length)];
      
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
      
      return {
        id: `TKT-${String(1000 + index).padStart(4, '0')}`,
        subject,
        description: `Detailed description for ticket ${subject.toLowerCase()}. User experiencing issues and requires immediate attention from our support team.`,
        status,
        priority,
        category: category.id,
        categoryInfo: category,
        user,
        assignedTo: Math.random() > 0.3 ? {
          id: 1,
          name: 'Luis Nava',
          role: 'Developer',
          avatar: 'LN'
        } : null,
        createdAt: createdDate.toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['web-app', 'urgent'],
        responses: [
          {
            id: 1,
            author: user.name,
            role: 'Patient',
            content: `I'm experiencing issues with ${subject.toLowerCase()}. Please help resolve this as soon as possible.`,
            timestamp: createdDate.toISOString(),
            type: 'user'
          }
        ]
      };
    });
  };

  // Calcular estadísticas del dashboard
  const calculateStats = (ticketData) => {
    const stats = {
      total: ticketData.length,
      new: ticketData.filter(t => t.status === 'new').length,
      inProgress: ticketData.filter(t => t.status === 'in-progress').length,
      resolved: ticketData.filter(t => ['resolved', 'closed'].includes(t.status)).length,
      critical: ticketData.filter(t => t.priority === 'critical').length,
      avgResponseTime: '2.4h'
    };
    setDashboardStats(stats);
  };

  // Manejar cambios en filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    applyFilters(tickets, newFilters);
  };

  // Aplicar filtros
  const applyFilters = (ticketData, filterOptions) => {
    let filtered = [...ticketData];

    // Filtro de búsqueda
    if (filterOptions.search) {
      const searchTerm = filterOptions.search.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchTerm) ||
        ticket.id.toLowerCase().includes(searchTerm) ||
        ticket.user.name.toLowerCase().includes(searchTerm) ||
        ticket.description.toLowerCase().includes(searchTerm)
      );
    }

    // Filtros por estado, prioridad, categoría
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filterOptions.status);
    }
    
    if (filterOptions.priority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === filterOptions.priority);
    }
    
    if (filterOptions.category !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === filterOptions.category);
    }

    // Ordenar por fecha de creación (más recientes primero)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredTickets(filtered);
  };

  // Manejar selección de ticket
  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  // Manejar cierre del modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  // Manejar actualización de ticket
  const handleTicketUpdate = async (ticketId, updates) => {
    try {
      // Simulamos llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedTickets = tickets.map(ticket =>
        ticket.id === ticketId ? { ...ticket, ...updates, updatedAt: new Date().toISOString() } : ticket
      );
      
      setTickets(updatedTickets);
      applyFilters(updatedTickets, filters);
      calculateStats(updatedTickets);
      
      // Actualizar ticket seleccionado
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, ...updates });
      }
      
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  return (
    <div className="support-dashboard">
      {/* Header clínico */}
      <div className="clinical-header">
        <div className="header-content">
          <div className="header-title">
            <div className="medical-icon">
              <i className="fas fa-user-md"></i>
            </div>
            <div className="title-info">
              <h1>Clinical Support Center</h1>
              <p>Technical assistance for healthcare professionals</p>
            </div>
          </div>

          <div className="header-actions">
            <button 
              className="exit-support-btn"
              onClick={() => navigate('/developer/homePage')}
            >
              <i className="fas fa-arrow-left"></i>
              Exit Support
            </button>
            
            <div className="user-info">
              <div className="user-avatar">
                {currentUser ? currentUser.first_name?.charAt(0) + currentUser.last_name?.charAt(0) : 'DV'}
              </div>
              <div className="user-details">
                <span className="user-name">{currentUser?.first_name} {currentUser?.last_name}</span>
                <span className="user-role">Support Specialist</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard de estadísticas */}
      <div className="clinical-stats">
        <div className="stat-card total">
          <div className="stat-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">{dashboardStats.total}</span>
            <span className="stat-label">Total Tickets</span>
          </div>
        </div>
        
        <div className="stat-card new">
          <div className="stat-icon">
            <i className="fas fa-plus-circle"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">{dashboardStats.new}</span>
            <span className="stat-label">New Tickets</span>
          </div>
        </div>
        
        <div className="stat-card progress">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">{dashboardStats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        
        <div className="stat-card resolved">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">{dashboardStats.resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
        
        <div className="stat-card critical">
          <div className="stat-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">{dashboardStats.critical}</span>
            <span className="stat-label">Critical</span>
          </div>
        </div>
        
        <div className="stat-card response-time">
          <div className="stat-icon">
            <i className="fas fa-tachometer-alt"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">{dashboardStats.avgResponseTime}</span>
            <span className="stat-label">Avg Response</span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="dashboard-content">
        {/* Panel de filtros */}
        <div className="filters-panel">
          <TicketFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
          />
        </div>

        {/* Layout principal */}
        <div className="main-layout">
          {/* Lista de tickets */}
          <div className="tickets-section">
            <TicketList
              tickets={filteredTickets}
              selectedTicket={selectedTicket}
              onTicketSelect={handleTicketSelect}
              onTicketUpdate={handleTicketUpdate}
              isLoading={isLoading}
            />
          </div>

        </div>
      </div>

      {/* Modal de Ticket */}
      <TicketModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onTicketUpdate={handleTicketUpdate}
      />
    </div>
  );
};

export default SupportDashboard;