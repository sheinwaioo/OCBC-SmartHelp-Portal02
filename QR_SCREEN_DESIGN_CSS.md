/* ============================================================
   PROFESSIONAL BANKING GRADE QR CODE SCREEN - CSS
   OCBC Standard | Senior-Friendly | Accessible
   ============================================================ */

/* ============================================================
   COLOR PALETTE (Banking Standard)
   ============================================================ */
:root {
  /* Primary Banking Colors */
  --ocbc-red: #ef2b2d;
  --ocbc-red-dark: #d92222;
  --ocbc-navy: #0f172a;
  --ocbc-navy-light: #1e293b;
  
  /* Neutral Colors */
  --white: #ffffff;
  --off-white: #f8fafc;
  --light-grey: #e2e8f0;
  --medium-grey: #cbd5e1;
  --dark-grey: #64748b;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  
  /* Status Colors */
  --success-green: #16a34a;
  --warning-orange: #f97316;
  --info-blue: #0084d6;
  
  /* Spacing */
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 28px;
  --font-size-4xl: 32px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
}

/* ============================================================
   MODAL CONTAINER
   ============================================================ */
.qr-modal-banking {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.3s ease-in-out;
}

.qr-modal-banking .modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  cursor: pointer;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ============================================================
   MODAL CONTENT (Card Container)
   ============================================================ */
.qr-modal-content {
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow-y: auto;
  padding: var(--spacing-2xl);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Close Button */
.qr-close-btn {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  width: 44px;
  height: 44px;
  background: var(--off-white);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--text-primary);
  transition: all 0.2s ease;
  z-index: 10;
}

.qr-close-btn:hover {
  background: var(--light-grey);
  transform: scale(1.05);
}

.qr-close-btn:active {
  transform: scale(0.95);
}

/* ============================================================
   HEADER SECTION
   ============================================================ */
.qr-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--light-grey);
}

.qr-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.2;
}

.qr-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* ============================================================
   QR CODE CARD (Center Focus)
   ============================================================ */
.qr-code-card {
  margin-bottom: var(--spacing-2xl);
  text-align: center;
}

.qr-code-wrapper {
  background: var(--off-white);
  border: 2px solid var(--light-grey);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: inline-block;
  transition: all 0.3s ease;
}

.qr-code-wrapper:hover {
  border-color: var(--ocbc-red);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.qr-code-img {
  width: 280px;
  height: 280px;
  object-fit: contain;
  border-radius: var(--radius-md);
  display: block;
  margin-bottom: var(--spacing-md);
}

.qr-code-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
}

/* ============================================================
   INFORMATION SECTION
   ============================================================ */
.qr-info-section {
  margin-bottom: var(--spacing-2xl);
}

.qr-info-block {
  background: var(--off-white);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  border-left: 4px solid var(--info-blue);
  transition: all 0.2s ease;
}

.qr-info-block:hover {
  background: #f1f5f9;
}

/* Branch Block */
.qr-info-block.branch-block {
  border-left-color: var(--ocbc-red);
}

/* Validity Block (Prominent) */
.qr-info-block.validity-block {
  background: linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%);
  border-left-color: var(--ocbc-red);
  padding: var(--spacing-lg);
}

.qr-info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

/* ID Block */
.qr-info-block.id-block {
  border-left-color: var(--ocbc-navy);
  background: linear-gradient(135deg, #f0f4f8 0%, #f8fafc 100%);
}

.qr-info-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xs) 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.qr-info-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

.consultation-id {
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
  color: var(--ocbc-red);
  font-size: var(--font-size-xl);
}

.expiry-date {
  color: var(--ocbc-red);
}

/* ============================================================
   HOW TO USE GUIDE (3-Step)
   ============================================================ */
.qr-usage-guide {
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
  border-radius: var(--radius-lg);
  border: 1px solid var(--light-grey);
}

.qr-guide-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg) 0;
  text-align: center;
}

