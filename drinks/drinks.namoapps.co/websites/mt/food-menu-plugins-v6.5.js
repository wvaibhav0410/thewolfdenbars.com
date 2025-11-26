function  newTemplateSeparateToMultipleFoodItems() {

    var foodItemElements = $('.food-item-holder');

        $(foodItemElements.get().reverse()).each(function (){

            var foodPrices = $(this).find('.food-price');
            var holder = $(this);

            if (foodPrices.length > 1) {

                $(foodPrices.get().reverse()).each(function (){
                    var $clone = holder.clone();
                    $clone.find('.food-price').remove();
                    $('<div class="food-price">'+$(this).text()+'</div>').insertBefore($clone.find('.food-item-description'));
                    var clone = $clone.html();
                    $('<div class="food-item-holder">'+clone+'</div>').insertAfter(holder.parents('.food-menu-content').children().first());
                });

                holder.addClass('hidden');
            }

        });
}

function newTemplateCreateShoppingCartButton() {

    var el = $('<button style="font-family: Arial, Helvetica, sans-serif;margin: 10px 10px 10px 0;float:left;" class="btn btn-primary add-to-cart">Add to cart</button>');

    //find where prices are present
    $('.food-item-holder').each(function (index ){

        var foodItemEl = $(this).find('.food-price');
        var foodSizeAndPrice = foodItemEl.text().split("/");
        var price = parseInt(foodSizeAndPrice[0].replace('$',''));

        if ($(this).find('.food-price').text() != '' && Number.isInteger(price)) {
            $(this).addClass('show-cart-button');
            $(this).attr('data-SH-position', index);
        }
    });
    //add btn
    $('.show-cart-button').append(el);
    //reload masonry
    $('.food-menu-grid').masonry();
}

function createRemoveFromCartButton(appendTo, parent) {
    var el = $(' <button style="font-family: Arial, Helvetica, sans-serif;margin: 10px -2px 10px 0;padding: 6px 10px;"  class="btn btn-default remove-from-cart">Remove from cart</button> ');
    if (parent) {
      appendTo.parent().append(el);
    } else {
       appendTo.append(el);
    }
}

function newTemplateAddToCart() {
    $('.add-to-cart').click(function () {
        if ($(this).parent('div:first').find('.remove-from-cart').length  < 1 ) {
            createRemoveFromCartButton($(this), true);
        }

        //find menu id
        var classList = $(this).parents('.food-menu-grid').attr('class').split(/\s+/);
        var menuId;

        $.each(classList, function(index, item) {
            if (item.includes('menu_')) {
                menuId = item.replace("menu_", "");
            }
        });

        var foodItemEl = $(this).parent('div:first').find('.food-price');
        var foodSizeAndPrice = foodItemEl.text().split("/");

        /* //if multimple prices shoud be used somewhere
        var foodItem = [];
        //push price and name to food item
       foodItemEl.each(function (){
            var menuItemPrice = $(this).text().split("/");
            menuItemPrice.length > 1 ? foodItem.foodSizes.push({ name: menuItemPrice[1] , price: menuItemPrice[0] }) : foodItem.foodSizes.push({ name: '' , price: menuItemPrice[0] });
        });*/

       // var cartItems = [];
       var foodItem = {
            menuId: menuId,
            menuName: $('.menu_'+menuId+'_link').text(),
            menuSection:  $(this).parents('.food-menu-grid-item-content').children().first().text(),
            menuItemName: $(this).parent('div:first').find('.food-item-title').text(),
            menuItemDescription: $(this).parent('div:first').find('.food-item-description').text(),
            menuItemPrice: (Math.round(foodSizeAndPrice[0].replace('$', '') * 100) / 100).toFixed(2),
            menuItemSize: foodSizeAndPrice[1] ? foodSizeAndPrice[1] : "",
            itemCount: 0,
            divPosition: $(this).parent('div:first').attr('data-sh-position'),
        };

        var cartItems = getShCartObject();

        if(cartItems.length == 0 && foodSizeAndPrice[0]) {
            cartItems.push(foodItem);
        }

        var itemExists = false;

        $.each(cartItems, function(index, item) {
            if (item.menuItemName == foodItem.menuItemName &&
                item.menuItemPrice == foodItem.menuItemPrice &&
                item.menuId == foodItem.menuId) {
                cartItems[index].itemCount = cartItems[index].itemCount + 1;
                itemExists = true;
            }
        });

        if (!itemExists && foodSizeAndPrice[0]) {
            foodItem.itemCount = foodItem.itemCount + 1;
            cartItems.push(foodItem);
        }

        //push food item to cartItems
        window.sessionStorage.setItem("SHcartItems", JSON.stringify(cartItems));

        newTemplateReloadCartItems()
        //reload masonry
        $('.food-menu-grid').masonry();
    });
}

