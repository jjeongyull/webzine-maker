$(async function(){
  var urlParams = new URLSearchParams(window.location.search);
  g_month = urlParams.get('vol');
  let param = {};

  if(isEmpty(g_month)){
    // 메인페이지를 불러온다
    param.cmd = "load_main_webzine";
    param.tbl_name = "webzine_main";
    param.c_idx = c_idx;
    await call_ajax(param,  true);

    // 웹진 옵션을 불러온다
    param = {};
    param.cmd = "load_webzine_option";
    param.tbl_name = "webzine_option";
    param.c_idx = c_idx;
    await call_ajax(param,  true);

    // 카테고리를 불러온다
    param = {};
    param.cmd = "load_webzine_category";
    param.tbl_name = "webzine_category";
    param.c_idx = c_idx;
    await call_ajax(param,  true);

    // 서브페이지들을 불러온다
    param = {};
    param.cmd = "load_webzine_list";
    param.tbl_name = "webzine_contents";
    param.c_idx = c_idx;
    await call_ajax(param,  true);

    let mainPageJSON = g_webzine_main_list.filter(items => Number(items.webzine_active) === 1);
    mainPageJSON = mainPageJSON.reduce((max, item) => {
      return max.webzine_month > item.webzine_month ? max : item;
    });
    console.log(mainPageJSON);

    let webzineOption = g_webzine_option[0];
    console.log(webzineOption);

    let webzineList = g_webzine_content_list.filter(items => String(items.webzine_month) === String(mainPageJSON.webzine_month));
    console.log(webzineList);

    g_month = mainPageJSON.webzine_month;

    draw_main_page_header(webzineOption, webzineList);
    draw_main_banner(webzineOption, mainPageJSON);
    draw_main_content(webzineOption, webzineList, mainPageJSON);
    draw_footer(webzineOption);
  }else{
    param.cmd = "load_main_webzine";
    param.tbl_name = "webzine_main";
    param.c_idx = c_idx;
    await call_ajax(param,  true);

    // 웹진 옵션을 불러온다
    param = {};
    param.cmd = "load_webzine_option";
    param.tbl_name = "webzine_option";
    param.c_idx = c_idx;
    await call_ajax(param,  true);

    // 카테고리를 불러온다
    param = {};
    param.cmd = "load_webzine_category";
    param.tbl_name = "webzine_category";
    param.c_idx = c_idx;
    await call_ajax(param,  true);

    // 서브페이지들을 불러온다
    param = {};
    param.cmd = "load_webzine_list";
    param.tbl_name = "webzine_contents";
    param.c_idx = c_idx;
    await call_ajax(param,  true);

    let mainPageJSON = g_webzine_main_list.filter(items => String(items.webzine_month) === g_month);
    mainPageJSON = mainPageJSON[0]

    let webzineOption = g_webzine_option[0];
    console.log(webzineOption);

    let webzineList = g_webzine_content_list.filter(items => String(items.webzine_month) === String(mainPageJSON.webzine_month));
    console.log(webzineList);

    g_month = mainPageJSON.webzine_month;

    draw_main_page_header(webzineOption, webzineList);
    draw_main_banner(webzineOption, mainPageJSON);
    draw_main_content(webzineOption, webzineList, mainPageJSON);
    draw_footer(webzineOption);
  }

  // 더미데이터 슬라이드
  swiper2 = new Swiper(".mySwiper2", {
    slidesPerView: 2,
    spaceBetween: 10,
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
    },
  });

  // // 풀페이지 적용 js
  // var sections = $('.full-content'); // 풀페이지에 이용할 섹션을 모두 선택
  // var pagenation = $('.fullpage-btn'); // 풀페이지에 이용할 섹션을 모두 선택

  // function scrollToSection(index) {
  //   isScrolling = true;
  //   $('html, body').animate({
  //     scrollTop: sections.eq(index).offset().top
  //   }, 600, function() {
  //     isScrolling = false;
  //   });
  // }
  
  // function navigateUp() {
  //   if (currentSection > 0 && !isScrolling) {
  //     currentSection--;
  //     scrollToSection(currentSection);
  //   }
  // }
  
  // function navigateDown() {
  //   if (currentSection < sections.length - 1 && !isScrolling) {
  //     currentSection++;
  //     scrollToSection(currentSection);
  //   }
  // }
  
  // function setActiveSection(index) {
  //   sections.removeClass('active');
  //   sections.eq(index).addClass('active');
  //   pagenation.removeClass('active');
  //   pagenation.eq(index).addClass('active');
  // }
  
  // // 윈도우 너비가 770px 이상인 경우에만 풀페이지 기능을 활성화
  // if ($(window).width() >= 770) {
  //   $(document).on('keydown', function(e) {
  //     if (e.which === 38) {
  //       navigateUp();
  //     } else if (e.which === 40) {
  //       navigateDown();
  //     }
  //   });
  
  //   $(window).on('wheel', function(e) {
  //     if (e.originalEvent.deltaY > 0) {
  //       navigateDown();
  //     } else {
  //       navigateUp();
  //     }
  //   });
  
  //   $(window).on('scroll', function() {
  //     var scrollPos = $(window).scrollTop();
  //     var windowHeight = $(window).height();
  
  //     sections.each(function(index) {
  //       var sectionTop = $(this).offset().top;
  //       var sectionHeight = $(this).outerHeight();
  
  //       if (sectionTop <= scrollPos + windowHeight / 2 && sectionTop + sectionHeight > scrollPos + windowHeight / 2) {
  //         currentSection = index;
  //         setActiveSection(currentSection);
  //       }
  //     });
  //   });
  
  //   $(document).on('click', '.fullpage-btn', function() {
  //     pagenation.removeClass('active');
  //     var index = $(this).data('index');
  //     scrollToSection(Number(index))
  //     setActiveSection(Number(index))
  //   });
  // }
});