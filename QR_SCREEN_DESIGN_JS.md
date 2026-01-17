/* ============================================================
   PROFESSIONAL QR CODE SCREEN - JAVASCRIPT IMPLEMENTATION
   Handles display, interactivity, and accessibility
   ============================================================ */

/**
 * Initialize QR Code Screen with Banking-Grade Design
 * Shows professional, senior-friendly interface
 */
function initQRScreenBanking() {
  // Setup event listeners
  setupQRScreenListeners();
  
  // Setup accessibility features
  setupAccessibility();
}

/**
 * Display QR Code Screen with Professional Design
 * @param {Object} qrData - QR code data {consultationId, qrCode, branch, instructions}
 */
function showQRScreenBanking(qrData) {
  if (!qrData || !qrData.qrCode) {
    console.error('Invalid QR data');
    addBotMessage('Error generating QR code. Please try again.');
    return;
  }

  // Get modal elements
  const modal = document.getElementById('qr-modal');
  const qrImage = document.getElementById('qr-code-image');
  const branchName = document.getElementById('qr-branch-name');
  const consultationId = document.getElementById('qr-consultation-id');
  const expiryDate = document.getElementById('qr-expiry-date');

  // Set QR Code Image
  qrImage.src = qrData.qrCode;
  qrImage.alt = `QR code for consultation ${qrData.consultationId} at ${qrData.branch}`;

  // Set Branch Information
  branchName.textContent = qrData.branch || 'OCBC Branch';

  // Set Consultation ID (Reference Number)
  consultationId.textContent = qrData.consultationId || 'ENQ-XXXX-XXX';

  // Calculate and Set Expiry Date (7 days from today)
  const expiryDateObj = new Date();
  expiryDateObj.setDate(expiryDateObj.getDate() + 7);
  const formattedExpiryDate = formatDateForDisplay(expiryDateObj);
  expiryDate.textContent = formattedExpiryDate;

  // Store data for later use
  window.currentQRData = {
    ...qrData,
    expiryDate: expiryDateObj
  };

  // Show Modal with Animation
  modal.style.display = 'flex';
  
  // Add animation class
  const content = modal.querySelector('.qr-modal-content');
  content.classList.add('slide-up-animation');

  // Log for analytics
  console.log('QR Screen displayed:', {
    consultationId: qrData.consultationId,
    branch: qrData.branch,
    timestamp: new Date().toISOString()
  });
}

/**
 * Format date for senior-friendly display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date (e.g., "23 Jan 2026")
 */
function formatDateForDisplay(date) {
  const options = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('en-SG', options);
}

/**
 * Setup Event Listeners for QR Screen
 */
function setupQRScreenListeners() {
  // Close Button
  const closeBtn = document.querySelector('.qr-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeQRScreen);
  }

  // Modal Overlay Click (Close)
  const modal = document.getElementById('qr-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal.querySelector('.modal-overlay')) {
        closeQRScreen();
      }
    });
  }

  // Download/Save QR Code Button
  const downloadBtn = document.getElementById('qr-download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadQRCode);
  }

  // Help Button
  const helpBtn = document.getElementById('qr-help-btn');
  if (helpBtn) {
    helpBtn.addEventListener('click', showQRHelp);
  }

  // Collapsible Information Toggle
  const infoToggle = document.getElementById('qr-info-toggle');
  if (infoToggle) {
    infoToggle.addEventListener('click', toggleAdditionalInfo);
  }

  // Keyboard Navigation: Escape to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      closeQRScreen();
    }
  });
}

/**
 * Close QR Screen Modal
 */
function closeQRScreen() {
  const modal = document.getElementById('qr-modal');
  if (modal) {
    const content = modal.querySelector('.qr-modal-content');
    content.classList.remove('slide-up-animation');
    
    setTimeout(() => {
      modal.style.display = 'none';
    }, 200);
  }
}