.qr-steps-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.qr-step {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.step-number {
  min-width: 40px;
  width: 40px;
  height: 40px;
  background: var(--ocbc-red);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
  margin-top: 4px;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.step-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* ============================================================
   SECURITY REASSURANCE MESSAGE
   ============================================================ */
.qr-security-message {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.security-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.security-text {
  font-size: var(--font-size-sm);
  color: var(--success-green);
  margin: 0;
  line-height: 1.5;
}

/* ============================================================
   ACTION BUTTONS
   ============================================================ */
.qr-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.qr-btn {
  padding: var(--spacing-lg) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-family: var(--font-family);
  min-height: 56px;
}

/* Primary Button: Save QR Code */
.qr-btn-primary {
  background: var(--ocbc-red);
  color: var(--white);
  box-shadow: var(--shadow-md);
}

.qr-btn-primary:hover {
  background: var(--ocbc-red-dark);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.qr-btn-primary:active {
  transform: translateY(0);
}

/* Secondary Button: Need Help */
.qr-btn-secondary {
  background: var(--off-white);
  color: var(--text-primary);
  border: 2px solid var(--light-grey);
}

.qr-btn-secondary:hover {
  border-color: var(--ocbc-red);
  color: var(--ocbc-red);
  background: #fff5f5;
}

.qr-btn-secondary:active {
  background: var(--light-grey);
}

.btn-icon {
  font-size: 18px;
}

.btn-text {
  font-weight: 600;
}

/* ============================================================
   ADDITIONAL INFORMATION (Collapsible)
   ============================================================ */
.qr-additional-info {
  border-top: 1px solid var(--light-grey);
  padding-top: var(--spacing-lg);
}

.qr-info-toggle {
  width: 100%;
  padding: var(--spacing-md);
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-primary);
  font-weight: 600;
  font-size: var(--font-size-base);
  transition: all 0.2s ease;
}

.qr-info-toggle:hover {
  color: var(--ocbc-red);
}

.toggle-icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--off-white);
  border-radius: 50%;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.qr-info-toggle.active .toggle-icon {
  transform: rotate(45deg);
}

.qr-info-details {
  padding: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  animation: expandDown 0.3s ease;
}

@keyframes expandDown {
  from {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.info-item {
  background: var(--off-white);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}

.info-item h4 {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  font-weight: 600;
}

.info-item p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* ============================================================
   RESPONSIVE DESIGN (Mobile-First)
   ============================================================ */

/* Tablet (768px and up) */
@media (min-width: 768px) {
  .qr-modal-content {
    padding: var(--spacing-2xl);
    max-width: 650px;
  }

  .qr-info-row {
    grid-template-columns: 1fr 1fr;
  }

  .qr-actions {
    grid-template-columns: 1fr 1fr;
  }
}

/* Mobile (Below 640px) */
@media (max-width: 640px) {
  .qr-modal-content {
    max-width: 100%;
    max-height: 100vh;
    border-radius: var(--radius-lg);
    margin: var(--spacing-md);
  }

  .qr-title {
    font-size: var(--font-size-2xl);
  }

  .qr-subtitle {
    font-size: 15px;
  }

  .qr-code-img {
    width: 240px;
    height: 240px;
  }

  .qr-info-row {
    grid-template-columns: 1fr;
  }

  .qr-actions {
    grid-template-columns: 1fr;
  }

  .qr-info-block {
    padding: var(--spacing-md);
  }

  .qr-usage-guide {
    padding: var(--spacing-md);
  }

  .step-number {
    min-width: 36px;
    width: 36px;
    height: 36px;
  }
}

/* ============================================================
   ACCESSIBILITY & SENIORS
   ============================================================ */

/* Large text for seniors */
@media (prefers-reduced-motion: no-preference) {
  * {
    scroll-behavior: smooth;
  }
}

/* High contrast mode support */
@media (prefers-contrast: more) {
  .qr-title {
    font-weight: 900;
    letter-spacing: 0.5px;
  }

  .qr-info-value {
    font-weight: 900;
  }

  .qr-btn {
    border-width: 2px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .qr-modal-content {
    background: #1a202c;
    color: #e2e8f0;
  }

  .qr-title,
  .qr-info-value {
    color: #f1f5f9;
  }

  .qr-subtitle,
  .step-description,
  .qr-info-label {
    color: #cbd5e1;
  }

  .qr-info-block {
    background: #2d3748;
    border-color: #4a5568;
  }

  .qr-code-wrapper {
    background: #2d3748;
    border-color: #4a5568;
  }

  .qr-close-btn {
    background: #2d3748;
    color: #e2e8f0;
  }
}

/* Focus states for keyboard navigation */
.qr-btn:focus,
.qr-info-toggle:focus,
.qr-close-btn:focus {
  outline: 3px solid var(--ocbc-red);
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ============================================================
   PRINT STYLES (For Printing QR Code)
   ============================================================ */
@media print {
  .qr-modal-banking .modal-overlay {
    display: none;
  }

  .qr-modal-content {
    box-shadow: none;
    border: 1px solid var(--light-grey);
  }

  .qr-close-btn,
  .qr-actions,
  .qr-additional-info {
    display: none;
  }

  .qr-code-img {
    width: 300px;
    height: 300px;
  }

  .qr-info-section {
    page-break-inside: avoid;
  }
}
