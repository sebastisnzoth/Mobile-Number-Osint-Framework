// DEVOTEE INDIA OSINT Framework
// Nikul Suthar & Sharoop Parihar
// COMPLETE 78 METHODS - 9 categories

const techniquesData = {
    categories: [
        { id: 1, name: "📡 1. Technical & Telephony Data", icon: "fas fa-tower-cell" },
        { id: 2, name: "👤 2. Contact Syncing & Caller ID Apps", icon: "fas fa-id-card" },
        { id: 3, name: "💬 3. Messengers & VoIP Apps", icon: "fab fa-whatsapp" },
        { id: 4, name: "💰 4. Financial & Business Data", icon: "fas fa-rupee-sign" },
        { id: 5, name: "🌐 5. Social Media & Search Engines", icon: "fab fa-facebook" },
        { id: 6, name: "💀 6. Breach Data & Source Code", icon: "fas fa-database" },
        { id: 7, name: "🔐 7. Google Account & Password Recovery", icon: "fab fa-google" },
        { id: 8, name: "📍 8. Geolocation Paid Services", icon: "fas fa-map-marker-alt" },
        { id: 9, name: "🤖 9. Automated OSINT Tools", icon: "fas fa-robot" }
    ],
    details: {
        // Category 1: Technical & Telephony (8 methods)
        1: [
            { name: "Area Code Lookup", tool: "Wikipedia", url: "https://en.wikipedia.org/wiki/List_of_mobile_phone_number_series", action: "Search mobile number prefix to find country/region", example: "+91 98765 → India" },
            { name: "Country Code Database", tool: "CountryCode.org", url: "https://countrycode.org", action: "Find country from international prefix", example: "+1 → USA, +44 → UK, +91 → India" },
            { name: "HLR Research (Network Query)", tool: "smsc.ru/testhlr", url: "https://smsc.ru/testhlr/", action: "Query HLR to get IMSI code, provider, active status", example: "Get IMSI → 404XX → India Airtel" },
            { name: "IMSI Catcher / War Driving", tool: "IMSI catcher device", url: "", action: "Use IMSI code to track home address (physical proximity required)", example: "Advanced technique" },
            { name: "Provider Information", tool: "HLR research", url: "", action: "Find mobile provider, time zone, active status", example: "Airtel, IST, Active" },
            { name: "Mobile Network Code (MNC) Lookup", tool: "MCC-MNC Database", url: "https://mcc-mnc.com", action: "Lookup operator by network code", example: "404-01 → India Airtel" },
            { name: "Wi-Fi Hotspot Tracking", tool: "WiGLE", url: "https://wigle.net", action: "Search phone name/hotspot SSID in WiGLE database", example: "Find locations where phone acted as hotspot" },
            { name: "Cell Tower Geolocation", tool: "OpenCellID", url: "https://opencellid.org", action: "Find tower locations by cell ID for triangulation", example: "Approximate location" }
        ],
        // Category 2: Contact Syncing & Caller ID (8 methods)
        2: [
            { name: "Truecaller Search", tool: "truecaller.com", url: "https://www.truecaller.com", action: "Search number → get name, spam reports, location", example: "Find caller name and profile" },
            { name: "Sync.me Search", tool: "sync.me", url: "https://sync.me", action: "Import contact → find linked social media accounts", example: "Discover Facebook/Instagram" },
            { name: "Showcaller Search", tool: "showcaller.com", url: "https://showcaller.com", action: "Caller ID lookup with social media integration", example: "Find linked profiles" },
            { name: "Whoscall Search", tool: "whoscall.com", url: "https://whoscall.com", action: "Number lookup with community spam reports", example: "Check if number reported as spam" },
            { name: "CallApp Search", tool: "callapp.com", url: "https://callapp.com", action: "Caller ID with social media sync", example: "Find social profiles" },
            { name: "Username Search from Caller ID", tool: "whatsmyname.app", url: "https://whatsmyname.app", action: "Use found username to search across 300+ platforms", example: "Find all accounts with same username" },
            { name: "Social Media Research", tool: "Facebook/Instagram/LinkedIn", url: "", action: "Search found username → analyze posts, friends, bio", example: "Find city, workplace, home address clues" },
            { name: "Google Search Username", tool: "google.com", url: "https://google.com", action: "Search username in quotes with phone number", example: "\"username\" + phone" }
        ],
        // Category 3: Messengers & VoIP (16 methods)
        3: [
            { name: "WhatsApp Profile Check", tool: "wa.me", url: "https://wa.me/", action: "Save number → check profile picture, bio, last seen", example: "https://wa.me/91XXXXXXXXXX" },
            { name: "WhatsApp Business Check", tool: "WhatsApp Business API", url: "https://business.whatsapp.com", action: "Check if number has business account", example: "Get business name, description, address" },
            { name: "Telegram Search by Number", tool: "t.me", url: "https://t.me", action: "Search number → check profile picture, username, bio", example: "Find Telegram account" },
            { name: "Telegram API Check", tool: "Telegram API", url: "https://my.telegram.org", action: "Check registration via API", example: "Returns user ID if exists" },
            { name: "Signal Check", tool: "signal.org", url: "https://signal.org", action: "Check if number registered on Signal", example: "Privacy-focused messenger" },
            { name: "Discord Search", tool: "discord.com", url: "https://discord.com", action: "Add friend by phone number", example: "Find Discord user" },
            { name: "Face Search from Profile Pic", tool: "pimeyes.com", url: "https://pimeyes.com", action: "Upload profile picture → find other accounts", example: "Cross-platform identity" },
            { name: "FaceCheck ID Search", tool: "facecheck.id", url: "https://facecheck.id", action: "Search face across social media", example: "Find all photos of person" },
            { name: "FindClone.ru Search", tool: "findclone.ru", url: "https://findclone.ru", action: "Russian face search engine", example: "VK & OK profiles" },
            { name: "Skype Search by Number", tool: "web.skype.com", url: "https://web.skype.com", action: "Search number on Skype → get profile", example: "Find Skype ID" },
            { name: "Google Voice Check", tool: "voice.google.com", url: "https://voice.google.com", action: "Check if number linked to Google Voice", example: "VoIP detection" },
            { name: "Viber Search", tool: "viber.com", url: "https://viber.com", action: "Check Viber registration", example: "Profile picture, name" },
            { name: "WeChat Search", tool: "wechat.com", url: "https://wechat.com", action: "Search number on WeChat", example: "Chinese messenger footprint" },
            { name: "Line Messenger Check", tool: "line.me", url: "https://line.me", action: "Check Line registration", example: "Popular in Japan/Thailand" },
            { name: "Reverse Image Search Google", tool: "images.google.com", url: "https://images.google.com", action: "Search profile pictures across web", example: "Find other accounts" },
            { name: "Yandex Image Search", tool: "yandex.com/images", url: "https://yandex.com/images", action: "Russian reverse image search", example: "Better for Eastern Europe" }
        ],
        // Category 4: Financial & Business (7 methods)
        4: [
            { name: "PayPal Search - Status", tool: "paypal.com", url: "https://paypal.com", action: "Enter number → check online/offline status", example: "Determine time zone" },
            { name: "PayPal - Username Path", tool: "paypal.com", url: "https://paypal.com", action: "Get username → search social media", example: "Find location from profile" },
            { name: "PayPal - Company Path", tool: "paypal.com", url: "https://paypal.com", action: "Find company name → search owners", example: "Ultimate beneficial owner" },
            { name: "Open Corporates Search", tool: "opencorporates.com", url: "https://opencorporates.com", action: "Search company name → get owners/directors", example: "Find registered address" },
            { name: "MCA India Search", tool: "mca.gov.in", url: "https://mca.gov.in", action: "Check if number linked to registered business", example: "Director details" },
            { name: "Google Pay Search", tool: "Google Pay App", url: "", action: "Enter number → check name on UPI", example: "Find user name" },
            { name: "PhonePe Search", tool: "PhonePe App", url: "", action: "Search number → verify name", example: "Linked bank account" }
        ],
        // Category 5: Social Media & Search Engines (14 methods)
        5: [
            { name: "Facebook Search by Phone", tool: "facebook.com", url: "https://facebook.com", action: "Search number in FB → find profile", example: "Use /search/top/?q=number" },
            { name: "Facebook Graph Search", tool: "Facebook API", url: "", action: "Graph search for phone numbers", example: "Find hidden profiles" },
            { name: "Instagram Search by Number", tool: "instagram.com", url: "https://instagram.com", action: "Search number in 'Find people'", example: "Discover IG account" },
            { name: "TikTok Search", tool: "tiktok.com", url: "https://tiktok.com", action: "Search number → find account", example: "Profile with phone sync" },
            { name: "Twitter/X Search", tool: "twitter.com", url: "https://twitter.com", action: "Search phone number in Twitter", example: "Use advanced search" },
            { name: "Snapchat Search", tool: "Snapchat App", url: "", action: "Add by phone number", example: "Find username" },
            { name: "LinkedIn Search by Phone", tool: "linkedin.com", url: "https://linkedin.com", action: "Search number in contacts", example: "Professional profile" },
            { name: "YouTube Search", tool: "youtube.com", url: "https://youtube.com", action: "Search number in comments/about", example: "Find channel" },
            { name: "Google Search Dorks", tool: "google.com", url: "https://google.com", action: "Search formats: +91XXXX, 0XXXX, XXXXX", example: "\"+919876543210\" OR 9876543210" },
            { name: "Bing Search", tool: "bing.com", url: "https://bing.com", action: "Search number in different formats", example: "Different results than Google" },
            { name: "Yandex Search", tool: "yandex.com", url: "https://yandex.com", action: "Russian search engine", example: "Better for Eastern content" },
            { name: "DuckDuckGo Search", tool: "duckduckgo.com", url: "https://duckduckgo.com", action: "Privacy-focused search", example: "May find different results" },
            { name: "Search Documents (PDF/DOC)", tool: "Google filetype", url: "https://google.com", action: "Search 'filetype:pdf 9876543210'", example: "Find resumes, reports with number" },
            { name: "Image EXIF Data Extraction", tool: "exifdata.com", url: "https://exifdata.com", action: "Check if images contain GPS coordinates", example: "Extract location from photos" }
        ],
        // Category 6: Breach Data & Source Code (8 methods)
        6: [
            { name: "Dehashed Search", tool: "dehashed.com", url: "https://dehashed.com", action: "Search number in breach database (paid)", example: "Get usernames, passwords, emails" },
            { name: "IntelX Search", tool: "intelx.io", url: "https://intelx.io", action: "Search phone number across breaches", example: "Dark web data" },
            { name: "Snusbase Search", tool: "snusbase.com", url: "https://snusbase.com", action: "Check compromised credentials", example: "Find leaked data" },
            { name: "LeakCheck.io", tool: "leakcheck.io", url: "https://leakcheck.io", action: "Search phone in data breaches", example: "Check 7+ billion records" },
            { name: "Facebook Breach Check 2021", tool: "FB breach data", url: "", action: "Check if number in Facebook breach (533M users)", example: "Find linked accounts" },
            { name: "PublicWWW Source Code Search", tool: "publicwww.com", url: "https://publicwww.com", action: "Search number in website source code", example: "Find hidden contact info" },
            { name: "Archive.org Wayback Machine", tool: "archive.org", url: "https://archive.org", action: "Check historical data of websites", example: "Find old contact pages" },
            { name: "IP Address Extraction", tool: "From source code", url: "", action: "Find IP addresses linked to number", example: "Then geolocate IP" }
        ],
        // Category 7: Google Account & Password Recovery (6 methods)
        7: [
            { name: "Google Recovery - GAIA ID", tool: "accounts.google.com", url: "https://accounts.google.com", action: "Try password recovery → get GAIA ID", example: "GAIA ID reveals account age" },
            { name: "Google Recovery - Email Hint", tool: "Google Recovery", url: "", action: "Get masked email associated with number", example: "Find Google account" },
            { name: "Google Reviews Search", tool: "maps.google.com", url: "https://maps.google.com", action: "Search GAIA ID in Google reviews", example: "Find user name, location from reviews" },
            { name: "Wayback Machine for Google", tool: "archive.org", url: "https://archive.org", action: "Check historical Google profile data", example: "Old posts, reviews" },
            { name: "GHunt Tool", tool: "github.com/mxrch/GHunt", url: "https://github.com/mxrch/GHunt", action: "OSINT tool for Google accounts", example: "Get profile picture, name, location" },
            { name: "YouTube Channel Check", tool: "youtube.com", url: "https://youtube.com", action: "Search number in YouTube accounts", example: "Find linked channel" }
        ],
        // Category 8: Geolocation Paid Services (5 methods)
        8: [
            { name: "GeoCell.mobi Service", tool: "geocell.mobi", url: "https://geocell.mobi", action: "Generate tracking link → send to target", example: "If target clicks → get GPS location" },
            { name: "CellTrack.nl Service", tool: "celltrack.nl", url: "https://celltrack.nl", action: "Similar tracking link service", example: "SMS with link tracking" },
            { name: "Grabify IP Logger", tool: "grabify.link", url: "https://grabify.link", action: "Create tracking link → get IP when clicked", example: "Then geolocate IP" },
            { name: "IP Logger Shortener", tool: "iplogger.org", url: "https://iplogger.org", action: "Shorten link with IP tracking", example: "Track clicks" },
            { name: "⚠️ Important Note", tool: "", url: "", action: "Only works if target NOT using VPN/Tor", example: "VPN bypasses this method" }
        ],
        // Category 9: Automated OSINT Tools (6 methods)
        9: [
            { name: "PhoneInfoga", tool: "github.com/sundowndev/phoneinfoga", url: "https://github.com/sundowndev/phoneinfoga", action: "Advanced phone number OSINT tool", example: "Scan number, get carrier, country, Google info" },
            { name: "Spiderfoot", tool: "spiderfoot.net", url: "https://www.spiderfoot.net", action: "Automated OSINT with 200+ modules", example: "Multiple OSINT sources" },
            { name: "Maltego", tool: "maltego.com", url: "https://www.maltego.com", action: "Visual OSINT investigation platform", example: "Transform-based number research" },
            { name: "Lampyre", tool: "lampyre.io", url: "https://lampyre.io", action: "Data enrichment & OSINT platform", example: "Paid but powerful" },
            { name: "IntelTechniques Telephone Tool", tool: "inteltechniques.com/tools/Telephone.html", url: "https://www.inteltechniques.com/tools/Telephone.html", action: "Browser-based telephone OSINT by Michael Bazzell", example: "Direct number search" },
            { name: "Recon-ng", tool: "github.com/lanmaster53/recon-ng", url: "https://github.com/lanmaster53/recon-ng", action: "Full-featured reconnaissance framework", example: "Phone module available" }
        ]
    }
};

