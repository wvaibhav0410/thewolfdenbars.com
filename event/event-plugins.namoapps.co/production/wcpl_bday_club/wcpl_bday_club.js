// Birthday Club Plugin START
document.addEventListener('DOMContentLoaded', () => {
	if (typeof bday_club_promo === 'undefined' || !bday_club_promo || bday_club_promo === null || bday_club_promo.length === 0) {
		return;
	} else {
        initializeBdayClubPlugin();
    }

    function initializeBdayClubPlugin() {
        // Do not show Bday club promo if it's editor environment
        const editorEnvironmentLinks = ['website-editor-staging.spotapps.co', 'website-editor.spotapps.co'];
        const origin = window.location.origin;
        if (editorEnvironmentLinks.some(link => origin.includes(link))) return;

        // Do not show Bday club promo if it's not Homepage
        const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.php';
        if (!isHomePage) return;

        const bdayClubLink = bday_club_promo?.bday_club_link ?? '';
        const bdayClubFabShow = bday_club_promo?.bday_club_fab ?? false;
        const bdayClubFabType = bday_club_promo?.bday_club_fab_type ?? 'type_1';
        const bdayClubFabDefStyle = bday_club_promo?.bday_club_fab_def_style ?? 'light';
        const bdayClubCustomOffer = bday_club_promo?.bday_club_custom_offer ?? true;

        let bdayClubOfferText = bday_club_promo?.bday_offer_freebie_name;

        // If it's custom offer override it with generic text
        if (bdayClubCustomOffer || !bdayClubOfferText) {
            bdayClubOfferText = 'We have a gift for you';
        } else {
            bdayClubOfferText = bdayClubOfferText.toLowerCase();
            bdayClubOfferText = `Don't miss out on your ${bdayClubOfferText}`
        }

        const bdayClubFabText = `<b>Bday coming up? </b><br>${bdayClubOfferText}`;

        if (typeof bdayClubLink !== 'undefined' && bdayClubLink.trim() !== '') {
            if (typeof bdayClubFabShow !== 'undefined' && bdayClubFabShow === true) {
                // Load Font Awesome if not present
                const hasFontAwesome = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                    .some(link => /font-?awesome/i.test(link.href));
                if (!hasFontAwesome) {
                    const faLink = document.createElement('link');
                    faLink.rel = 'stylesheet';
                    faLink.href = '//static.spotapps.co/web-lib/fontawesome/font-awesome-4.7.0/css/font-awesome.min.css';
                    document.head.appendChild(faLink); // Add at the end of <head>
                }
                
                if (bdayClubFabType === 'type_1') {
                    initCircleFAB();
                }
                if (bdayClubFabType === 'type_2') {
                    initTileFAB();
                }

                // Detect and apply styles after button is injected
                detectWebsiteColors(({
                    fabBackgroundColor,
                    fabTextColor,
                    fabIconColor
                }) => {
                    setFABStyle(fabBackgroundColor, fabTextColor, fabIconColor);
                });

            }
        }

        // Set button's style
        function setFABStyle(fabBackgroundColor, fabTextColor, fabIconColor) {
            const fab = document.querySelector('.bday-club-btn');
            if (!fab) return;

            fab.style.backgroundColor = fabBackgroundColor;
            fab.style.color = fabTextColor;
            fab.style.borderColor = fabTextColor;
            fab.style.outlineColor = fabTextColor;

            const icon = fab.querySelector('.fab-icon-wrapper i');
            if (icon) {
                icon.style.color = fabIconColor;
            }
        }

        // Detect color from navigation
        function detectWebsiteColors(callback) {
            const realNav = document.querySelector('nav.navbar');

            // Fallback early for unsupported layouts
            if (
                !realNav ||
                window.getComputedStyle(realNav).display === 'none' || 
                realNav.classList.contains('nav-v2') ||
                realNav.classList.contains('nav-v5') ||
                (realNav.classList.contains('nav-v4') && !realNav.classList.contains('nav-v6'))
            ) {
                return callback(fallbackBtnColors());
            }

            // Create ghost nav
            const ghostNav = realNav.cloneNode(true);
            ghostNav.classList.add('nav-scroll');
            ghostNav.style.position = 'absolute';
            ghostNav.style.top = '-9999px';
            ghostNav.style.left = '-9999px';
            ghostNav.style.visibility = 'hidden';

            document.body.appendChild(ghostNav);

            requestAnimationFrame(() => {
                const isMobile = window.innerWidth < 768;

                let fabBackgroundColor;
                let fabTextColor;
                let fabIconColor;

                if (isMobile) {
                    // Mobile: use nav background + simulated icon-bar state
                    fabBackgroundColor = window.getComputedStyle(ghostNav).backgroundColor;

                    // Find the real toggle button and clone it
                    const realToggle = ghostNav.querySelector('.navbar-toggle');
                    let clonedToggle = null;

                    if (realToggle) {
                        clonedToggle = realToggle.cloneNode(true);
                        clonedToggle.setAttribute('aria-expanded', 'true');
                        clonedToggle.style.position = 'absolute';
                        clonedToggle.style.top = '-9999px';
                        clonedToggle.style.left = '-9999px';
                        clonedToggle.style.visibility = 'hidden';

                        ghostNav.appendChild(clonedToggle);
                    }

                    // Use the first .icon-bar from original nav for text color
                    const originalIconBar = realToggle?.querySelector('.icon-bar');
                    fabTextColor = originalIconBar
                        ? window.getComputedStyle(originalIconBar).backgroundColor
                        : null;

                    // Use first .icon-bar from simulated expanded toggle for icon color
                    const simulatedIconBar = clonedToggle?.querySelector('.icon-bar');
                    fabIconColor = simulatedIconBar
                        ? window.getComputedStyle(simulatedIconBar).backgroundColor
                        : fabTextColor;

                    // Clean up cloned toggle
                    if (clonedToggle) {
                        ghostNav.removeChild(clonedToggle);
                    }
				} else {
                    // Desktop: use navbar-tabs and nav links
                    let navbarTabs = ghostNav.querySelector('.navbar-tabs') || ghostNav;

                    fabBackgroundColor = window.getComputedStyle(navbarTabs).backgroundColor;

                    // Step 1: Get default (non-active) text color
                    const allLinks = navbarTabs.querySelectorAll('.navbar-nav > li > a');
                    const defaultTextLink = Array.from(allLinks).find(link => !link.closest('.active'));

                    fabTextColor = defaultTextLink ?
                        window.getComputedStyle(defaultTextLink).color :
                        null;

                    // Step 2: Try to get a real active link first
                    let activeLink = navbarTabs.querySelector('.navbar-nav > .active > a');

                    // Step 3: Simulate .active if none exists
                    let cloneContainer = null;

                    if (!activeLink && allLinks.length > 0) {
                        const firstLi = allLinks[0].closest('li');

                        if (firstLi) {
                            // Clone <li> and force it to be .active
                            const clonedLi = firstLi.cloneNode(true);
                            clonedLi.className = 'nav-tab active';

                            cloneContainer = document.createElement('ul');
                            cloneContainer.classList.add('navbar-nav');
                            cloneContainer.style.position = 'absolute';
                            cloneContainer.style.left = '-9999px';
                            cloneContainer.style.top = '-9999px';
                            cloneContainer.style.visibility = 'hidden';

                            cloneContainer.appendChild(clonedLi);
                            navbarTabs.appendChild(cloneContainer);

                            activeLink = clonedLi.querySelector('a');
                        }
                    }

                    // Step 4: Read icon color from active link or fallback
                    fabIconColor = activeLink ?
                        window.getComputedStyle(activeLink).color :
                        fabTextColor;

                    // Step 5: Clean up simulated DOM if needed
                    if (cloneContainer) {
                        navbarTabs.removeChild(cloneContainer);
                    }
                }

                // Normalize for conflict resolution
                const bg = fabBackgroundColor?.toLowerCase();
                let text = fabTextColor?.toLowerCase();
                let icon = fabIconColor?.toLowerCase();

                const isTransparent = (val) =>
                    !val || val === 'transparent' || val === 'rgba(0, 0, 0, 0)';

                // Fallback if any major color is invalid
                if (isTransparent(bg) || isTransparent(text)) {
                    document.body.removeChild(ghostNav);
                    return callback(fallbackBtnColors());
                }

                // Resolve color conflicts
                if (icon === bg) {
                    icon = text;
                }

                if (text === bg) {
                    text = icon;
                }

                document.body.removeChild(ghostNav);

                callback({
                    fabBackgroundColor: bg,
                    fabTextColor: text,
                    fabIconColor: icon
                });
            });
        }

        function fallbackBtnColors() {
            const defStyle = (typeof bdayClubFabDefStyle !== 'undefined' && bdayClubFabDefStyle === 'dark') ?
                defDarkStyle() :
                defLightStyle();

            return defStyle;
        }

        function defLightStyle() {
            return {
                fabBackgroundColor: '#ffffff',
                fabTextColor: '#333333',
                fabIconColor: '#333333'
            };
        }

        function defDarkStyle() {
            return {
                fabBackgroundColor: '#333333',
                fabTextColor: '#ffffff',
                fabIconColor: '#ffffff'
            };
        }

        // === Birthday Club FAB Circle Button ===
        function initCircleFAB() {
            // Create Elements
            const fabCircleHolder = document.createElement('div');
            fabCircleHolder.className = 'bday-club-btn-holder-circle';

            // Get plain text from FAB label HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = bdayClubFabText;
            const plainTextLabel = tempDiv.textContent || tempDiv.innerText || '';

            const fabButtonCircle = document.createElement('a');
            fabButtonCircle.className = 'bday-club-btn bday-club-btn-circle';
            fabButtonCircle.id = 'bDayClubFAB';
            fabButtonCircle.setAttribute('href', bdayClubLink);
            fabButtonCircle.setAttribute('target', '_blank');
            fabButtonCircle.setAttribute('rel', 'noopener noreferrer');
            fabButtonCircle.setAttribute('aria-label', `${plainTextLabel}. Opens in a new tab.`);

            fabButtonCircle.innerHTML = `
            <span class="visuallyhidden">${plainTextLabel}</span>
            <span class="fab-icon-wrapper">
                <i class="fa fa-birthday-cake" aria-hidden="true"></i>
            </span>
            <span class="fab-label" aria-hidden="true">
                ${bdayClubFabText}
            </span>
            `;

            fabCircleHolder.appendChild(fabButtonCircle);
            document.body.appendChild(fabCircleHolder);

            // Set FAB Position Based on Contact Widget
            setTimeout(() => {
                setFabCircleHolderPosition(fabCircleHolder);

                // Listen for ContactBtnMoved event and reposition FAB accordingly
                const contactBtn = document.querySelector('#sh-generic-form-bubble');
                if (contactBtn) {
                    contactBtn.addEventListener('ContactBtnMoved', () => {
                        setFabCircleHolderPosition(fabCircleHolder);
                    });
                };
            }, 500);

            // Confetti on load
            setTimeout(() => launchConfetti(fabButtonCircle), 2000);

            // Hover Expand (Desktop only)
            let hoverCollapseTimeout = null;
            // Focus detect
            let focusChangedFromTabSwitch = false;

            // Expand FAB on mouseenter
            fabButtonCircle.addEventListener('mouseenter', () => {
                if (!isRealMouseDevice()) return;

                clearTimeout(hoverCollapseTimeout);
                updateExpandedButtonWidth();
                fabButtonCircle.classList.add('expanded');
            });

            // Collapse FAB on mouseleave
            fabButtonCircle.addEventListener('mouseleave', () => {
                // Delay collapse slightly to avoid hover bounce
                hoverCollapseTimeout = setTimeout(() => {
                    fabButtonCircle.classList.remove('expanded');
                }, 300);
            });

            // Detect tab switch and cancel FAB focus 
            window.addEventListener('blur', () => {
                focusChangedFromTabSwitch = true;
            });
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    focusChangedFromTabSwitch = true;
                }
            });

            // Expand FAB on keyboard focus
            fabButtonCircle.addEventListener('focus', () => {
                if (focusChangedFromTabSwitch) {
                    // Don't expand on focus caused by tab switch
                    focusChangedFromTabSwitch = false;
                    return;
                }
            
                clearTimeout(hoverCollapseTimeout);
                updateExpandedButtonWidth();
                fabButtonCircle.classList.add('expanded');
            });

            // Collapse FAB on keyboard blur
            fabButtonCircle.addEventListener('blur', () => {
                hoverCollapseTimeout = setTimeout(() => {
                    fabButtonCircle.classList.remove('expanded');
                }, 300);
            });

            // Collapse FAB after touchend
            fabButtonCircle.addEventListener('touchend', () => {
                setTimeout(() => {
                    fabButtonCircle.classList.remove('expanded');
                }, 1000);
            });

            function isRealMouseDevice() {
                return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
            }

            // Initial expand on load
            setTimeout(() => {
                updateExpandedButtonWidth();
                fabButtonCircle.classList.add('expanded');
            }, 1000);

            // Collapse FAB after scroll past 50% viewport height
            const collapseOnScroll = () => {
                const scrollY = window.scrollY || window.pageYOffset;
                const triggerPoint = window.innerHeight * 0.5;

                if (scrollY > triggerPoint && fabButtonCircle.classList.contains('expanded')) {
                    fabButtonCircle.classList.remove('expanded');
                    window.removeEventListener('scroll', collapseOnScroll);
                }
            };

            window.addEventListener('scroll', collapseOnScroll);

            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    setFabCircleHolderPosition(fabCircleHolder);
                    updateExpandedButtonWidth();
                }, 250);
            });
        }

        // Dynamically calculate and set Circle FAB Position Based on Contact Widget position
        function setFabCircleHolderPosition(fabCircleHolder) {
            let fixedContactWidget = document.querySelector('#sh-generic-form-bubble');
            if (!fixedContactWidget) {
                fixedContactWidget = document.querySelector('#sh-generic-form-widget .tw-fixed');
            }
        
            // Default spacing values
            let totalOffset = 21;
            let desiredSpacing = 13;
            if (window.innerWidth < 768) {
                totalOffset = 56;
                desiredSpacing = 8;
            }
        
            if (fixedContactWidget) {
                const styles = window.getComputedStyle(fixedContactWidget);
        
                let bottom = parseFloat(styles.bottom);
                let height = parseFloat(styles.height);
                let marginBottom = parseFloat(styles.marginBottom);
        
                // Ensure fallback to 0 if any value is invalid
                desiredSpacing = isNaN(bottom) || styles.bottom === 'auto' || bottom < 0 ? 0 : desiredSpacing;
                bottom = isNaN(bottom) || styles.bottom === 'auto' || bottom < 0 ? 0 : bottom;
                height = isNaN(height) ? 0 : height;
                marginBottom = isNaN(marginBottom) ? 0 : marginBottom;
        
                totalOffset = bottom + height + marginBottom + desiredSpacing;
            }
        
            fabCircleHolder.style.bottom = `${totalOffset}px`;
        }

        // Dynamically calculate the width of .fab-label and set btn extended width accordingly
        function updateExpandedButtonWidth() {
            const fab = document.querySelector('.bday-club-btn-circle');
            const label = fab?.querySelector('.fab-label');
            if (!fab || !label) return;

            const labelStyles = window.getComputedStyle(label);
            const fabStyles = window.getComputedStyle(fab);

            // Get full HTML content of the label
            const labelHtml = label.innerHTML;

            // Split by <br>, <br/>, or <br /> (case-insensitive)
            const lines = labelHtml.split(/<br\s*\/?>/gi);

            const measureLine = (html) => {
                const tempSpan = document.createElement('span');
                tempSpan.innerHTML = html.trim(); // preserve inline HTML
                
                Object.assign(tempSpan.style, {
                    position: 'absolute',
                    visibility: 'hidden',
                    whiteSpace: 'nowrap',
                    fontSize: labelStyles.fontSize,
                    fontFamily: labelStyles.fontFamily,
                    fontWeight: labelStyles.fontWeight,
                    letterSpacing: labelStyles.letterSpacing,
                    lineHeight: labelStyles.lineHeight,
                });

                document.body.appendChild(tempSpan);
                const width = tempSpan.offsetWidth;
                document.body.removeChild(tempSpan);
                return width;
            };

            const lineWidths = lines.map(measureLine);
            const maxLineWidth = Math.max(...lineWidths);
            const totalWidth = maxLineWidth + 80; // Add padding/icon space

            // Check if fab has a max-width set in CSS
            const maxWidthStr = fabStyles.maxWidth;
            let maxWidth = null;

            if (maxWidthStr && maxWidthStr !== 'none') {
                // Convert CSS unit to pixels
                const tempDiv = document.createElement('div');
                tempDiv.style.position = 'absolute';
                tempDiv.style.visibility = 'hidden';
                tempDiv.style.width = maxWidthStr;
                document.body.appendChild(tempDiv);
                maxWidth = tempDiv.offsetWidth;
                document.body.removeChild(tempDiv);
            }

            label.style.whiteSpace = 'nowrap';

            if (maxWidth !== null && totalWidth > maxWidth) {
                label.style.whiteSpace = 'normal';
            }

            fab.style.setProperty('--fab-expanded-width', `${totalWidth}px`);
        }

        function launchConfetti(buttonEl, event = null) {
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const isScreenReaderOrKeyboard = event?.detail === 0;

            // Launch confetti only if user wants motion AND used mouse/touch
            if (prefersReducedMotion || isScreenReaderOrKeyboard) return;

            const confettiContainer = document.createElement('div');
            confettiContainer.className = 'confetti-container';

            for (let i = 0; i < 14; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-piece';
                confetti.style.backgroundColor = getRandomColor();

                const angle = Math.random() * Math.PI * 2;
                const distance = 80 + Math.random() * 40;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                confetti.style.setProperty('--x', `${x}px`);
                confetti.style.setProperty('--y', `${-y}px`);
                confetti.style.setProperty('--rotation', `${Math.random() * 720 - 360}deg`);
                confetti.style.animationDelay = `${Math.random() * 0.15}s`;

                confettiContainer.appendChild(confetti);
            }

            const rect = buttonEl.getBoundingClientRect();
            confettiContainer.style.top = `${rect.top + rect.height / 2}px`;
            confettiContainer.style.left = `${rect.left + rect.width / 2}px`;

            document.body.appendChild(confettiContainer);

            setTimeout(() => confettiContainer.remove(), 1000);
        }

        function getRandomColor() {
            const colors = ['#00DBDE', '#FC00FF', '#FE5D26', '#F2E863', '#08605F'];
            return colors[Math.floor(Math.random() * colors.length)];
        }


        // === Birthday Club FAB Tile Button ===
        function initTileFAB() {
            const fabButtonTile = document.createElement('button');
            fabButtonTile.className = 'bday-club-btn bday-club-btn-tile';
            fabButtonTile.setAttribute('role', 'button');
            fabButtonTile.setAttribute('aria-label', 'Join our Birthday Club to get a free birthday treat');

            fabButtonTile.innerHTML = `
            <span class="fab-label">Get a Free Birthday Treat</span>
            <span class="fab-icon-wrapper">
                <i class="fa fa-gift" aria-hidden="true"></i>
            </span>
            `;

            document.body.appendChild(fabButtonTile);

            // Confetti on load
            setTimeout(() => launchConfetti(fabButtonTile), 2000);

            // Icon spin on hover
            fabButtonTile.addEventListener('mouseenter', () => {
                const icon = fabButtonTile.querySelector('.fab-icon-wrapper i:nth-of-type(1)');
                if (icon) icon.classList.add('spin-once');
            });

            // Reset icon class after animation
            fabButtonTile.addEventListener('animationend', (e) => {
                if (e.target.classList.contains('spin-once')) {
                    e.target.classList.remove('spin-once');
                }
            });

            // Active push-down effect on mouse down
            fabButtonTile.addEventListener('mousedown', () => {
                fabButtonTile.classList.add('active');
            });
            fabButtonTile.addEventListener('mouseup', () => {
                fabButtonTile.classList.remove('active');
            });
            fabButtonTile.addEventListener('mouseleave', () => {
                fabButtonTile.classList.remove('active');
            });

            // Click behavior
            fabButtonTile.addEventListener('click', (e) => {
                launchConfetti(fabButtonTile, e);
                setTimeout(() => {
                    window.open(bdayClubLink, '_blank');
                }, 1000);
            });

            // Touch handling (mobile)
            fabButtonTile.addEventListener('touchstart', () => {
                fabButtonTile.classList.add('active');
            }, {
                passive: true
            });
            fabButtonTile.addEventListener('touchend', (e) => {
                fabButtonTile.classList.remove('active');
                launchConfetti(fabButtonTile, e);
                setTimeout(() => {
                    window.open(bdayClubLink, '_blank');
                }, 1000);
            });
        }
    }

});