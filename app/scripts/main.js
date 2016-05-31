var sparkbespoke;

	// Function to retrieve the URL parameters in the address bar
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

	var theRoute = getUrlParameter('route');

	// Detect Ie9 and older
	!Modernizr.csstransitions ? browserSpec = 'old' : browserSpec = 'new';

	// Locations data from locations.js file
	locationsArray = locations;

	// Global vars
	var mapObject,
		overlay,
		latLongArray = [],
		marker,
		bounds,
		markerArray = [],
		mapStyles = [{featureType:"administrative",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"administrative",elementType:"labels.text.fill",stylers:[{color:"#444444"}]},{featureType:"landscape",elementType:"all",stylers:[{color:"#f2f2f2"}]},{featureType:"landscape",elementType:"geometry",stylers:[{color:"#bc0f00"}]},{featureType:"landscape",elementType:"geometry.stroke",stylers:[{color:"#ffffff"}]},{featureType:"landscape",elementType:"labels",stylers:[{visibility:"simplified"}]},{featureType:"landscape.man_made",elementType:"geometry.fill",stylers:[{saturation:"0"},{color:"#bd0900"}]},{featureType:"landscape.natural.terrain",elementType:"geometry",stylers:[{visibility:"off"}]},{featureType:"poi",elementType:"all",stylers:[{visibility:"off"}]},{featureType:"road",elementType:"all",stylers:[{saturation:-100},{lightness:45}]},{featureType:"road",elementType:"geometry",stylers:[{visibility:"on"}]},{featureType:"road",elementType:"geometry.fill",stylers:[{hue:"#ff0000"}]},{featureType:"road",elementType:"geometry.stroke",stylers:[{color:"#965858"}]},{featureType:"road",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"road.highway",elementType:"all",stylers:[{visibility:"simplified"}]},{featureType:"road.highway",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"road.arterial",elementType:"labels.icon",stylers:[{visibility:"off"}]},{featureType:"transit",elementType:"all",stylers:[{visibility:"off"}]},{featureType:"transit",elementType:"geometry",stylers:[{visibility:"off"}]},{featureType:"water",elementType:"all",stylers:[{color:"#9ba1a5"},{visibility:"on"}]}],
		data,
		start,
		end,
		currentMap = [],
		invisibleMarker,
		markerBounds = new google.maps.LatLngBounds(),
		mc,
		firstLoad = false,
 		locationsArray,
	 	route = theRoute,
 		browserSpec,
 		$closeGallery = $('.close-gallery'),
 		isMobile = false;

	$(window).resize(function(event) {
		if ($(window).width() < 480) {
			isMobile = true;
		} else {
			isMobile = false;
		}
	});

	if ($(window).width() < 480) {
			isMobile = true;
		} else {
			isMobile = false;
		}

 	// Initialize the google map
	function loadMap() {

		// Hide loading screen

		setTimeout(function(){
			$('.loader-wrapper').fadeOut(800);
		}, 800);


		// Map options
		var options = {

			streetViewControl: false,
			scaleControl: false,
			scrollwheel: true,
			disableDefaultUI: true,
			disableDoubleClickZoom: false,
			zoom: 12,
			center: new google.maps.LatLng(51.5072,0.1275),
			styles: mapStyles,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			draggable: false

		};


		mapObject = new google.maps.Map(document.getElementById('gmap'), options);

		calcRoute();

		if (isMobile === true) {

			mapObject.setOptions({draggable: false});

		} else {

			mapObject.setOptions({draggable: true});

		}

		//Create the DIV to hold the control and call the ZoomControl() constructor passing in this DIV.

		var zoomControlDiv = document.createElement('div');
		var zoomControl = new ZoomControl(zoomControlDiv, mapObject);

		zoomControlDiv.index = 1;
		mapObject.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(zoomControlDiv);

		// Function to set markers depending on map route
		function calcRoute() {
			// Refer to the current map we are on e.g 'route1' and create new array using underscore
			currentMap = _.where(locationsArray, {name: route});

			createCustomMarkers(currentMap);

			//Animate each marker one by one by adding animate.css class
			setTimeout(function(){
				TweenMax.staggerFromTo($('.marker'), 1, { scale: 0, rotation: 180 }, { scale: 1, opacity: 1, rotation: 315, ease: Back.easeInOut }, 0.2);
			}, 800);

		}

		// Initialize the google map clusterers
		function createClusterers(markerArray) {

			var clusterStyles = [
				{
					fontFamily: 'Arial',
					textSize: 14,
					textColor: 'white',
					url: 'images/cluster-icon.png',
					height: 89,
					width: 87
				}
			];

			var mcOptions = {
			    gridSize: 30,
			    styles: clusterStyles
			};

			mc = new MarkerClusterer(mapObject, markerArray, mcOptions);

		}

		// Initialize custom google map markers from CustomGoogleMapMarker.js file.
		function createCustomMarkers(currentMap) {

			for (var i = 0; i < currentMap[0].checkpoints.length; i++) {

				var position = new google.maps.LatLng(currentMap[0].checkpoints[i].lat, currentMap[0].checkpoints[i].lng);

				overlay = new CustomMarker(
					position,
					mapObject,
					{
						marker_id: i,
						the_title:  currentMap[0].checkpoints[i].title,
						the_image: currentMap[0].checkpoints[i].image,
						the_priceCopy: currentMap[0].checkpoints[i].priceCopy,
						the_text: currentMap[0].checkpoints[i].description,
						the_size: currentMap[0].checkpoints[i].size,
						the_population: currentMap[0].checkpoints[i].population,
						the_distance: currentMap[0].checkpoints[i].distance,
						the_directions: currentMap[0].checkpoints[i].directions
					}
				);

		      	markerBounds.extend(position);

		      	var latlngbounds = new google.maps.LatLngBounds();

				markerArray.push(overlay);

			};

			mapObject.fitBounds(markerBounds);

			if (isMobile) {

				var listener = google.maps.event.addListener(mapObject, "idle", function() {

					console.log(mapObject.getZoom());

					if (mapObject.getZoom() < 6) mapObject.setZoom(4); 

					google.maps.event.removeListener(listener); 

				});

			}
			

			if ( firstLoad === false ) {
				createCarousel();
				firstLoad = true;
			}

		}

		// Create the carousel marker and initialise the slick carousel script
		function createCarousel() {

			var slide = [];

			for (var i = 0; i < currentMap[0].checkpoints.length; i++) {
				//background: url('+ currentMap[0].checkpoints[i].image +') no-repeat center center; background-size: cover;
				slide = '<div class="slide full-height" id="slide'+(i + 1)+'" data-zoom="'+currentMap[0].checkpoints[i].zoomLevel+'">\
							<div class="landscape-image full-height" style="backgroundColor:#000;"></div>\
						 </div>';

				 $('#carousel').append(slide);


			};

			setTimeout(function(){

				$('#carousel').slick({
					dots: false,
					speed: 200,
					infinite: true,
					adaptiveHeight: true,
					centerMode: false,
					slidesToShow: 1,
					nextArrow: '.next',
  					prevArrow: '.previous'
				});

			}, 500);

		}
		// Switch to the desired screen with either css3 animations or fallback to jquery animate
		function switchScreen(screen) {

			// animations for new and old browsers

			var $destinations = $('#destinations'),
			$destinationsSmall = $('#destinationsSmall'),
			$map = $('#map');


		    if (screen === 'destinations') {
		    	destAnim(browserSpec);
		    } else if (screen === 'map') {
		    	mapAnim(browserSpec);
		    } else {
		    	smalldestAnim(browserSpec);
		    }

		    // Switch to map view
		    function mapAnim(browserSpec) {

		    	setTimeout(function(){
		    		$('.marker').removeClass('active');
		    		mapObject.fitBounds(markerBounds);
		    		if (isMobile) {

						var listener = google.maps.event.addListener(mapObject, "idle", function() {

							console.log(mapObject.getZoom());

							if (mapObject.getZoom() < 6) mapObject.setZoom(4); 

							google.maps.event.removeListener(listener); 

						});

					}
		    	}, 300);

		    	if (browserSpec === 'new') {

		    		$closeGallery.removeClass('animated fadeIn inFront').addClass('animated fadeOut');
		    		$destinations.removeClass('animated fadeIn inFront').addClass('animated fadeOut');
			    	$destinationsSmall.removeClass('animated fadeIn inFront').addClass('animated fadeOut');
			    	$map.removeClass('animated fadeOut inFront').addClass('animated fadeIn inFront');
			    	$('.header h2').text(screen);
			    	$('#mapWrap').removeClass('destinations small').addClass('map');

		    	} else {

		    		$closeGallery.animate({'opacity': 0}, 400);
		    		$destinations.removeClass('inFront').animate({'opacity': 0}, 400);
			    	$destinationsSmall.removeClass('inFront').animate({'opacity': 0}, 400);
			    	$map.addClass('inFront').animate({'opacity': 1}, 400);

			    	$('.header h2').text(screen);
			    	$('#mapWrap').removeClass('destinations small').addClass('map');

		    	}


		    }

		    // Switch to the carousel view
		    function destAnim(browserSpec) {

		    	if (browserSpec === 'new') {

		    		$destinationsSmall.removeClass('animated fadeIn inFront').addClass('animated fadeOut');
			        $destinations.removeClass('animated fadeOut inFront').addClass('animated fadeIn inFront');
              		$map.removeClass('animated fadeIn inFront');
              		$closeGallery.removeClass('hidden animated fadeOut inFront').addClass('animated fadeIn inFront');

			        $('.header h2').text(screen);
			        $('#mapWrap').removeClass('map small').addClass('destinations');

		    	} else {

		    		$destinationsSmall.removeClass('inFront').animate({'opacity': 0}, 400);
			        $destinations.addClass('inFront').animate({'opacity': 1}, 400);
			        $map.removeClass('inFront');

			        $('.header h2').text(screen);
			        $('#mapWrap').removeClass('map small').addClass('destinations');

		    	}

		    }

		}

		// Custom zoom functionality
		function ZoomControl(controlDiv, map) {

			// Creating divs & styles for custom zoom control

			controlDiv.style.padding = '5px';
			controlDiv.id = 'mapControls';

			// Set CSS for the control wrapper
			var controlWrapper = document.createElement('div');
			controlWrapper.style.cursor = 'pointer';
			controlWrapper.style.textAlign = 'center';
			controlWrapper.style.width = '32px';
			controlWrapper.style.height = '64px';
			controlWrapper.style.right = '0px';
			controlDiv.appendChild(controlWrapper);

			// Set CSS for the zoomIn
			var zoomInButton = document.createElement('div');
			zoomInButton.style.width = '37px';
			zoomInButton.style.height = '37px';
			zoomInButton.style.marginBottom = '10px';
			/* Change this to be the .png image you want to use */
			zoomInButton.style.backgroundImage = 'url(images/zoom-in.svg)';
			zoomInButton.style.backgroundColor = //'#056664';
			controlWrapper.appendChild(zoomInButton);

			// Set CSS for the zoomOut
			var zoomOutButton = document.createElement('div');
			zoomOutButton.style.width = '37px';
			zoomOutButton.style.height = '36px';
			/* Change this to be the .png image you want to use */
			zoomOutButton.style.backgroundImage = 'url(images/zoom-out.svg)';
			zoomOutButton.style.backgroundColor = //'#056664';
			controlWrapper.appendChild(zoomOutButton);

			// Setup the click event listener - zoomIn
			google.maps.event.addDomListener(zoomInButton, 'click', function() {
				map.setZoom(map.getZoom() + 1);
				ga('send', 'event', 'Zoom in');
			});

			// Setup the click event listener - zoomOut
			google.maps.event.addDomListener(zoomOutButton, 'click', function() {
				map.setZoom(map.getZoom() - 1);
				ga('send', 'event', 'Zoom out');
			});

		}

		/* User interaction events below */

		$('#switchMap').on('click', function(e){
		    e.preventDefault();
		    switchScreen('destinations');
		    _satellite.track('bespokeEvent', 'Read more', route);
            ga('send', 'event', 'Click', 'Read more', route);
		});

		$('#destBtn').on('click', function(e){
		    e.preventDefault();
		    switchScreen('destinationsSmall');
		    _satellite.track('bespokeEvent', 'Destination', route);
            ga('send', 'event', 'Click', 'Destination', route);
		});

		$('#mapBtn, .back-to-map, .close-gallery').on('click', function(e){

			var $self = $(this);

		    e.preventDefault();

		   $('#mapWrap').hasClass('map') ? switchScreen('destinations') : switchScreen('map');

		   $('#carousel').slick('slickGoTo', 0);

            ga('send', 'event', 'Click', 'Map', route);

            if ($self.hasClass('back-to-map')) {
            	$self.toggleClass('map-btn gallery-btn');
            }

		});


		$('.detailMore').on('click', function(e){
		    e.preventDefault();

		    $('#carousel').slick('slickGoTo', ( $(this).data('id') - 1 ) );

		    setTimeout(function(){
		    	switchScreen('destinations');
		    }, 300);

		    _satellite.track('bespokeEvent', 'Detail read more');
            ga('send', 'event', 'Click', 'Detail read more', route);

		});

	}

	// Window resize funcitonality

	// Resize the container based on the users window size
	// function scaleContainer() {
	// 	$('.sections-wrap, #gmap').css({
	// 		'height': $(window).outerHeight() - $('.header').outerHeight() - $('.nav-btn').outerHeight() - $('.heading').outerHeight()
	// 	});
	// }

	// if ($(window).width() < 480) {
	// 	scaleContainer();
	// }

	// $(window).resize(function(event) {
	// 	if ($(window).width() < 480) {
	// 		scaleContainer();
	// 	}
	// });

	google.maps.event.addDomListener(window, 'load', loadMap);