function newTemplateRemoveFromCart() {

    $("body").on('click', '.remove-from-cart', function(){
        var cartItems = JSON.parse(window.sessionStorage.getItem("SHcartItems"));
        var parentPosition = $(this).parent('div:first').attr('data-sh-position');

        if (!parentPosition) {//sidebar click
            parentPosition = $(this).attr('data-sh-position');
            $(this).parents('.sh-sidebar-item').remove();
            $("div").find('[data-sh-position='+parentPosition+']').find('.remove-from-cart').remove();
        } else {
            $(this).remove();
        }

        $.each(cartItems, function(index, item) {

            if (typeof item !== "undefined") {
                if (parentPosition == item.divPosition) {
                    cartItems.splice(index, 1);
                }
            }
        });

        window.sessionStorage.setItem("SHcartItems", JSON.stringify(cartItems));

        newTemplateReloadCartItems();
    });
}

function newTemplateOnLoadRemoveFromCartButton() {

    var cartItems = JSON.parse(window.sessionStorage.getItem("SHcartItems")) || [];

    $('.show-cart-button').each(function (){
        var position = $(this).attr('data-sh-position');
        var parent = $(this);
        var menuTitle = $(this).find('.food-item-title').text();
        $.each(cartItems, function(index, item) {
            if (item.divPosition == position && item.menuItemName == menuTitle) {
                createRemoveFromCartButton(parent,false);
            }
        });
    });
}

function newTemplateCartSidebar() {

    var cartItems = getShCartObject();
    var total = 0;

    if ($(window).width() > 767) {

        if (cartItems.length > 0) {
            //hide corona sidebar
            if(!$('#corona-instructions-sidebar').hasClass('hidden'))
                $('#corona-instructions-sidebar').addClass('hidden');
            // a bit hacky approach
            $("#sh-shopping-cart-sidebar").remove();

            var marginTop = $('.navbar-fixed-top').height() + 50;
            var maxWidth = '450px';
            //create sidebar holder
            $('.food-menu-page').append('<div id="sh-shopping-cart-sidebar" class="container" style="position:fixed;top:'+marginTop+'px;right:0;background-color:#fff;padding:15px;text-align:center;color:#000;text-transform:uppercase;border: 1px solid #eee;z-index:9999;max-width:'+maxWidth+'"><div class="col-md-12 col-sm-12"><h3 style="font-family:Arial, Helvetica, sans-serif;" class="pull-left">Your Order:</h3><button style="background: none;border: none;color:#000;text-decoration:underline;" class="pull-right sh-toggle-cart">Hide Cart</button></div><div class="sh-sidebar-items" style="max-height: 170px;overflow: auto;margin: 4px 4px;padding: 4px;"></div></div>');

            $.each(cartItems, function(index, item) {

                var itemName = item.menuItemSize ? item.menuItemName +' / '+ item.menuItemSize : item.menuItemName;
                //cart items
                $('.sh-sidebar-items').append('<div class="sh-sidebar-item"><div class="col-md-8 col-sm-8"><strong style="font-family:Arial, Helvetica, sans-serif;position:absolute;left:2px;margin-right:3px;">'+item.itemCount+'</strong> <p class="pull-left" style="font-family:Arial, Helvetica, sans-serif;margin:0 3px 5px;font-size:1em;text-align: left;">'+itemName+'</p></div><div class="col-md-4 col-sm-4 pull-right"><span style="font-family:Arial, Helvetica, sans-serif;margin:0 2px 5px;font-size:1em;">$ '+item.menuItemPrice+'</span> <span  class="remove-from-cart" data-sh-position="'+item.divPosition+'"><i style="color:#000;cursor:pointer;margin:2px 0" class="fa fa-trash pull-right" aria-hidden="true"></i></span></div></div>');
                total += item.itemCount * item.menuItemPrice;
            });
            //total and checkout button
            $('#sh-shopping-cart-sidebar').append('<div class="col-md-8 col-sm-9"  style="padding-top:10px;"><p class="pull-left" style="font-family:Arial, Helvetica, sans-serif;margin:0 0 5px;font-size:1em;">Total:</p></div><div class="col-md-4 col-sm-3" style="font-family:Arial, Helvetica, sans-serif;padding-top:10px;"><p style="margin:0 0 5px;font-size:1em;">$ '+total.toFixed(2)+'</p></div><div class="col-md-12 col-sm-12"><a style="font-family:Arial, Helvetica, sans-serif;" class="btn btn-success sh-checkout">Proceed to checkout</a></div>');

        }
        if (!cartItems.length) {
            $("#sh-shopping-cart-sidebar").remove();
            $('#corona-instructions-sidebar').removeClass('hidden');
        }

        if(isShCartMinimized() == 1)
            $('#sh-shopping-cart-sidebar').addClass('hidden');

    } else {
            if($('#sh-cart-mobile').length) {
                newTemplateFooterCart();
            }else {
                var waitForCTA = setInterval(function(){
                    if ($('#bottom-navbar').hasClass('show-bottom-nav')) {  // wait for CTA
                        newTemplateFooterCart();
                        clearInterval(waitForCTA);
                    }
                }, 300);
            }
    }
}

