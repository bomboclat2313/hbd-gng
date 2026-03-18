// Simple numeric password mechanism
// Adjust this PIN to whatever you like
const CORRECT_PIN = "190312"; // example birthday code

const input = document.getElementById("pin-input");
const keypad = document.querySelector(".keypad");
const submitBtn = document.getElementById("submit");
const msg = document.getElementById("message");
const lock = document.getElementById("lock");
const protectedSection = document.getElementById("protected");
const speechBox = document.getElementById("speech");
const speechText = document.getElementById("speech-text");
const audio = document.getElementById("bg-audio");
const audioToggle = document.getElementById("audio-toggle");
const fullscreenToggle = document.getElementById("fullscreen-toggle");
const timelineToggle = document.getElementById("timeline-toggle");
const timelineRewind = document.getElementById("timeline-rewind");
const timelineForward = document.getElementById("timeline-forward");
// Fireworks overlay elements
const fireworksOverlay = document.getElementById("fireworks-overlay");
const fireworksFrame = document.getElementById("fireworks-frame");
// Track if fireworks have already been opened via trigger
let fireworksOpened = false;
// Overlay speech and audio toggle
const overlaySpeechText = document.getElementById('fireworks-speech-text');
const overlayAudioToggle = document.getElementById('fireworks-audio-toggle');
const overlayFullscreenToggle = document.getElementById('fireworks-fullscreen-toggle');
const bgFadeOverlay = document.getElementById('bg-fade-overlay');
const desktopIcons = document.getElementById('desktop-icons');
const iconWindowOverlay = document.getElementById('icon-window-overlay');
const iconWindowTitle = document.getElementById('icon-window-title');
const iconWindowClose = document.getElementById('icon-window-close');
const iconWindowContent = document.querySelector('.icon-window-content');
const siteLoader = document.getElementById('site-loader');
const LOADING_SCREEN_DURATION_MS = 2500;
let useOverlaySpeech = false;
let fireworksIframeReady = false;
let appStarted = false;

// ---------------- Desktop Icon + Window Config (EDIT ONLY THIS BLOCK) ----------------
// WHAT: change icon label/image, popup background image, popup text, and popup size.
// WHERE: only in DESKTOP_CONFIG below.
// HOW:
// 1) To use image icon: set iconImage (ex: 'letters/intro.png')
// 2) To use emoji icon: remove iconImage and set iconEmoji (ex: '📁')
// 3) Set windowBackgroundImage for popup background.
// 4) Set windowText to '' if you want image-only popup.
// 5) Add more icons by copying one object in icons[].
const DESKTOP_CONFIG = {
	// Desktop icon grid position/spacing
	desktop: {
		top: '96px',
		left: '18px',
		columnGap: '26px',
		rowGap: '20px'
	},
	// Popup window size/styling
	window: {
		width: 'min(76vw, 920px)',
		minWidth: '340px',
		maxHeight: 'min(76vh, 700px)',
		aspectRatio: '16 / 9',
		borderRadius: '14px',
		overlayBackground: 'rgba(6, 4, 14, 0.38)',
		contentPadding: '28px',
		defaultTextSuffix: ' window',
		defaultBackgroundSize: 'cover',
		defaultBackgroundPosition: 'center',
		defaultBackgroundRepeat: 'no-repeat'
	},
	// One object = one desktop icon
	icons: [
		{
			label: '1. warmth',
			iconImage: 'letters/1. warmth.png',
			iconImageSize: '44px',
			windowTitle: '1. warmth',
			windowText: '',
			windowBackgroundImage: 'letters/1. warmth.png'
		},
		{
			label: '2. thoughts',
			iconImage: 'letters/2. thoughts.png',
			iconImageSize: '44px',
			windowTitle: '2. thoughts',
			windowText: '',
			windowBackgroundImage: 'letters/2. thoughts.png'
		},
		{
			label: '3. memories',
			iconImage: 'letters/3. memories.png',
			iconImageSize: '44px',
			windowTitle: '3. memories',
			windowText: '',
			windowBackgroundImage: 'letters/3. memories.png'
		},
		{
			label: '4. wishes',
			iconImage: 'letters/4. wishes.png',
			iconImageSize: '44px',
			windowTitle: '4. wishes',
			windowText: '',
			windowBackgroundImage: 'letters/4. wishes.png'
		},
		{
			label: '5. peace',
			iconImage: 'letters/5. peace.png',
			iconImageSize: '44px',
			windowTitle: '5. peace',
			windowText: '',
			windowBackgroundImage: 'letters/5. peace.png'
		},
		{
			label: '6. gratitude',
			iconImage: 'letters/6. gratitude.png',
			iconImageSize: '44px',
			windowTitle: '6. gratitude',
			windowText: '',
			windowBackgroundImage: 'letters/6. gratitude.png'
		},
		{
			label: 'credits 1',
			iconImage: 'letters/credits 1.png',
			iconImageSize: '44px',
			windowTitle: 'credits 1',
			windowText: '',
			windowBackgroundImage: 'letters/credits 1.png'
		},
		{
			label: 'credits 2',
			iconImage: 'letters/credits 2.png',
			iconImageSize: '44px',
			windowTitle: 'credits 2',
			windowText: '',
			windowBackgroundImage: 'letters/credits 2.png'
		},
		{
			label: 'analysis',
			iconImage: 'letters/analysis.png',
			iconImageSize: '44px',
			windowTitle: 'analysis',
			windowText: '',
			windowBackgroundImage: 'letters/analysis.png'
		}
	]
};
// ---------------------------------------------------------------------------------------

function setStyleIfExists(el, key, value) {
	if (!el || value === undefined || value === null || value === '') return;
	el.style[key] = value;
}

function createDesktopShortcut(icon = {}, index = 0) {
	const label = (icon.label || `Icon ${index + 1}`).trim();
	const btn = document.createElement('button');
	btn.className = 'desktop-shortcut';
	btn.setAttribute('aria-label', label);

	const tile = document.createElement('span');
	tile.className = 'desktop-icon-tile';

	if (icon.iconImage) {
		const img = document.createElement('img');
		img.className = 'desktop-icon-image';
		img.src = icon.iconImage;
		img.alt = '';
		setStyleIfExists(img, 'width', icon.iconImageSize);
		setStyleIfExists(img, 'height', icon.iconImageSize);
		tile.appendChild(img);
	} else {
		const emoji = document.createElement('span');
		emoji.className = 'desktop-emoji';
		emoji.textContent = icon.iconEmoji || '📁';
		tile.appendChild(emoji);
	}

	const text = document.createElement('span');
	text.className = 'desktop-label';
	text.textContent = label;

	btn.appendChild(tile);
	btn.appendChild(text);
	btn._windowConfig = icon;
	return btn;
}

