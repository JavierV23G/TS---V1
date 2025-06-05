// 🚀 ULTRA PREMIUM SignaturePad.jsx - ABSOLUTE BEAST MODE 🚀
import React, { useRef, useState, useEffect } from 'react';
import '../../../../../../../styles/developer/Patients/InfoPaciente/NotesAndSign/SignaturePad.scss';

const SignaturePad = ({ 
  label = 'SIGNATURE', 
  onSignatureChange, 
  initialSignature = null,
  disabled = false 
}) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [hasSignature, setHasSignature] = useState(!!initialSignature);
  const [useUpload, setUseUpload] = useState(false);
  const [fileName, setFileName] = useState('');
  const [canvasLoaded, setCanvasLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // 🎯 Initialize canvas with premium settings
  useEffect(() => {
    if (useUpload) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    // Calculate responsive canvas size
    const containerRect = container.getBoundingClientRect();
    const canvasWidth = Math.max(containerRect.width - 32, 300); // Min 300px
    const canvasHeight = Math.max(180, Math.min(250, canvasWidth * 0.4)); // Aspect ratio

    // Handle high-DPI displays
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    setCanvasSize({ width: canvasWidth, height: canvasHeight });

    // Premium canvas context setup
    const ctx = canvas.getContext('2d');
    ctx.scale(pixelRatio, pixelRatio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#2d3748';
    ctx.shadowColor = 'rgba(45, 55, 72, 0.2)';
    ctx.shadowBlur = 1;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    
    setContext(ctx);
    setCanvasLoaded(true);

    // Load initial signature with fade-in animation
    if (initialSignature) {
      loadSignatureImage(initialSignature, ctx, canvasWidth, canvasHeight);
    }

    // Cleanup function
    return () => {
      removeEventListeners();
    };
  }, [initialSignature, useUpload]);

  // 🎯 Load signature image with animation
  const loadSignatureImage = (imageSrc, ctx, width, height) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let drawWidth = width - 20; // Padding
      let drawHeight = height - 20;
      
      if (aspectRatio > drawWidth / drawHeight) {
        drawHeight = drawWidth / aspectRatio;
      } else {
        drawWidth = drawHeight * aspectRatio;
      }
      
      const x = (width - drawWidth) / 2;
      const y = (height - drawHeight) / 2;
      
      // Animated loading
      setIsAnimating(true);
      let opacity = 0;
      
      const animateLoad = () => {
        opacity += 0.05;
        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        if (opacity >= 1) {
          ctx.globalAlpha = 1;
          setHasSignature(true);
          setIsAnimating(false);
          return;
        }
        
        requestAnimationFrame(animateLoad);
      };
      
      setTimeout(animateLoad, 200);
    };
    img.src = imageSrc;
  };

  // 🎯 Remove all event listeners
  const removeEventListeners = () => {
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('touchend', handleTouchEnd);
    window.removeEventListener('touchmove', handleTouchMove);
  };

  // 🎯 Get coordinates from event
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width / pixelRatio),
      y: (clientY - rect.top) * (canvas.height / rect.height / pixelRatio)
    };
  };

  // 🎯 Start drawing
  const startDrawing = (e) => {
    if (disabled || useUpload || !context) return;
    
    e.preventDefault();
    setIsDrawing(true);
    setStrokeCount(prev => prev + 1);
    
    const { x, y } = getCoordinates(e);
    
    context.beginPath();
    context.moveTo(x, y);
    
    // Add event listeners
    if (e.type.includes('mouse')) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
  };

  // 🎯 Continue drawing
  const continueDrawing = (e) => {
    if (!isDrawing || !context) return;
    
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    
    // Variable line width based on speed (premium effect)
    const currentTime = Date.now();
    if (continueDrawing.lastTime) {
      const timeDiff = currentTime - continueDrawing.lastTime;
      const speed = timeDiff < 50 ? 'fast' : timeDiff < 100 ? 'medium' : 'slow';
      
      context.lineWidth = speed === 'fast' ? 1.5 : speed === 'medium' ? 2.5 : 3.5;
    }
    continueDrawing.lastTime = currentTime;
    
    context.lineTo(x, y);
    context.stroke();
  };

  // 🎯 Stop drawing
  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    setHasSignature(true);
    saveSignature();
    
    removeEventListeners();
    continueDrawing.lastTime = null;
  };

  // 🎯 Mouse event handlers
  const handleMouseDown = (e) => startDrawing(e);
  const handleMouseMove = (e) => continueDrawing(e);
  const handleMouseUp = () => stopDrawing();

  // 🎯 Touch event handlers
  const handleTouchStart = (e) => startDrawing(e);
  const handleTouchMove = (e) => continueDrawing(e);
  const handleTouchEnd = () => stopDrawing();

  // 🎯 Save signature with optimization
  const saveSignature = () => {
    if (useUpload || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Create optimized version
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Set optimal size for storage
    tempCanvas.width = Math.min(canvas.width, 800);
    tempCanvas.height = Math.min(canvas.height, 400);
    
    // Fill with white background
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw scaled signature
    tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
    
    const signatureData = tempCanvas.toDataURL('image/png', 0.8);
    
    if (onSignatureChange) {
      onSignatureChange(signatureData);
    }
  };

  // 🎯 Clear signature with premium animation
  const clearSignature = () => {
    if (disabled) return;
    
    if (!useUpload && context) {
      setIsAnimating(true);
      
      // Premium clear animation
      let scale = 1;
      const animateClear = () => {
        scale -= 0.05;
        
        if (scale <= 0) {
          context.clearRect(0, 0, canvasSize.width, canvasSize.height);
          setIsAnimating(false);
          setHasSignature(false);
          setStrokeCount(0);
          
          if (onSignatureChange) {
            onSignatureChange(null);
          }
          return;
        }
        
        context.clearRect(0, 0, canvasSize.width, canvasSize.height);
        context.save();
        context.scale(scale, scale);
        context.translate(
          (canvasSize.width * (1 - scale)) / (2 * scale),
          (canvasSize.height * (1 - scale)) / (2 * scale)
        );
        
        // Redraw with reduced opacity
        context.globalAlpha = scale;
        // Note: Would need to store stroke data to fully redraw, simplified for demo
        context.restore();
        
        requestAnimationFrame(animateClear);
      };
      
      animateClear();
    } else {
      // Upload mode clear
      setHasSignature(false);
      setUseUpload(false);
      setFileName('');
      
      if (onSignatureChange) {
        onSignatureChange(null);
      }
    }
  };

  // 🎯 Handle file upload with validation
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // File validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf'];
    
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload an image file (PNG, JPEG, GIF) or PDF');
      return;
    }
    
    setFileName(file.name);
    setUseUpload(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = event.target.result;
      
      if (file.type.startsWith('image/')) {
        // For images, we can preview them
        if (onSignatureChange) {
          onSignatureChange(fileData);
        }
        setHasSignature(true);
      } else {
        // For PDFs and other files, just store reference
        if (onSignatureChange) {
          onSignatureChange(fileData);
        }
        setHasSignature(true);
      }
    };
    
    reader.readAsDataURL(file);
  };

  // 🎯 Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const event = { target: { files } };
      handleFileUpload(event);
    }
  };

  // 🎯 Toggle upload mode
  const toggleUploadMode = (enabled) => {
    setUseUpload(enabled);
    if (!enabled) {
      clearSignature();
    }
  };

  return (
    <div className={`signature-pad-ultra-premium ${disabled ? 'disabled' : ''} ${hasSignature ? 'has-signature' : ''} ${isAnimating ? 'animating' : ''}`}>
      
      {/* 🚀 PREMIUM HEADER */}
      <div className="signature-header-premium">
        <div className="header-left">
          <div className="signature-icon">
            <i className="fas fa-signature"></i>
          </div>
          <div className="header-content">
            <h3>Digital Signature</h3>
            <p>Sign digitally or upload existing signature</p>
          </div>
        </div>
        
        <div className="header-right">
          <div className="mode-toggle">
            <button 
              className={`toggle-btn ${!useUpload ? 'active' : ''}`}
              onClick={() => toggleUploadMode(false)}
              disabled={disabled}
            >
              <i className="fas fa-pen"></i>
              <span>Draw</span>
            </button>
            <button 
              className={`toggle-btn ${useUpload ? 'active' : ''}`}
              onClick={() => toggleUploadMode(true)}
              disabled={disabled}
            >
              <i className="fas fa-upload"></i>
              <span>Upload</span>
            </button>
          </div>
          
          {strokeCount > 0 && !useUpload && (
            <div className="stroke-counter">
              <i className="fas fa-paint-brush"></i>
              <span>{strokeCount} strokes</span>
            </div>
          )}
        </div>
      </div>

      {/* 🎯 SIGNATURE AREA */}
      <div className="signature-area-premium">
        {useUpload ? (
          // 🔥 UPLOAD MODE
          <div 
            className={`upload-zone ${isDragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {fileName ? (
              <div className="file-preview-premium">
                <div className="file-icon">
                  <i className={`fas ${fileName.toLowerCase().includes('.pdf') ? 'fa-file-pdf' : 'fa-file-image'}`}></i>
                </div>
                <div className="file-details">
                  <h4>{fileName}</h4>
                  <p>File uploaded successfully</p>
                  <div className="file-actions">
                    <button 
                      className="change-file-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={disabled}
                    >
                      <i className="fas fa-exchange-alt"></i>
                      Change File
                    </button>
                  </div>
                </div>
                <div className="success-indicator">
                  <i className="fas fa-check-circle"></i>
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-animation">
                  <div className="upload-icon">
                    <i className="fas fa-cloud-upload-alt"></i>
                  </div>
                  <div className="upload-rings">
                    <div className="ring ring-1"></div>
                    <div className="ring ring-2"></div>
                    <div className="ring ring-3"></div>
                  </div>
                </div>
                
                <div className="upload-content">
                  <h4>Upload Signature File</h4>
                  <p>Drag and drop your signature file here</p>
                  <p className="upload-specs">Supports: PNG, JPEG, GIF, PDF (Max 5MB)</p>
                  
                  <button 
                    className="upload-btn-premium"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                  >
                    <i className="fas fa-folder-open"></i>
                    <span>Browse Files</span>
                  </button>
                </div>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              accept="image/*,.pdf"
              disabled={disabled}
            />
          </div>
        ) : (
          // 🔥 DRAWING MODE
          <div className="canvas-zone">
            <div className="canvas-container-premium">
              <canvas
                ref={canvasRef}
                className={`signature-canvas-premium ${hasSignature ? 'has-content' : ''} ${isDrawing ? 'drawing' : ''}`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              />
              
              {!hasSignature && canvasLoaded && !isAnimating && (
                <div className="canvas-overlay">
                  <div className="drawing-guide">
                    <div className="guide-icon">
                      <i className="fas fa-pen-fancy"></i>
                    </div>
                    <div className="guide-text">
                      <h4>Sign Here</h4>
                      <p>Click and drag to create your signature</p>
                    </div>
                  </div>
                  
                  <div className="signature-line">
                    <span className="line-start">✕</span>
                    <div className="line-middle"></div>
                    <span className="line-end">✕</span>
                  </div>
                </div>
              )}
              
              {isAnimating && (
                <div className="animation-overlay">
                  <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <i className="fas fa-signature"></i>
                  </div>
                </div>
              )}
            </div>
            
            <div className="canvas-controls">
              <div className="control-hints">
                <div className="hint-item">
                  <i className="fas fa-mouse"></i>
                  <span>Click & drag to sign</span>
                </div>
                <div className="hint-item">
                  <i className="fas fa-mobile-alt"></i>
                  <span>Touch & move on mobile</span>
                </div>
              </div>
              
              <div className="canvas-info">
                <div className="canvas-size">
                  {canvasSize.width}×{canvasSize.height}px
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🎯 SIGNATURE LABEL */}
      <div className="signature-label-area">
        <div className="label-line"></div>
        <div className="label-text">
          <span>{label}</span>
        </div>
        <div className="label-line"></div>
      </div>

      {/* 🚀 ACTION BUTTONS */}
      <div className="signature-actions-premium">
        <button 
          className={`clear-btn-premium ${(!hasSignature || disabled) ? 'disabled' : ''}`}
          onClick={clearSignature}
          disabled={disabled || !hasSignature}
        >
          <div className="btn-icon">
            <i className="fas fa-trash-alt"></i>
          </div>
          <div className="btn-content">
            <span className="btn-text">Clear Signature</span>
            <span className="btn-subtext">Start over</span>
          </div>
        </button>
        
        {hasSignature && (
          <div className="signature-status">
            <div className="status-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="status-text">
              <span>Signature Captured</span>
              <span className="timestamp">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignaturePad;