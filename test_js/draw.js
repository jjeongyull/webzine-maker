// 헤더 그리기
function draw_header(){
  let target = $('#header');
  let header_option = g_option.main.header;
  console.log(header_option);

  let tempHTML = `<div class='flex p-5 z-10 bg-test items-center header_${header_option.header_width} header_${header_option.style}'>
    <div>
      <img src=${header_option.logo_image} style="width: ${header_option.img_width}px" alt='로고'>
    </div>
    <nav class='menu_${header_option.menu_position}'>
    <ul class='flex items-center gap-10 text-${header_option.menu_color} font-${header_option.menu_font_weight}'>`;

  if(!isEmpty(header_option.search)){
    // 검색기능 사용시 작성
  }

  for(let i = 0; i < g_category_list.length; i++){
    let subJSON = g_content_list.filter((items) => {
      return Number(items.category_idx) === Number(g_category_list[i].idx);
    });
    subJSON = subJSON[0];
    tempHTML = tempHTML + `<li class='menu' data-idx=${subJSON.idx}>${g_category_list[i].name}</li>`
  }

  tempHTML = tempHTML + `</ul></nav></div>`

  target.html(tempHTML);
  $('.menu').css('font-size', `${header_option.menu_font_size}px`);
}

// 배너를 그린다
function draw_banner(){
  let banner_option = g_option.main.banner; 
  let tempHTML = "";
  let target = $('#banner');
  let font_size_arr = [];
  if(Number(banner_option.banner_active) === 1){
    tempHTML = tempHTML + `<div class='w-${banner_option.banner_width} h-${banner_option.banner_height}'>`;

    if(g_main_list.banner_type === 'slide'){
      let banner_json = g_main_list.banner.items;
      tempHTML = tempHTML + `<div class="swiper mySwiper">
      <div class="swiper-wrapper">`
      $.each(banner_json, function(key, items){
        let sizeJSON = {};
        let className = "";
        let data_idx = "";
        if(!isEmpty(items.link)){
          className = 'btn_sub_page';
          data_idx = items.link;
        }
        sizeJSON.title_size = items.title.title_size;
        sizeJSON.sub_title_size = items.title.sub_title_size;
        tempHTML = tempHTML + `<div class="swiper-slide ${className} relative bg-img" data-idx=${data_idx} style="background-image: url('${items.image}');">
          <div class='text-${items.title.title_align} position-${items.title.title_position}'>
            <h2 class='banner-title-${key} text-white text-${items.title.title_weight}'>${items.title.title}</h2>
            <h3 class='banner-sub-title-${key} text-white text-${items.title.sub_title_weight}'>${items.title.sub_title}</h3>
          </div>
        </div>`;

        font_size_arr.push(sizeJSON);
      });
      tempHTML = tempHTML + `</div>
          <div class="swiper-button-next"></div>
          <div class="swiper-button-prev"></div>
          <div class="swiper-pagination"></div>
        </div>`
    }else{

    }
  }

  target.html(tempHTML);

  if(g_main_list.banner_type === 'slide'){
    swiper = new Swiper(".mySwiper", {
      cssMode: true,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      pagination: {
        el: ".swiper-pagination",
      },
      mousewheel: true,
      keyboard: true,
    });

    for(let i = 0; i < font_size_arr.length; i++){
      $(`.banner-title-${i}`).css('font-size', `${font_size_arr[i].title_size}px`);
      $(`.banner-sub-title-${i}`).css('font-size', `${font_size_arr[i].sub_title_size}px`);
    }
  }else{
    // 슬라이드가 아닐때 구현
  }
}

// 메인페이지에 콘텐츠들을 그린다
function draw_main_contents(){
  // 카테고리 뷰 순서대로 정렬
  let categoryJSON = g_category_list.sort(function(a, b) {
    return a.order - b.order;
  });

  // 카테고리 수 만큼 태그를 그린다
  let bodyTarget = $('#content');
  let bodyHTML = "";

  for(let i = 0; i < categoryJSON.length; i++){
    bodyHTML = bodyHTML + `<section id='section_${i}'></section>`;
  }

  bodyTarget.html(bodyHTML);

  // 옵션에서 콘텐츠 부분 저장
  let content_info_list = g_option.contents.content_info;

  // 콘텐츠 제목으로 카테고리 이름을 할건지 여부
  let content_category_name_active = g_option.contents.contents_category_text_view; // 0이면 보이게
  let content_category_name_align = g_option.contents.contents_category_text_align;

 

  $.each(categoryJSON, function(key, items){
    // 카테고리에 맞는 리스트들을 빼낸다
    let tempJSON = g_content_list.filter((items2) => {
      return Number(items2.category_idx) === Number(items.idx);
    });

    // view_order순서로 재정렬
    tempJSON.sort(function(a, b) {
      return a.view_order - b.view_order;
    });

    // 번호에 맞는 탬플릿을 가져온다
    let contents_template_info = content_info_list[key];

    let tempHTML = "<div class='mb-40'>";
    if(Number(content_category_name_active) === 0){
      tempHTML = tempHTML + `<h2 class='main-content-title text-3xl md:text-4xl mb-10 text-${content_category_name_align}'>${items.name}</h2>`;
    } 

    // 탬플릿별로 콘텐츠를 그린다
    let rtnHTML = draw_contents_template(contents_template_info, tempJSON);
    tempHTML = tempHTML + rtnHTML + `</div>`;

    let target = $(`#section_${key}`);
    target.html(tempHTML);
    console.log(contents_template_info);
  });
}

