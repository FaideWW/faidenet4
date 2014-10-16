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

    var viewport_height = 0,
        home_parallax = function () {
            var $document          = $(document),
                $window            = $(window),
                $home_element      = $('section#home>header'),
                home_goal          = {},
                target_reference   = {},
                rem                = parseInt($('body').css('font-size')),
                ease_out;

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
                    initial: (-$home_element.height() / 2) + 5,
                    goal:    2 * rem + 5 // section>header>h1 has this padding on it
                    // ^ accounting for the border-top offset
                }
            };

            target_reference = {
                determinant: function () { return $document.scrollTop() },
                initial:     0,
                goal:        viewport_height - $home_element.height()
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

        var $window               = $(window),
            $all_sections         = $('body>section'),
            sections              = [],
            $home_section         = $('section#home'),
            $footer               = $('body>footer'),
            total_document_height = 0,
            current_fold          = 0,
            setHeights            = function () {
                total_document_height = 0;
                $all_sections.each(function (i) {
                    var init_height = (Math.max($(this).height(), viewport_height) | 0); // truncate and integer cast to avoid half-pixel values
                    $(this).css({
                        'position': 'fixed',
                        'z-index': $all_sections.length - i,
                        'overflow-y': 'hidden',
                        'height': init_height,
                        'min-height': 0
                    });
                    sections[i] = {
                        $section: $(this),
                        height:   init_height,
                        top:      total_document_height
                    };
                    total_document_height += init_height;
                });
                //the footer is a special case so we handle it separately

                $footer.css({
                    position: 'fixed',
                    bottom:   '0',
                    'z-index':  '-1',
                    'overflow-y': 'hidden',
                    width:    '100%'
                });

                console.log(sections);
                // account for the footer offset
//        sections[sections.length - 1].$section.css({
//            'margin-bottom': $footer.height()
//        });

                sections.push({
                    $section: $footer,
                    height:   $footer.height(),
                    top:      total_document_height
                });

                total_document_height += $footer.outerHeight();


                $home_section.css('position', 'fixed');
                $('body').css('height', total_document_height);
            };
        viewport_height = $(window).height();
        home_parallax();
        setHeights();

        $window.scroll(function () {
            var scroll = $window.scrollTop();

            // special case home page
            if (current_fold === 0) {
                $home_section.css({
                    height: viewport_height - scroll,
                    'min-height': 0
                });
            }


            // downward scroll behavior
            if (current_fold < sections.length - 1) {
                if (scroll >= sections[current_fold + 1].top) {
                    current_fold += 1;
                    sections[current_fold].$section.css({
                        position: 'absolute',
                        top: sections[current_fold].top
                    });
                }
            }

            if (current_fold > 0) {
                if (scroll < sections[current_fold].top) {
                    sections[current_fold].$section.css({
                        position: 'fixed',
                        top:      0
                    });
                    current_fold -= 1;
                }
            }
        });

        $window.resize(function () {
            viewport_height = $(this).height();
            setHeights();
        })

    });
}(window.jQuery));