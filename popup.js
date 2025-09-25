class AttendancePopup {
    constructor() {
        this.attendanceData = [];
        this.isTracking = false;

        this.initializeElements();
        this.bindEvents();
        this.loadAttendanceData();
    }

    initializeElements() {
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.attendanceList = document.getElementById('attendanceList');
        this.totalCount = document.getElementById('totalCount');
    }

    bindEvents() {
        this.refreshBtn.addEventListener('click', () => {
            this.loadAttendanceData();
        });

        this.clearBtn.addEventListener('click', () => {
            this.clearAttendance();
        });

        // Auto-refresh every 5 seconds
        setInterval(() => {
            this.loadAttendanceData();
        }, 5000);
    }

    async loadAttendanceData() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const activeTab = tabs[0];

            if (!activeTab.url.includes('meet.google.com')) {
                this.showError('Please open a Google Meet tab first');
                return;
            }

            // Send message to content script
            const response = await chrome.tabs.sendMessage(activeTab.id, {
                action: 'getAttendance'
            });

            if (response) {
                this.attendanceData = response.joinOrder || [];
                this.isTracking = response.isTracking || false;
                this.updateUI();
            } else {
                this.showError('Unable to connect to Google Meet. Please refresh the page.');
            }

        } catch (error) {
            console.error('Error loading attendance data:', error);
            this.showError('Error loading data. Make sure you\'re on a Google Meet page.');
        }
    }

    updateUI() {
        this.updateStatus();
        this.updateAttendanceList();
        this.updateStats();
    }

    updateStatus() {
        if (this.isTracking) {
            this.statusIndicator.className = 'status-indicator active';
            this.statusText.textContent = 'Tracking active';
        } else {
            this.statusIndicator.className = 'status-indicator inactive';
            this.statusText.textContent = 'Not tracking';
        }
    }

    updateAttendanceList() {
        if (this.attendanceData.length === 0) {
            this.attendanceList.innerHTML = `
        <div class="empty-state">
          <p>No participants tracked yet</p>
          <p>Make sure the participants panel is open in Google Meet</p>
        </div>
      `;
            return;
        }

        const listHTML = this.attendanceData.map((participant, index) => `
      <div class="participant-item">
        <div class="participant-number">${index + 1}</div>
        <div class="participant-info">
          <div class="participant-name">${this.escapeHtml(participant.name)}</div>
          <div class="participant-time">Joined at ${participant.joinTime}</div>
        </div>
      </div>
    `).join('');

        this.attendanceList.innerHTML = listHTML;
    }

    updateStats() {
        this.totalCount.textContent = this.attendanceData.length;
    }

    async clearAttendance() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const activeTab = tabs[0];

            if (!activeTab.url.includes('meet.google.com')) {
                this.showError('Please open a Google Meet tab first');
                return;
            }

            await chrome.tabs.sendMessage(activeTab.id, {
                action: 'clearAttendance'
            });

            this.attendanceData = [];
            this.updateUI();

        } catch (error) {
            console.error('Error clearing attendance:', error);
            this.showError('Error clearing data');
        }
    }

    showError(message) {
        this.statusIndicator.className = 'status-indicator';
        this.statusText.textContent = 'Error';
        this.attendanceList.innerHTML = `
      <div class="empty-state">
        <p style="color: #ea4335;">${message}</p>
      </div>
    `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AttendancePopup();
});