function applyDesktopConfig() {
	if (!desktopIcons) return;
	const d = DESKTOP_CONFIG.desktop || {};
	setStyleIfExists(desktopIcons, 'top', d.top);
	setStyleIfExists(desktopIcons, 'left', d.left);
	setStyleIfExists(desktopIcons, 'columnGap', d.columnGap);
	setStyleIfExists(desktopIcons, 'rowGap', d.rowGap);

	const w = DESKTOP_CONFIG.window || {};
	setStyleIfExists(iconWindowOverlay, 'background', w.overlayBackground);
	const panel = iconWindowOverlay ? iconWindowOverlay.querySelector('.icon-window') : null;
	setStyleIfExists(panel, 'width', w.width);
	setStyleIfExists(panel, 'minWidth', w.minWidth);
	setStyleIfExists(panel, 'maxHeight', w.maxHeight);
	setStyleIfExists(panel, 'aspectRatio', w.aspectRatio);
	setStyleIfExists(panel, 'borderRadius', w.borderRadius);
	setStyleIfExists(iconWindowContent, 'padding', w.contentPadding);

	const list = Array.isArray(DESKTOP_CONFIG.icons) ? DESKTOP_CONFIG.icons : [];
	const frag = document.createDocumentFragment();
	// First group count (2 columns x 3 rows = 6 icons)
	const FIRST_GROUP_COUNT = 6;
	list.forEach((icon, index) => {
		if (icon && icon.hidden) return;
		// Insert a spacer between the first group and the remaining icons
		if (index === FIRST_GROUP_COUNT) {
			const spacer = document.createElement('div');
			spacer.className = 'desktop-spacer';
			spacer.setAttribute('aria-hidden', 'true');
			frag.appendChild(spacer);
		}
		frag.appendChild(createDesktopShortcut(icon, index));
	});
	desktopIcons.innerHTML = '';
	desktopIcons.appendChild(frag);
}

applyDesktopConfig();

function markFireworksIframeReady() {
	fireworksIframeReady = true;
	customizeFireworksIframe();
}

function isFireworksIframeLoaded() {
	try {
		const doc = fireworksFrame && fireworksFrame.contentDocument;
		if (!doc) return false;
		return doc.readyState === 'interactive' || doc.readyState === 'complete';
	} catch (e) {
		return false;
	}
}

// Preload the fireworks iframe early to avoid loading box
if (fireworksFrame) {
	fireworksFrame.addEventListener('load', () => {
		markFireworksIframeReady();
		// Don't enable sound yet - wait for trigger
	}, { once: true });
	// In some runs iframe is already loaded before this listener is attached.
	if (isFireworksIframeLoaded()) {
		markFireworksIframeReady();
	}
}

// Enable/disable forward button (set to true to show it, false to hide it)
const ENABLE_FORWARD_BUTTON = false;

// Emoji rain function
function createEmojiRain(options = {}) {
    // Default settings with combined configuration options
    const settings = {
        // Emoji size range
        minSize: 25,
        maxSize: 40,
        
        // Text size range
        minTextSize: 20,
        maxTextSize: 40,
        
        baseSpeed: 6,
        speedFactor: 1,
        frequency: 450,
        behindContent: true,
        ...options
    };
    
    const emojis = ['🎂', '🎉', '🎊', '🍰', '🥳', '✨', '🍬', '🧁', '🎁'];

    let emojiContainer = document.querySelector('.emoji-rain');
    if (!emojiContainer) {
        emojiContainer = document.createElement('div');
        emojiContainer.className = 'emoji-rain';
        document.body.appendChild(emojiContainer);

        // Add styling for the container and text-based items
        const style = document.createElement('style');
        style.innerHTML = `
            .emoji-rain {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: ${settings.behindContent ? '20' : '100'};
                overflow: hidden;
            }
            .emoji-rain span {
                position: absolute;
                user-select: none;
            }
            .emoji-rain .text-emoji {
                color: #d8c2ff;
                font-weight: 700;
            }
        `;
        document.head.appendChild(style);
    }

    // Create interval for continuous emoji creation
    const intervalId = setInterval(() => {
        const item = emojis[Math.floor(Math.random() * emojis.length)];
        const element = document.createElement('span');

        // Check if item is text, then apply text-emoji class and size
        let size;
        if (/[a-zA-Z]/.test(item)) {
            element.classList.add('text-emoji');
            size = Math.random() * (settings.maxTextSize - settings.minTextSize) + settings.minTextSize;

        } else {
            size = Math.random() * (settings.maxSize - settings.minSize) + settings.minSize;
        }

        element.style.fontSize = `${size}px`;
        element.textContent = item;
        emojiContainer.appendChild(element);

        // Apply falling animation
        const startX = Math.random() * window.innerWidth;
        const rotation = Math.random() * 15;
        const durationVariation = gsap.utils.random(0.8, 1.2);
        const duration = settings.baseSpeed * settings.speedFactor * durationVariation;

        gsap.fromTo(
            element,
            {
                x: startX,
                y: -50,
                rotation: rotation,
                opacity: gsap.utils.random(0.7, 1),
            },
            {
                y: window.innerHeight + 100,
                x: startX + gsap.utils.random(-50, 50),
                rotation: rotation + gsap.utils.random(-20, 15),
                duration: duration,
                ease: "power1.out",
                onComplete: () => {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }
            }
        );
    }, settings.frequency);

    return {
        stop: () => clearInterval(intervalId)
    };
}

// Variable to store emoji rain instance
let emojiRainInstance = null;

// Speech timing defaults and per-line config
const SPEECH_DEFAULTS = {
	fadeIn: 0.6,
	hold: 0.8,
	fadeOut: 0.6,
	repeatDelay: 0.2,
	speed: 1,
	fontFamily: "Playfair Display, serif",
	fontSize: "6px"
};

// ==================================================
// SPEECH TEXT TUNING (EDIT THESE VALUES YOURSELF)
// ==================================================
const SPEECH_TUNING = {
	topOffsetVh: 30,           // Moves all GSAP lines higher on screen
	stackLineGapEm: 0.5,       // Space between stacked lines
	stackLineDelayScale: 2,  // Bigger = more delay between stacked lines
	lineGapScale: 0          // Bigger = more delay between each GSAP line
};

if (typeof document !== 'undefined' && document.documentElement) {
	document.documentElement.style.setProperty('--speech-top-offset', `${SPEECH_TUNING.topOffsetVh}vh`);
}

const FIREWORKS_BG_SHIFT_SEC = 3;