// footer를 그린다
function draw_main_footer(){
  let f_option = g_option.footer; 
  let target = $("#footer");

  let tempHTML = `
  <div class='py-10 bg-gray-200'>
    <div class='${f_option.display} w-${f_option.width} items-center justify-${f_option.align} gap-5'>
      <div>
        <img class='block' src=${f_option.img} style="width: ${f_option.logo_width}px" alt='로고'>
      </div>
      <div>
        <p>${f_option.title}</p>
        <p>${f_option.address}</p>
        <p>${f_option.copylight}</p>
      </div>
    </div>
  </div>
  `;

  target.html(tempHTML);
}

// 탬플릿 별로 콘텐츠를 그리고 html구조를 리턴한다
function draw_contents_template(template, pData){
  let rtnHTML = "";

  let slide_active = template.content_slide;
  let contents_template = template.content_template;

  if(Number(contents_template) === 1){
    if(Number(slide_active) === 1){ // 슬라이드일때

    }else{ // 아닐때
      rtnHTML = rtnHTML + `<div class='w-${template.width} grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4'>`;
      $.each(pData, function(key, items){
        rtnHTML = rtnHTML + `<div class="p-2 h-60 md:h-96 section-bg cursor-pointer relative content-hover-event btn_go_subpage" 
        data-idx=${items.idx} style="background-image: url('${items.banner.banner}');">
        <div class="content-overlay"></div>
        <div class="content-hover">
          <div class="content-more">
            <span class="content-more-span content-more-span-1"></span>
            <span class="content-more-span content-more-span-2"></span>
          </div>
        </div>
        <h3 class="content-name">${items.banner.title}</h3>
        <p class="text-white text-base md:text-2xl content-sub-name">${items.banner.sub_title}</p>
        </div>`;
      });
    }

  }else if(Number(contents_template) === 2){
    if(Number(slide_active) === 1){ // 슬라이드일때

    }else{ // 아닐때
      rtnHTML = rtnHTML + `<div class='w-${template.width} grid grid-cols-1 md:grid-cols-2'>`;
      $.each(pData, function(key, items){
        if (key % 2 === 0) { // 짝수일때
          rtnHTML = rtnHTML + `<div class="w-full btn_go_subpage md:w-1/1 content-left-box" data-idx=${items.idx}>
            <h3 class="content-2-title">${items.banner.title}</h3>
            <p class="content-2-text">${items.banner.sub_title}</p>
            <div class="w-full section-bg h-80" style="background-image: url('${items.banner.banner}');"></div>
          </div>`;
        } else { // 홀수일때
              rtnHTML = rtnHTML + `<div class="w-full btn_go_subpage md:w-1/1 content-right-box text-white" data-idx=${items.idx}>
              <h3 class="content-2-title-2 text-right">${items.banner.title}</h3>
              <p class="content-2-text-2 text-right">${items.banner.sub_title}</p>
              <div class="w-full section-bg h-80" style="background-image: url('${items.banner.banner}');"></div>
            </div>`
        }
      });
    }

  }else if(Number(contents_template) === 3){
    if(Number(slide_active) === 1){ // 슬라이드일때

    }else{ // 아닐때
      rtnHTML = rtnHTML + `<div class='w-${template.width} grid grid-cols-2 md:grid-cols-4 gap-5'>`;
      $.each(pData, function(key, items){
        rtnHTML = rtnHTML + `<div class='tem-3-rounded box-shadow btn_go_subpage' data-idx=${items.idx}>
          <div class='w-full h-60 section-bg' style="background-image: url('${items.banner.banner}');"></div>
          <div class='tem-3-textbox p-5 bg-white'>
            <h4 class='mb-2 font-bold text-2xl'>${items.banner.title}</h4>
            <p class='text-base'>${items.banner.sub_title}</p>
          </div>
        </div>`;
      });
    }
  }else if(Number(contents_template) === 4){
    if(Number(slide_active) === 1){ // 슬라이드일때

    }else{ // 아닐때
      rtnHTML = rtnHTML + `<div>`;
      $.each(pData, function(key, items){
        rtnHTML = rtnHTML + `<div class="w-${template.width}  bg-gray-200 block md:flex btn_go_subpage items-center mb-10" data-idx=${items.idx}>
          <div class="w-full md:w-1/4">
            <img class="w-full block" src=${items.banner.banner}>
          </div>
          <div class="w-full md:w-3/4 p-5">
            <h2 class="text-2xl font-bold mb-5 md:text-3xl main-color">${items.banner.title}</h2>
            <p class="sub-text text-lg md:text-2xl">${items.banner.sub_title}</p>
          </div>
          </div>`;
      });
    }
  }

  rtnHTML = rtnHTML + `</div>`;

  return rtnHTML;
}
