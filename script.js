/**
 * Seeva Download Detection
 * Detects user's OS and provides appropriate download links
 */

const VERSION = '0.2.2'; // Update this for each release
const SEEVA_VERSION = `v${VERSION}`;
const RELEASE_BASE = `https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/${SEEVA_VERSION}`;

const DOWNLOADS = {
    mac: {
        primary: {
            url: `${RELEASE_BASE}/Seeva.AI.Assistant_${VERSION}_aarch64.dmg`,
            text: 'Download for macOS',
            note: 'Apple Silicon',
            altUrl: `${RELEASE_BASE}/Seeva.AI.Assistant_${VERSION}_x64.dmg`,
            altText: 'Intel Mac'
        }
    },
    windows: {
        primary: {
            url: `${RELEASE_BASE}/Seeva.AI.Assistant_${VERSION}_x64-setup.exe`,
            text: 'Download for Windows',
            note: 'Windows 10+',
            altUrl: `${RELEASE_BASE}/Seeva.AI.Assistant_${VERSION}_x64_en-US.msi`,
            altText: 'MSI Installer'
        }
    },
    linux: {
        primary: {
            url: `${RELEASE_BASE}/Seeva.AI.Assistant_${VERSION}_amd64.deb`,
            text: 'Download for Linux',
            note: 'Debian/Ubuntu',
            altUrl: `${RELEASE_BASE}/Seeva.AI.Assistant-${VERSION}-1.x86_64.rpm`,
            altText: 'RPM Package'
        }
    }
};

function detectOS() {
    const ua = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    if (platform.includes('mac') || ua.includes('mac')) {
        return 'mac';
    } else if (platform.includes('win') || ua.includes('windows')) {
        return 'windows';
    } else if (platform.includes('linux') || ua.includes('linux')) {
        return 'linux';
    }
    return 'mac';
}

function getDownloadInfo() {
    const os = detectOS();
    return {
        os: os,
        ...DOWNLOADS[os].primary
    };
}

function setupDownloadButton(buttonId, textId = null, noteId = null, altLinkId = null) {
    const info = getDownloadInfo();
    const btn = document.getElementById(buttonId);

    if (!btn) {
        console.error(`Download button with id "${buttonId}" not found`);
        return;
    }

    btn.href = info.url;

    if (textId) {
        const textEl = document.getElementById(textId);
        if (textEl) textEl.textContent = info.text;
    } else {
        btn.textContent = info.text;
    }

    if (noteId) {
        const noteEl = document.getElementById(noteId);
        if (noteEl) noteEl.textContent = info.note;
    }

    if (altLinkId && DOWNLOADS[info.os].primary.altUrl) {
        const altLink = document.getElementById(altLinkId);
        if (altLink) {
            altLink.href = DOWNLOADS[info.os].primary.altUrl;
            altLink.textContent = `or download for ${DOWNLOADS[info.os].primary.altText}`;
            altLink.style.display = 'inline';
        }
    }
}

// Fullscreen image functionality
function openFullscreen() {
    document.getElementById('fullscreen-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFullscreen() {
    document.getElementById('fullscreen-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupDownloadButton('download-btn', 'download-text', 'download-note', 'alt-download');

    // Setup escape key to close fullscreen
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeFullscreen();
        }
    });
});
