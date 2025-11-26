function iframeTMTpageInit() {

    var iframe_element = document.getElementById('pageIframe');
    var tmt_page = document.getElementById('tmtPage');

    function setIframeHeight(iframe_height, unit) {
        var loader = document.getElementById('loader');
        if (iframe_height) {
            iframe_element.style.height = iframe_height + unit;
            tmt_page.style.height = iframe_height + unit;
        } else {
            if (loader) {
                setTimeout(function(){
                    loader.style.display = "none";
                }, 400);
            }
        }
        setTimeout(function(){
            iframe_element.classList.remove("hide-iframe");
        }, 300);
    }

    function getNavigationHeight() {
        var nav_element = document.getElementById('navbar');
        var nav_height = nav_element.clientHeight;
        return nav_height;
    }

    setIframeHeight(false, 'vh');

    var current_location_url = window.location.href;
    // Get the window displayed in the iframe.
    var iframe = iframe_element.contentWindow;
    var iframe_content_padding_top = getNavigationHeight();

    var message_object = {
        locationURL: current_location_url,
        paddingTop: iframe_content_padding_top,
        resize: false
    };
    
    var is_mobile = false;
    
    iframe.postMessage(message_object, '*');

    // Listen to holla back
    window.addEventListener('message',function(event){
        if(event.data.detectDevice){
            is_mobile = event.data.isMobile
        }
        if(event.data.tmtPageHeight){
            var iframe_height_calc = event.data.tmtPageHeight;
            setIframeHeight(iframe_height_calc, 'px');
        }
        // Check if page should be scrolled to top
        if(event.data.tmtScrollTo){
            window.scrollTo({
                top: event.data.tmtScrollTo,
                behavior: "smooth"
            })
        }
    },false);

    function debounce(func){
        var timer;
        return function(event){
            if(timer) clearTimeout(timer);
            timer = setTimeout(func,200,event);
        };
    }
    window.addEventListener("resize",debounce(function(e){
        tmt_page.style.height = iframe_element.clientHeight + "px";
        // Reset iframe height
        if(!is_mobile){
            iframe_element.style.height = null; 
        }        
        message_object.paddingTop = getNavigationHeight();
        message_object.resize = true;
        iframe.postMessage(message_object, '*');
    }));

}