function newTemplateFooterCart() {

    var cartItems = getShCartObject();
    var bottom = $('#bottom-navbar').height();
    var total = getShTotalItems();

    $("#sh-cart-mobile").remove();

    if (cartItems.length > 0) {
        var itemsInOrder = total > 1 ? total +' items in order' : total +' item in order';

        $('<div id="sh-cart-mobile" style="position:fixed;bottom:'+bottom+'px;background-color:#5cb85c;width:100%;color:#fff;"><span style="float: left;padding: 5px 5px 5px 10px;line-height: 3;font-size:1.2em">'+itemsInOrder+'</span><a href="#" style="font-family:Arial, Helvetica, sans-serif;float:right;margin: 11px;color:#5cb85c;font-size:1.1em;font-weight:bold;" class="btn btn-default sh-checkout">Proceed to checkout</a></div>').insertBefore('#bottom-navbar');
           newTemplateHandleSmallDevices();
    }
}

function newTemplateCartSidebarMinimized() {
    if ($(window).width() > 767) {
        var marginTop = $('.navbar-fixed-top').height() + 50;
        var maxWidth = '25%';
        var total = getShTotalItems();

        if($('#sh-cart-icon-holder').length){
            if ($('#sh-shopping-cart-sidebar').hasClass('hidden')) {
                $('#sh-cart-icon-holder').removeClass('hidden');
            }

            $('.sh-minimized-item-count').text(total);

        } else {
            $('.food-menu-page').append('<div id="sh-cart-icon-holder" class="hidden" style="position:fixed;top:'+marginTop+'px;right:15px;background-color:#5cb85c;width:100px;text-align:center;border-radius:10px;border:2px solid #fff;padding-top: 20px;padding-bottom: 3px;" class="sh-cart-icon"><span class="sh-minimized-item-count" style="font-family:Arial, Helvetica, sans-serif;background-color:#fff;color:#5cb85c;padding:0;margin:0;border-radius:100%;right: 13px;position: absolute;top: 8px;height: 20px;width: 20px;">'+total+'</span><button style="background: none;border: none;font-family:Arial, Helvetica, sans-serif;color:#fff;"  class="sh-toggle-cart"><img height="30px" width="30px" src="https://spothopper-static.s3.amazonaws.com/websites/mt/shopping_cart.png" alt="sh shopping" /><br />View Cart</button></div>');
            if(isShCartMinimized() == 1)
                $('#sh-cart-icon-holder').removeClass('hidden');
        }
        if (total == 0)
                $('#sh-cart-icon-holder').addClass('hidden');
    }
}

function getShTotalItems() {

    var cartItems = getShCartObject();
    if (cartItems.length) {
        var itemCount = cartItems.map(function (item) {
            return item.itemCount;
        }, 0)

        var total = itemCount.reduce(function(accumulator, currentValue) {
          return accumulator + currentValue;
        })

        return total;
    } else {
        return 0;
    }
}

function getShCartObject() {
    return JSON.parse(sessionStorage.getItem("SHcartItems")) || [];
}

function isShCartMinimized() {
    return sessionStorage.getItem("SHcartMinimized") || 0;
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
}

function newTemplateHandleSmallDevices() {
    if($(window).width() <= 320){
        var padding = "6px 6px";
        var fontSize = "1em";

        $('#sh-cart-mobile').find('span').css('font-size', fontSize);
        $('#sh-cart-mobile').find('a').css('font-size', fontSize);
        $('.add-to-cart').css('padding', padding);
        $('.add-to-cart').css('margin', '10px 4px 10px 0');
        $('.remove-from-cart').css('padding', padding);

    }
}

