// Google Meet Attendance Tracker Content Script
// This script runs on Google Meet pages and tracks participant join order

class AttendanceTracker {
    constructor() {
        this.participants = [];
        this.joinOrder = [];
        this.isTracking = false;
        this.trackingInterval = null;

        this.init();
    }

    init() {
        setTimeout(() => {
            this.startTracking();
        }, 3000);

        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'getAttendance') {
                sendResponse({
                    joinOrder: this.joinOrder,
                    currentParticipants: this.participants,
                    isTracking: this.isTracking
                });
            } else if (request.action === 'clearAttendance') {
                this.clearAttendance();
                sendResponse({ success: true });
            }
        });
    }

    startTracking() {
        if (this.isTracking) return;

        console.log('🎯 Starting attendance tracking...');
        this.isTracking = true;

        // Check every 3 seconds
        this.trackingInterval = setInterval(() => {
            this.checkParticipants();
        }, 3000);

        // Initial check
        this.checkParticipants();
    }

    stopTracking() {
        if (!this.isTracking) return;

        console.log('⏹️ Stopping attendance tracking...');
        this.isTracking = false;

        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }
    }

    checkParticipants() {
        const currentParticipants = this.getCurrentParticipants();

        if (currentParticipants.length === 0) {
            // No participants found, maybe panel is closed
            return;
        }

        // Check for new participants
        currentParticipants.forEach(participant => {
            if (!this.joinOrder.find(p => p.name === participant.name)) {
                const joinTime = new Date().toLocaleTimeString();
                const participantData = {
                    name: participant.name,
                    joinTime: joinTime,
                    joinOrder: this.joinOrder.length + 1
                };

                this.joinOrder.push(participantData);
                console.log(`➕ New participant: ${participant.name} at ${joinTime}`);

                // Store in chrome storage for persistence
                this.saveToStorage();
            }
        });

        this.participants = currentParticipants;
    }

    getCurrentParticipants() {
        const participants = [];

        // Words/phrases to exclude from participant names
        const excludeList = [
            'you', 'meeting tools', 'chat', 'captions', 'present now', 'share screen',
            'more options', 'leave call', 'turn off camera', 'mute', 'unmute',
            'raise hand', 'activities', 'breakout rooms', 'polls', 'qa',
            'whiteboard', 'recording', 'call will end soon', 'call ended',
            'meeting', 'tools', 'apps', 'alarm', 'people', 'participants',
            'host', 'co-host', 'moderator', 'presenter', 'viewer',
            'join', 'leave', 'invite', 'copy', 'link', 'add', 'remove'
        ];

        // Method 1: Look for actual participant list items with more specific targeting
        const participantListItems = document.querySelectorAll('[role="listitem"]');
        participantListItems.forEach(item => {
            // Look for spans that contain participant names
            const nameSpans = item.querySelectorAll('span');
            nameSpans.forEach(span => {
                const text = span.textContent.trim();

                if (this.isValidParticipantName(text, excludeList)) {
                    // Additional check: make sure this isn't a button or interactive element
                    const isButton = span.closest('button') !== null;
                    const hasClickHandler = span.onclick !== null || span.getAttribute('onclick') !== null;
                    const isAriaHidden = span.getAttribute('aria-hidden') === 'true';

                    if (!isButton && !hasClickHandler && !isAriaHidden) {
                        // Avoid duplicates
                        if (!participants.find(p => p.name === text)) {
                            participants.push({ name: text, element: span });
                        }
                    }
                }
            });
        });

        // Method 2: If Method 1 didn't find participants, try a more targeted approach
        if (participants.length === 0) {
            // Look specifically in the participants panel area
            const possibleContainers = document.querySelectorAll('[role="list"], [data-tab-id="2"], .participants-list');

            possibleContainers.forEach(container => {
                const spans = container.querySelectorAll('span');
                spans.forEach(span => {
                    const text = span.textContent.trim();

                    if (this.isValidParticipantName(text, excludeList)) {
                        const rect = span.getBoundingClientRect();
                        const isVisible = rect.width > 0 && rect.height > 0;
                        const isButton = span.closest('button') !== null;

                        if (isVisible && !isButton) {
                            // Avoid duplicates
                            if (!participants.find(p => p.name === text)) {
                                participants.push({ name: text, element: span });
                            }
                        }
                    }
                });
            });
        }

        console.log(`👥 Found ${participants.length} participants:`, participants.map(p => p.name));
        return participants;
    }

    isValidParticipantName(text, excludeList) {
        if (!text || text.length < 2) return false;
        if (text.length > 50) return false; // Too long to be a name

        // Convert to lowercase for comparison
        const lowerText = text.toLowerCase();

        // Check if text contains any excluded words/phrases
        for (const excludeWord of excludeList) {
            if (lowerText.includes(excludeWord.toLowerCase())) {
                return false;
            }
        }

        // Check for unwanted patterns
        if (lowerText.includes('(')) return false; // Likely contains status info
        if (lowerText.includes('@')) return false; // Email addresses
        if (lowerText.includes('http')) return false; // URLs
        if (lowerText.includes('www.')) return false; // URLs
        if (/^\d+$/.test(text)) return false; // Just numbers
        if (text.includes('...')) return false; // Truncated text
        if (text.includes('•')) return false; // Bullet points
        if (text.includes('→')) return false; // Arrows/navigation

        // Check for repeated characters (like "peoplepeople")
        const words = text.split(/\s+/);
        for (const word of words) {
            // Check if word is repeated (like "peoplepeople" = "people" + "people")
            const halfLength = Math.floor(word.length / 2);
            if (halfLength > 2) {
                const firstHalf = word.substring(0, halfLength);
                const secondHalf = word.substring(halfLength);
                if (firstHalf === secondHalf) {
                    return false; // Repeated word pattern
                }
            }
        }

        // Must contain at least one letter
        if (!/[a-zA-Z]/.test(text)) return false;

        // Should look like a name (letters, spaces, basic punctuation only)
        if (!/^[a-zA-Z\s\.\-']+$/.test(text)) return false;

        return true;
    }

    saveToStorage() {
        chrome.storage.local.set({
            'meetAttendance': this.joinOrder
        });
    }

    loadFromStorage() {
        chrome.storage.local.get(['meetAttendance'], (result) => {
            if (result.meetAttendance) {
                this.joinOrder = result.meetAttendance;
            }
        });
    }

    clearAttendance() {
        this.joinOrder = [];
        this.participants = [];
        chrome.storage.local.remove(['meetAttendance']);
        console.log('🗑️ Attendance list cleared');
    }
}

// Initialize the tracker when the page loads
let tracker;

// Wait for page to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        tracker = new AttendanceTracker();
    });
} else {
    tracker = new AttendanceTracker();
}

// Handle page navigation (Google Meet is a SPA)
let currentUrl = window.location.href;
setInterval(() => {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        // URL changed, restart tracking if we're on a meet page
        if (currentUrl.includes('meet.google.com') && currentUrl.includes('/')) {
            if (tracker) {
                tracker.stopTracking();
            }
            setTimeout(() => {
                tracker = new AttendanceTracker();
            }, 2000);
        }
    }
}, 1000);
