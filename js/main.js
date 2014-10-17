/**
 *
 * --------------------------------------------
 *  features that still need to be implemented
 * --------------------------------------------
 *
 * TODO: link fragments navigation
 * TODO: browser history manipulation
 * TODO: side navbar (maybe?)
 * TODO: blog post exit functionality
 * TODO: blog post entrance and exit animations
 * TODO: ghost integration
 * TODO: general code cleanup
 *
 */


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
                $home_element      = $('section#home-section>header'),
                home_goal          = {},
                target_reference   = {},
                rem                = parseInt($('body').css('font-size')),
                doParallax         = function () {
                    var progress = ((target_reference.determinant() - target_reference.initial) / (target_reference.goal - target_reference.initial)),
                        prop,
                        style_obj = {};
//                console.log(progress);
                    if (progress >= 0 && progress <= 1) {
                        progress = ease_out(progress);
                        for (prop in home_goal) {
                            if (home_goal.hasOwnProperty(prop)) {
                                style_obj[prop] = (home_goal[prop].initial + ((home_goal[prop].goal - home_goal[prop].initial) * progress)) + ((home_goal[prop].suffix) ? home_goal[prop].suffix : 0);
                            }
                        }
                        $home_element.css(style_obj);
                    }
                },
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

            $window.scroll(doParallax);

            $window.resize(function () {
                var new_height = $(this).height();
                if (viewport_height !== new_height) {
                    viewport_height = new_height;
                    doParallax();
                }
            })
        },
        getSectionID = function ($section) {
            return $section.children('header').children('a').attr('id');
        },
        calculateHeaderHeight = function ($header, viewport_height) {
            $header.data('max-height', viewport_height);
        },
        calculateSectionHeights = function ($all_sections, viewport_height, $footer) {
            // returns an object indexed by section link fragment of all section heights and their "top" values
            // this is ignorant to changes in the home section's height
            var sections = {},
                total    = 0;
            $all_sections.each(function (i) {
                var $section = $(this),
                    id       = getSectionID($section),
                    section_height;
                if (id === 'home') {
                    calculateHeaderHeight($section, viewport_height);
                    section_height = viewport_height;
                } else {
                    section_height = $section.height();
                }
                sections[id] = {
                    $section: $section,
                    height: section_height,
                    top: total
                };
                total += section_height;
            });

            if ($footer) {
                // add the footer if it exists
                sections.footer = {
                    $section: $footer,
                    height:   $footer.outerHeight(),
                    top:      total
                };

                total += sections.footer.height;
            }

            sections.__total = total;

            return sections;
        },
        assignSectionHeights = function ($all_sections, section_heights, $footer) {
            $all_sections.each(function (i) {
                var $section = $(this),
                    id       = getSectionID($section);


                // initially fix all sections, positioning will come later
                $section.css({
                    'position': 'fixed',
                    'z-index':  $all_sections.length - i,
                    'overflow-y': 'hidden',
                    'height': section_heights[id].height,
                    'min-height': 0
                });
            });

            if ($footer) {
                // handle the footer
                $footer.css({
                    position: 'fixed',
                    bottom:   '0',
                    'z-index':  '-1',
                    'overflow-y': 'hidden'
                });
            }

            $('body').css('height', section_heights.__total);
        },
        resizeHeader     = function ($header, scroll_position) {
            var max = $header.data('max-height');
            if (max) {
                $header.css({
                    height: Math.max(max - scroll_position, 0)
                });
            }
        },
        positionSections = function ($all_sections, section_heights, current_fold) {

        };


    $(document).ready(function () {
        var $window               = $(window),
            $all_sections         = $('body>section'),
            sections              = [],
            $home_section         = $('section#home-section'),
            $footer               = $('body>footer'),
            total_document_height = 0,
            current_fold          = 0,
            setHeights            = function () {
                total_document_height = 0;
                sections              = [];
                $all_sections.each(function (i) {
                    // edge case hack
                    if ($(this).attr('id') !== 'home-section') {
                        $(this).css('height', 'auto');
                    }

                    var init_height = (Math.max($(this).height(), viewport_height) | 0); // truncate and integer cast to avoid half-pixel values

                    $(this).css({
                        // critical to maintaining functionality when sections change height dynamically (blog posts)
                        'position': (i <= current_fold) ? 'absolute' : 'fixed',
                        'z-index': $all_sections.length - i,
                        'overflow-y': 'hidden',
                        'height': init_height,
                        'min-height': 0
                    });
                    sections[i] = {
                        $section: $(this),
                        height:   init_height,
                        top:      total_document_height,
                        link_frag: $(this).children('header').children('a').attr('id')
                    };
                    console.log(sections[i]);
                    total_document_height += init_height;
                });


                //the footer is a special case so we handle it separately
                $footer.css({
                    position: 'fixed',
                    bottom:   '0',
                    'z-index':  '-1',
                    'overflow-y': 'hidden'
                });

                sections.push({
                    $section:      $footer,
                    height:        $footer.height(),
                    top:           total_document_height
                });

                total_document_height += $footer.outerHeight();


                $home_section.css('position', 'fixed');
                $('body').css('height', total_document_height);
            },
            doScroll = function () {
                var scroll = $window.scrollTop();
//                console.log('doing scroll');
                // special case home page
                $home_section.css({
                    height: Math.max(viewport_height - scroll, 0),
//                        top: -scroll,
                    'min-height': 0
                });



                // downward scroll behavior
                if (current_fold < sections.length - 1) {
                    if (scroll >= sections[current_fold + 1].top) {
                        current_fold += 1;
                        sections[current_fold].$section.css({
                            position: 'absolute',
                            top: sections[current_fold].top
                        });
                        console.log('history set to #' + sections[current_fold].link_frag);
                        window.history.replaceState({}, sections[current_fold].link_frag ,'#' + sections[current_fold].link_frag);
                    }
                }

                if (current_fold > 0) {
                    if (scroll < sections[current_fold].top) {
                        sections[current_fold].$section.css({
                            position: 'fixed',
                            top:      0
                        });
                        current_fold -= 1;
                        console.log('history set to #' + sections[current_fold].link_frag);
                        window.history.replaceState({}, sections[current_fold].link_frag, '#' + sections[current_fold].link_frag);
                    }
                }
            },
            goTo = function (s) {
                current_fold = s;
                console.log(sections[s].top);
                $window.scrollTop(sections[s].top);
            };


        viewport_height = $(window).height();

        var section_heights = calculateSectionHeights($all_sections, viewport_height, $footer);

        assignSectionHeights($all_sections, section_heights, $footer);













        home_parallax();
        //setHeights();


        // detect url hash

//        if (window.location.hash) {
//            console.log(window.location.hash);
//            var s;
//            for (s = 0; s < sections.length; s += 1) {
//                if (sections[s].link_frag === window.location.hash.substr(1)) {
//                    current_fold = s;
//                    setHeights();
//                    goTo(s);
//                }
//            }
//        }



        $window.scroll(doScroll);

        $window.resize(function () {
            var new_height = $(this).height();
            if (viewport_height !== new_height) {
                viewport_height = new_height;
                setHeights();
                doScroll();
            }
        });



        // handlebars
        var src = $('#single-post-template').html(),
            template = Handlebars.compile(src),
            context = {
                tags: ["tag1", "tag2", "tag3"],
                date: "date",
                title: "Title",
                body: "<p>Hello world</p><p>Hello world</p><p>Hello world</p><p>Hello world</p><p>Hello world</p><p>Hello world</p><p>Hello world</p><p>Hello world</p><p>Hello world</p><p>Hello world</p><p>Hello world</p><p>Hello world</p><p>Hello world</p>"
            },
            html = template(context);

        $('a.title, a.more').click(function () {
            $('#posts').addClass('hidden');
            $('#post').removeClass('hidden').html(html);
            window.location.hash = '#blog';
            goTo(2);
            setHeights();
            doScroll();
            return false;
        })





    });
}(window.jQuery));