$("body").on('click', '.sh-toggle-cart', function(){
    if (!$('#sh-shopping-cart-sidebar').hasClass('hidden')) {
        window.sessionStorage.setItem("SHcartMinimized", 1);
        $('#sh-shopping-cart-sidebar').addClass('hidden');
        $('#sh-cart-icon-holder').removeClass('hidden');
    } else{
        window.sessionStorage.setItem("SHcartMinimized", 0);
        $('#sh-shopping-cart-sidebar').removeClass('hidden');
        $('#sh-cart-icon-holder').addClass('hidden');
    }
});

function newTemplateShowCartOnResize(){
    $(window).on('resize', function(){

            var win = $(this); //this = window
            if (win.width() <= 767) {
                newTemplateHandleSmallDevices();
                $('#sh-shopping-cart-sidebar').addClass('hidden');
                $('#sh-cart-icon-holder').addClass('hidden');
                if ($('#sh-cart-mobile').length) {
                    $('#sh-cart-mobile').removeClass('hidden');
                } else {
                    newTemplateFooterCart();
                }
            }else {
                if ($('#sh-shopping-cart-sidebar').length) {
                    if(isShCartMinimized() == 1) {
                        $('#sh-cart-icon-holder').removeClass('hidden');
                    } else {
                        $('#sh-shopping-cart-sidebar').removeClass('hidden');
                    }
                }else {
                    newTemplateCartSidebar();
                }

                $('#sh-cart-mobile').addClass('hidden');
            }
            //somekind of debounce
            clearTimeout(resizeTimer);
            var resizeTimer = setTimeout(function() {
                newTemplateReloadCartItems();
        }, 400);
    });
}

function newTemplateReloadCartItems(){
    var total = getShTotalItems();
    var cartItems = getShCartObject();
    $('.sh-minimized-item-count').text(total);
    var itemsInOrder = total > 1 ? total +' items in order' : total +' item in order';
    $('#sh-cart-mobile').find('span').text(itemsInOrder);
    $('.sh-sidebar-items').empty();

    //reload whole component
    newTemplateCartSidebar();

    if(!cartItems.length) {
        $('#sh-cart-mobile').remove();
        $('#sh-cart-icon-holder').addClass('hidden');
    }else {
        newTemplateCartSidebar();
        newTemplateCartSidebarMinimized();
    }
}

function newTemplateShOrderStatus(){
    if (getUrlParameter('order_status')) {
        return "Your order has been processed."
    }
}

function newTemplateSetOrderCode(orderCode){

    var cartItems = getShCartObject();
    cartItems.forEach(function(val, index,) {
       val.orderCode = orderCode;
    });
    window.sessionStorage.setItem("SHcartItems", JSON.stringify(cartItems));
}

function newTemplateShDeleteCartOrder(){
    var orderCode = getUrlParameter('order_code');
    var statusCode = getUrlParameter('order_status');

    if (statusCode == 'completed' || statusCode == 'out_of_hours') {
        var cartItems = getShCartObject();
        cartItems.forEach(function(val, index,) {
            if (val.orderCode == orderCode) {
                sessionStorage.removeItem("SHcartItems");
                newTemplateReloadCartItems();
                newTemplateShShowMessage();
                $('.remove-from-cart').remove();
            }
        });


    }
}

function newTemplateShShowMessage(){
    if (getUrlParameter('order_status') && !getShCartObject().length) {
        var orderStatus = getUrlParameter('order_status');
        if (orderStatus == 'completed') {
            var orderInquiry = getUrlParameter('order_inquiry');
            var orderCode = getUrlParameter('order_code');
            var shMessageHeading = 'YOUR ORDER HAS BEEN RECEIVED!';
            var phoneText = '';
            if (typeof order_config !== "undefined") {
               if (order_config && order_config.contact_phone_for_orders && order_config.contact_phone_for_orders != '') {
                    var phoneText = '<p style="color:#000;font-size: 1.2em;font-family: Arial, Helvetica, sans-serif;">If you have any questions you can call us at  <a style="color:#337ab7;" href="tel:+1'+order_config.contact_phone_for_orders+'">' + shFormatNumber(order_config.contact_phone_for_orders) + '</a></p>';
                }
            }
            var shMessageBody = '<p style="color:#000;font-size: 1.2em;font-family: Arial, Helvetica, sans-serif;">Your order number is #'+orderInquiry+'</p><p style="color:#000;font-size: 1.2em;font-family: Arial, Helvetica, sans-serif;"> <a style="color:#337ab7;" href="'+shUrl+'/orders/'+orderCode+'/details" >Click here for your order status</a> </p> '+phoneText+'  <p style="color:#000;font-size: 1.2em;font-family: Arial, Helvetica, sans-serif;" >Thank you!</p>';
        }
        if (shMessageHeading && shMessageBody) {
            var shModal = '<div style="z-index:9999;" class="modal fade" id="shCartMessage" role="dialog"> <div class="modal-dialog"><div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal">&times;</button> <h4 style="color:#000;font-size: 1.3em;font-family: Arial, Helvetica, sans-serif;" class="modal-title text-center">'+shMessageHeading+'</h4> </div> <div class="modal-body text-center"> '+shMessageBody+' </div><div class="modal-footer"> <button style="font-size: 14px;font-family: Arial, Helvetica, sans-serif;" type="button" class="btn btn-success" data-dismiss="modal">Close</button> </div> </div> </div> </div>';
            $('.food-menu-page').append(shModal);

            $('#shCartMessage').modal('show');

        }
    }
}