//________________________________________________________________________________________________________________________________________________________________________________________________
// Edit timings per line here
// Edit timings per line here
const SPEECH_LINES = [
	{ text: "", timings: { fadeIn: 0.5, hold: 2, fadeOut: 0.5, speed: 2 }, fontFamily: "Playfair Display, serif", fontSize: "25px" },

	//Together
	{
		text: "",
		stackLines: [
			"Full screen will give you a better experience",
			"Press on the top left button to fullscreen",
			"Also get your earphones for better experience",
			"Alright enjoy then ^_^"
		],
		lineDelay: 2, // Per-line delay for this stack (seconds before speed scaling)
		timings: { fadeIn: 2, hold: 2, fadeOut: 2, speed: 2 },
		fontFamily: "Playfair Display, serif",
		fontSize: "35px"
	},
    //Together

	//Together 2
	{
		text: "",
		stackLines: [
			"Hi Rani!",
			"Still love you name btw :)"
		],
		stackLineFontSizes: ["100px", "25px"],
		lineDelay: 2,
		timings: { fadeIn: 2, hold: 2.3, fadeOut: 0.5, speed: 2 },
		fontFamily: "Playfair Display, serif",
		fontSize: "35px"
	},
    //Together 2

	{ text: "Its been a while since we last talked", timings: { fadeIn: 0.5, hold: 3, fadeOut: 0.5, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "50px" },
	{ text: "It might also be very surprising to get this surprise at this stage of life", timings: { fadeIn: 0.5, hold: 4, fadeOut: 0.5, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "50px" },
	{ text: "But well", timings: { fadeIn: 2, hold: 1, fadeOut: 0.5, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "50px" },
	{ text: "That's what makes me", timings: { fadeIn: 1, hold: 2, fadeOut: 0.5, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "50px" },
	{ text: "Me.", timings: { fadeIn: 0.5, hold: 3, fadeOut: 0.5, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "100px" },

	{ text: "Anyways", timings: { fadeIn: 0.5, hold: 2, fadeOut: 0.5, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "50px" },
	{ text: "If we come to the main topic", timings: { fadeIn: 0.5, hold: 3, fadeOut: 0.5, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "50px" },
	//Together 3
	{
		text: "",
		stackLines: [
			"Its your birthday today",
			"YAYYY! 🎉🎂🥳",
		],
		stackLineFontSizes: ["100px", "25px"],
		lineDelay: 1,
		timings: { fadeIn: 2, hold: 4, fadeOut: 0.5, speed: 2 },
		fontFamily: "Playfair Display, serif",
		fontSize: "35px"
	},
    //Together 3	

	//Together 4
	{
		text: "",
		stackLines: [
			"so",
			"How is it going so far?",
			"I hope you are doing well",
			"And, actually planned to celebrate your birthday",
			"I did not do so much this time because of few things",
			"I will tell you at last"
		],
		lineDelay: 2, // Per-line delay for this stack (seconds before speed scaling)
		timings: { fadeIn: 2, hold: 3, fadeOut: 2, speed: 2 },
		fontFamily: "Playfair Display, serif",
		fontSize: "30px"
	},
    //Together 4

    { text: "But first,", timings: { fadeIn: 0.7, hold: 1, fadeOut: 0.5, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "50px" },
    { text: "Let me also wish you", timings: { fadeIn: 0.7, hold: 1, fadeOut: 0.5, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "50px" },

	 
	//not delete - this triggers the background shift and fireworks reveal
	{ text: "...", timings: { fadeIn: 0.7, hold: 2.6, fadeOut: 0.5, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "30px" },

	{ text: "", timings: { fadeIn: 0.5, hold: 6.5, fadeOut: 0.5, speed: 2 }, fontFamily: "Playfair Display, serif", fontSize: "25px" },

	{ text: "HAPPY BIRTHDAY RANI", timings: { fadeIn: 1.1, hold: 10, fadeOut: 1, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "100px" },
     
	{ text: "May God always keep you safe, happy", timings: { fadeIn: 2, hold: 2, fadeOut: 2, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "50px" },
	{ text: "AND >_< ,", timings: { fadeIn: 2, hold: 1, fadeOut: 2, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "50px" },	
	//Together 5
	{
		text: "",
		stackLines: [
			"Let me also be the part of your life",
			"👉👈>_<",
		],
		stackLineFontSizes: ["50px", "50px"],
		lineDelay: 2,
		timings: { fadeIn: 2, hold: 4, fadeOut: 2, speed: 2 },
		fontFamily: "Playfair Display, serif",
		fontSize: "35px"
	},
    //Together 5
	
	{ text: "Now", timings: { fadeIn: 2, hold: 1, fadeOut: 2, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "50px" },	

	//Together 6
	{
		text: "",
		stackLines: [
			"you will see few Icons with their label",
			"those are letters whcih you can read",
			"click them one by one acc to the numbering",
			"Alright enjoy then ^_^"
		],
		lineDelay: 3, // Per-line delay for this stack (seconds before speed scaling)
		timings: { fadeIn: 2, hold: 2, fadeOut: 2, speed: 2 },
		fontFamily: "Playfair Display, serif",
		fontSize: "35px"
	},
    //Together 6

	// End marker - will show the beating heart
	{ text: "END", timings: { fadeIn: 0, hold: 0, fadeOut: 0, speed: 1 }, fontFamily: "Playfair Display, serif", fontSize: "0.5px" }

];
//___________________________________________________________________________________________________________________________________________________________________________________________


// GSAP timelines
let tlIntro, tlError, tlSuccess, tlSpeech;

function initAnimations() {
	if (typeof gsap === 'undefined') return; // graceful if GSAP not loaded

	// Intro timeline
	tlIntro = gsap.timeline({ defaults: { duration: 0.35, ease: 'power2.out' } });
	gsap.set('#lock', { opacity: 0, y: 16 });
	gsap.set('#protected', { opacity: 0, y: 16 });
	gsap.set(['#message'], { opacity: 0 });
	tlIntro
		.to('#lock', { opacity: 1, y: 0 })
		.from('.pin-input', { opacity: 0, y: 10 }, '<0.05')
		.from('.keypad button', { opacity: 0, y: 8, stagger: 0.03 }, '-=0.1')
		.from('#submit', { opacity: 0, y: 8 }, '-=0.1')
		.to('#message', { opacity: 1, duration: 0.2 }, '>-0.15');

	// Error shake
	tlError = gsap.timeline({ paused: true });
	tlError
		.to(input, { x: -8, duration: 0.06, ease: 'power1.inOut', repeat: 5, yoyo: true })
		.to(input, { x: 0, duration: 0.08, ease: 'power1.out' })
		.call(() => clearAll());

	// Success transition
	tlSuccess = gsap.timeline({ paused: true });
	tlSuccess
		.to('#lock', { scale: 0.98, opacity: 0, duration: 0.25, ease: 'power1.out' })
		.add(() => {
			lock.classList.add('hidden');
			protectedSection.classList.remove('hidden');
		})
		.fromTo('#protected', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' })
		.add(() => {
			// attempt to play background audio (may be blocked by browser if no user gesture)
			if (typeof playAudio === 'function') playAudio();
			// Start emoji rain
			emojiRainInstance = createEmojiRain();
			startSpeech();
		});

	tlIntro.play();
}

function startAppAfterLoader() {
	if (appStarted) return;
	appStarted = true;

	if (typeof document !== 'undefined' && document.body) {
		document.body.classList.remove('loading-active');
	}

	if (siteLoader) {
		siteLoader.classList.add('site-loader--hide');
		siteLoader.setAttribute('aria-hidden', 'true');
		setTimeout(() => {
			siteLoader.classList.add('hidden');
		}, 720);
	}

	initAnimations();
}

setTimeout(startAppAfterLoader, LOADING_SCREEN_DURATION_MS);

// Fireworks overlay controls
let audioWasPlayingBeforeFireworks = false;
function showFireworks() {
	if (!fireworksOverlay) return;
	fireworksOverlay.classList.remove('hidden');
	fireworksOverlay.setAttribute('aria-hidden', 'false');
	// Switch speech rendering to overlay
	useOverlaySpeech = true;

	// Smooth crossfade from main scene to fireworks overlay
	if (window.gsap) {
		gsap.killTweensOf([fireworksOverlay, fireworksFrame, '#protected', speechBox]);
		gsap.set(fireworksOverlay, { opacity: 0 });
		if (fireworksFrame) gsap.set(fireworksFrame, { scale: 1.04, filter: 'blur(6px)' });

		const entranceTl = gsap.timeline();
		entranceTl.to('#protected', { opacity: 0.2, duration: 1.1, ease: 'power2.out' }, 0);
		if (speechBox) entranceTl.to(speechBox, { opacity: 0, duration: 0.95, ease: 'power1.out' }, 0);
		entranceTl.to(fireworksOverlay, { opacity: 1, duration: 1.8, ease: 'power2.inOut' }, 0.25);
		if (fireworksFrame) entranceTl.to(fireworksFrame, { scale: 1, filter: 'blur(0px)', duration: 1.85, ease: 'power2.out' }, 0.25);
		entranceTl.add(() => {
			if (speechBox) speechBox.classList.add('hidden');
			gsap.set('#protected', { opacity: 1 });
		});
	} else if (speechBox) {
		speechBox.classList.add('hidden');
	}

	// Fireworks is preloaded; if not ready yet, wait for first load once.
	if (fireworksFrame) {
		if (!fireworksIframeReady && isFireworksIframeLoaded()) {
			markFireworksIframeReady();
		}
		const shouldEnableFireworks = !!(audio && !audio.paused);
		if (fireworksIframeReady) {
			enableFireworksSound(shouldEnableFireworks);
		} else {
			fireworksFrame.addEventListener('load', () => {
				markFireworksIframeReady();
				enableFireworksSound(shouldEnableFireworks);
			}, { once: true });
		}
	}
	// Sync overlay audio toggle icon and handler
	if (overlayAudioToggle) {
		overlayAudioToggle.textContent = (audio && !audio.paused) ? '🔊' : '🔇';
		overlayAudioToggle.onclick = () => {
			if (!audio) return;
			if (audio.paused) playAudio(); else pauseAudio();
			overlayAudioToggle.textContent = audio.paused ? '🔇' : '🔊';
		};
	}
}

function hideFireworks() {
	if (!fireworksOverlay) return;
	// Switch speech rendering back to main
	useOverlaySpeech = false;
	if (window.gsap) {
		gsap.killTweensOf([fireworksOverlay, speechBox, bgFadeOverlay]);
		if (speechBox) {
			speechBox.classList.remove('hidden');
			gsap.set(speechBox, { opacity: 0 });
		}
		const exitTl = gsap.timeline();
		exitTl.to(fireworksOverlay, {
			opacity: 0,
			duration: 1.2,
			ease: 'power2.inOut',
			onComplete: () => {
				fireworksOverlay.classList.add('hidden');
				fireworksOverlay.setAttribute('aria-hidden', 'true');
			}
		});
		if (speechBox) exitTl.to(speechBox, { opacity: 1, duration: 1.0, ease: 'power2.out' }, 0.3);
		if (bgFadeOverlay) {
			exitTl.to(bgFadeOverlay, {
				opacity: 0,
				duration: 0.9,
				ease: 'power2.out',
				onComplete: () => bgFadeOverlay.classList.add('hidden')
			}, 0);
		}
	} else {
		fireworksOverlay.classList.add('hidden');
		fireworksOverlay.setAttribute('aria-hidden', 'true');
		if (speechBox) speechBox.classList.remove('hidden');
		if (bgFadeOverlay) {
			bgFadeOverlay.classList.add('hidden');
			bgFadeOverlay.style.opacity = 0;
		}
	}
}

// Hide Firework app UI and loading screen
function customizeFireworksIframe() {
	try {
		const doc = fireworksFrame && fireworksFrame.contentDocument;
		if (!doc) return;
		// Inject CSS to hide controls, menus, and loading screen
		const style = doc.createElement('style');
		style.textContent = `
			.controls, .menu, .help-modal, .credits, .loading-init { display: none !important; }
			.stage-container { border: none !important; }
		`;
		doc.head.appendChild(style);
	} catch (e) {
		// Ignore failures; fireworks will still run without UI tweaks
	}
}

// Ask the fireworks iframe to enable/disable sound (resume AudioContext + set sound flag)
function enableFireworksSound(enable = true) {
	try {
		if (fireworksFrame && fireworksFrame.contentWindow) {
			// Define your custom fireworks sequence here
			// Run pyramid twice first, then normal random behavior resumes
			const customSequence = [
				{ type: 'pyramid', delay: 0 },
				{ type: 'pyramid', delay: 0 }
			];
			const payload = {
				type: 'enable-sound',
				enabled: enable,
				customSequence: customSequence
			};
			
			fireworksFrame.contentWindow.postMessage(payload, '*');
			setTimeout(() => {
				try {
					if (fireworksFrame && fireworksFrame.contentWindow) {
						fireworksFrame.contentWindow.postMessage(payload, '*');
					}
				} catch (e) { /* ignore */ }
			}, 450);
		}
	} catch (e) { /* ignore */ }
}

// Start a looping speech mode that fades words in/out
let currentLineIndex = 0;
let timelinePaused = false;

function startSpeech() {
	if (!window.gsap || !speechBox || !speechText) return;
	speechBox.classList.remove('hidden');
	currentLineIndex = 0;
	if (tlSpeech) tlSpeech.kill();
	playLine();
}

const playLine = () => {
	if (timelinePaused) return; // don't start new line if paused
	
	const line = SPEECH_LINES[currentLineIndex] || { text: "" };
	const t = { ...SPEECH_DEFAULTS, ...(line.timings || {}) };
	const speed = t.speed || 1;
	const enterDuration = Math.max(0.05, t.fadeIn / speed);
	const exitDuration = Math.max(0.05, t.fadeOut / speed);
	const holdDuration = t.hold / speed;
	const repeatDelayDuration = ((t.repeatDelay || 0) / speed) * SPEECH_TUNING.lineGapScale;
	const enterDistance = 20;
	const exitDistance = -14;
	const enterEase = 'power3.out';
	const exitEase = 'power2.inOut';

	if (tlSpeech) tlSpeech.kill();
	tlSpeech = gsap.timeline({
		onComplete: () => {
			if (!timelinePaused) {
				currentLineIndex++;
				// Stop looping when we reach the end
				if (currentLineIndex < SPEECH_LINES.length) {
					playLine();
				}
			}
		}
	});

	const targetEl = (useOverlaySpeech && overlaySpeechText) ? overlaySpeechText : speechText;
	const targetForColor = targetEl;
	const normalizeFontSize = (value) => {
		if (value === undefined || value === null) return null;
		if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
		const str = String(value).trim();
		if (!str) return null;
		return /^\d+(\.\d+)?$/.test(str) ? `${str}px` : str;
	};
	const stackLinesRaw = Array.isArray(line.stackLines) ? line.stackLines : null;
	const stackLineFontSizes = Array.isArray(line.stackLineFontSizes)
		? line.stackLineFontSizes
		: (Array.isArray(line.stackLinesFontSizes) ? line.stackLinesFontSizes : []);
	const normalizedStackLines = (stackLinesRaw || []).map((entry, index) => {
		if (typeof entry === "string") {
			return { text: entry, fontSize: normalizeFontSize(stackLineFontSizes[index]), fontFamily: null };
		}
		if (entry && typeof entry === "object") {
			return {
				text: entry.text || "",
				fontSize: normalizeFontSize(entry.fontSize ?? stackLineFontSizes[index]),
				fontFamily: entry.fontFamily || null
			};
		}
		return { text: "", fontSize: normalizeFontSize(stackLineFontSizes[index]), fontFamily: null };
	});
	const isStackLine = normalizedStackLines.length > 0;
	const combinedLineText = isStackLine ? normalizedStackLines.map((item) => item.text).join(" ") : (line.text || "");
	const isFullscreenHintLine = /fullscreen/i.test(combinedLineText);
	if (!isFullscreenHintLine) stopFullscreenButtonBeat();
	const isTypingLine = !!line.typing;
	const typingCharDelay = (line.typing && line.typing.charDelay) ? line.typing.charDelay : 0.035;
	const lineTextChars = [...(line.text || "")];
	const typingDuration = Math.max(0.2, (lineTextChars.length * typingCharDelay) / speed);
	let hasHappyBirthdayAnimation = false;

	if (isStackLine) {
		const ff = line.fontFamily || t.fontFamily || SPEECH_DEFAULTS.fontFamily;
		const fs = normalizeFontSize(line.fontSize || t.fontSize || SPEECH_DEFAULTS.fontSize) || SPEECH_DEFAULTS.fontSize;
		const perLineDelay = ((typeof line.lineDelay === "number" ? line.lineDelay : 0.5) / speed) * SPEECH_TUNING.stackLineDelayScale;
		const perLineFade = enterDuration;

		targetEl.innerHTML = "";
		targetEl.style.fontFamily = ff;
		targetEl.style.fontSize = fs;

		const rows = normalizedStackLines.map((item, index) => {
			const row = document.createElement("span");
			row.textContent = item.text;
			row.style.display = "block";
			row.style.opacity = "0";
			row.style.marginTop = index === 0 ? "0" : `${SPEECH_TUNING.stackLineGapEm}em`;
			row.style.fontSize = item.fontSize || fs;
			row.style.fontFamily = item.fontFamily || ff;
			targetEl.appendChild(row);
			return row;
		});

		tlSpeech
			.set(targetEl, { opacity: 1 })
			.set(rows, { opacity: 0, y: enterDistance })
			.call(() => {
				if (isFullscreenHintLine) triggerFullscreenButtonBeat();
			})
			.to(rows, {
				opacity: 1,
				y: 0,
				duration: perLineFade,
				stagger: perLineDelay,
				ease: enterEase
			})
			.to(targetEl, { opacity: 1, duration: holdDuration })
			.call(() => {
				if (isFullscreenHintLine) stopFullscreenButtonBeat();
			})
			.to(targetEl, {
				opacity: 0,
				y: exitDistance,
				duration: exitDuration,
				ease: exitEase
			})
			.to({}, { duration: repeatDelayDuration });
		return;
	}

	tlSpeech
		.set(targetEl, { opacity: 0, y: enterDistance })
		.call(() => {
			targetEl.textContent = line.text;
			// apply per-line font and size
			const ff = line.fontFamily || t.fontFamily || SPEECH_DEFAULTS.fontFamily;
			const fs = normalizeFontSize(line.fontSize || t.fontSize || SPEECH_DEFAULTS.fontSize) || SPEECH_DEFAULTS.fontSize;
			targetEl.style.fontFamily = ff;
			targetEl.style.fontSize = fs;
			
			// Special animation for "HAPPY BIRTHDAY SARTHAK"
			if (combinedLineText.includes("HAPPY BIRTHDAY")) {
				hasHappyBirthdayAnimation = true;
				// Clear text and create individual word spans for animation
				targetEl.textContent = '';
				const words = line.text.split(' ');
				const wordSpans = [];
				
				words.forEach((word, index) => {
					const span = document.createElement('span');
					span.textContent = word;
					span.style.display = 'inline-block';
					span.style.margin = '0 14px';
					span.style.opacity = '0';
					span.style.textShadow = '0 0 10px rgba(255, 255, 255, 1)'; // Initial glow
					targetEl.appendChild(span);
					wordSpans.push(span);
				});
				
				// Animate each word with bounce and color change
				wordSpans.forEach((span, index) => {
					const delay = index * 0.3;
					
					// Bounce in animation
					gsap.fromTo(span, 
						{ 
							opacity: 0, 
							y: -50, 
							scale: 0.5,
							color: '#fff066',
							textShadow: '0 0 10px rgba(249, 236, 118, 1)'
						},
						{ 
							opacity: 1, 
							y: 0, 
							scale: 1,
							duration: 0.6,
							delay: delay,
							ease: 'bounce.out'
						}
					);
					
					// Continuous color pulse with glow
					gsap.to(span, {
						color: '#fdfdfdff',
						textShadow: '0 0 30px rgba(255, 255, 255, 1), 0 0 60px rgba(255, 255, 255, 1)',
						duration: 1.5,
						delay: delay + 0.6,
						repeat: -1,
						yoyo: true,
						ease: 'sine.inOut'
					});
					
					gsap.to(span, {
						y: -15,
						duration: 1.2,
						delay: delay + 0.6,
						repeat: -1,
						yoyo: true,
						ease: 'sine.inOut'
					});
					
					// Subtle scale pulse
					gsap.to(span, {
						scale: 1.1,
						duration: 1.8,
						delay: delay + 0.6,
						repeat: -1,
						yoyo: true,
						ease: 'sine.inOut'
					});
				});
			}
			
			// Check for trigger word "..." to fade background to pure black
			if ((line.text || "").trim() === "...") {
				const bgShiftDuration = FIREWORKS_BG_SHIFT_SEC;
				const startDelaySec = 0;
				// Stop emoji rain
				if (emojiRainInstance) {
					emojiRainInstance.stop();
				}
				// Directly darken the JPG by fading a black overlay on top of it.
				if (bgFadeOverlay) {
					bgFadeOverlay.classList.remove('hidden');
					gsap.set(bgFadeOverlay, { opacity: 0 });
					gsap.to(bgFadeOverlay, {
						opacity: 1,
						duration: bgShiftDuration,
						delay: startDelaySec,
						ease: 'power2.inOut'
					});
				}
				// Fade text color to white
				gsap.to(targetForColor, {
					color: '#c6c6c6ff',
					duration: bgShiftDuration,
					delay: startDelaySec,
					ease: 'power2.out'
				});
				// Reduce background song volume to half smoothly
				if (audio) {
					const targetVol = Math.max(0, audio.volume * 0.35);
					gsap.to(audio, { volume: targetVol, duration: bgShiftDuration, delay: startDelaySec, ease: 'power2.out' });
				}
				// Open fireworks overlay after the delayed black transition has completed (once only)
				if (!fireworksOpened) {
					const delayMs = Math.round((bgShiftDuration + 0.2) * 1000);
					setTimeout(() => {
						if (!fireworksOpened) {
							fireworksOpened = true;
							if (typeof showFireworks === 'function') showFireworks();
						}
					}, delayMs);
				}
			}
			
			// Check for END marker to show beating heart
			if ((line.text || "").trim() === "END") {
				targetEl.textContent = ''; // Clear END text
				showEndUi();
			}
		});

	if (isTypingLine && !hasHappyBirthdayAnimation) {
		tlSpeech
			.to(targetEl, {
				opacity: 1,
				y: 0,
				duration: enterDuration,
				ease: enterEase
			})
			.call(() => {
				targetEl.textContent = '';
			})
			.to({}, {
				duration: typingDuration,
				ease: 'none',
				onUpdate: function () {
					const typedCount = Math.floor(this.progress() * lineTextChars.length);
					targetEl.textContent = lineTextChars.slice(0, typedCount).join('');
				}
			})
			.call(() => {
				targetEl.textContent = line.text;
			})
			.to(targetEl, { opacity: 1, duration: holdDuration })
			.call(() => {
				if (isFullscreenHintLine) stopFullscreenButtonBeat();
			})
			.to(targetEl, {
				opacity: 0,
				y: exitDistance,
				duration: exitDuration,
				ease: exitEase
			})
			.to({}, { duration: repeatDelayDuration });
	} else {
		tlSpeech
			.to(targetEl, {
				opacity: 1,
				y: 0,
				duration: enterDuration,
				ease: enterEase
			})
			.call(() => {
				if (isFullscreenHintLine) triggerFullscreenButtonBeat();
			})
			.to(targetEl, { opacity: 1, duration: holdDuration })
			.call(() => {
				if (isFullscreenHintLine) stopFullscreenButtonBeat();
			})
			.to(targetEl, {
				opacity: 0,
				y: exitDistance,
				duration: exitDuration,
				ease: exitEase
			})
			.to({}, { duration: repeatDelayDuration });
	}
};

function showDesktopIcons() {
	if (!desktopIcons) return;
	desktopIcons.classList.remove('hidden');
	desktopIcons.setAttribute('aria-hidden', 'false');
	if (desktopIcons.dataset.shown === '1') return;
	desktopIcons.dataset.shown = '1';
	const items = desktopIcons.querySelectorAll('.desktop-shortcut');
	if (window.gsap && items.length) {
		gsap.set(items, { opacity: 0, y: 10 });
		gsap.to(items, {
			opacity: 1,
			y: 0,
			duration: 0.28,
			stagger: 0.06,
			ease: 'power2.out'
		});
	}
}

function showEndUi() {
	// kept for backward-compatibility: reveal desktop icons only
	showDesktopIcons();
}

function isIconWindowOpen() {
	return !!(iconWindowOverlay && !iconWindowOverlay.classList.contains('hidden'));
}

function openIconWindow(options = {}) {
	if (!iconWindowOverlay) return;
	const safeTitle = (options.titleText || 'Window').trim() || 'Window';
	const hasCustomText = Object.prototype.hasOwnProperty.call(options, 'contentText');
	const suffix = (DESKTOP_CONFIG.window && DESKTOP_CONFIG.window.defaultTextSuffix) || ' window';
	const contentText = hasCustomText ? options.contentText : `${safeTitle}${suffix}`;
	const backgroundImage = (options.backgroundImage || '').trim();
	const windowConfig = DESKTOP_CONFIG.window || {};
	const backgroundSize = options.backgroundSize || windowConfig.defaultBackgroundSize || 'cover';
	const backgroundPosition = options.backgroundPosition || windowConfig.defaultBackgroundPosition || 'center';
	const backgroundRepeat = options.backgroundRepeat || windowConfig.defaultBackgroundRepeat || 'no-repeat';

	if (iconWindowTitle) iconWindowTitle.textContent = safeTitle;

	// Set title & close button color: black for all letters except the "5. peace" image
	try {
		const isPeace = String(safeTitle || '').toLowerCase().includes('peace');
		if (iconWindowTitle) iconWindowTitle.style.color = isPeace ? 'var(--text)' : '#000';
		if (iconWindowClose) iconWindowClose.style.color = isPeace ? 'var(--text)' : '#000';
	} catch (e) { /* ignore */ }
	if (iconWindowContent) {
		iconWindowContent.textContent = contentText;
		// The visual letter will be applied to the panel element so the titlebar
		// can sit on top of it. Ensure the content area does not set a background.
		iconWindowContent.style.removeProperty('background-image');
		iconWindowContent.style.removeProperty('background-size');
		iconWindowContent.style.removeProperty('background-position');
		iconWindowContent.style.removeProperty('background-repeat');
	}

	// Popup-specific audio handling:
	// - Play the background music at a low volume while the popup is open.
	// - If music was previously paused, start it temporarily (but remember we started it).
	// - Always turn OFF fireworks sound while popup is open.
	// We keep previous states so we can restore them when the popup closes.
	if (audio) {
		const POPUP_LOW_VOLUME = 0.08;
		// store previous state for restoration
		window._prevAudioStateForPopup = window._prevAudioStateForPopup || { playing: !audio.paused, volume: audio.volume };
		// mark whether we forced playback (it was paused before popup)
		window._popupForcedMusic = !!audio.paused;
		try {
			// set low volume for popup
			window._prevAudioStateForPopup.volume = audio.volume; // Store previous volume
			audio.volume = POPUP_LOW_VOLUME;
			if (audio.paused) {
				// attempt to play even if toggle says off — per request, popup should play low-volume music
				const p = audio.play();
				if (p && p.then) p.catch(() => {});
			}
		} catch (e) { /* ignore */ }
	}

	// Ensure fireworks audio is disabled while popup is open
	try { enableFireworksSound(false); } catch (e) { /* ignore */ }
	iconWindowOverlay.classList.remove('hidden');
	iconWindowOverlay.setAttribute('aria-hidden', 'false');
	if (!window.gsap) return;
	const panel = iconWindowOverlay.querySelector('.icon-window');
	if (!panel) return;

	// Helper: convert cm to px using CSS reference (96dpi / 2.54cm)
	function cmToPx(cm) { return (cm * 96) / 2.54; }

	// Reset any previously-applied inline sizing so CSS defaults apply
	panel.style.removeProperty('width');
	panel.style.removeProperty('height');
	panel.style.removeProperty('max-height');
	panel.style.removeProperty('aspect-ratio');

	// If we have a background image, load it and size the panel with per-image vertical margins
	if (backgroundImage) {
		// apply image to the panel so it covers the titlebar too
		try {
			panel.style.backgroundImage = `url("${backgroundImage}")`;
			panel.style.backgroundSize = 'cover';
			panel.style.backgroundPosition = backgroundPosition || 'center';
			panel.style.backgroundRepeat = backgroundRepeat || 'no-repeat';
		} catch (e) { /* ignore if panel not ready */ }
		const img = new Image();
		img.onload = () => {
			const aspect = img.naturalWidth / img.naturalHeight || 16 / 9;
			const isCreditsImage = /credits/i.test(backgroundImage) || /credits/i.test(safeTitle);
			const isAnalysisImage = /analysis/i.test(backgroundImage) || /analysis/i.test(safeTitle);
			let totalMarginCm = 5; // default: 2.5cm top + 2.5cm bottom
			if (isCreditsImage) totalMarginCm = 14; // 7cm top + 7cm bottom for credits
			if (isAnalysisImage) totalMarginCm = 5; // keep analysis.png at 5cm total
			const availableHeightPx = Math.max(100, Math.round(window.innerHeight - cmToPx(totalMarginCm)));
			let targetWidthPx = Math.round(availableHeightPx * aspect);
			const maxAllowedWidth = Math.max(200, window.innerWidth - 48);
			if (targetWidthPx > maxAllowedWidth) {
				// adjust height to keep aspect and fit width
				targetWidthPx = maxAllowedWidth;
				const adjustedHeight = Math.round(targetWidthPx / aspect);
				panel.style.height = adjustedHeight + 'px';
			} else {
				panel.style.height = availableHeightPx + 'px';
			}
			panel.style.width = targetWidthPx + 'px';
			panel.style.aspectRatio = 'auto';
			panel.style.maxHeight = 'none';
		};
		img.onerror = () => { /* leave defaults if image fails to load */ };
		img.src = backgroundImage;
	}

	gsap.killTweensOf(panel);
	gsap.fromTo(panel, { opacity: 0, scale: 0.96, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: 'power2.out' });
}

function closeIconWindow() {
	if (!iconWindowOverlay) return;

	// Restore audio and fireworks state when popup closes
	if (audio) {
		try {
			const prev = window._prevAudioStateForPopup || null;
			if (prev) {
				if (window._popupForcedMusic) {
					// we started playback for the popup; pause it now
					audio.pause();
				} else {
					// restore previous volume
					audio.volume = (typeof prev.volume === 'number') ? prev.volume : audio.volume;
				}
			}
		} catch (e) { /* ignore */ }
		// cleanup
		try { delete window._popupForcedMusic; delete window._prevAudioStateForPopup; } catch (e) {}
	}

	// Re-sync fireworks sound based on current fireworks overlay + audio state
	try { syncFireworksSoundWithAudio(); } catch (e) { /* ignore */ }
	iconWindowOverlay.classList.add('hidden');
	iconWindowOverlay.setAttribute('aria-hidden', 'true');
}

// Keep popup closed by default until an icon is clicked.
closeIconWindow();

// Audio controls
let audioPlaying = false;

function isFireworksOverlayVisible() {
	return fireworksOverlay && !fireworksOverlay.classList.contains('hidden');
}

function syncFireworksSoundWithAudio() {
	if (!isFireworksOverlayVisible()) return;
	const shouldEnableFireworks = !!(audio && !audio.paused);
	enableFireworksSound(shouldEnableFireworks);
	if (overlayAudioToggle) overlayAudioToggle.textContent = shouldEnableFireworks ? '🔊' : '🔇';
}

async function playAudio() {
	if (!audio) return;
	try {
		// unmute and attempt to play
		audio.muted = false;
		audio.volume = 0.75;
		const p = audio.play();
		if (p && p.then) {
			await p;
		}
		audioPlaying = !audio.paused;
		if (audioToggle) audioToggle.textContent = audioPlaying ? '🔊' : '🔇';
		// Sync fireworks sound state with main audio toggle
		syncFireworksSoundWithAudio();
	} catch (err) {
		// autoplay blocked — notify user to press the music button
		audioPlaying = false;
		if (audioToggle) audioToggle.textContent = '🔇';
		setError('Audio blocked — click the music button to enable sound.');
		// Ensure fireworks sound is also disabled while audio is blocked
		syncFireworksSoundWithAudio();
	}
}

function pauseAudio() {
	if (!audio) return;
	audio.pause();
	audioPlaying = false;
	if (audioToggle) audioToggle.textContent = '🔇';
	// Sync fireworks sound with main audio state
	syncFireworksSoundWithAudio();
}


function updateFullscreenToggle() {
	if (!fullscreenToggle && !overlayFullscreenToggle) return;
	const fullscreenIcon = document.getElementById("fullscreen-icon");
	const overlayFullscreenIcon = document.getElementById("fireworks-fullscreen-icon");
	const isFullscreen = !!document.fullscreenElement;
	if (fullscreenIcon) {
		fullscreenIcon.src = isFullscreen ? "music/icons/fullscreen-exit.svg" : "music/icons/fullscreen-enter.svg";
	}
	if (overlayFullscreenIcon) {
		overlayFullscreenIcon.src = isFullscreen ? "music/icons/fullscreen-exit.svg" : "music/icons/fullscreen-enter.svg";
	}
	if (fullscreenToggle) {
		fullscreenToggle.title = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
		fullscreenToggle.setAttribute('aria-label', isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
	}
	if (overlayFullscreenToggle) {
		overlayFullscreenToggle.title = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
		overlayFullscreenToggle.setAttribute('aria-label', isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
	}
}

function triggerFullscreenButtonBeat() {
	if (!fullscreenToggle || !window.gsap) return;
	const fullscreenIcon = document.getElementById("fullscreen-icon");
	gsap.killTweensOf(fullscreenToggle);
	if (fullscreenIcon) gsap.killTweensOf(fullscreenIcon);
	gsap.set(fullscreenToggle, { scale: 1 });
	if (fullscreenIcon) {
		gsap.set(fullscreenIcon, {
			filter: 'invert(1) brightness(2.1) drop-shadow(0 0 10px rgba(255, 255, 255, 0.98)) drop-shadow(0 0 22px rgba(255, 255, 255, 0.92))'
		});
	}
	gsap.to(fullscreenToggle, {
		scale: 1.3,
		duration: 0.32,
		repeat: -1,
		yoyo: true,
		ease: 'sine.inOut'
	});
}

function stopFullscreenButtonBeat() {
	if (!fullscreenToggle || !window.gsap) return;
	const fullscreenIcon = document.getElementById("fullscreen-icon");
	gsap.killTweensOf(fullscreenToggle);
	if (fullscreenIcon) gsap.killTweensOf(fullscreenIcon);
	gsap.to(fullscreenToggle, {
		scale: 1,
		duration: 0.18,
		ease: 'power2.out'
	});
	if (fullscreenIcon) {
		gsap.to(fullscreenIcon, {
			filter: 'invert(1)',
			duration: 0.18,
			ease: 'power2.out'
		});
	}
}

async function toggleFullscreen() {
	try {
		if (!document.fullscreenElement) {
			await document.documentElement.requestFullscreen();
		} else {
			await document.exitFullscreen();
		}
	} catch (e) {
		setError('Fullscreen is blocked by browser settings.');
	}
}

if (fullscreenToggle) {
	fullscreenToggle.addEventListener('click', toggleFullscreen);
}
if (overlayFullscreenToggle) {
	overlayFullscreenToggle.addEventListener('click', toggleFullscreen);
}
document.addEventListener('fullscreenchange', updateFullscreenToggle);
updateFullscreenToggle();

// endHeart removed: no restart button.

if (iconWindowClose) {
	iconWindowClose.addEventListener('click', closeIconWindow);
}

if (iconWindowOverlay) {
	iconWindowOverlay.addEventListener('click', (e) => {
		if (e.target === iconWindowOverlay) closeIconWindow();
	});
}

if (desktopIcons) {
	desktopIcons.querySelectorAll('.desktop-shortcut').forEach((shortcutBtn) => {
		shortcutBtn.addEventListener('click', () => {
			const labelEl = shortcutBtn.querySelector('.desktop-label');
			const labelText = (labelEl ? labelEl.textContent : shortcutBtn.getAttribute('aria-label')) || 'Window';
			const iconConfig = shortcutBtn._windowConfig || {};
			const hasWindowText = Object.prototype.hasOwnProperty.call(iconConfig, 'windowText');
			const windowOptions = {
				titleText: iconConfig.windowTitle || labelText,
				backgroundImage: iconConfig.windowBackgroundImage || '',
				backgroundSize: iconConfig.windowBackgroundSize || '',
				backgroundPosition: iconConfig.windowBackgroundPosition || '',
				backgroundRepeat: iconConfig.windowBackgroundRepeat || ''
			};
			if (hasWindowText) windowOptions.contentText = iconConfig.windowText;
			openIconWindow(windowOptions);
		});
	});
}

if (audioToggle) {
		// initialize icon
		audioToggle.textContent = (audio && !audio.paused) ? '🔊' : '🔇';
		audioToggle.addEventListener('click', () => {
			if (!audio) return;
			if (audio.paused) {
				playAudio();
			} else {
				pauseAudio();
			}
		});
	}
// Timeline controls
if (timelineToggle) {
	timelineToggle.textContent = '⏸️';
	timelineToggle.addEventListener('click', () => {
		if (timelinePaused) {
			// resume
			timelinePaused = false;
			if (tlSpeech) tlSpeech.resume();
			else playLine(); // if no active timeline, start playing
			timelineToggle.textContent = '⏸️';
		} else {
			// pause
			timelinePaused = true;
			if (tlSpeech) tlSpeech.pause();
			timelineToggle.textContent = '▶️';
		}
	});
}

if (timelineRewind) {
	timelineRewind.addEventListener('click', () => {
		// go back one line
		if (currentLineIndex > 0) {
			currentLineIndex--;
		} else {
			currentLineIndex = SPEECH_LINES.length - 1; // wrap to last
		}
		// kill current timeline and play previous line
		if (tlSpeech) tlSpeech.kill();
		timelinePaused = false;
		if (timelineToggle) timelineToggle.textContent = '⏸️';
		playLine();
	});
}

if (timelineForward) {
	// Show/hide forward button based on config
	if (ENABLE_FORWARD_BUTTON) {
		timelineForward.classList.remove('hidden');
	}
	
	timelineForward.addEventListener('click', () => {
		// go forward one line
		currentLineIndex = (currentLineIndex + 1) % SPEECH_LINES.length;
		// kill current timeline and play next line
		if (tlSpeech) tlSpeech.kill();
		timelinePaused = false;
		if (timelineToggle) timelineToggle.textContent = '⏸️';
		playLine();
	});
}

// Helper to update the input value with masking length
function appendDigit(d) {
	if (!/^[0-9]$/.test(d)) return;
	if ((input.value || "").length >= input.maxLength) return;
	input.value += d;
	clearMessage();
}

function backspace() {
	input.value = input.value.slice(0, -1);
}

function clearAll() {
	input.value = "";
	clearMessage();
}

function clearMessage() {
	msg.textContent = "";
	msg.classList.remove("error", "ok");
}

function setError(text) {
	msg.textContent = text;
	msg.classList.remove("ok");
	msg.classList.add("error");
}

function setOk(text) {
	msg.textContent = text;
	msg.classList.remove("error");
	msg.classList.add("ok");
}

function validate() {
	const value = input.value;
	if (!value) {
		setError("Please enter the code");
		return;
	}
	if (value === CORRECT_PIN) {
		setOk("Unlocked");
		// success animation if available
		if (tlSuccess) {
			tlSuccess.restart();
		} else {
			lock.classList.add("hidden");
			protectedSection.classList.remove("hidden");
		}
	} else {
		setError("Incorrect code");
		if (tlError) {
			tlError.restart();
		} else {
			input.classList.add("shake");
			setTimeout(() => input.classList.remove("shake"), 400);
			clearAll();
		}
	}
}

// Keypad events
keypad.addEventListener("click", (e) => {
	const btn = e.target.closest("button");
	if (!btn) return;
	// micro press animation
	if (window.gsap) gsap.fromTo(btn, { scale: 1 }, { scale: 0.96, duration: 0.06, yoyo: true, repeat: 1, ease: 'power1.inOut' });
	const key = btn.getAttribute("data-key");
	const action = btn.getAttribute("data-action");
	if (key) appendDigit(key);
	if (action === "back") backspace();
	if (action === "clear") clearAll();
});

submitBtn.addEventListener("click", validate);

// Keyboard support (optional)
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape" && isIconWindowOpen()) {
		closeIconWindow();
		return;
	}
	if (e.key >= "0" && e.key <= "9") {
		appendDigit(e.key);
	}
	if (e.key === "Backspace") {
		backspace();
	}
	if (e.key === "Enter") validate();
});

// Hide cursor after inactivity
const CURSOR_HIDE_DELAY_MS = 3000;
let cursorHideTimer = null;

function showCursorAndScheduleHide() {
	document.body.classList.remove('cursor-hidden');
	if (cursorHideTimer) clearTimeout(cursorHideTimer);
	cursorHideTimer = setTimeout(() => {
		document.body.classList.add('cursor-hidden');
	}, CURSOR_HIDE_DELAY_MS);
}

['mousemove', 'mousedown', 'wheel', 'keydown', 'touchstart'].forEach((evt) => {
	document.addEventListener(evt, showCursorAndScheduleHide, { passive: true });
});
showCursorAndScheduleHide();
