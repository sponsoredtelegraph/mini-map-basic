
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        'use strict';
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            FNOP = function () {},
            fBound = function () {
                return fToBind.apply(
                    this instanceof FNOP && oThis ? this : oThis,
                   aArgs.concat(Array.prototype.slice.call(arguments))
               );
            };

        FNOP.prototype = this.prototype;
        fBound.prototype = new FNOP();

        return fBound;
    };
}


(function () {
    'use strict';
    var ObjectProto = Object.prototype,
    defineGetter = ObjectProto.__defineGetter__,
    defineSetter = ObjectProto.__defineSetter__,
    lookupGetter = ObjectProto.__lookupGetter__,
    lookupSetter = ObjectProto.__lookupSetter__,
    hasOwnProp = ObjectProto.hasOwnProperty;

    if (defineGetter && defineSetter && lookupGetter && lookupSetter) {

        if (!Object.defineProperty) {

            Object.defineProperty = function (obj, prop, descriptor) {

                if (arguments.length < 3) { // all arguments required
                    throw new TypeError("Arguments not optional");
                }

                prop += ""; // convert prop to string 

                if (hasOwnProp.call(descriptor, "value")) {
                    if (!lookupGetter.call(obj, prop) && !lookupSetter.call(obj, prop)) {
                        // data property defined and no pre-existing accessors
                        obj[prop] = descriptor.value;
                    }

                    if ((hasOwnProp.call(descriptor, "get") ||
                         hasOwnProp.call(descriptor, "set")))
                    {
                        // descriptor has a value prop but accessor already exists
                        throw new TypeError("Cannot specify an accessor and a value");
                    }
                }

                // can't switch off these features in ECMAScript 3
                // so throw a TypeError if any are false
                if (!(descriptor.writable && descriptor.enumerable &&
                    descriptor.configurable))
                {
                    throw new TypeError(
                        "This implementation of Object.defineProperty does not support" +
                        " false for configurable, enumerable, or writable."
                    );
                }

                if (descriptor.get) {
                    defineGetter.call(obj, prop, descriptor.get);
                }
                if (descriptor.set) {
                    defineSetter.call(obj, prop, descriptor.set);
                }

                return obj;
            };
        }

        if (!Object.getOwnPropertyDescriptor) {
            Object.getOwnPropertyDescriptor = function (obj, prop) {
                if (arguments.length < 2) { // all arguments required
                    throw new TypeError("Arguments not optional.");
                }

                prop += ""; // convert prop to string

                var descriptor = {
                    configurable: true,
                    enumerable  : true,
                    writable    : true
                },
                getter = lookupGetter.call(obj, prop),
                setter = lookupSetter.call(obj, prop);

                if (!hasOwnProp.call(obj, prop)) {
                    // property doesn't exist or is inherited
                    return descriptor;
                }
                if (!getter && !setter) { // not an accessor so return prop
                    descriptor.value = obj[prop];
                    return descriptor;
                }

                // there is an accessor, remove descriptor.writable;
                // populate descriptor.get and descriptor.set (IE's behavior)
                delete descriptor.writable;
                descriptor.get = descriptor.set = undefined;

                if (getter) {
                    descriptor.get = getter;
                }
                if (setter) {
                    descriptor.set = setter;
                }

                return descriptor;
            };
        }

        if (!Object.defineProperties) {
            Object.defineProperties = function (obj, props) {
                var prop;
                for (prop in props) {
                    if (hasOwnProp.call(props, prop)) {
                        Object.defineProperty(obj, prop, props[prop]);
                    }
                }
            };
        }
    }
}());

// Begin dataset code