// Calculate total methods
let totalMethods = 0;
for (let i = 1; i <= 9; i++) {
    totalMethods += techniquesData.details[i]?.length || 0;
}
console.log("Total Methods:", totalMethods); // Should show 78

// COPY FUNCTION
function copyToClipboard(text, toolName) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`✅ Copied: ${toolName}`);
        }).catch(() => {
            fallbackCopy(text, toolName);
        });
    } else {
        fallbackCopy(text, toolName);
    }
}

function fallbackCopy(text, toolName) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    
    try {
        document.execCommand('copy');
        showToast(`✅ Copied: ${toolName}`);
    } catch (err) {
        showToast(`❌ Failed: ${toolName}`);
    }
    
    document.body.removeChild(textarea);
}

// Render Tree
function renderTree() {
    const container = document.getElementById('osintTree');
    let html = '';
    
    for (let i = 1; i <= 9; i++) {
        const cat = techniquesData.categories[i-1];
        const methods = techniquesData.details[i] || [];
        html += `
            <div class="tree-category">
                <div class="category-header" data-cat="cat-${i}">
                    <div class="category-icon"><i class="${cat.icon}"></i></div>
                    <div class="category-title">${cat.name}</div>
                    <div class="category-count">${methods.length}</div>
                    <div class="category-toggle"><i class="fas fa-chevron-down"></i></div>
                </div>
                <div class="methods-container" id="cat-${i}">
        `;
        
        methods.forEach(m => {
            const searchText = `${m.name} ${m.tool} ${m.action}`.toLowerCase();
            const displayTool = m.tool.length > 28 ? m.tool.substring(0, 25) + '...' : m.tool;
            html += `
                <div class="method-card" data-search="${searchText}">
                    <div class="method-name">
                        <i class="fas fa-caret-right"></i> ${m.name}
                        <span class="method-tool" data-tool-url="${m.url || ''}" data-tool-name="${m.tool}">
                            <i class="fas fa-copy"></i> ${displayTool}
                        </span>
                    </div>
                    <div class="method-action"><i class="fas fa-clipboard-list"></i> ${m.action}</div>
                    ${m.example ? `<div class="method-example">📝 ${m.example}</div>` : ''}
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    container.innerHTML = html;
    
    // Toggle categories
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            const catId = header.getAttribute('data-cat');
            const methodsDiv = document.getElementById(catId);
            const icon = header.querySelector('.category-toggle i');
            if (methodsDiv.style.display === 'block') {
                methodsDiv.style.display = 'none';
                icon.className = 'fas fa-chevron-down';
            } else {
                methodsDiv.style.display = 'block';
                icon.className = 'fas fa-chevron-up';
            }
        });
    });
    
    // Copy on click
    document.querySelectorAll('.method-tool').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const url = el.getAttribute('data-tool-url');
            const name = el.getAttribute('data-tool-name');
            
            if (url && url !== "") {
                let finalUrl = url;
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    finalUrl = 'https://' + url;
                }
                copyToClipboard(finalUrl, name);
            } else {
                showToast(`📋 ${name} (Manual OSINT - No link to copy)`);
            }
        });
    });
    
    // Open first category
    const firstCat = document.getElementById('cat-1');
    if (firstCat) {
        firstCat.style.display = 'block';
    }
}

// Search
function setupSearch() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const methods = document.querySelectorAll('.method-card');
        
        methods.forEach(m => {
            const searchData = m.getAttribute('data-search') || '';
            if (term === '' || searchData.includes(term)) {
                m.style.display = '';
                if (term !== '' && searchData.includes(term)) {
                    m.classList.add('highlight');
                    const parent = m.closest('.methods-container');
                    if (parent && parent.style.display !== 'block') {
                        parent.style.display = 'block';
                        const catId = parent.getAttribute('id');
                        const header = document.querySelector(`[data-cat="${catId}"]`);
                        if (header) {
                            const icon = header.querySelector('.category-toggle i');
                            if (icon) icon.className = 'fas fa-chevron-up';
                        }
                    }
                } else {
                    m.classList.remove('highlight');
                }
            } else {
                m.style.display = 'none';
                m.classList.remove('highlight');
            }
        });
    });
}

// Toast
function showToast(msg) {
    const toast = document.getElementById('toastMsg');
    toast.querySelector('span').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// Keyboard shortcut: focus the search field (Cmd/Ctrl + K)
function setupKeyboardShortcuts() {
    const btn = document.getElementById('startBtn');
    const investigation = document.getElementById('investigationArea');
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const panel = document.getElementById('notesPanel');
            const notesBtn = document.getElementById('notesBtn');
            if (panel && !panel.classList.contains('hidden')) {
                panel.classList.add('hidden');
                if (notesBtn) notesBtn.classList.remove('active');
            }
        }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            const focusSearch = () => {
                const input = document.getElementById('searchInput');
                if (input) { input.focus(); input.select(); }
            };
            if (investigation.classList.contains('hidden')) {
                btn.click();
                setTimeout(focusSearch, 450);
            } else {
                focusSearch();
            }
        }
    });
}

// HTML escaping helper (never inject API data as raw markup)
function escapeHtml(value) {
    return String(value === null || value === undefined || value === '' ? '—' : value)
        .replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Toolchain status panel
async function loadToolsStatus() {
    const target = document.getElementById('toolsStatus');
    if (!target) return;
    target.innerHTML = '<span class="tool-chip">Checking…</span>';
    try {
        const res = await fetch('/api/tools');
        const data = await res.json();
        if (!data.installed) {
            target.innerHTML = '<span class="tool-chip missing">Not installed — run npm run tools:install</span>';
            return;
        }
        const chips = (data.tools || []).map(t => {
            const cls = !t.available ? 'missing' : (t.official ? 'ok' : 'fallback');
            const label = t.name + (t.official ? '' : ' (offline fallback)');
            return `<span class="tool-chip ${cls}">${escapeHtml(label)}</span>`;
        });
        if ((data.skippedOptional || []).length) {
            chips.push(`<span class="tool-chip fallback">${data.skippedOptional.length} optional item(s) unavailable</span>`);
        }
        target.innerHTML = chips.join('');
    } catch (err) {
        target.innerHTML = `<span class="tool-chip missing">API unreachable: ${escapeHtml(err.message || err)}</span>`;
    }
}

// Offline number lookup (local /api/lookup)
function setupLookup() {
    const form = document.getElementById('lookupForm');
    const input = document.getElementById('lookupInput');
    const region = document.getElementById('lookupRegion');
    const consent = document.getElementById('lookupConsent');
    const result = document.getElementById('lookupResult');
    const btn = document.getElementById('lookupBtn');
    if (!form || !result) return;

    const show = (html) => { result.innerHTML = html; result.classList.remove('hidden'); };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const number = input.value.trim();
        if (!number) {
            show('<div class="lookup-error">Enter a phone number to analyse.</div>');
            return;
        }
        if (!consent.checked) {
            show('<div class="lookup-error">Please confirm you have consent / a legal basis before analysing a number.</div>');
            return;
        }
        btn.disabled = true;
        show('<div class="lookup-note">Analysing locally…</div>');
        try {
            const params = new URLSearchParams({ number, consent: 'true' });
            if (region.value) params.set('region', region.value);
            const res = await fetch(`/api/lookup?${params.toString()}`);
            const data = await res.json();
            if (!res.ok) {
                show(`<div class="lookup-error">${escapeHtml(data.error || 'Lookup failed')}</div>`);
                return;
            }
            const items = [
                ['E.164', data.e164],
                ['Region', data.region],
                ['Country / area', data.country_or_area],
                ['Carrier', data.carrier],
                ['Line type', data.line_type],
                ['Calling code', data.country_code ? '+' + data.country_code : null],
                ['Valid number', data.is_valid === null || data.is_valid === undefined ? 'unknown' : String(data.is_valid)],
                ['Timezones', (data.timezones || []).join(', ')],
                ['International format', data.international]
            ];
            const grid = `<div class="lookup-grid">${items.map(([k, v]) =>
                `<div class="lookup-item"><small>${escapeHtml(k)}</small><span>${escapeHtml(v)}</span></div>`).join('')}</div>`;
            const providerNote = (data.providers || []).filter(p => p.configured)
                .map(p => `<div class="lookup-warn">External provider ${escapeHtml(p.name)}: ${escapeHtml(p.status)}</div>`).join('');
            show(`${grid}
                <div class="lookup-note"><i class="fas fa-lock"></i> ${escapeHtml(data.disclaimer || '')}<br>Source: ${escapeHtml(data.source)}</div>
                ${providerNote}`);
        } catch (err) {
            show(`<div class="lookup-error">Could not reach the local API: ${escapeHtml(err.message || err)}</div>`);
        } finally {
            btn.disabled = false;
        }
    });

    const refreshBtn = document.getElementById('refreshToolsBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', loadToolsStatus);
    loadToolsStatus();
}

// Investigation notes (localStorage)
const NOTES_KEY = 'devoteeIndia.osintNotes';

function setupNotes() {
    const btn = document.getElementById('notesBtn');
    const panel = document.getElementById('notesPanel');
    const input = document.getElementById('notesInput');
    const badge = document.getElementById('notesBadge');
    const status = document.getElementById('notesStatus');
    const clearBtn = document.getElementById('clearNotesBtn');
    const exportBtn = document.getElementById('exportNotesBtn');
    if (!btn || !panel || !input) return;

    const storage = {
        get() {
            try { return window.localStorage.getItem(NOTES_KEY) || ''; }
            catch (err) { return ''; }
        },
        set(value) {
            try {
                if (value) window.localStorage.setItem(NOTES_KEY, value);
                else window.localStorage.removeItem(NOTES_KEY);
                return true;
            } catch (err) { return false; }
        }
    };

    input.value = storage.get();
    const refreshBadge = () => {
        if (badge) badge.classList.toggle('hidden', input.value.trim() === '');
    };
    refreshBadge();

    btn.addEventListener('click', () => {
        const opening = panel.classList.contains('hidden');
        panel.classList.toggle('hidden', !opening);
        btn.classList.toggle('active', opening);
        if (opening) input.focus();
    });

    let saveTimer;
    input.addEventListener('input', () => {
        refreshBadge();
        if (status) status.textContent = 'Saving...';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            const saved = storage.set(input.value);
            if (status) {
                status.textContent = saved
                    ? `Saved locally · ${new Date().toLocaleTimeString()}`
                    : 'Could not save (browser storage blocked)';
            }
        }, 300);
    });

    if (clearBtn) clearBtn.addEventListener('click', () => {
        if (!window.confirm('Delete all your investigation notes?')) return;
        input.value = '';
        storage.set('');
        refreshBadge();
        if (status) status.textContent = 'Notes cleared';
        input.focus();
    });

    if (exportBtn) exportBtn.addEventListener('click', () => {
        const blob = new Blob([input.value], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `osint-notes-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        if (status) status.textContent = 'Notes downloaded';
    });
}

// Investigate Button
function setupInvestigate() {
    const btn = document.getElementById('startBtn');
    const hero = document.getElementById('heroSection');
    const investigation = document.getElementById('investigationArea');
    
    btn.addEventListener('click', () => {
        hero.classList.add('hide-hero');
        setTimeout(() => {
            hero.style.display = 'none';
            investigation.classList.remove('hidden');
            investigation.scrollIntoView({ behavior: 'smooth' });
        }, 400);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTree();
    setupSearch();
    setupInvestigate();
    setupKeyboardShortcuts();
    setupNotes();
    setupLookup();
    console.log(`✅ DEVOTEE INDIA OSINT Framework Loaded with ${totalMethods} Methods`);
});