/**
 * Download QR Code as PNG File
 * Creates a high-quality PNG with consultation details
 */
function downloadQRCode() {
  const qrData = window.currentQRData;
  
  if (!qrData || !qrData.qrCode) {
    alert('QR code not available. Please try again.');
    return;
  }

  try {
    // Create link element
    const link = document.createElement('a');
    link.href = qrData.qrCode;
    
    // Format filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `OCBC-Queue-Ticket-${qrData.consultationId}-${timestamp}.png`;
    
    link.download = filename;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show confirmation
    showDownloadConfirmation();

    // Log analytics
    console.log('QR Code downloaded:', {
      filename,
      consultationId: qrData.consultationId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Download error:', error);
    alert('Unable to download. Please try saving from your browser menu instead.');
  }
}

/**
 * Show Download Confirmation Message
 */
function showDownloadConfirmation() {
  const btn = document.getElementById('qr-download-btn');
  const originalText = btn.innerHTML;

  // Change button to show success state
  btn.innerHTML = '<span class="btn-icon">✓</span><span class="btn-text">Saved Successfully</span>';
  btn.style.background = 'var(--success-green)';
  btn.disabled = true;

  // Revert after 3 seconds
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.style.background = '';
    btn.disabled = false;
  }, 3000);
}

/**
 * Show Help/How-to Information
 * Displays friendly guidance for using the QR code
 */
function showQRHelp() {
  const qrData = window.currentQRData;
  
  const helpMessage = `
📱 How to Use Your QR Code:

1️⃣ Visit Your Branch
   Go to ${qrData.branch} within 7 days

2️⃣ Scan the Code
   Show this screen or saved QR code to the staff

3️⃣ Get Queue Number
   They'll give you a number instantly

💡 Tips:
• You don't need to stand in line
• Your queue number will be called
• Bring a valid ID for verification
• This code works for 7 days

Questions? Ask the staff at the branch!
  `;

  // Show in chat or alert
  addBotMessage(helpMessage);
}

/**
 * Toggle Additional Information Section
 */
function toggleAdditionalInfo() {
  const toggle = document.getElementById('qr-info-toggle');
  const details = document.getElementById('qr-info-details');

  if (details.style.display === 'none') {
    details.style.display = 'flex';
    toggle.classList.add('active');
  } else {
    details.style.display = 'none';
    toggle.classList.remove('active');
  }
}

/**
 * Setup Accessibility Features
 * Ensures senior users and those with disabilities can use the screen
 */
function setupAccessibility() {
  // Ensure all buttons are keyboard accessible
  const buttons = document.querySelectorAll('.qr-btn, .qr-close-btn, .qr-info-toggle');
  
  buttons.forEach(btn => {
    // Add focus visible state
    btn.addEventListener('focus', function() {
      this.style.outline = '3px solid var(--ocbc-red)';
      this.style.outlineOffset = '2px';
    });

    btn.addEventListener('blur', function() {
      this.style.outline = 'none';
    });

    // Ensure minimum touch target size (44x44px for senior users)
    const rect = btn.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      btn.style.minWidth = '44px';
      btn.style.minHeight = '44px';
      btn.style.padding = '12px 16px';
    }
  });

  // Add ARIA labels for screen readers
  const modal = document.getElementById('qr-modal');
  if (modal) {
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'qr-title');
  }

  // Ensure images have alt text
  const qrImage = document.getElementById('qr-code-image');
  if (qrImage && !qrImage.alt) {
    qrImage.alt = 'QR code for branch queue';
  }
}

/**
 * Print QR Code Ticket
 * Allows users to print the ticket for use at branch
 */
function printQRCode() {
  const qrData = window.currentQRData;
  
  if (!qrData) {
    alert('No QR code to print');
    return;
  }

  // Create print window
  const printWindow = window.open('', '', 'height=600,width=600');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>OCBC Queue Ticket - ${qrData.consultationId}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 40px;
          margin: 0;
        }
        .ticket-container {
          max-width: 600px;
          margin: 0 auto;
          border: 2px dashed #ef2b2d;
          padding: 30px;
          border-radius: 12px;
        }
        .ticket-title {
          font-size: 28px;
          font-weight: bold;
          color: #0f172a;
          margin-bottom: 10px;
        }
        .qr-code {
          margin: 30px 0;
        }
        .qr-code img {
          width: 300px;
          height: 300px;
        }
        .ticket-id {
          font-size: 24px;
          font-weight: bold;
          color: #ef2b2d;
          margin: 20px 0;
          font-family: monospace;
        }
        .ticket-info {
          text-align: left;
          margin: 20px 0;
          font-size: 16px;
        }
        .ticket-info p {
          margin: 8px 0;
        }
        .instructions {
          background: #f8fafc;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          text-align: left;
        }
        .instructions ol {
          padding-left: 20px;
        }
        .instructions li {
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="ticket-container">
        <div class="ticket-title">OCBC Branch Queue Ticket</div>
        
        <div class="qr-code">
          <img src="${qrData.qrCode}" alt="QR Code">
        </div>
        
        <div class="ticket-id">${qrData.consultationId}</div>
        
        <div class="ticket-info">
          <p><strong>Branch:</strong> ${qrData.branch}</p>
          <p><strong>Valid for:</strong> 7 days from issue</p>
          <p><strong>Expires:</strong> ${formatDateForDisplay(window.currentQRData.expiryDate)}</p>
        </div>
        
        <div class="instructions">
          <h3>How to Use This Ticket:</h3>
          <ol>
            <li>Visit your selected branch within 7 days</li>
            <li>Show this QR code to the counter staff</li>
            <li>Receive your queue number instantly</li>
            <li>Wait comfortably - no need to stand in line</li>
          </ol>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Print after content loads
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

/**
 * Share QR Code (For mobile - opens share dialog)
 */
function shareQRCode() {
  const qrData = window.currentQRData;
  
  if (!qrData) {
    alert('No QR code to share');
    return;
  }

  // Check if Web Share API is available
  if (navigator.share) {
    navigator.share({
      title: 'OCBC Queue Ticket',
      text: `My OCBC consultation reference: ${qrData.consultationId}\nBranch: ${qrData.branch}`,
      url: window.location.href
    }).catch(err => console.log('Share error:', err));
  } else {
    // Fallback: Copy to clipboard
    const shareText = `OCBC Queue Ticket\nRef: ${qrData.consultationId}\nBranch: ${qrData.branch}\nExpires: ${formatDateForDisplay(window.currentQRData.expiryDate)}`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Ticket details copied to clipboard!');
    });
  }
}

/**
 * Validate QR Code Expiry
 * Check if QR code is still valid
 */
function isQRCodeValid() {
  const qrData = window.currentQRData;
  
  if (!qrData || !qrData.expiryDate) {
    return false;
  }

  const now = new Date();
  return now <= qrData.expiryDate;
}

/**
 * Show Expiry Warning if Code is About to Expire
 */
function checkQRCodeExpiry() {
  const qrData = window.currentQRData;
  
  if (!qrData || !qrData.expiryDate) {
    return;
  }

  const now = new Date();
  const daysUntilExpiry = Math.ceil((qrData.expiryDate - now) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry <= 1) {
    addBotMessage(`⚠️ Your queue ticket expires in ${daysUntilExpiry} day(s). Please use it soon!`);
  }
}

/**
 * Initialize QR Screen on DOM Ready
 */
document.addEventListener('DOMContentLoaded', initQRScreenBanking);

// Export for use in other scripts
window.QRScreenBanking = {
  show: showQRScreenBanking,
  close: closeQRScreen,
  download: downloadQRCode,
  print: printQRCode,
  share: shareQRCode,
  isValid: isQRCodeValid,
  checkExpiry: checkQRCodeExpiry
};
