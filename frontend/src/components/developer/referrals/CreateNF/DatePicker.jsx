import React, { useState, useRef, useEffect } from 'react';
import '../../../../styles/developer/Referrals/CreateNF/DatePicker.scss';

// FUNCIÓN HELPER FUERA DEL COMPONENTE - Crear fecha desde string sin problemas de timezone
const createDateFromString = (dateString) => {
  if (!dateString) return null;
  
  const [year, month, day] = dateString.split('-').map(Number);
  // Crear fecha en timezone local
  return new Date(year, month - 1, day);
};

// FUNCIÓN HELPER FUERA DEL COMPONENTE - Formatear fecha para input sin problemas de timezone
const formatInputDate = (date) => {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DevCustomDatePicker = ({ 
  selectedDate, 
  onChange, 
  label, 
  name, 
  disabled = false, 
  required = false 
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [localDate, setLocalDate] = useState(selectedDate ? createDateFromString(selectedDate) : null);
  const [animation, setAnimation] = useState('');
  const calendarRef = useRef(null);
  
  // Formatear la fecha para mostrar en el input (DD/MM/YYYY)
  const formatDisplayDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Obtener el nombre del mes y año para el encabezado del calendario
  const getMonthYearDisplay = () => {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const monthName = months[currentMonth.getMonth()];
    // Capitalizar la primera letra
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    
    return `${capitalizedMonth} ${currentMonth.getFullYear()}`;
  };
  
  // Generar los días para mostrar en el calendario
  const generateDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Primer día del mes actual
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = domingo, 1 = lunes, etc.
    
    // Último día del mes
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Días del mes anterior para completar la primera semana
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    // Días del mes siguiente para completar la última semana
    const lastDayOfWeek = lastDayOfMonth.getDay();
    const daysFromNextMonth = 6 - lastDayOfWeek;
    
    // Generar array de todos los días
    const days = [];
    
    // Días del mes anterior
    for (let i = daysInPrevMonth - daysFromPrevMonth + 1; i <= daysInPrevMonth; i++) {
      days.push({
        day: i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
        date: new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, i)
      });
    }
    
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // Días del mes siguiente
    for (let i = 1; i <= daysFromNextMonth; i++) {
      days.push({
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
        date: new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, i)
      });
    }
    
    return days;
  };
  
  // Navegar al mes anterior
  const goToPrevMonth = () => {
    setAnimation('slide-out-right');
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
      setAnimation('slide-in-left');
    }, 200);
    setTimeout(() => {
      setAnimation('');
    }, 400);
  };
  
  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setAnimation('slide-out-left');
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
      setAnimation('slide-in-right');
    }, 200);
    setTimeout(() => {
      setAnimation('');
    }, 400);
  };
  
  // Seleccionar un día
  const selectDay = (day) => {
    if (!day.isCurrentMonth) {
      if (day.month < currentMonth.getMonth() || (day.month === 11 && currentMonth.getMonth() === 0)) {
        goToPrevMonth();
        setTimeout(() => {
          setLocalDate(day.date);
          const formattedDate = formatInputDate(day.date);
          console.log('Date selected in CustomDatePicker:', { date: day.date, formatted: formattedDate });
          onChange(formattedDate);
        }, 300);
      } else {
        goToNextMonth();
        setTimeout(() => {
          setLocalDate(day.date);
          const formattedDate = formatInputDate(day.date);
          console.log('Date selected in CustomDatePicker:', { date: day.date, formatted: formattedDate });
          onChange(formattedDate);
        }, 300);
      }
    } else {
      setLocalDate(day.date);
      const formattedDate = formatInputDate(day.date);
      console.log('Date selected in CustomDatePicker:', { date: day.date, formatted: formattedDate });
      onChange(formattedDate);
      
      // Añadir una pequeña animación al calendario antes de cerrarlo
      setTimeout(() => {
        setShowCalendar(false);
      }, 300);
    }
  };
  
  // Limpiar selección
  const clearDate = (e) => {
    e.stopPropagation();
    setLocalDate(null);
    onChange('');
    setAnimation('bounce-out');
    setTimeout(() => {
      setShowCalendar(false);
    }, 300);
  };
  
  // Establecer la fecha a hoy
  const setToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    setLocalDate(today);
    const formattedDate = formatInputDate(today);
    console.log('Today selected in CustomDatePicker:', { date: today, formatted: formattedDate });
    onChange(formattedDate);
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setAnimation('pulse');
    setTimeout(() => {
      setAnimation('');
      setShowCalendar(false);
    }, 400);
  };
  
  // Mostrar calendario
  const handleShowCalendar = () => {
    if (!disabled) {
      setShowCalendar(true);
    }
  };
  
  // Cerrar calendario
  const handleCloseCalendar = (e) => {
    e.stopPropagation();
    setAnimation('bounce-out');
    setTimeout(() => {
      setShowCalendar(false);
      setAnimation('');
    }, 300);
  };
  
  // Cerrar el calendario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Solo cuando el calendario está abierto y el clic no es dentro del calendario
      if (showCalendar && calendarRef.current && !calendarRef.current.contains(event.target)) {
        setAnimation('bounce-out');
        setTimeout(() => {
          setShowCalendar(false);
          setAnimation('');
        }, 300);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);
  
  // USEEFFECT CORREGIDO - Actualizar el estado local si cambia la fecha seleccionada externamente
  useEffect(() => {
    if (selectedDate) {
      console.log('CustomDatePicker received selectedDate:', selectedDate);
      const date = createDateFromString(selectedDate);
      console.log('CustomDatePicker parsed date:', date);
      setLocalDate(date);
      if (date) {
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    } else {
      setLocalDate(null);
    }
  }, [selectedDate]);
  
  // Comprobar si un día es hoy
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Comprobar si un día está seleccionado
  const isSelected = (date) => {
    if (!localDate) return false;
    return date.getDate() === localDate.getDate() &&
           date.getMonth() === localDate.getMonth() &&
           date.getFullYear() === localDate.getFullYear();
  };
  
  // Días de la semana
  const weekdays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  
  return (
    <div className="custom-date-picker" ref={calendarRef}>
      {label && <label>{label}</label>}
      
      <div 
        className="date-input-wrapper"
        onClick={handleShowCalendar}
      >
        <input
          type="text"
          name={name}
          value={localDate ? formatDisplayDate(localDate) : ''}
          readOnly
          placeholder="Seleccionar fecha"
          disabled={disabled}
          required={required}
          className={`custom-date-input ${disabled ? 'disabled' : ''}`}
        />
        <i className="fas fa-calendar-alt calendar-icon"></i>
      </div>
      
      {showCalendar && (
        <>
          {/* Overlay que cubre toda la pantalla */}
          <div className="calendar-overlay" onClick={handleCloseCalendar}></div>
          
          {/* Dropdown del calendario */}
          <div className={`calendar-dropdown ${animation}`}>
            <div className="calendar-header">
              <div className="month-year">
                {getMonthYearDisplay()}
              </div>
              <div className="navigation">
                <button 
                  className="nav-btn prev-month" 
                  onClick={(e) => { e.stopPropagation(); goToPrevMonth(); }}
                  aria-label="Mes anterior"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button 
                  className="nav-btn next-month" 
                  onClick={(e) => { e.stopPropagation(); goToNextMonth(); }}
                  aria-label="Siguiente mes"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
            
            <div className="calendar-body">
              <div className="weekdays">
                {weekdays.map((day, index) => (
                  <div key={index} className="weekday">{day}</div>
                ))}
              </div>
              
              <div className={`days ${animation}`}>
                {generateDays().map((day, index) => (
                  <div
                    key={index}
                    className={`day 
                      ${!day.isCurrentMonth ? 'other-month' : ''} 
                      ${isToday(day.date) ? 'today' : ''} 
                      ${isSelected(day.date) ? 'selected' : ''}`
                    }
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      selectDay(day); 
                    }}
                  >
                    {day.day}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="calendar-footer">
              <button 
                className="calendar-btn clear-btn" 
                onClick={clearDate}
              >
                <i className="fas fa-times-circle"></i> Borrar
              </button>
              <button 
                className="calendar-btn today-btn" 
                onClick={setToday}
              >
                <i className="fas fa-calendar-day"></i> Hoy
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DevCustomDatePicker;