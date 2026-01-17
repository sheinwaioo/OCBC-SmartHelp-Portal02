<!-- PROFESSIONAL QR CODE SCREEN - OCBC Banking Grade -->
<!-- This replaces the existing QR modal with a senior-friendly, accessible design -->

<!-- Include this in your index.html -->
<div id="qr-modal" class="modal qr-modal-banking">
  <div class="modal-overlay"></div>
  
  <div class="modal-content qr-modal-content">
    <!-- Close Button (Top Right) -->
    <button class="modal-close qr-close-btn" aria-label="Close QR code screen">
      <span class="close-icon">✕</span>
    </button>

    <!-- Main Container -->
    <div class="qr-screen-container">
      
      <!-- Header Section -->
      <div class="qr-header">
        <h1 class="qr-title">Your Branch Queue QR Code</h1>
        <p class="qr-subtitle">Scan this QR code at your selected OCBC branch to retrieve your queue number.</p>
      </div>

      <!-- QR Code Card (Center Focus) -->
      <div class="qr-code-card">
        <!-- QR Code Container -->
        <div class="qr-code-wrapper">
          <img id="qr-code-image" src="" alt="QR code for branch queue" class="qr-code-img" />
          <p class="qr-code-label">Scan with Phone Camera</p>
        </div>
      </div>

      <!-- Information Section (Below QR) -->
      <div class="qr-info-section">
        
        <!-- Branch Name (Prominent) -->
        <div class="qr-info-block branch-block">
          <p class="qr-info-label">📍 Selected Branch</p>
          <p class="qr-info-value" id="qr-branch-name">OCBC Tampines Central</p>
        </div>

        <!-- Validity Period (Highly Visible) -->
        <div class="qr-info-block validity-block">
          <div class="qr-info-row">
            <div>
              <p class="qr-info-label">⏱ Valid for</p>
              <p class="qr-info-value">7 Days</p>
            </div>
            <div>
              <p class="qr-info-label">📅 Expires On</p>
              <p class="qr-info-value expiry-date" id="qr-expiry-date">23 Jan 2026</p>
            </div>
          </div>
        </div>

        <!-- Consultation ID -->
        <div class="qr-info-block id-block">
          <p class="qr-info-label">Reference Number</p>
          <p class="qr-info-value consultation-id" id="qr-consultation-id">ENQ-8921-ABC</p>
        </div>

      </div>

      <!-- How to Use Guide (3-Step) -->
      <div class="qr-usage-guide">
        <h2 class="qr-guide-title">How to Use This QR Code</h2>
        
        <div class="qr-steps-container">
          <!-- Step 1 -->
          <div class="qr-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3 class="step-title">Visit Your Branch</h3>
              <p class="step-description">Go to your selected OCBC branch within 7 days</p>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="qr-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3 class="step-title">Scan at Counter</h3>
              <p class="step-description">Show or scan this QR code to the branch staff</p>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="qr-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3 class="step-title">Get Queue Number</h3>
              <p class="step-description">Receive your queue number instantly and wait your turn</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Reassurance Message -->
      <div class="qr-security-message">
        <p class="security-icon">🔒</p>
        <p class="security-text">This QR code is generated securely and does not contain sensitive banking information.</p>
      </div>

      <!-- Action Buttons (Primary + Secondary) -->
      <div class="qr-actions">
        <!-- Primary: Save QR Code -->
        <button class="qr-btn qr-btn-primary" id="qr-download-btn" aria-label="Save QR code as image">
          <span class="btn-icon">⬇</span>
          <span class="btn-text">Save QR Code</span>
        </button>

        <!-- Secondary: How to Use -->
        <button class="qr-btn qr-btn-secondary" id="qr-help-btn" aria-label="Learn more about using this QR code">
          <span class="btn-icon">?</span>
          <span class="btn-text">Need Help?</span>
        </button>
      </div>

      <!-- Additional Information (Collapsible) -->
      <div class="qr-additional-info">
        <button class="qr-info-toggle" id="qr-info-toggle">
          <span class="toggle-icon">+</span>
          <span class="toggle-text">More Information</span>
        </button>
        <div class="qr-info-details" id="qr-info-details" style="display: none;">
          <div class="info-item">
            <h4>What is a queue number?</h4>
            <p>A queue number lets you wait comfortably without standing in line. You'll be notified when it's your turn.</p>
          </div>
          <div class="info-item">
            <h4>Can I use this QR code later?</h4>
            <p>Yes, this QR code is valid for 7 days from the date you generated it. You can visit the branch anytime within this period.</p>
          </div>
          <div class="info-item">
            <h4>What if I can't scan the code?</h4>
            <p>You can show this screen to the branch staff and provide your reference number. They can look up your information manually.</p>
          </div>
        </div>
      </div>

    </div>

  </div>

</div>
