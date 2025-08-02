import React, { useState, useEffect, useRef } from 'react';
import '../../../styles/developer/Welcome/AIAssistant.scss';

const DevAIAssistant = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  const quickSuggestions = [
    { icon: 'fa-calendar-plus', text: 'Agendar cita', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #1E40AF)' },
    { icon: 'fa-user-plus', text: 'Nuevo paciente', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #047857)' },
    { icon: 'fa-file-medical', text: 'Historial médico', color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #B45309)' },
    { icon: 'fa-chart-line', text: 'Ver reportes', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }
  ];
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setAnimationClass('bounceIn');
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [isExpanded]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageHistory]);
  
  const toggleAssistant = () => {
    if (isExpanded) {
      setAnimationClass('slideDownAndFade');
      setTimeout(() => {
        setIsExpanded(false);
        setAnimationClass('');
      }, 300);
    } else {
      setIsExpanded(true);
      setAnimationClass('slideUpAndReveal');
    }
    setIsTyping(false);
  };
  
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };
  
  const simulateTyping = (text, callback) => {
    setIsProcessing(true);
    
    setMessageHistory(prev => [...prev, { sender: 'assistant', content: '', isTyping: true }]);
    
    let i = 0;
    const typingSpeed = 30;
    const typeChar = () => {
      if (i < text.length) {
        setMessageHistory(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex].content += text.charAt(i);
          i++;
          return updated;
        });
        setTimeout(typeChar, typingSpeed);
      } else {
        setMessageHistory(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex].isTyping = false;
          return updated;
        });
        setIsProcessing(false);
        if (callback) callback();
      }
    };
    
    setTimeout(typeChar, 600);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() === '' || isProcessing) return;
    
    setMessageHistory(prev => [...prev, { sender: 'user', content: query }]);
    
    const button = document.querySelector('.send-button.active');
    if (button) {
      button.classList.add('sent');
      
      for (let i = 0; i < 8; i++) {
        const particle = document.createElement('span');
        particle.classList.add('particle');
        const randomAngle = Math.random() * Math.PI * 2;
        const randomDistance = Math.random() * 20 + 10;
        particle.style.setProperty('--angle', `${randomAngle}rad`);
        particle.style.setProperty('--distance', `${randomDistance}px`);
        particle.style.setProperty('--delay', `${Math.random() * 200}ms`);
        button.appendChild(particle);
      }
      
      setTimeout(() => {
        button.classList.remove('sent');
        const particles = button.querySelectorAll('.particle');
        particles.forEach(p => p.remove());
      }, 1000);
    }
    
    const userQuery = query.toLowerCase();
    let response = "Entendido, ¿en qué más puedo ayudarte?";
    
    if (userQuery.includes('cita') || userQuery.includes('agendar')) {
      response = "He abierto el calendario para agendar una nueva cita. Por favor, selecciona fecha y hora disponible.";
    } else if (userQuery.includes('paciente') || userQuery.includes('nuevo')) {
      response = "Perfecto, he iniciado el formulario para registrar un nuevo paciente. Necesitaremos datos personales y médicos básicos.";
    } else if (userQuery.includes('historial') || userQuery.includes('médico')) {
      response = "Accediendo al historial médico. Por favor, indique el nombre del paciente o su número de identificación.";
    } else if (userQuery.includes('reporte') || userQuery.includes('estadística')) {
      response = "Generando reportes actualizados. ¿Prefieres ver estadísticas de pacientes, ingresos o procedimientos médicos?";
    }
    
    setQuery('');
    setIsTyping(false);
    
    simulateTyping(response);
  };
  
  const handleSuggestionClick = (suggestion, index) => {
    if (isProcessing) return;
    
    setActiveSuggestion(index);
    setTimeout(() => setActiveSuggestion(null), 500);
    
    let response = "";
    switch(suggestion.text) {
      case "Agendar cita":
        response = "He abierto el módulo de agendamiento. ¿Para qué médico y fecha prefieres agendar?";
        break;
      case "Nuevo paciente":
        response = "Formulario de registro activado. Necesitaremos información básica del nuevo paciente.";
        break;
      case "Historial médico":
        response = "Accediendo a la base de datos de historiales médicos. ¿Cuál es el nombre o ID del paciente?";
        break;
      case "Ver reportes":
        response = "Cargando panel de reportes y analíticas. ¿Qué periodo de tiempo deseas analizar?";
        break;
      default:
        response = "¿En qué puedo ayudarte con esta opción?";
    }
    
    setMessageHistory(prev => [...prev, { 
      sender: 'user', 
      content: `He seleccionado: ${suggestion.text}`,
      isActionCard: true,
      actionIcon: suggestion.icon,
      actionColor: suggestion.color
    }]);
    
    simulateTyping(response);
  };

  if (!isVisible) return null;

  return (
    <div className={`ai-assistant-container ${isExpanded ? 'expanded' : ''} ${animationClass}`}>
      <div className="assistant-collapsed" onClick={toggleAssistant}>
        <div className="assistant-icon">
          <div className="icon-pulse"></div>
          <i className="fas fa-robot"></i>
        </div>
        <div className="assistant-prompt">
          <span>¿En qué puedo ayudarte hoy?</span>
        </div>
        <div className="assistant-toggle">
          <i className={`fas fa-chevron-${isExpanded ? 'down' : 'up'}`}></i>
        </div>
      </div>
      
      {isExpanded && (
        <div className={`assistant-expanded ${animationClass}`}>
          {messageHistory.length > 0 && (
            <div className="message-history">
              {messageHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`message ${msg.sender} ${msg.isTyping ? 'typing' : ''} ${msg.isActionCard ? 'action-card' : ''}`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="message-avatar">
                      <i className="fas fa-robot"></i>
                    </div>
                  )}
                  
                  <div className="message-content">
                    {msg.isActionCard ? (
                      <div className="action-content" style={{ '--action-color': msg.actionColor }}>
                        <div className="action-icon">
                          <i className={`fas ${msg.actionIcon}`}></i>
                        </div>
                        <span>{msg.content}</span>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                    
                    {msg.isTyping && (
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    )}
                  </div>
                  
                  {msg.sender === 'user' && !msg.isActionCard && (
                    <div className="message-avatar user">
                      <span>YO</span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
          
          <div className="quick-suggestions">
            <h4>Acciones rápidas</h4>
            <div className="suggestions-list">
              {quickSuggestions.map((suggestion, index) => (
                <button 
                  key={index} 
                  className={`suggestion-item ${activeSuggestion === index ? 'active' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion, index)}
                  style={{
                    '--suggestion-color': suggestion.color,
                    '--suggestion-gradient': suggestion.gradient
                  }}
                >
                  <div className="suggestion-icon">
                    <i className={`fas ${suggestion.icon}`}></i>
                  </div>
                  <span>{suggestion.text}</span>
                  <div className="suggestion-hover-effect"></div>
                </button>
              ))}
            </div>
          </div>
          
          <form className="assistant-form" onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <div className="input-icon">
                <i className="fas fa-search"></i>
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Escribe tu consulta o instrucción..."
                value={query}
                onChange={handleInputChange}
                disabled={isProcessing}
              />
              <button 
                type="submit" 
                className={`send-button ${isTyping ? 'active' : ''}`}
                disabled={!isTyping || isProcessing}
              >
                <i className="fas fa-paper-plane"></i>
                <span className="send-ripple"></span>
              </button>
            </div>
          </form>
          
          <div className="assistant-help">
            <p>
              <i className="fas fa-info-circle"></i>
              Puedes preguntar sobre pacientes, citas, facturas o solicitar asistencia técnica.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevAIAssistant;