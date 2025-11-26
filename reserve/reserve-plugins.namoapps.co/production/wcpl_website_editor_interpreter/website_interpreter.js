// Website Interpreter START
document.addEventListener('DOMContentLoaded', function() {
    /////// 
    // Website Changes Log Interpreter START
    function runChangesLogInterpreter() {
        
        // Console log will be visible if string "?interpreter=on" is added in the URL
        const interpreterOn = window.location.href.toLowerCase().includes('?interpreter=on');

        // Get Changes Log array (changes_log_array var from WCache)
        if (typeof changes_log_array === 'undefined' || !changes_log_array || changes_log_array === null || changes_log_array.length === 0) {
            changes_log_array = [];
        }

        var contentLogSavedArray;
        var styleLogSavedArray;

        if(Array.isArray(changes_log_array)) {
            contentLogSavedArray = changes_log_array;
            styleLogSavedArray = [];
        } else {
            contentLogSavedArray = changes_log_array.content_log || [];
            styleLogSavedArray = changes_log_array.style_log || [];
        }

        // Create custom event which will Edit mode listen to
        const eventEditor = new CustomEvent("PostInterpreter");

        // Workaround to restore background value set on old template version
        applyOriginalBackground('custom.css', '.contact-v3::before', '.contact-v3');

        // Empty Changes Log
        if ((!contentLogSavedArray || contentLogSavedArray.length === 0) && (!styleLogSavedArray || styleLogSavedArray.length === 0)) {
            // Dispatch/Trigger/Fire the event
            document.dispatchEvent(eventEditor);
            if (interpreterOn) {
                console.log("<-------- Changes Log interpreter Done -------->");
                console.log("Changes Log is empty");
            }
            return;
        }

        // Restore original background value
        function getOriginalBackgroundFromStylesheet(sheetName, originalSelector) {
            for (const sheet of document.styleSheets) {
                if (sheet.href && sheet.href.includes(sheetName)) {
                    try {
                        for (const rule of sheet.cssRules) {
                            if (rule.selectorText === originalSelector) {
                                return rule.style.getPropertyValue('background') || null;
                            }
                        }
                    } catch (e) {
                        console.warn("Cannot access stylesheet due to CORS restrictions:", e);
                    }
                }
            }
            return null; // Return null if no match is found
        }
        function applyOriginalBackground(sheetName, originalSelector, targetSelector) {
            const targetElement = document.querySelector(targetSelector);
            if (!targetElement) {
                return;
            }

            let originalBackground = getOriginalBackgroundFromStylesheet(sheetName, originalSelector);
        
            // Return early if originalBackground is null or 'none'
            if (!originalBackground || originalBackground.trim().toLowerCase() === 'none') {
                return;
            }
        
            targetElement.style.backgroundColor = originalBackground;
        }
        
        let log = {
            style: 'color: #000; font-size: 12px; padding: 3px 10px 3px 5px; border-radius: 10px;',
            style_box: 'color: #fff; font-size: 12px; padding: 3px 15px 2px 10px; border: 1px solid #fff;',
            info: (msg) => {
                console.log(`%c✅ ${msg}`, `background: #dff7e9; ${log.style}`);
            },
            warn: (msg) => {
                console.log(`%c⚠️ ${msg}`, `background: #ffd092; ${log.style}`);
            },
            success: (msg) => {
                console.log(`%cℹ️ ${msg}`, `background: #fcf4d2; ${log.style}`);
            },
            error: (msg) => {
                console.log(`%c❌ ${msg}`, `background: #fecace; ${log.style}`);
            },
            section: (msg) => {
                console.log(`%c📌 ${msg}`, `background: #fcf4d2; color: #000; font-size: 12px; padding: 3px 10px 3px 5px;`);
            },
            content_info: (msg) => {
                console.log(`%c📝 ${msg}`, `background: #3e3e3e; ${log.style_box}`);
            },
            style_info: (msg) => {
                console.log(`%c🎨 ${msg}`, `background: #3e3e3e; ${log.style_box}`);
            }
        };

        const elementChangeResolver = {
            'text' : {
                'link_change': function(element, elementData) {
                    let initialData = element.getAttribute('href');
                    if (initialData !== elementData) {
                        if (elementData.startsWith('/')) {
                            elementData = appendDomainParamIfNeeded(elementData);
                        }
                        element.setAttribute('href', elementData);
                        return ['success', 'link changed'];
                    }
                    return ['no_action', 'link change'];
                },
                'content_change': function(element, elementData) {
                    let initialData = element.textContent.replace(/\s*(\r?\n|\r)\s*/g, '').replace(/\s{2,}/g, ' ').trim();
                    let elementDataHelper = extractTextContentFromHTML(elementData);
                    // No change detected
                    if (initialData === elementDataHelper) {
                        return ['no_action', 'text change'];
                    }
                    // If element is empty and '*' character is injected, mark element as no change detected
                    if (initialData === '*' && elementDataHelper === '' && element.classList.contains('editor-empty-element')) {
                        return ['no_action', 'text change', '\nℹ️*editor-empty-element -> This element is empty, the * character is injected'];
                    }
                    // If element is empty, mark element as empty and show that '*' character needs to be injected
                    if (!elementData) {
                        element.classList.add('editor-empty-element');
                        element.innerHTML = '*';
                        return ['success', 'text changed', '\n*editor-empty-element -> This element is empty, the * character needs to be injected'];
                    }
                    // Otherwise, update content normally and show that the change is detected for the element
                    element.classList.remove('editor-empty-element');
                    element.innerHTML = elementData;
                    return ['success', 'text changed'];
                }
            },
            'background_image': {
                'content_change': function(element, elementData) {
                    let initialData = element.style.backgroundImage;
                    let initialDataHelper = extractUrlFromString(initialData);
                    if (initialDataHelper !== elementData) {
                        element.style.backgroundImage = `url('${elementData}')`;
                        return ['success', 'image changed (CSS background-image)'];
                    }
                    return ['no_action', 'image changed (CSS background-image)'];
                }
            },
            'image': {
                'content_change': function(element, elementData) {
                    let initialData = element.getAttribute('src');
                    if (initialData !== elementData) {
                        element.setAttribute('src', elementData);
                        return ['success', 'image changed (HTML img tag)'];
                    }
                    return ['no_action', 'image change (HTML img tag)'];
                }
            },
            'section': {
                'section_hide': function(element, elementData) {
                    let initialData = element.getAttribute('data-hidden');
                    if (initialData !== elementData) {
                        element.classList.add('hide-show-section');
                        element.setAttribute('data-hidden', elementData);
                        const isHidden = elementData === 'yes';
                        return ['success', `section changed: ${isHidden ? 'hidden' : 'shown'}`];
                    }
                    return ['no_action', 'section change'];
                }
            }
        }

        // Helper function to modify internal links as WCache does
        function appendDomainParamIfNeeded(str) {
            const origin = window.location.origin;
        
            // Check if the origin contains "website-editor" or "wcache"
            if (origin.includes("website-editor") || origin.includes("wcache")) {
                const urlParams = new URLSearchParams(window.location.search);
                const domainParam = urlParams.get('domain');
        
                // If the domain parameter exists, append it to the string
                if (domainParam) {
                    return `${str}?domain=${domainParam}`;
                }
            }
        
            // Return the original string if no conditions are met
            return str;
        }

        // Helper functions for text cleaning
        function extractTextContentFromHTML(htmlString) {
            // Create a temporary DOM element
            const tempElement = document.createElement('div');
            tempElement.innerHTML = htmlString;
        
            // Get the text content from the element
            return tempElement.textContent.replace(/\s{2,}/g, ' ').trim();
        }
        function extractUrlFromString(input) {
            return input.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        }

        function applyChangeToElement(element, elementType, actionType, elementData) {

            if (!element) {
                return ['not_found', ''];
            }
        
            try {
                const result = elementChangeResolver[elementType][actionType](element, elementData);
                return result;

            } catch (err) {
                return ['error', ''];
            }
        
        }

        function getElementByPath(js_path) {
            try {
                // Attempt to query the element using the js_path
                const element = document.querySelector(js_path);
                if (element) return element;
        
                // Handle the special case for elements with "a#"
                if (js_path.startsWith('a#')) {
                    const elementOrgID = js_path.substring(2);
                    return document.getElementById(elementOrgID);
                }
            } catch (error) {
                // Fallback in case of syntax error and "a#" pattern
                if (error.name === 'SyntaxError' && js_path.startsWith('a#')) {
                    const elementOrgID = js_path.substring(2);
                    return document.getElementById(elementOrgID);
                }
                // Rethrow if the error is not related to the special case
                throw error;
            }
            return null;
        }

        function getAdditionalChangeInfo(elementID, elementPath, elementType, elementTag) {
            if (elementType === 'section') {
                return `${elementTag} ${elementID}`;
            }

            if (elementPath.startsWith('a#')) {
                return `${elementTag} in ${elementPath}`;
            }

            const delimiterIndex = elementPath.indexOf(' >');
            if (delimiterIndex !== -1) {
                return `${elementTag} in ${elementPath.substring(0, delimiterIndex)}`;
            }

            return `${elementTag} ${elementPath}`;
        }

        // Apply Content log changes
        function applyContentLogChanges(pageBodyClass) {

            if (interpreterOn) {
                log.content_info(`Content Log -------->>`);
                console.log(contentLogSavedArray);
            }

            contentLogSavedArray.forEach((changeObj, index) => {
                const { id, js_path, action_type, element_type, tag_name, data_change, body_class, common_element } = changeObj;

                const sanitizedPageBodyClass = pageBodyClass.replace(/\.custom-style/g, '');
                const sanitizedBodyClass = body_class.replace(/\.custom-style/g, '');
    
                // Skip if element is not from that page and it's not common element (all pages el)
                if (!sanitizedPageBodyClass.includes(sanitizedBodyClass) && !common_element) return;
        
                let element, result;
                try {
                    element = getElementByPath(js_path);
                    result = applyChangeToElement(element, element_type, action_type, data_change);
                } catch (error) {
                    result = ['error', error.message];
                }
        
                if (!interpreterOn) return;

                let additionalInfo = getAdditionalChangeInfo(id, js_path, element_type, tag_name);
        
                const logMessage = `CL_${index} `;
                switch (result[0]) {
                    case 'success':
                        log.success(`${logMessage}Interpreter ${result[1]} ${additionalInfo} ${result[2] ? result[2] : ''}`);
                        break;
                    case 'no_action':
                        log.info(`${logMessage}No Action for ${result[1]} ${additionalInfo} ${result[2] ? result[2] : ''}`);                   
                        break;
                    case 'not_found':
                        log.error(`${logMessage}Element not found ${result[1]} JSpath: ${js_path}`);
                        break;
                    case 'error':
                    default:
                        log.error(`${logMessage}Error ${result[1]}`);
                        break;
                }
            });
        }
        // Apply Style Log changes
        function applyStyleLogChanges(pageBodyClass) {
            if (interpreterOn) {
                log.style_info(`Style Log -------->>`);
                console.log(styleLogSavedArray);
            }

            const sanitizedPageBodyClass = pageBodyClass.replace(/\.custom-style/g, '');
        
            styleLogSavedArray.forEach(({ id, style, body_class }) => {
                const sanitizedBodyClass = body_class.replace(/\.custom-style/g, '');
                if (!sanitizedPageBodyClass.includes(sanitizedBodyClass)) return;
        
                const cleanedStyle = style.replace(/\s{3,}/g, ' ').trim();
                $('head').append(`<style data-saved-style-target="${id}">${cleanedStyle}</style>`);
            });
        
            // Set specific CSS classes to body indicating that page has custom style (needed for background filter apply)
            document.body.classList.add('custom-style');

            if (interpreterOn) {
                const styleString = getIdStringFromArray(styleLogSavedArray);
                log.section(`Changes in sections:\n${styleString}`);
            }
        }
        function getIdStringFromArray(styleLogSavedArray) {
            return styleLogSavedArray
                .map(obj => `${obj.id}`) // Extract `id` and format it
                .join('\n'); // Join with new lines
        }

        ///////
        // Apply Changes Log
        var interpreterPageBodyClass = document.body.classList.value.trim().replace(/\s+/g, '.');
        const applyLogChanges = (array, applyFunction) => {
            if (array.length) {
                applyFunction(interpreterPageBodyClass);
            }
        };
        
        function setEditorChanges() {
            if (interpreterOn) {
                console.log("<-------- Changes Log interpreter start -------->");
            }
        
            // Apply changes if there's data to process
            [ 
                [contentLogSavedArray, applyContentLogChanges], 
                [styleLogSavedArray, applyStyleLogChanges] 
            ].forEach(([array, applyFunction]) => applyLogChanges(array, applyFunction));
        
            if (interpreterOn) {
                console.log("<-------- Changes Log interpreter end -------->");
            }
        }

        function reInitializeOwlCarousel(owlCarouselHolderID) {
            var owlElement = $(`${owlCarouselHolderID} .owl-carousel`);
            
            if(!owlElement) return;
            
            // Check if Owl Carousel is initialized
            if (owlElement.data('owl.carousel')) {
                // Retrieve the current options
                var currentOptions = owlElement.data('owl.carousel').options;
                
                // Destroy the existing carousel
                owlElement.trigger('destroy.owl.carousel');
                
                // Update the options for mouseDrag and touchDrag
                var newOptions = $.extend({}, currentOptions, {
                    loop: false,
                    dots: true,
                    dotsContainer: false
                });
                
                // Reinitialize the carousel with the updated options
                owlElement.owlCarousel(newOptions);
            }
        }  
        
        function checkElementChanges(sectionID, elementClass) {
            var element = $(sectionID);

            if (elementClass) {
               element = $(`${sectionID} ${elementClass}`);
            }
                     
            // Check if element exists
            if (!element.length) {
                return false;
            }
        
            // Check if any element in contentLogSavedArray has js_path that includes sectionID (e.g., 'div#reviews_v2')
            const hasItemChanges = contentLogSavedArray.some(changeObj =>
                changeObj.js_path.toLowerCase().includes(sectionID)
            );
        
            // Check if any element in contentLogSavedArray has id that includes sectionID substring (e.g., 'section_id_reviews_v2')
            const hasHolderChanges = contentLogSavedArray.some(changeObj =>
                changeObj.id.toLowerCase().includes(sectionID.substring(1))
            );
        
            // Return true if there are item changes or holder changes
            if (hasItemChanges || hasHolderChanges) {
                return true;
            } else {
                return false;
            }
        }  
        
        // ReInitialize Owl carousel if exist. Important so Change log could be applied properly
        var runOwlCarouselReviewsReInit = checkElementChanges('#reviews_v2', '.owl-carousel');
        if (runOwlCarouselReviewsReInit) {
            reInitializeOwlCarousel('#reviews_v2');
        }

        setEditorChanges();

        function resizeAboutUs(sectionID) {
            const textHolder = $(`${sectionID} .about-us-v7-content .text-content`)
            if (!textHolder.length) return;

            const textHeight = textHolder.outerHeight(true);
            if (window.innerWidth < 768) {
                $('.about-us-v7-content:nth-of-type(2)', sectionID).css('min-height', `${textHeight}px`);
            } else {
                $('.about-us-v7-content', sectionID).css('height', `${textHeight}px`);
            }
        }

        var runAboutUsResize = checkElementChanges('#aboutus_v7');
        if (runAboutUsResize) {
            resizeAboutUs('#aboutus_v7');
        }

        if (contentLogSavedArray.length !== 0 || styleLogSavedArray.length !== 0) {
            // Dispatch/Trigger/Fire the event
            document.dispatchEvent(eventEditor);
        } 
    }

    runChangesLogInterpreter();
    /////// Website Changes Log Interpreter END
});