if (!document.documentElement.dataset &&
         // FF is empty while IE gives empty object
        (!Object.getOwnPropertyDescriptor(Element.prototype, 'dataset')  ||
        !Object.getOwnPropertyDescriptor(Element.prototype, 'dataset').get)
    ) {
    var propDescriptor = {
        enumerable: true,
        get: function () {
            'use strict';
            var i,
                that = this,
                HTML5_DOMStringMap,
                attrVal, attrName, propName,
                attribute,
                attributes = this.attributes,
                attsLength = attributes.length,
                toUpperCase = function (n0) {
                    return n0.charAt(1).toUpperCase();
                },
                getter = function () {
                    return this;
                },
                setter = function (attrName, value) {
                    return (typeof value !== 'undefined') ?
                        this.setAttribute(attrName, value) :
                        this.removeAttribute(attrName);
                };
            try { // Simulate DOMStringMap w/accessor support
                // Test setting accessor on normal object
                ({}).__defineGetter__('test', function () {});
                HTML5_DOMStringMap = {};
            }
            catch (e1) { // Use a DOM object for IE8
                HTML5_DOMStringMap = document.createElement('div');
            }
            for (i = 0; i < attsLength; i++) {
                attribute = attributes[i];
                // Fix: This test really should allow any XML Name without
                //         colons (and non-uppercase for XHTML)
                if (attribute && attribute.name &&
                    (/^data-\w[\w\-]*$/).test(attribute.name)) {
                    attrVal = attribute.value;
                    attrName = attribute.name;
                    // Change to CamelCase
                    propName = attrName.substr(5).replace(/-./g, toUpperCase);
                    try {
                        Object.defineProperty(HTML5_DOMStringMap, propName, {
                            enumerable: this.enumerable,
                            get: getter.bind(attrVal || ''),
                            set: setter.bind(that, attrName)
                        });
                    }
                    catch (e2) { // if accessors are not working
                        HTML5_DOMStringMap[propName] = attrVal;
                    }
                }
            }
            return HTML5_DOMStringMap;
        }
    };
    try {
        // FF enumerates over element's dataset, but not
        //   Element.prototype.dataset; IE9 iterates over both
        Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
    } catch (e) {
        propDescriptor.enumerable = false; // IE8 does not allow setting to true
        Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
    }
}


function CustomMarker(latlng, map, args) {
	this.latlng = latlng;
	this.args = args;
	this.setMap(map);
    this.theMap = map;
}

var markerClick = false;
var $indexNum = $('#indexNum');
var $text = $('#slideFooter');
var $indexTitle = $('#indexTitle');

CustomMarker.prototype = new google.maps.OverlayView();