function renameShCartKey(obj, old_key, new_key) {
    if (old_key !== new_key) {
        Object.defineProperty(obj, new_key,
        Object.getOwnPropertyDescriptor(obj, old_key));
        delete obj[old_key];
    }
}

function transformShCartObject(cartItems){
    //rename keys
    cartItems.forEach(function(val, index) {
        renameShCartKey(val, 'menuItemPrice', 'menu_item_cents');
        renameShCartKey(val, 'menuId', 'menu_id');
        renameShCartKey(val, 'menuName', 'menu_name');
        renameShCartKey(val, 'menuSection', 'menu_section');
        renameShCartKey(val, 'menuItemName', 'menu_item_name');
        renameShCartKey(val, 'menuItemDescription', 'menu_item_description');
        renameShCartKey(val, 'menuItemSize', 'menu_item_size');
        renameShCartKey(val, 'itemCount', 'item_count');
    });
    //price to cents
    cartItems.forEach(function(val, index) {
        val.menu_item_cents = val.menu_item_cents * 100;
    });

    return cartItems;
}

function ShCreateOrUpdateOrder(url) {

    var cartItems = transformShCartObject(getShCartObject());

    var order = {
        domain: window.location.host,
        source_url: window.location.href.split(/[?#]/)[0],
        order_items: cartItems,
        sh_url_params: window.sessionStorage.getItem("shUrlParams")
    }

    if (cartItems[0].orderCode) {
        order.order_code = cartItems[0].orderCode;
    }

    $.ajax({
        url: url +'/api/orders/create_or_update_order',
        crossDomain: true,
        type: 'POST',
        beforeSend: function(xhr){xhr.setRequestHeader('Content-Type', 'text/plain'); },
        contentType: 'application/json',
        data: JSON.stringify(order),
        dataType: 'json',

    }).done(function(data) {
        newTemplateSetOrderCode(data.order_code)
        ga('send', 'event', {
                eventCategory: 'Website Proceed To Checkout',
                eventAction: 'Click',
                eventLabel: data.order_code,
                transport: 'beacon'
        });
        window.location.href = url + '/orders/' + data.order_code;
    })
    .fail(function(error) {
        console.log(error)
    });
}

function newTemplateShProceedToCheckout(url){
  $("body").on('click', '.sh-checkout', function(){
    $(this).addClass('disabled');
    ShCreateOrUpdateOrder(url);
  });
}

function initializeShCart(url) {
  if (getUrlParameter('cart_disabled') == 'true' || getUrlParameter('contactless')  == 'true') { return }
  if ($('.food-menu-nav').length) { // check is it a new template
      newTemplateSeparateToMultipleFoodItems();
      newTemplateCreateShoppingCartButton();
      newTemplateOnLoadRemoveFromCartButton();
      newTemplateAddToCart();
      newTemplateRemoveFromCart();
      newTemplateCartSidebar();
      newTemplateCartSidebarMinimized();
      newTemplateShowCartOnResize();
      newTemplateHandleSmallDevices();
      newTemplateShDeleteCartOrder();
      newTemplateShProceedToCheckout(url);
  }
}

function shFormatNumber(phoneNumberString) {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ')-' + match[2] + '-' + match[3];
    }
    return null;
}


$( document ).ready(function() {
    if (window.location.host.includes("localhost")) {
        window.shUrl = "http://localhost:3001";
        setTimeout(function(){
            initializeShCart(shUrl);
        }, 300);
    }else {
        window.shUrl = "https://www.spothopperapp.com";
        setTimeout(function(){
                if (order_config) {
                    var shParams = JSON.parse(window.sessionStorage.getItem('shUrlParams'));
                    if (shParams.mt_test_mode == 'true' || order_config.shopping_cart == true && order_config['shopping_cart_type'] != "TMT") {
                        initializeShCart(shUrl);
                    }
                }
        }, 300);
  }
});

