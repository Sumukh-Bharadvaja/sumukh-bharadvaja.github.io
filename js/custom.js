;(function($){
    "use strict"
    var nav_offset_top = $('.header_area').height()+50; 
    /*-------------------------------------------------------------------------------
	  Navbar 
	-------------------------------------------------------------------------------*/

	//* Navbar Fixed  
    function navbarFixed(){
        if ( $('.header_area').length ){ 
            $(window).scroll(function() {
                var scroll = $(window).scrollTop();   
                if (scroll >= nav_offset_top ) {
                    $(".header_area").addClass("navbar_fixed");
                } else {
                    $(".header_area").removeClass("navbar_fixed");
                }
            });
        };
    };
    navbarFixed();
    
    /*function testimonialSlider(){
        if ( $('.testimonial_slider').length ){
            $('.testimonial_slider').owlCarousel({
                loop:true,
                margin: 30,
                items: 2,
                nav:false,
                autoplay: true,
                dots: true,
                smartSpeed: 1500,
                responsiveClass: true,
                responsive: {
                    0: {
                        items: 1,
                    },
                    768: {
                        items: 2,
                    },
                }
            })
        }
    }
    testimonialSlider();*/


    document.addEventListener('DOMContentLoaded', function() {
        const experienceItems = document.querySelectorAll('.experience-item');
    
        experienceItems.forEach(item => {
            item.addEventListener('click', () => {
                const details = item.querySelector('.details');
                details.style.display = details.style.display === 'block' ? 'none' : 'block';
            });
        });
    });
    
    
       
    
    /* ===== Parallax Effect===== */
	
	function parallaxEffect() {
    	$('.bg-parallax').parallax();
	}
	parallaxEffect();
    
    
    $('select').niceSelect();
    $('#datetimepicker11,#datetimepicker1').datetimepicker({
        daysOfWeekDisabled: [0, 6]
    });
    
     /*---------gallery isotope js-----------*/
    function galleryMasonry(){
        if ( $('#gallery').length ){
            $('#gallery').imagesLoaded( function() {
              // images have loaded
                // Activate isotope in container
                $("#gallery").isotope({
                    itemSelector: ".gallery_item",
                    layoutMode: 'masonry',
                    animationOptions: {
                        duration: 750,
                        easing: 'linear'
                    }
                });
            })
        }
    }
    galleryMasonry();

	function openProjectLink(event) {
        event.preventDefault();  // Prevent default anchor behavior
        window.open('https://github.com/Sumukh-Bharadvaja/World-Energy-Consumption', '_blank');
    }

    $('.gallery_filter').on('click', 'a', function () {
        var filterValue = $(this).attr('data-filter');
        $('.imageGallery1').isotope({ filter: filterValue });
    });
    
    
	    
    
    
    
})(jQuery)