CustomMarker.prototype.draw = function() {

	var self = this,
    firstClick = false;

	var div = this.div;

	if (!div) {

		div = this.div = document.createElement('div');

		div.className = 'marker';
		div.style.position = 'absolute';
		div.style.cursor = 'pointer';

		if (typeof(self.args.marker_id) !== 'undefined') {

            /* assign all the data attributes to each marker */

			$(div).attr('data-markerId', self.args.marker_id);
            $(div).attr('data-placeImage', self.args.the_image);
            $(div).attr('data-theTitle', self.args.the_title);
            $(div).attr('data-theText', self.args.the_text);
            $(div).attr('data-the_priceCopy', self.args.the_priceCopy);
            $(div).attr('data-lat', self.latlng.lat());
            $(div).attr('data-lng', self.latlng.lng());
            $(div).attr('data-size', self.args.the_size);
            $(div).attr('data-population', self.args.the_population);
            $(div).attr('data-distance', self.args.the_distance);
            $(div).attr('data-directions', self.args.the_directions);

		}

		var panes = this.getPanes();

		panes.overlayImage.appendChild(div);

        var label = document.createElement("P");

        label.innerHTML = self.args.the_title;

        div.appendChild(label);

        var pin = document.createElement("div");

        pin.className = 'pin';

        div.appendChild(pin);

        var pulse =  document.createElement("div");

        pulse.className = 'pulse';

        div.appendChild(pulse);

        var pulsate =  document.createElement("div");

        pulsate.className = 'pulsate';

        div.appendChild(pulsate);

        google.maps.event.addDomListener(div, "click", function(event) {

            markerClick = true;

            // Switch to the map icon
            $('.back-to-map').addClass('map-btn').removeClass('gallery-btn');

            //update the text and index value on the slude footer
            $indexTitle.addClass('animated fadeOut');
            $indexNum.addClass('animated fadeOut');
            $text.addClass('animated fadeOut');

            // Wait 500 ms before fading back in new text values
            setTimeout(function(){

                $text.removeClass('fadeOut').addClass('fadeIn');
                $text.find('#slide-title').text($(div).attr('data-thetitle'));
                $text.find('#size').next().text($(div).attr('data-size'));
                $text.find('#population').next().text($(div).attr('data-population'));
                $text.find('#distance').next().text($(div).attr('data-distance'));
                $text.find('#directions').next().text($(div).attr('data-directions'));

            }, 300);

            /* Marker styling classes */

            $(div).siblings('div').removeClass('active');
            $(div).addClass('active');
            switchScreen('destinations');

            /* Control slider on marker click*/

            $('#carousel').slick('slickGoTo', $(div).attr('data-markerId'));


             _satellite.track('bespokeEvent', 'pin click');
            ga('send', 'event', 'Click', 'Map pin', 'Pin '+ self.args.the_title +'');

            // console.log(self.args.the_title);


            // Zoom into map
            mapObject.setZoom(6);

            var lat = self.latlng.lat;
            var lng =self.latlng.lng;

            // Wait until map is idle before triggering the offset change
            var listener = google.maps.event.addListener(mapObject, "idle", function() {

                // Center the map to the marker center plus the pixel offset required
                // Center the map to the marker center plus the pixel offset required
                if ($(window).width > 480) {
                    offsetCenter(self.latlng, -100, - $('.map-container').outerHeight() / 2 + 200, lat, lng);
                } else {
                    offsetCenter(self.latlng, -10, - $('.map-container').outerHeight() / 2 + 170, lat, lng);
                }


                google.maps.event.removeListener(listener);

            });



        });

        function switchScreen(screen) {

            // animations for new and old browsers
            var $destinations = $('#destinations'),
            $map = $('#map');

            if (screen === 'destinations') {
                destAnim(browserSpec);
            } else {
                mapAnim(browserSpec);
            }

            function mapAnim(browserSpec) {

                if (browserSpec === 'new') {

                    $destinations.removeClass('animated fadeIn inFront').addClass('animated fadeOut');
                    $closeGallery.removeClass('animated fadeIn inFront').addClass('animated fadeOut inFront');
                    $map.removeClass('animated fadeOut inFront').addClass('animated fadeIn inFront');
                    $('.header h2').text(screen);
                    $('#mapWrap').removeClass('destinations small').addClass('map');

                } else {
                    $closeGallery.animate({'opacity': 0}, 400);
                    $destinations.removeClass('inFront').animate({'opacity': 0}, 400);
                    $map.addClass('inFront').animate({'opacity': 1}, 400);
                    $('.header h2').text(screen);
                    $('#mapWrap').removeClass('destinations small').addClass('map');

                }


            }

            function destAnim(browserSpec) {

                if (browserSpec === 'new') {

                    $closeGallery.removeClass('animated fadeOut inFront').addClass('animated fadeIn inFront');

                    $destinations.removeClass('animated fadeOut inFront').addClass('animated fadeInDown inFront');

                    // $map.removeClass('animated fadeIn inFront').addClass('animated fadeOut');
                    $map.removeClass('animated fadeIn inFront');

                    $('.header h2').text(screen);
                    $('#mapWrap').removeClass('map small').addClass('destinations');

                } else {


                    $destinations.addClass('inFront').animate({'opacity': 1}, 400);
                    $map.removeClass('inFront');

                    $('.header h2').text(screen);
                    $('#mapWrap').removeClass('map small').addClass('destinations');

                }

            }

        }


	}

    var point = this.getProjection().fromLatLngToDivPixel(this.latlng);
    if (point) {
        div.style.left = (point.x - 10) + 'px';
        div.style.top = (point.y - 20) + 'px';
    }

};

CustomMarker.prototype.remove = function() {
	if (this.div) {
		this.div.parentNode.removeChild(this.div);
		this.div = null;
	}
};

CustomMarker.prototype.getActiveMarker = function() {
    if ($(this.div).hasClass('active')) {
        return this;
    }
};

CustomMarker.prototype.getPosition = function() {
	return this.latlng;
};

