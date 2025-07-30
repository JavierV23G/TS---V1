import React, { useState, useRef, useEffect } from 'react';

const createDateFromString = (dateString) => {
  if (!dateString) return null;
  
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatInputDate = (date) => {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DevDOBDatePicker = ({ 
  selectedDate, 
  onChange, 
  name = "dob",
  disabled = false, 
  required = false 
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentDecade, setCurrentDecade] = useState(Math.floor(new Date().getFullYear() / 10) * 10);
  const [localDate, setLocalDate] = useState(selectedDate ? createDateFromString(selectedDate) : null);
  const [viewMode, setViewMode] = useState('days');
  const [animation, setAnimation] = useState('');
  const calendarRef = useRef(null);

  const formatDisplayDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  
  const formatInputDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const getHeaderText = () => {
    if (viewMode === 'days') {
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return `${months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
    } else if (viewMode === 'months') {
      return `${currentYear}`;
    } else if (viewMode === 'years') {
      return `${currentDecade} - ${currentDecade + 9}`;
    } else if (viewMode === 'decades') {
      const startDecade = Math.floor(currentDecade / 100) * 100;
      return `${startDecade} - ${startDecade + 90}`;
    }
  };
  
  const generateDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    const lastDayOfWeek = lastDayOfMonth.getDay();
    const daysFromNextMonth = 6 - lastDayOfWeek;
    
    const days = [];
    
    for (let i = daysInPrevMonth - daysFromPrevMonth + 1; i <= daysInPrevMonth; i++) {
      days.push({
        day: i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
        date: new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, i)
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
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
  
  const generateMonths = () => {
    const months = [];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    for (let i = 0; i < 12; i++) {
      months.push({
        month: i,
        year: currentYear,
        name: monthNames[i]
      });
    }
    
    return months;
  };
  
  const generateYears = () => {
    const years = [];
    const startYear = currentDecade;
    
    for (let i = 0; i < 12; i++) {
      const year = startYear + i - 1;
      years.push({
        year,
        isCurrentDecade: i > 0 && i < 11
      });
    }
    
    return years;
  };
  
  const generateDecades = () => {
    const decades = [];
    const startDecade = Math.floor(currentDecade / 100) * 100;
    
    for (let i = 0; i < 12; i++) {
      const decade = startDecade + (i - 1) * 10;
      decades.push({
        decade,
        isCurrentCentury: i > 0 && i < 11
      });
    }
    
    return decades;
  };
  
  const goToPrevMonth = () => {
    setAnimation('slide-out-right');
    setTimeout(() => {
      if (viewMode === 'days') {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
      } else if (viewMode === 'months') {
        setCurrentYear(currentYear - 1);
      } else if (viewMode === 'years') {
        setCurrentDecade(currentDecade - 10);
      } else if (viewMode === 'decades') {
        setCurrentDecade(currentDecade - 100);
      }
      setAnimation('slide-in-left');
    }, 200);
    setTimeout(() => {
      setAnimation('');
    }, 400);
  };
  
  const goToNextMonth = () => {
    setAnimation('slide-out-left');
    setTimeout(() => {
      if (viewMode === 'days') {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
      } else if (viewMode === 'months') {
        setCurrentYear(currentYear + 1);
      } else if (viewMode === 'years') {
        setCurrentDecade(currentDecade + 10);
      } else if (viewMode === 'decades') {
        setCurrentDecade(currentDecade + 100);
      }
      setAnimation('slide-in-right');
    }, 200);
    setTimeout(() => {
      setAnimation('');
    }, 400);
  };
  
  const changeViewMode = (mode) => {
    setAnimation('zoom-out');
    setTimeout(() => {
      setViewMode(mode);
      setAnimation('zoom-in');
    }, 200);
    setTimeout(() => {
      setAnimation('');
    }, 400);
  };
  
  const handleMonthClick = (month) => {
    setCurrentMonth(new Date(currentYear, month, 1));
    changeViewMode('days');
  };
  
  const handleYearClick = (year) => {
    setCurrentYear(year);
    changeViewMode('months');
  };
  
  const handleDecadeClick = (decade) => {
    setCurrentDecade(decade);
    changeViewMode('years');
  };
  
  const handleHeaderClick = () => {
    if (viewMode === 'days') {
      changeViewMode('months');
    } else if (viewMode === 'months') {
      changeViewMode('years');
    } else if (viewMode === 'years') {
      changeViewMode('decades');
    }
  };
  
  const selectDay = (day) => {
    if (!day.isCurrentMonth) {
      if (day.month < currentMonth.getMonth() || (day.month === 11 && currentMonth.getMonth() === 0)) {
        goToPrevMonth();
        setTimeout(() => {
          setLocalDate(day.date);
          onChange(formatInputDate(day.date));
        }, 300);
      } else {
        goToNextMonth();
        setTimeout(() => {
          setLocalDate(day.date);
          onChange(formatInputDate(day.date));
        }, 300);
      }
    } else {
      setLocalDate(day.date);
      onChange(formatInputDate(day.date));
      
      setTimeout(() => {
        setShowCalendar(false);
      }, 300);
    }
  };
  
  const clearDate = (e) => {
    e.stopPropagation();
    setLocalDate(null);
    onChange('');
    setAnimation('bounce-out');
    setTimeout(() => {
      setShowCalendar(false);
    }, 300);
  };
  
  const setToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    setLocalDate(today);
    onChange(formatInputDate(today));
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setCurrentYear(today.getFullYear());
    setCurrentDecade(Math.floor(today.getFullYear() / 10) * 10);
    setViewMode('days');
    setAnimation('pulse');
    setTimeout(() => {
      setAnimation('');
      setShowCalendar(false);
    }, 400);
  };
  
  const handleShowCalendar = () => {
    if (!disabled) {
      setShowCalendar(true);
    }
  };
  
  const handleCloseCalendar = (e) => {
    e.stopPropagation();
    setAnimation('bounce-out');
    setTimeout(() => {
      setShowCalendar(false);
      setAnimation('');
    }, 300);
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
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
  
  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      setLocalDate(date);
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      setCurrentYear(date.getFullYear());
      setCurrentDecade(Math.floor(date.getFullYear() / 10) * 10);
    } else {
      setLocalDate(null);
    }
  }, [selectedDate]);
  
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  const isSelected = (date) => {
    if (!localDate) return false;
    return date.getDate() === localDate.getDate() &&
           date.getMonth() === localDate.getMonth() &&
           date.getFullYear() === localDate.getFullYear();
  };
  
  const isSelectedMonth = (month, year) => {
    if (!localDate) return false;
    return month === localDate.getMonth() && year === localDate.getFullYear();
  };
  
  const isSelectedYear = (year) => {
    if (!localDate) return false;
    return year === localDate.getFullYear();
  };
  
  const weekdays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  
  return (
    <div className="custom-date-picker dob-date-picker" ref={calendarRef}>
      <label htmlFor={name}>Date of Birth</label>
      
      <div 
        className="date-input-wrapper"
        onClick={handleShowCalendar}
      >
        <input
          type="text"
          id={name}
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
          <div className="calendar-overlay" onClick={handleCloseCalendar}></div>
          
          <div className={`calendar-dropdown ${animation}`}>
            <div className="calendar-header">
              <div className="month-year" onClick={handleHeaderClick}>
                {getHeaderText()}
                <i className="fas fa-chevron-up header-icon"></i>
              </div>
              <div className="navigation">
                <button 
                  className="nav-btn prev-month" 
                  onClick={(e) => { e.stopPropagation(); goToPrevMonth(); }}
                  aria-label="Anterior"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button 
                  className="nav-btn next-month" 
                  onClick={(e) => { e.stopPropagation(); goToNextMonth(); }}
                  aria-label="Siguiente"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
            
            <div className="calendar-body">
              {viewMode === 'days' && (
                <>
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
                </>
              )}
              
              {viewMode === 'months' && (
                <div className={`months ${animation}`}>
                  {generateMonths().map((month, index) => (
                    <div
                      key={index}
                      className={`month ${isSelectedMonth(month.month, month.year) ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMonthClick(month.month);
                      }}
                    >
                      {month.name}
                    </div>
                  ))}
                </div>
              )}
              
              {viewMode === 'years' && (
                <div className={`years ${animation}`}>
                  {generateYears().map((yearObj, index) => (
                    <div
                      key={index}
                      className={`year 
                        ${!yearObj.isCurrentDecade ? 'other-decade' : ''} 
                        ${isSelectedYear(yearObj.year) ? 'selected' : ''}`
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleYearClick(yearObj.year);
                      }}
                    >
                      {yearObj.year}
                    </div>
                  ))}
                </div>
              )}
              
              {viewMode === 'decades' && (
                <div className={`decades ${animation}`}>
                  {generateDecades().map((decadeObj, index) => (
                    <div
                      key={index}
                      className={`decade 
                        ${!decadeObj.isCurrentCentury ? 'other-century' : ''}`
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDecadeClick(decadeObj.decade);
                      }}
                    >
                      {decadeObj.decade}
                    </div>
                  ))}
                </div>
              )}
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

export default DevDOBDatePicker;