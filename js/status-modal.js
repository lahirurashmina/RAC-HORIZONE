/**
 * Status Modal Handler
 * Controls the display of Success/Warning/Failed modals.
 * Supports both Bootstrap modals (if available) and custom overlay modals.
 */

class StatusModal {
    constructor() {
        this.overlayId = 'statusModalOverlay';
        this.contentId = 'statusModalContent';
        this.isBootstrap = typeof bootstrap !== 'undefined';

        // Create modal content if it doesn't exist (for non-bootstrap pages mainly)
        if (!document.getElementById(this.overlayId) && !document.getElementById('successModal')) {
            this.createModalStructure();
        }
    }

    createModalStructure() {
        const overlay = document.createElement('div');
        overlay.id = this.overlayId;
        overlay.className = 'custom-modal-overlay';

        overlay.innerHTML = `
            <div id="${this.contentId}" class="status-modal-content">
                <div class="modal-body">
                    <div id="statusIcon" class="status-icon-container">
                        <i class="fas fa-check"></i>
                    </div>
                    <h2 id="statusTitle" class="status-title">Success</h2>
                    <p id="statusMessage" class="status-message">Operation successful</p>
                    <div class="status-modal-footer">
                        <button id="statusSecondaryBtn" class="btn-status btn-status-outline" style="display:none;">Cancel</button>
                        <button id="statusPrimaryBtn" class="btn-status btn-status-primary">OK</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Add click listener to close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close();
            }
        });

        // Add button listener
        const btn = document.getElementById('statusPrimaryBtn');
        if (btn) {
            btn.addEventListener('click', () => this.close());
        }

        const secBtn = document.getElementById('statusSecondaryBtn');
        if (secBtn) {
            secBtn.addEventListener('click', () => this.close());
        }
    }

    show(type, title, message, buttonText = 'OK', onClickCallback = null) {
        // Types: 'success', 'warning', 'failed', 'confirm'
        const content = document.getElementById(this.contentId);
        const overlay = document.getElementById(this.overlayId);

        if (!content || !overlay) return;

        const iconContainer = document.getElementById('statusIcon');
        const titleEl = document.getElementById('statusTitle');
        const messageEl = document.getElementById('statusMessage');
        const primaryBtn = document.getElementById('statusPrimaryBtn');
        const secondaryBtn = document.getElementById('statusSecondaryBtn');
        const icon = iconContainer.querySelector('i');

        // Reset classes
        content.className = 'status-modal-content';
        content.classList.add(`${type === 'confirm' ? 'failed' : type}-modal-ui`);

        // Set Content
        titleEl.textContent = title;
        messageEl.textContent = message;
        primaryBtn.textContent = buttonText;
        secondaryBtn.style.display = 'none';

        // Set Icon
        icon.className = 'fas';
        if (type === 'success') icon.classList.add('fa-check');
        else if (type === 'warning') icon.classList.add('fa-exclamation-triangle');
        else if (type === 'failed' || type === 'confirm') icon.classList.add('fa-trash-alt');

        // Set Button Callback
        primaryBtn.onclick = () => {
            this.close();
            if (onClickCallback) onClickCallback();
        };

        // Show
        overlay.classList.add('active');
    }

    confirm(title, message, confirmText = 'Yes, Delete', cancelText = 'No, Cancel', onConfirm = null) {
        const content = document.getElementById(this.contentId);
        const overlay = document.getElementById(this.overlayId);
        if (!content || !overlay) return;

        const iconContainer = document.getElementById('statusIcon');
        const titleEl = document.getElementById('statusTitle');
        const messageEl = document.getElementById('statusMessage');
        const primaryBtn = document.getElementById('statusPrimaryBtn');
        const secondaryBtn = document.getElementById('statusSecondaryBtn');
        const icon = iconContainer.querySelector('i');

        // UI Setup (use failed theme for delete usually)
        content.className = 'status-modal-content failed-modal-ui';
        titleEl.textContent = title;
        messageEl.textContent = message;

        icon.className = 'fas fa-trash-alt';

        secondaryBtn.textContent = cancelText;
        secondaryBtn.style.display = 'block';
        secondaryBtn.onclick = () => this.close();

        primaryBtn.textContent = confirmText;
        primaryBtn.onclick = () => {
            this.close();
            if (onConfirm) onConfirm();
        };

        overlay.classList.add('active');
    }

    logout(onLogout) {
        const content = document.getElementById(this.contentId);
        const overlay = document.getElementById(this.overlayId);
        if (!content || !overlay) return;

        const iconContainer = document.getElementById('statusIcon');
        const titleEl = document.getElementById('statusTitle');
        const messageEl = document.getElementById('statusMessage');
        const primaryBtn = document.getElementById('statusPrimaryBtn');
        const secondaryBtn = document.getElementById('statusSecondaryBtn');
        const icon = iconContainer.querySelector('i');

        // UI Setup
        content.className = 'status-modal-content logout-modal-ui';
        titleEl.textContent = 'Logout';
        messageEl.textContent = 'Are you sure you want to logout?';

        icon.className = 'fas fa-sign-out-alt';

        // In the user's image, Logout is red (secondary) and Cancel is blue (primary)
        secondaryBtn.textContent = 'Logout';
        secondaryBtn.style.display = 'block';
        secondaryBtn.onclick = () => {
            this.close();
            if (onLogout) onLogout();
        };

        primaryBtn.textContent = 'Cancel';
        primaryBtn.onclick = () => this.close();

        overlay.classList.add('active');
    }

    close() {
        const overlay = document.getElementById(this.overlayId);
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
}

const statusModal = new StatusModal();