/* this function offesets the map center to a pixel value so we can see the markers below the slideshow */

 function offsetCenter(thelatlng, offsetx, offsety, lat, lng) {

    // latlng is the apparent centre-point
    // offsetx is the distance you want that point to move to the right, in pixels
    // offsety is the distance you want that point to move upwards, in pixels
    // offset can be negative
    // offsetx and offsety are both optional

    var scale = Math.pow(2, mapObject.getZoom());

    var nw = new google.maps.LatLng(
        mapObject.getBounds().getNorthEast().lat(),
        mapObject.getBounds().getSouthWest().lng()
    );


    if (thelatlng != null) {

        //console.log(thelatlng);

        var worldCoordinateCenter = mapObject.getProjection().fromLatLngToPoint(thelatlng);

        var pixelOffset = new google.maps.Point((offsetx/scale) || 0,(offsety/scale) ||0)

        var worldCoordinateNewCenter = new google.maps.Point(
            worldCoordinateCenter.x - pixelOffset.x,
            worldCoordinateCenter.y + pixelOffset.y
        );

        var newCenter = mapObject.getProjection().fromPointToLatLng(worldCoordinateNewCenter);

        mapObject.panTo(newCenter);

    } else {

        var tempLatLng = new google.maps.LatLng(lat, lng);
        var worldCoordinateCenter = mapObject.getProjection().fromLatLngToPoint(tempLatLng);
        var pixelOffset = new google.maps.Point((offsetx/scale) || 0,(offsety/scale) ||0);

        var worldCoordinateNewCenter = new google.maps.Point(
            worldCoordinateCenter.x - pixelOffset.x,
            worldCoordinateCenter.y + pixelOffset.y
        );

        var newCenter = mapObject.getProjection().fromPointToLatLng(worldCoordinateNewCenter);

        mapObject.panTo(newCenter);

    }



}

$('#carousel').on('afterChange', function(event, slick, currentSlide, nextSlide){

    markerClick = false;
    var slideIndex = currentSlide + 1;

    var zoomLevel = $('.slick-active').data('zoom');
    // console.log(zoomLevel);
    //mapObject.setZoom(zoomLevel);

    _satellite.track('bespokeEvent', 'slide change');
    ga('send', 'event', 'Slide change', 'Gallery', 'slide number = '+ slideIndex +'');

});


 // on carousel slide change we reposition the map to match the relevant marker
$('#carousel').on('beforeChange', function(event, slick, currentSlide, nextSlide){

    if (markerClick != true) {

        var dir,
        zoomLevel;

        // Detect if user is moving left or right in carousel
        if (Math.abs(nextSlide - currentSlide) == 1) {
            dir = (nextSlide - currentSlide > 0) ? "right" : "left";
        }else {
            dir = (nextSlide - currentSlide > 0) ? "left" : "right";
        }

        // Get next or previous desired zoom level from data attibutes
        dir === 'left' ? zoomLevel = $('.slick-active').prev().data('zoom') : zoomLevel = $('.slick-active').next().data('zoom');

        // Zoom into map
        mapObject.setZoom(6);

        // get the attributes from the relevant marker
        var slideId = nextSlide;
        console.log(slideId);
        var marker = $("[data-markerId='" + slideId + "']");
        var lat = marker.data('lat');
        var lng = marker.data('lng');

        //update the text and index value on the slude footer
        $indexTitle.addClass('animated fadeOut');
        $indexNum.addClass('animated fadeOut');
        $text.addClass('animated fadeOut');

        // Wait 500 ms before fading back in new text values
        setTimeout(function(){

            console.log(marker);

            $text.removeClass('fadeOut').addClass('fadeIn');
            $text.find('#slide-title').text(marker.attr('data-thetitle'));
            $text.find('#size').next('p').html(marker.attr('data-size'));
            $text.find('#population').next('p').html(marker.attr('data-population'));
            $text.find('#distance').next('p').html(marker.attr('data-distance'));
            $text.find('#directions').next('p').html(marker.attr('data-directions'));

        }, 300);

        // Center the map to the marker center plus the pixel offset required
        if ($(window).width > 480) {
            offsetCenter(self.latlng, -100, - $('.map-container').outerHeight() / 2 + 200, lat, lng);
        } else {
            offsetCenter(self.latlng, -10, - $('.map-container').outerHeight() / 2 + 170, lat, lng);
        }


        marker.siblings(marker).removeClass('active')
        marker.addClass('active');

    }


});

var close = document.getElementById('closeCarousel');

 var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        } else {
            return 'belfast'; // Default to Belfast
        }
    }
};
