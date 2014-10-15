(function ($) {

    /*
     Parallax effect
     - required
     - element start
     - element end
     - scroll position start
     - scroll position end
     - interpolation/easing function

     */

    var home_parallax = function () {
        var $document          = $(document),
            $window            = $(window),
            $home_section      = $('section#home'),
            $target_element    = $('section#about'),
            $home_element      = $('section#home>header'),
            initial_height     = $target_element.offset().top,
            home_goal          = {},
            target_reference   = {},
            ease_out;


        $home_section.css({
            position: 'absolute',
            'z-index': 9
        });
        $home_element.css({
            position: 'absolute',
            top:      '50%',
            'margin-top': -$home_element.height() / 2,
            left:     '50%',
            'margin-left': -$home_element.width() / 2
        });

        home_goal = {
            top: {
                suffix:  '%',
                initial: 50,
                goal:    0
            },
            'margin-top': {
                initial: (-$home_element.height() / 2),
                goal:    5 // accounting for the border-top offset
            },
            'padding-top': {
                suffix:  'rem',
                initial: 0,
                goal:    2
            }
        };

        target_reference = {
            determinant: function () { return $document.scrollTop() },
            initial:     0,
            goal:        initial_height * 0.9
        };

        /*
        quadratic ease out function
         */
        ease_out = function (x) {
            return (2 - x) * x;
        };

        $window.scroll(function () {
            var progress = ((target_reference.determinant() - target_reference.initial) / (target_reference.goal - target_reference.initial)),
                prop,
                style_obj = {};
            if (progress >= 0 && progress <= 1) {
                progress = ease_out(progress);
                for (prop in home_goal) {
                    if (home_goal.hasOwnProperty(prop)) {
                        style_obj[prop] = (home_goal[prop].initial + ((home_goal[prop].goal - home_goal[prop].initial) * progress)) + ((home_goal[prop].suffix) ? home_goal[prop].suffix : 0);
                    }
                }
                $home_element.css(style_obj);
            }
        });


    };


    $(document).ready(function () {
        home_parallax();

        var $window               = $(window),
            $all_sections         = $('body>section, body>footer'),
            $home_section         = $('section#home'),
            $about_section        = $('section#about'),
            total_document_height = 0,
            initial_height        = $home_section.height();
        console.log($all_sections);
        $all_sections.each(function (i) {
            var init_height = $(this).height();
            total_document_height += init_height;
            $(this).css({
                'position': 'fixed',
                'z-index': $all_sections.length - i,
                'overflow-y': 'hidden',
                'height': init_height,
                'min-height': 0
            });
        });

        $home_section.css('position', 'fixed');
        $('body').css('height', total_document_height);


        $window.scroll(function () {
            $home_section.css({
                height: initial_height - $window.scrollTop(),
                'min-height': 0
            });

            $about_section.css({
                position: 'fixed'
            });
        })


    });
}(window.jQuery));