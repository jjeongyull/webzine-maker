// 메인페이지의 헤더를 그린다
function draw_main_page_header(options, webzineList){
  let option = urldecode(options.template_info);
  option = JSON.parse(option);

  let header_template = option.main_header_template;
  let header_logo = option.header_file_name;

  $('#header').html(HEADER_TEMPLATE[`header_${header_template}`]);
    let imgTag = `<img class='cursor-pointer' id='btn_go_main' data-vol=${g_month} style="width: 150px;" src='img/${c_idx}/${header_logo}'>`;
    $('#main_header_logo').html(imgTag);

    let menu = $('#menu_list');
    let tempHTML = "";
    for(let i = 0; i < g_category_list.length; i++){
      let subJSON = webzineList.filter(items => Number(items.category_idx) === Number(g_category_list[i].idx));

      if(!isEmpty(subJSON)){
        subJSON = subJSON[0];
        tempHTML = tempHTML + `<li class='btn_go_subpage text-white text-base text-xl' data-idx=${subJSON.idx}>${g_category_list[i].name}</li>`;
       
      }
      
    }
    menu.html(tempHTML);

    if(!isEmpty(g_idx)){
      $("#header_inner").addClass("active");
    }
}

// 메인페이지의 배너를 그린다
function draw_main_banner(options, mainPageJSON){
  let option = urldecode(options.template_info);
  let banner_type = mainPageJSON.webzine_banner_type
  option = JSON.parse(option);

  let title_info = urldecode(mainPageJSON.main_info);
  title_info = JSON.parse(title_info);
  console.log(title_info);

  let title_div = "";
  let title_div_class= "";
  let title_class= "";
  let sub_title_class= "";

  let title = title_info.title;  // 타이틀
  let title_align = title_info.title_text_align;  // 타이틀 텍스트 정렬
  let title_font_size = title_info.title_font_size;  // 타이틀 폰트 사이즈
  let title_font_weight = title_info.title_font_weight;  // 타이틀 폰트 굵기
  let sub_title = title_info.sub_title;  // 서브타이틀
  let sub_title_font_size = title_info.sub_title_font_size;  // 서브타이틀 폰트사이즈
  let sub_title_font_weight = title_info.sub_title_font_weight;  // 서브타이틀 굵기

  let title_position = title_info.title_position;

  title_div_class = title_position;

  if(title_align == "left"){
    title_class = "text-left";
  }else if(title_align == "center"){
    title_class = "text-center";
  }else if(title_align == "right"){
    title_class = "text-right";
  }


  title_font_weight = 'title_weight_' + title_font_weight;
  sub_title_font_weight = 'sub_title_weight' + sub_title_font_weight; 


  title_div = `<div class='title-div text-white ${title_div_class}'>
    <h2 class='${title_class} ${title_font_weight} title-size text-sh mb-3'>${title}</h2>
    <h2 class='${title_class} ${sub_title_font_weight} sub-title-size text-sh'>${sub_title}</h2>
  </div>`;

  let banner_template = option.main_banner_template;

  $('#main_banner').html(BANNER_TEMPLATE[`banner_${banner_template}`]);
  let target = $('#banner_div');
  let tempHTML = "";
  if(Number(banner_type) === 1){ // 슬라이드 형일때
    let banner_arr = mainPageJSON.webzime_main_file_name;	
    banner_arr = banner_arr.split(',');
    tempHTML = `<div class="swiper mySwiper">
                  <div class="swiper-wrapper">`
    for(let i = 0; i < banner_arr.length; i++){
      tempHTML = tempHTML + `<div class="swiper-slide bg-img" style="background-image: url('img/${c_idx}/${mainPageJSON.webzine_month}/${banner_arr[i]}');">
        <div class='banner-overlay'></div>
        <div class='cir-line-deco'></div>
        <div class='back-cir' style="background-image: url('img/${c_idx}/${mainPageJSON.webzine_month}/${banner_arr[i]}');"></div>
      </div>`;
    }
    tempHTML = tempHTML + `</div>
          <div class='slide-btn-group'>
            <div class="swiper-button-prev banner-prev"></div>
            <div class="swiper-button-next banner-next"></div>
            <div class="swiper-pagination banner-count"></div>
          </div>
        </div>`;
    tempHTML = tempHTML + title_div;
    target.html(tempHTML);
    swiper = new Swiper(".mySwiper", {
      effect: "fade", // 페이드 인/아웃 효과
      autoplay: {
        delay: 5000, // 밀리초 단위, 5000은 5초
        disableOnInteraction: false, // 유저와의 상호작용 후에도 계속 autoplay 진행
      },
      fadeEffect: {
        crossFade: true
      },
      pagination: {
        el: ".swiper-pagination",
        type: "fraction",
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });
  }else{
    tempHTML = `<img src='img/${c_idx}/${mainPageJSON.webzine_month}/${mainPageJSON.webzime_main_file_name}'>`;
    tempHTML = tempHTML + title_div;
    target.html(tempHTML);
  }

  // 폰트사이즈 적용
  $('.title-size').css('font-size', `${title_font_size}px`);
  $('.sub-title-size').css('font-size', `${sub_title_font_size}px`);
}

// 메인페이지의 콘텐트 그리기
function draw_main_content(options, list, mainPageJSON){
  let target_1 = $('#section_1');
  let target_2 = $('#section_2');
  let target_3 = $('#section_4');

  let focusName = g_category_list.filter(item => Number(item.idx) === IN_FOCUS);
  if(focusName.length != 0){
    focusName = focusName[0].name;
  }

  let focusPart = list.filter((items) => Number(items.category_idx) === IN_FOCUS);
  focusPart.sort(function(a, b) {
    return a.view_order - b.view_order;
  });
  if(focusPart.length != 0){
    let focus_html = `<h2 class='main-content-title text-center mb-10 text-3xl text-4xl'>${focusName}</h2><div class="w-full grid grid-cols-1 grid-cols-2 gap-2 gap-4">`;
    let option = urldecode(options.template_info);
    option = JSON.parse(option);
  
    // 포커스
    $.each(focusPart, function(key, items){
      focus_html = focus_html + `<div class='p-2 h-60 h-96 section-bg cursor-pointer relative content-hover-event btn_go_subpage' data-idx=${items.idx} style="background-image: url('img/${c_idx}/${mainPageJSON.webzine_month}/${items.category_idx}/${items.main_page_thumnail}');">
        <div class='content-overlay'></div>
        <div class='content-hover'>
          <div class='content-more'>
            <span class='content-more-span content-more-span-1'></span>
            <span class='content-more-span content-more-span-2'></span>
          </div>
        </div>
        <h3 class='content-name'>${items.page_title}</h3>
        <p class='text-white text-base text-2xl content-sub-name'>${items.page_sub_title}</p>
      </div>`
    });
  
    focus_html = focus_html + '</div>';
    target_1.html(focus_html);
  }


  // 이슈 부분
  let issueName = g_category_list.filter(item => Number(item.idx) === KAT_ISSUE);
  if(issueName.length != 0){
    issueName = issueName[0].name;
  }

  let issuePart = list.filter((items) => Number(items.category_idx) === KAT_ISSUE);
  if(issuePart.length != 0){
    let issue_html = `<h2 class='main-content-title text-center mb-10 text-3xl text-4xl'>${issueName}</h2><div class='w-full block flex'>`;

    let count = 0;
    $.each(issuePart, function(key, items){
      let sub_name = g_category_list.filter(item => Number(item.idx) === Number(items.category_idx));
      sub_name = sub_name[0].name;
      if(count === 0){
        issue_html = issue_html + `<div class='w-full btn_go_subpage w-1/1 content-left-box' data-idx=${items.idx}>
          <h3 class='content-2-title'>${items.page_title}</h3>
          <p class='content-2-text'>${items.page_sub_title}</p>
          <div class='w-full section-bg h-80' style="background-image: url('img/${c_idx}/${mainPageJSON.webzine_month}/${items.category_idx}/${items.main_page_thumnail}');"></div>
        </div>`;
        count = count + 1;
      }else{
        issue_html = issue_html + `<div class='w-full btn_go_subpage w-1/1 content-right-box text-white' data-idx=${items.idx}>
          <h3 class='content-2-title-2 text-right'>${items.page_title}</h3>
          <p class='content-2-text-2 text-right'>${items.page_sub_title}</p>
          <div class='w-full section-bg h-80' style="background-image: url('img/${c_idx}/${mainPageJSON.webzine_month}/${items.category_idx}/${items.main_page_thumnail}');"></div>
        </div>`;
      }
    });
    target_2.html(issue_html);
  }
 

  // 프라자
  let plazaName = g_category_list.filter(item => Number(item.idx) === PLAZA);
  plazaName = plazaName[0].name;
  let plazaJSON = list.filter((items) => Number(items.category_idx) === PLAZA);
  let plaza_html = `<h2 class='main-content-title text-center mb-5 text-3xl text-4xl'>${plazaName}</h2><div>`;
  $.each(plazaJSON, function(key, items){
    plaza_html = plaza_html + `<div class="bg-gray-200 w-full block flex btn_go_subpage items-center mb-10" data-idx=${items.idx}>
    <div class='w-full w-1/4'>
      <img class='w-full block' src='img/${c_idx}/${mainPageJSON.webzine_month}/${items.category_idx}/${items.main_page_thumnail}'>
    </div>
    <div class='w-full w-3/4 p-5'>
      <h2 class='text-2xl font-bold mb-5 text-3xl main-color'>${items.page_title}</h2>
      <p class='sub-text text-lg text-2xl'>${items.page_sub_title}</p>
    </div>
    </div>`
  });
  plaza_html = plaza_html + `</div>`;
  target_3.html(plaza_html);
}

// footer를 그린다
function draw_footer(webzineOption){
  let option = urldecode(webzineOption.template_info);
  option = JSON.parse(option);
  let target = $('#footer');
  console.log(option);

  let footer_info_1 = option.footer_info_1;
  let footer_info_2 = option.footer_info_2;
  let footer_info_3 = option.footer_info_3;

  let footer_html = `<div class='block mx-auto flex gap-5 container px-5 px-5 items-center justify-center py-10'>
    <img class='block footer-logo mb-3 mb-0' src='img/${c_idx}/${option.footer_file_name}'>
    <div>
      <p class='f-color'>${footer_info_1}</p>
      <p class='text-xl f-color'>${footer_info_2}</p>
      <p class='f-color'>${footer_info_3}</p>
    </div>
  </div>`;

  target.html(footer_html);
}

// 서브페이지 배너 그리기
function draw_sub_banner(pData){
  let target = $('#sub_banner');
  let tempHTML = `<div class='w-full sub-banner-height relative'>
    <div class='w-full h-full absolute sub-banner left-0 top-0' style="background-image: url('img/${c_idx}/${g_month}/${pData.category_idx}/${pData.page_banner}');"></div>
    <div class='absolute center'>
      <p class='text-white text-center sub-banner-first mb-2'>${pData.page_title}</p>
      <h1 class='text-white sub-banner-second text-center font-bold'>${pData.page_sub_title}</h1>
    </div>
  </div>
  <div class='w-full border-tb bg-gray-200 px-5 px-0 mb-10'>
    <div class='w-1200 mx-auto py-5 flex items-center justify-between'>
      <p class='text-sm text-base'>${pData.write_date}</p>
      <p class='text-sm text-base'>작성자</p>
    </div>
  </div>`;
  target.html(tempHTML);
}

// 탭 버튼을 그린다
function draw_tab_btn(pData){
  let tempJSON = pData.sort(function(a, b) {
    return a.view_order - b.view_order;
  });
  let target = $('#tab_btn');
  let tempHTML = `<div class='w-1200 mx-auto flex items-center gap-5 mb-20 flex-wrap'>`

  $.each(tempJSON, function(key, items){
    tempHTML = tempHTML + `<div class='w-fit sub-tab sub-tab-${items.idx} btn_go_subpage' data-idx=${items.idx}>${items.page_title}</div>`
  });
  tempHTML = tempHTML + `</div>`;
  target.html(tempHTML);
  $(`.sub-tab-${g_idx}`).addClass('active');
}

// 서브페이지의 내용을 그린다
function draw_sub_content(pData){
  let target = $('#content');
  let tempHTML = urldecode(pData.contents);
  let temp_url = `../tempUpload`;
  let real_url = `img/${c_idx}/${pData.webzine_month}/${pData.category_idx}`;
  if(tempHTML.includes(temp_url)){
    tempHTML = tempHTML.replaceAll(temp_url, real_url);
  }
  target.html(tempHTML);
  console.log(tempHTML);
}

// 페이지 하단에 이번 호 다른 페이지들을 보여준다
function draw_sub_prev_list(thisPage, webzineList){
  let target = $('#prev_list');
  let tempHTML = `
  <div class='border-tb px-5 px-0'>
    <div class='w-1200 mx-auto flex items-center justify-between py-4'>
      <p class='text-lg text-xl'>태그:</p>
      <div class='flex items-center gap-4'>
        <img class='block sns-icon cursor-pointer' id='btn_sns_naver' src='img/btn_sns_naver.png' alt='네이버 공유 아이콘'>
        <img class='block sns-icon cursor-pointer' id='btn_sns_facebook' src='img/btn_sns_facebook.png' alt='페이스북 공유 아이콘'>
        <img class='block sns-icon cursor-pointer' id='btn_sns_kakao' src='img/btn_sns_kakao.png' alt='카카오 공유 아이콘'>
        <img class='block sns-icon cursor-pointer' id='btn_sns_share' src='img/btn_sns_share.png' alt='링크 공유 아이콘'>
      </div>
    </div>
  </div>
  <div class='w-1200 mx-auto py-14 relative px-5 px-0'>
    <div class="swiper swiper2 mySwiper mySwiper2">
      <div class="swiper-wrapper">`;

  let idx = thisPage.idx;
  let other_arr = webzineList.filter(items => Number(items.idx) != idx);

  if(other_arr.length != 0){
    $.each(other_arr, function(key, items){
      tempHTML = tempHTML + `<div class="swiper-slide swiper-slide2 btn_go_subpage block" data-idx=${items.idx}>
        <div class='h-60 section-bg' style="background-image: url('img/${c_idx}/${items.webzine_month}/${items.category_idx}/${items.main_page_thumnail}');" >
        </div>
        <div class='bg-white text-center p-4'>
          <p class='text-lg text-xl font-bold break-keep prev-list-title'>${items.page_title}</p>
          <p class='font-basic'>${items.webzine_month}</p>
        </div>
      </div>`;
    });
  }

  tempHTML = tempHTML + `</div>
                
              </div>
              <div class="swiper-pagination swiper-pagination-2"></div>
              </div>
              `;

  target.html(tempHTML);

  swiper = new Swiper(".mySwiper2", {
    slidesPerView: 2,
    spaceBetween: 10,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 4,
        spaceBetween: 40,
      },
      1024: {
        slidesPerView: 5,
        spaceBetween: 50,
      },
    },
  });
}

