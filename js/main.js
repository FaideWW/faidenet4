/**
 *
 * --------------------------------------------
 *  features that still need to be implemented
 * --------------------------------------------
 *
 * DONE: link fragments navigation
 * DONE: browser history manipulation
 * DONE: side navbar (maybe?)
 * DONE: blog post exit functionality
 * DONE: blog post entrance and exit animations
 * DONE: post close button/exit strategy
 * TODO: alien integration
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
        };

    $(document).ready(function () {
        var $window               = $(window),
            $html                 = $('html'),
            $nav                  = $('body>nav'),
            $all_sections         = $('body>section'),
            sections              = [],
            $home_section         = $('section#home-section'),
            $footer               = $('body>footer'),
            total_document_height = 0,
            nav_hidden            = false,
            current_fold          = 0,
            setHeights            = function () {
                total_document_height = 0;
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
                        'min-height': 0,
                        'top': (i <= current_fold) ? total_document_height : 0
                    });
                    sections[i] = {
                        $section: $(this),
                        height:   init_height,
                        top:      total_document_height,
                        link_frag: $(this).children('header').children('a').attr('id')
                    };
                    total_document_height += init_height;
                });


                //the footer is a special case so we handle it separately
                $footer.css({
                    position: 'fixed',
                    bottom:   '0',
                    'z-index':  '-1',
                    'overflow-y': 'hidden'
                });

                sections[$all_sections.length] = {
                    $section:      $footer,
                    height:        $footer.height(),
                    top:           total_document_height
                };

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

                if (viewport_height - scroll < 15 && !showing_post) {
                    showNav();
                } else if (viewport_height - scroll > 15 || showing_post) {
                    hideNav();
                }


                // downward scroll behavior
                if (current_fold < sections.length - 1) {
                    if (scroll >= sections[current_fold + 1].top) {
                        current_fold += 1;
                        sections[current_fold].$section.css({
                            position: 'absolute',
                            top: sections[current_fold].top
                        });
                        $('body>nav a.active').removeClass('active');
                        $('body>nav a[data-target=' + current_fold + ']').addClass('active');
                        if (!showing_post) {
                            window.history.replaceState(window.history.state, sections[current_fold].link_frag ,'#' + sections[current_fold].link_frag);
                        }
                    }

                }

                if (current_fold > 0) {
                    if (scroll < sections[current_fold].top) {
                        sections[current_fold].$section.css({
                            position: 'fixed',
                            top:      0
                        });
                        current_fold -= 1;
                        $('body>nav a.active').removeClass('active');
                        $('body>nav a[data-target=' + current_fold + ']').addClass('active');
                        if (!showing_post) {
                            window.history.replaceState(window.history.state, sections[current_fold].link_frag, '#' + sections[current_fold].link_frag);
                        }
                    }
                }

            },
            goTo = function (s) {
                //current_fold = s;
                $html.animate({scrollTop: sections[s].top}, 200, 'swing');
                //$window.scrollTop(sections[s].top);
            };


        viewport_height = $(window).height();


        home_parallax();
        setHeights();


        // detect url hash

        if (window.location.hash) {
            console.log(window.location.hash);
            var s;
            for (s = 0; s < sections.length; s += 1) {
                if (sections[s].link_frag === window.location.hash.substr(1)) {
                    current_fold = s;
                    setHeights();
                    goTo(s);
                }
            }
        }



        $window.scroll(doScroll);

        var breakpoints = function (w) {
                if (w < 600) {
                    return 'small';
                } else if (w >= 600 && w < 800) {
                    return 'medium';
                } else {
                    return 'large';
                }
            },
            current_breakpoint = breakpoints($(window).width());


        $window.resize(function () {
            var new_height = $(this).height(),
                new_breakpoint  = breakpoints($(this).width());
            if (viewport_height !== new_height) {
                viewport_height = new_height;
                setHeights();
                doScroll();
            }



            if (current_breakpoint !== new_breakpoint) {
                current_breakpoint = new_breakpoint;
                console.log('breakpoint');
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
                slug: "title",
                body: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent mi massa, porttitor sed ultrices nec, porta eget erat. Fusce nisl lorem, commodo non lobortis mattis, molestie ut massa. Etiam eget orci ut sapien tincidunt molestie. Curabitur scelerisque velit sed semper sollicitudin. Aenean suscipit, libero ac ultricies molestie, magna lacus cursus metus, vitae iaculis ante metus vitae leo. Etiam cursus egestas dolor, sed faucibus odio faucibus ut. Cras efficitur felis non purus imperdiet, ac sagittis nisl fermentum. Morbi malesuada justo non turpis mollis convallis. Vestibulum lacinia vehicula elementum. Duis eget arcu nec ante venenatis ultrices vel a dolor. In lacinia odio sed vulputate efficitur. Aenean consectetur laoreet tellus eget tristique. Sed volutpat felis at arcu aliquam, non condimentum quam fringilla. Aenean fringilla ex ante. Quisque vel arcu suscipit, facilisis velit a, tempor orci.</p>" +
                "<p>Vivamus id venenatis nunc, vestibulum interdum nisl. Ut elementum, lorem sit amet aliquam cursus, justo sem scelerisque ligula, et euismod eros metus et massa. Maecenas eget augue nisi. Donec faucibus consequat vestibulum. Pellentesque purus arcu, sagittis ut viverra eu, rhoncus in nibh. Maecenas tempus ullamcorper justo a interdum. Nullam libero nisl, lobortis at dolor ac, ullamcorper accumsan nisi. Nam rutrum facilisis ex, ut laoreet justo finibus in.</p>" +
                "<p>Nulla suscipit felis in velit consectetur, ac dignissim orci lobortis. Nulla et faucibus diam. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Praesent condimentum lobortis magna pulvinar bibendum. Mauris dignissim pretium enim. Integer ut mauris quis odio convallis eleifend non eu massa. Vestibulum dignissim ligula sit amet pretium laoreet. Cras vehicula purus a sapien aliquet tristique. Mauris cursus urna ac consectetur fermentum. Vestibulum consequat, libero nec malesuada ultrices, enim arcu pulvinar nunc, vel mollis risus mi ac risus.</p>" +
                "<p>Fusce at purus id dolor efficitur egestas vitae a magna. In quis commodo sem, id pulvinar sem. Maecenas dapibus id ligula a volutpat. Suspendisse potenti. Maecenas ac turpis ante. Quisque in metus eu quam bibendum iaculis sit amet et nisi. Cras sodales sagittis metus et convallis. Sed euismod laoreet risus, at accumsan neque gravida varius.</p>" +
                "<p>Fusce at tortor a tellus vehicula pellentesque ac eget libero. Maecenas quis vulputate nisi. Aliquam erat volutpat. Phasellus sed libero et mauris posuere rhoncus et vel orci. Vivamus vitae accumsan nibh. Integer sagittis nunc non tristique tincidunt. Praesent a laoreet mauris, sed interdum urna. Aenean viverra leo eu purus lobortis consequat. Morbi bibendum justo nec diam mattis, non euismod libero hendrerit. Pellentesque luctus varius risus, quis pellentesque justo euismod at. Vestibulum tempor nisi in suscipit ornare. Duis in lacus at ipsum placerat tempor ac eget mauris. Nam efficitur sapien dapibus odio efficitur, vitae lacinia ipsum imperdiet. Vivamus eget augue finibus, volutpat metus et, varius arcu. Suspendisse potenti. Aliquam elementum pellentesque sem in laoreet. </p>"
            },
            $post = $('#post'),
            html = template(context);

        var showing_post = false,
            showPost = function () {
                var $posts = $('#posts'),
                    $close;
                showing_post = true;
                //$posts.parent().css({
                //    'height': 'auto'
                //});
                $posts.slideUp();
                $post.html(html).slideDown({
                    done: function () {
//                    window.location.hash = '#blog';
//                        goTo(2);
                        setHeights(2);
                        doScroll();

                        $close.click(function () {
                            //console.log('click');
                            //hidePost();
                            window.history.back();
                            return false;
                        }).animate({
                            'margin-top': 0
                        }, 200);
                    }
                });



                $close   = $('a#close-post');
                $close.css({
                    'margin-top': '1.5rem'
                });
                //window.location.hash = '#blog';
                //goTo(2);
                setHeights(2);
                doScroll();
            },
            hidePost = function () {
                showNav();

                showing_post = false;
                $('#posts').slideDown();
                $('#post').slideUp({
                    done: function () {
                        setHeights(2);
                        doScroll();
                    }
                });
            },
            hideNav   = function (instant) {
                if (!nav_hidden) {
                    nav_hidden = true;
                    toggleNav(instant);
                }
            },
            showNav   = function (instant) {
                if (nav_hidden) {
                    nav_hidden = false;
                    toggleNav(instant);
                }
            },
            toggleNav = function (instant) {
                $nav.animate({width: 'toggle'}, (instant ? 0 : 200));
            };

        $('a.title, a.more').click(function () {
            // this can't be in showPost because showPost can be triggered from popstate
            window.history.pushState({action: 'showpost'}, context.title, '#' + context.slug);
            showPost();
            return false;
        });


        window.onpopstate = function (e) {
            if (showing_post) {
                hidePost();
            } else if (e.state && e.state.action === 'showpost') {
                showPost();
            }
        };

        $('body>nav a').click(function () {
            $('body>nav a.active').removeClass('active');
            $(this).addClass('active');
            var target = $(this).data('target');
            goTo(target);
        });

        hideNav(true);

    });
}(window.jQuery));