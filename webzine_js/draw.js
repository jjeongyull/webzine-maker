// 헤더를 그린다
function draw_header(){
  let target = $('#header');

  let header_option = urldecode(g_webzine_option[0].template_info);
  header_option = JSON.parse(header_option);
  let last_vol_active = header_option.last_vol_active;
  header_option = header_option.header;
  console.log(header_option);

  

  let main_option = g_webzine_main_list.filter((items) => {
    return String(items.webzine_month) === String(WEZINE_MONTH);
  });
  main_option = main_option[0];
  main_option = urldecode(main_option.main_info);
  main_option = JSON.parse(main_option);
  let banner_option = main_option.banner;

  let headerHTML = `<div class="w-full px-5 header-bg-b header-${header_option.style}">`;
  let w_class_name = "";
  if(header_option.width != "100%"){
    w_class_name = `header-width-${header_option.width}`;
  }else{
    w_class_name = 'w-full'
  }
  let logo_option = header_option.logo;
  let link = "";
  if(Number(logo_option.link) === 0){
    link = "javascript:void(0)";
  }else if(Number(logo_option.link) === 1){
    link = 'index.html';
  }else{
    link = logo_option.link;
  }
  let menu_option = header_option.menu;
  let menu_list_html = "";
  let categoryJSON = g_category_list.sort(function(a, b) {
    return a.view_order - b.view_order;
  });
  for(let i = 0; i < categoryJSON.length; i++){
    let idx = "";
    let tempJSON = g_webzine_content_list.filter((items) => {
      return Number(items.category_idx) === Number(categoryJSON[i].idx) && items.webzine_month === WEZINE_MONTH;
    });
    tempJSON.sort((a, b) => {
      return Number(a.view_order) - Number(b.view_order);
    });
    if(tempJSON.length != 0){
      idx = tempJSON[0].idx;
    }else{
      idx = "";
    }
    if(!isEmpty(idx)){
      menu_list_html = menu_list_html + `<li class='cursor-pointer btn_go_sub_page block' data-idx=${idx}>${categoryJSON[i].name}</li>`;
    }
  }
  let search_option = header_option.search;
  let searchHTML = '';
  if(Number(search_option.visible) === 0){
    searchHTML = "";
  }else{
    searchHTML `<div class='search-tem-${search_option.template} flex items-center gap-2 position-${search_option.position}'>
      <input type='text' class='search-input-${search_option.template}'>
      <button>검색</button>
    </div>`
  }

  let logo_html = "";
  let option_html = "";
  let main_temp = [...g_webzine_main_list];
  if (window.location.href.includes("http://katswebzine.kr/")) {
    main_temp = main_temp.filter((items) => {
      return Number(items.webzine_active) === 1;
    });
  }
  for(let i = 0; i < main_temp.length; i++){
    if(main_temp[i].webzine_month === WEZINE_MONTH){
      option_html += `<li data-month='${main_temp[i].webzine_month}' selected>${main_temp[i].page_title}</li>`;
    }else{
      option_html += `<li data-month='${main_temp[i].webzine_month}'>${main_temp[i].page_title}</li>`;
    }
  }
  if(Number(banner_option.title_logo_view) === 1){
    if(Number(last_vol_active) === 1){ // 지난 호 보기 사용시
      logo_html = `<div class='flex items-center gap-2 position-${logo_option.position}'><a class='w-fit block h-fit' href=${link}>
      <img class='block header-logo' style="width: ${logo_option.width}px" src='https://webzine.menteimo.com/webzine_folder/${UUID}/${logo_option.src}' alt='${logo_option.description}'>
      </a>
      <div class='logo-title-sel' id='btn_select_vol'>
        <h3>${main_option.page_title}</h3>
      <ul id='last_vol_sel'>
        ${option_html}
      </ul>
      </div>
    </div>`
    }else{
      logo_html = `<a class='w-fit gap-3 items-center flex w-fit h-fit position-${logo_option.position}' href=${link}>
      <img class='block header-logo' style="width: ${logo_option.width}px" src='https://webzine.menteimo.com/webzine_folder/${UUID}/${logo_option.src}' alt='${logo_option.description}'>
      <div class='logo-title'>
        ${main_option.page_title}
      </div>
    </a>`
    }

  }else{
    if(Number(last_vol_active) === 1){ // 지난 호 보기 사용시
      logo_html = `<div class='flex items-center gap-2 position-${logo_option.position}'><a class='w-fit block h-fit ' href=${link}>
      <img class='block header-logo' style="width: ${logo_option.width}px" src='https://webzine.menteimo.com/webzine_folder/${UUID}/${logo_option.src}' alt='${logo_option.description}'>
      </a>
      <div class='logo-title-sel' id='btn_select_vol'>
        <h3>${main_option.page_title}</h3>
      <ul id='last_vol_sel'>
        ${option_html}
      </ul>
      </div>
    </div>`
    }else{
      logo_html = `<a class='block w-fit h-fit position-${logo_option.position}' href=${link}>
      <img class='block header-logo' style="width: ${logo_option.width}px" src='https://webzine.menteimo.com/webzine_folder/${UUID}/${logo_option.src}' alt='${logo_option.description}'>
    </a>`
    }
 
  }

  headerHTML = headerHTML + `
    <div class='${w_class_name} relative header-height-${header_option.height} flex items-center'>
      ${logo_html}
      <div class='mo-menu-tem-1' id='btn_mo_menu'>
        <span class='line line-1'></span>
        <span class='line line-2'></span>
        <span class='line line-3'></span>
      </div>
      <nav class='menu-div position-${menu_option.position} w-max'>
        <ul class='flex items-center gap-5 mo-menu-1' id='mo_menu_1'>
          ${menu_list_html}
        </ul>
      </nav>
      ${searchHTML}
    </div>
  `;
  headerHTML = headerHTML + `</div>`;
  target.html(headerHTML);
  $('.btn_go_sub_page').css({
    'font-size' : `${menu_option.size}px`,
    'font-weight' : `${menu_option.weight}`,
    'color' : `${menu_option.color}`
  });
}

// 메인페이지에 배너를 그린다
function draw_main_banner(){
  let target = $('#banner');
  let main_option = g_webzine_main_list.filter((items) => {
    return String(items.webzine_month) === String(WEZINE_MONTH);
  });
  main_option = main_option[0];
  main_option = urldecode(main_option.main_info);
  main_option = JSON.parse(main_option);
  console.log(main_option);
  let banner_option = main_option.banner;
  let banner_width = banner_option.width;
  let banner_height = banner_option.height;
  let titleHTML = "";
  if(String(banner_width) === "100%"){
    banner_width = "w-full";
  }else{
    banner_width = `w-${banner_width}`;
  }
  if(Number(banner_height) === 0){
    banner_height = "h-screen"
  }else{
    banner_height = "h-h-screen"
  }
  let bannerHTML = `<div class='${banner_width} ${banner_height}'>`;
  if(Number(banner_option.type) === 0){ // 단일 이미지형
    if(Number(banner_option.title_visible) === 1){
      titleHTML = `<div class='w-full text-${banner_option.title_align} position-${banner_option.title_position}'>
        <h1 class='banner-title'>${banner_option.title}</h1>
        <h2 class='banner-sub-title'>${banner_option.sub_title}</h2>
      </div>`;
    }
    let link_arr = banner_option.src.split(',');
    link_arr = link_arr[0];
    bannerHTML = bannerHTML + `<img class='block' src='img/${link_arr}'>${titleHTML}`;
  }else{ // 슬라이드 형
    bannerHTML = bannerHTML + `<div class="swiper mySwiper"><div class="swiper-wrapper">`;

    if(Number(banner_option.link_active) === 0){ // 링크를 사용하지않을때 (직접 이미지 첨부)
      // let link_arr = banner_option.src.split(',');
      for(let i = 0; i < banner_option.src.length; i++){
        if(Number(banner_option.b_title_active) === 1){
          titleHTML = `<div class='w-full text-${banner_option.title_align} position-${banner_option.title_position}'>
          <h1 class='banner-title'>${banner_option.banner_titles[i].title}</h1>
          <h2 class='banner-sub-title'>${banner_option.banner_titles[i].sub_title}</h2>
        </div>`;
        }else{
          titleHTML = `<div class='w-full text-${banner_option.title_align} position-${banner_option.title_position}'>
          <h1 class='banner-title'>${banner_option.title}</h1>
          <h2 class='banner-sub-title'>${banner_option.sub_title}</h2>
        </div>`;
        }
       
        bannerHTML = bannerHTML + `<div class="swiper-slide">
              <img class='block' src='img/${banner_option.src[i]}'><div class='banner-overlay'></div>${titleHTML}
              
            </div>`;
      }
    }else{ // 링크사용 (카테고리)
      if(Number(banner_option.category_type) === 0){ // 하나의 카테고리 내의 전체 콘텐츠
        let list = g_webzine_content_list.filter((items) => {
          return Number(items.category_idx) === Number(banner_option.link);
        });
        if(list.length != 0){
          for(let i = 0; i < list.length; i++){
            let sub_name = list[i].sub_category_idx;
            sub_name = g_sub_category_list.filter((items) => {
              return Number(items.idx) === Number(sub_name);
            });
            sub_name = sub_name[0].name;
            titleHTML = `<div class='w-full text-${banner_option.title_align} position-${banner_option.title_position}'>
              <h1 class='banner-title'>${sub_name}</h1>
              <h2 class='banner-sub-title'>${list[i].page_title}</h2>
            </div>`;
            bannerHTML = bannerHTML + `<div class="swiper-slide cursor-pointer btn_go_sub_page" data-idx=${list[i].idx}>
              <img class='block' src='img/${list[i].category_idx}/${list[i].main_page_thumnail}'>
              <div class='banner-overlay'></div>
              ${titleHTML}
            </div>`;
          }
        }
      }else{ // 여러개 카테고리 첫번째 콘텐츠
        for(let i = 0; i < banner_option.link.length; i++){
          let list = g_webzine_content_list.filter((items) => {
            return Number(items.category_idx) === Number(banner_option.link[i]);
          });
          if(list.length != 0){
            let sub_name = list[i].sub_category_idx;
            sub_name = g_sub_category_list.filter((items) => {
              return Number(items.idx) === Number(sub_name);
            });
            titleHTML = `<div class='w-full text-${banner_option.title_align} position-${banner_option.title_position}'>
              <h1 class='banner-title'>${sub_name}</h1>
              <h2 class='banner-sub-title'>${list.page_title}</h2>
            </div>`;
            list = list[0];
            bannerHTML = bannerHTML + `<div class="swiper-slide btn_go_sub_page" data-idx=${list.idx}>
              <img class='block' src='img/${WEZINE_MONTH}/img/${list.category_idx}/${list.main_page_thumnail}'>
              <div class='banner-overlay'></div>
              ${titleHTML}
            </div>`;
          }
        }
      }
    }
    bannerHTML = bannerHTML + `
    </div>
      <div class="swiper-button-next"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-pagination"></div>
    </div>
    `;
  }

  bannerHTML = bannerHTML + '</div>';
  target.html(bannerHTML);
  if(Number(banner_option.type) === 1){
    swiper = new Swiper(".mySwiper", {
      loop: true,
      pagination: {
        el: ".swiper-pagination",
        type: "fraction",
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
    });
  }
  let title_weight = banner_option.title_weight;
  let sub_title_weight = banner_option.sub_title_weight;
  if(Number(title_weight) === 1){
    title_weight = "bold";
  }else{
    title_weight = "weight";
  }
  if(Number(sub_title_weight) === 1){
    sub_title_weight = "bold";
  }else{
    sub_title_weight = "weight";
  }
  $('.banner-title').css({
    "font-size" : `${banner_option.title_size}px`,
    "font-weight" : `${title_weight}`,
    "color" : `white`,
    "word-break" : "keep-all"
  });
  $('.banner-sub-title').css({
    "font-size" : `${banner_option.sub_title_size}px`,
    "font-weight" : `${sub_title_weight}`,
    "color" : `white`,
    "word-break" : "keep-all"
  });
}

// 메인페이지의 컨텐츠들을 그린다
function draw_main_contents(){
  let target = $('#content');
  let sectionHTML = "";
  let main_option = g_webzine_main_list.filter((items) => {
    return String(items.webzine_month) === String(WEZINE_MONTH);
  });
  main_option = main_option[0];
  main_option = urldecode(main_option.main_info);
  main_option = JSON.parse(main_option);
  console.log(main_option);

  // 페이지의 노출할 섹션을 갯수대로 먼저 그린다
  let section_option = main_option.section;
  for(let i = 0; i < section_option.length; i++){
    let width = section_option[i].width;
    if(String(width) === "100%"){
      width = "w-full";
    }else{
      width = `${width}`;
    }
    sectionHTML = sectionHTML + `<section class='header-width-${width} md-px-5 px-0' id='section_${i}'></section>`;
  }
  target.html(sectionHTML);

  for(let i = 0; i < section_option.length; i++){
    let target = $(`#section_${i}`);
    let section_tem = section_option[i].section_template;
    if(Number(section_tem) === 0){ // 상자형
      draw_tenmplate_box(section_option[i], target, WEZINE_MONTH);
    }else if(Number(section_tem) === 1){ // 카드형
      draw_tenmplate_card(section_option[i], target, WEZINE_MONTH);
    }else if(Number(section_tem) === 2){ // 리스트형
      draw_tenmplate_list(section_option[i], target, WEZINE_MONTH);
    }else if(Number(section_tem) === 3){ // 상자형2형
      draw_tenmplate_box2(section_option[i], target, WEZINE_MONTH);
    }else if(Number(section_tem) === 4){ // 카드형 3
      draw_tenmplate_card_3(section_option[i], target, WEZINE_MONTH);
    }else if(Number(section_tem) === 5){ // 카드슬라이드형
      draw_tenmplate_card_slide(section_option[i], target, WEZINE_MONTH);
    }
  }
}

// footer그리기
function draw_footer(){
  let target = $('#footer');
  let footer_option = urldecode(g_webzine_option[0].template_info);
  footer_option = JSON.parse(footer_option);
  footer_option = footer_option.footer;
  console.log(footer_option);

  if(footer_option.visible === "visible"){
    let footer_html = "<div class='w-full bg-gray-200 py-10'>";
    let footer_width = footer_option.width;
    let footer_inner_align = footer_option.inner_align;
    let position = footer_option.position;
    if(String(position) === "left"){
      position = "justify-start items-center";
    }else if(String(position) === "center"){
      position = "justify-center items-center";
    }else if(String(position) === "right"){
      position = "justify-end items-center";
    }
    let link_active = footer_option.link;
    if(Number(link_active) === 1){
      link_active = "index.html";
    }else{
      link_active = "javascript:void(0)"
    }
    let logo_width = footer_option.logo_width;
    footer_html = footer_html + `<div class='header-width-${footer_width} md-px-5 px-0 block ${footer_inner_align} ${position} gap-5'>
      <a class='block md-mb-2 mb-0' href=${link_active}><img class='block f-logo' style="width: ${logo_width}px;" src='https://webzine.menteimo.com/webzine_folder/${UUID}/${footer_option.src}' alt='${footer_option.description}'></a>
      <div>
        <p class='text-lg mb-1'>${footer_option.customer_name}</p>
        <p class='text-lg mb-1'>${footer_option.address}</p>
        <p class='text-base'>${footer_option.copyright}</p>
      </div>
    `;
    footer_html = footer_html + `</div>`;
  
    target.html(footer_html);
  }
}



// ==========================================================================

// 탬플릿 별 그리기
function draw_tenmplate_box(option, target, month){ // 상자형
  let tempHTML = "<div class='mb-20 mb-40'>";
  let ca_idx = option.category_idx;
  console.log(option)
  let tempLIST = g_webzine_content_list.filter((items) => {
    return Number(items.category_idx) === Number(ca_idx);
  });
  tempLIST = tempLIST.filter((items) => {
    return items.webzine_month === month;
  });
  tempLIST.sort((a, b) => {
    return Number(a.view_order) - Number(b.view_order);
  });
  let caName = g_category_list.filter((items) => {
    return Number(items.idx) === Number(ca_idx);
  });
  caName = caName[0].name;
  if(tempLIST.length != 0){
    if(Number(option.section_category_view) === 1){
      if(!isEmpty(option.category_description)){
        tempHTML = tempHTML + `
        <div class='w-full md-block flex items-baseline md-mb-5 mb-10 gap-4'>
          <h2 class='main-content-title text-${option.section_category_align} text-3xl text-5xl'>${caName}</h2>
          <p class='category-description'>${option.category_description}</p>
        </div>
        <div class='w-full grid md-grid-cols-1 grid-cols-2 gap-2 gap-4'>
      `;
      }else{
        tempHTML = tempHTML + `
        <h2 class='main-content-title text-${option.section_category_align} md-mb-5 mb-10 md-text-3xl text-5xl'>${caName}</h2>
        <div class='w-full grid grid-cols-1 grid-cols-2 gap-2 gap-4'>
      `;
      }
 
    }else{
      tempHTML = tempHTML + `
      <div class='w-full grid md-grid-cols-1 grid-cols-2 gap-2 gap-4'>
    `;
    }
    
    for(let i = 0; i < tempLIST.length; i++){
      let idx = tempLIST[i].idx;
      let subCaName = g_sub_category_list.filter((items) => {
        return Number(items.idx) === Number(tempLIST[i].sub_category_idx);
      });
      if(subCaName.length != 0){
        subCaName = subCaName[0].name;
      }else{
        subCaName = tempLIST[i].page_title;
      }
      tempHTML = tempHTML + `
      <div class="p-2 md-h-60 h-96 section-bg cursor-pointer relative content-hover-event btn_go_sub_page" data-idx=${idx} style="background-image: url('img/${tempLIST[i].category_idx}/${tempLIST[i].main_page_thumnail}');">
      <div class="content-overlay"></div>
      <div class="content-hover">
        <div class="content-more">
          <span class="content-more-span content-more-span-1"></span>
          <span class="content-more-span content-more-span-2"></span>
        </div>
      </div>
      <h3 class="content-name md-text-xl text-3xl">${subCaName}</h3>
      <p class="text-white md-text-lg text-2xl content-sub-name">${tempLIST[i].page_sub_title}</p>
    </div>`
    }
  }
  tempHTML = tempHTML + `</div></div>`;
  target.html(tempHTML);
}

function draw_tenmplate_card(option, target, month){ // 카드형
  let tempHTML = "<div class='md-mb-20 mb-40'>";
  let ca_idx = option.category_idx;
  let tempLIST = g_webzine_content_list.filter((items) => {
    return Number(items.category_idx) === Number(ca_idx);
  });
  tempLIST = tempLIST.filter((items) => {
    return items.webzine_month === month;
  });
  tempLIST.sort((a, b) => {
    return Number(a.view_order) - Number(b.view_order);
  });
  let caName = g_category_list.filter((items) => {
    return Number(items.idx) === Number(ca_idx);
  });
  caName = caName[0].name;
  if(tempLIST.length != 0){
    if(Number(option.section_category_view) === 1){
      if(!isEmpty(option.category_description)){
        if(tempLIST.length === 2){
          tempHTML = tempHTML + `
          <div class='w-full md-block flex items-baseline md-mb-5 mb-10 gap-4'>
            <h2 class='main-content-title text-${option.section_category_align} md-text-3xl text-5xl'>${caName}</h2>
            <p class='category-description'>${option.category_description}</p>
          </div>
          <div class='w-full block flex'>`;
        }else{
          tempHTML = tempHTML + `
          <div class='w-full md-block flex items-baseline md-mb-5 mb-10 gap-4'>
            <h2 class='main-content-title text-${option.section_category_align} md-text-3xl text-5xl'>${caName}</h2>
            <p class='category-description'>${option.category_description}</p>
          </div>
          <div class='w-full md-block flex gap-5'>`;
        }

      }else{
        if(tempLIST.length === 2){
          tempHTML = tempHTML + `
          <h2 class='main-content-title text-${option.section_category_align} mb-5 mb-10 text-3xl text-5xl'>${caName}</h2>
          <div class='w-full md-block flex'>
        `;
        }else{
          tempHTML = tempHTML + `
          <h2 class='main-content-title text-${option.section_category_align} mb-5 mb-10 text-3xl text-5xl'>${caName}</h2>
          <div class='w-full md-block flex gap-5'>
        `;
        }
       
      }
 
    }else{
      if(tempLIST.length === 2){
        tempHTML = tempHTML + `
        <div class='w-full md-block flex'>`;
      }else{
        tempHTML = tempHTML + `
        <div class='w-full md-block flex gap-5'>`;
      }

    }
    if(tempLIST.length === 2){
      $.each(tempLIST, function(key, items){
        let idx = items.idx;
        let subCaName = g_sub_category_list.filter((items2) => {
          return Number(items2.idx) === Number(items.sub_category_idx);
        });
        if(subCaName.length != 0){
          subCaName = subCaName[0].name;
        }else{
          subCaName = items.page_title;
        }
        if (key % 2 === 0) {
          tempHTML = tempHTML + `<div class="w-full btn_go_sub_page w-1-1 content-left-box" data-idx=${idx}>
            <h3 class="content-2-title md-text-xl text-3xl">${subCaName}</h3>
            <p class="content-2-text md-text-lg text-2xl">${items.page_sub_title}</p>
            <div class="w-full section-bg h-80" style="background-image: url(img/${items.category_idx}/${items.main_page_thumnail}););"></div>
          </div>`;
        }else{
          tempHTML = tempHTML + `<div class="w-full btn_go_sub_page w-1-1 content-right-box text-white" data-idx=${idx}>
            <h3 class="content-2-title-2 text-right md-text-xl text-3xl">${subCaName}</h3>
            <p class="content-2-text-2 text-right md-text-lg text-2xl">${items.page_sub_title}</p>
            <div class="w-full section-bg h-80" style="background-image: url(img/${items.category_idx}/${items.main_page_thumnail});"></div>
          </div>`;
        }
      });
    }else{
      $.each(tempLIST, function(key, items){
        let idx = items.idx;
        let subCaName = g_sub_category_list.filter((items2) => {
          return Number(items2.idx) === Number(items.sub_category_idx);
        });
        if(subCaName.length != 0){
          subCaName = subCaName[0].name;
        }else{
          subCaName = items.page_title;
        }
        tempHTML = tempHTML + `<div class="w-full btn_go_sub_page w-1-1 content-left-box-2 md-mb-5 card-3-box" data-idx=${idx}>
          <h3 class="content-2-title-2 text-left md-text-xl text-3xl">${subCaName}</h3>
          <p class="content-2-text-2 text-left md-text-lg text-2xl">${items.page_sub_title}</p>
          <div class="w-full section-bg h-80" style="background-image: url(img/${items.category_idx}/${items.main_page_thumnail});"></div>
        </div>`;
      });
    }

  }
  tempHTML = tempHTML + `</div></div>`;
  target.html(tempHTML);
}

function draw_tenmplate_list(option, target, month){ // 리스트형
  let tempHTML = "<div class='mb-10 mb-20'>";
  let ca_idx = option.category_idx;
  let tempLIST = g_webzine_content_list.filter((items) => {
    return Number(items.category_idx) === Number(ca_idx);
  });
  tempLIST = tempLIST.filter((items) => {
    return items.webzine_month === month;
  });
  tempLIST.sort((a, b) => {
    return Number(a.view_order) - Number(b.view_order);
  });
  let caName = g_category_list.filter((items) => {
    return Number(items.idx) === Number(ca_idx);
  });
  caName = caName[0].name;
  if(tempLIST.length != 0){
   
    tempHTML = tempHTML + `
    <div class='w-full block'>`;
      
 
    
    $.each(tempLIST, function(key, items){
      let idx = items.idx;
      let subCaName = g_sub_category_list.filter((items2) => {
        return Number(items2.idx) === Number(items.sub_category_idx);
      });
      let caName = g_category_list.filter((items2) => {
        return Number(items2.idx) === Number(items.category_idx);
      });
      caName = caName[0].name;
      if(subCaName.length != 0){
        subCaName = subCaName[0].name;
      }else{
        subCaName = items.page_title;
      }
      tempHTML = tempHTML + `<div class="w-full md-block flex btn_go_sub_page justify-between bg-gray-100 items-center mb-10" data-idx=${idx}>
        <h3 class='text-white bg-blue-800 md-w-full w-fit py-2 md-px-5 px-7 text-lg font-bold'>${caName}</h3>
        <p class='text-base md-px-5 py-3 py-0'>${items.webzine_writer}</p>
      </div>`;
    });
    tempHTML = tempHTML + `</div></div>`;
  }
  target.html(tempHTML);
}

function draw_tenmplate_box2(option, target, month){ // 카드형2형
  let tempHTML = "<div class='md-mb-20 mb-40'>";
  let ca_idx = option.category_idx;
  let tempLIST = g_webzine_content_list.filter((items) => {
    return Number(items.category_idx) === Number(ca_idx);
  });
  tempLIST = tempLIST.filter((items) => {
    return items.webzine_month === month;
  });
  tempLIST.sort((a, b) => {
    return Number(a.view_order) - Number(b.view_order);
  });
  let caName = g_category_list.filter((items) => {
    return Number(items.idx) === Number(ca_idx);
  });
  caName = caName[0].name;
  if(tempLIST.length != 0){
    if(Number(option.section_category_view) === 1){
      if(!isEmpty(option.category_description)){
        tempHTML = tempHTML + `
        <div class='w-full md-block flex items-baseline md-mb-5 mb-10 gap-4'>
          <h2 class='main-content-title text-${option.section_category_align} md-text-3xl text-5xl'>${caName}</h2>
          <p class='category-description'>${option.category_description}</p>
        </div>
        <div class="w-1100 grid md-grid-cols-1 grid-cols-${tempLIST.length} gap-5">
      `;
      }else{
        tempHTML = tempHTML + `
        <h2 class='main-content-title text-${option.section_category_align} md-mb-5 mb-10 md-text-3xl text-5xl'>${caName}</h2>
        <div class="w-1100 grid md-grid-cols-1 grid-cols-${tempLIST.length} gap-5">
      `;
      }
 
    }else{
      tempHTML = tempHTML + `
      <div class="w-1100 grid md-grid-cols-1 grid-cols-${tempLIST.length} gap-5">
    `;
    }
    $.each(tempLIST, function(key, items){
      let idx = items.idx;
      let subCaName = g_sub_category_list.filter((items2) => {
        return Number(items2.idx) === Number(items.sub_category_idx);
      });
      if(subCaName.length != 0){
        subCaName = subCaName[0].name;
      }else{
        subCaName = items.page_title;
      }
      tempHTML = tempHTML + `<div class="tem-3-rounded box-shadow btn_go_sub_page" data-idx=${idx}>
        <div class="w-full h-72 section-bg border-bt-line" style="background-image: url(img/${items.category_idx}/${items.main_page_thumnail});"></div>
        <div class="tem-3-textbox p-5 bg-white">
          <h4 class="mb-2 font-bold md-text-xl text-3xl">${subCaName}</h4>
          <p class="md-text-lg text-2xl">${items.page_sub_title}</p>
        </div>
      </div>`;
    });
    tempHTML = tempHTML + `</div></div>`;
  }
  target.html(tempHTML);
}
function draw_tenmplate_card_3(option, target, month){ // 카드3형
  let tempHTML = "<div class='md-mb-20 mb-40'>";
  let ca_idx = option.category_idx;
  let tempLIST = g_webzine_content_list.filter((items) => {
    return Number(items.category_idx) === Number(ca_idx);
  });
  tempLIST = tempLIST.filter((items) => {
    return items.webzine_month === month;
  });
  tempLIST.sort((a, b) => {
    return Number(a.view_order) - Number(b.view_order);
  });
  let caName = g_category_list.filter((items) => {
    return Number(items.idx) === Number(ca_idx);
  });
  caName = caName[0].name;
  if(tempLIST.length != 0){
    if(Number(option.section_category_view) === 1){
      if(!isEmpty(option.category_description)){
        tempHTML = tempHTML + `
        <div class='w-full md-block flex items-baseline md-mb-5 mb-10 gap-4'>
          <h2 class='main-content-title text-${option.section_category_align} md-text-3xl text-5xl'>${caName}</h2>
          <p class='category-description'>${option.category_description}</p>
        </div>
        <div class='grid grid-cols-2 md-gap-2 gap-4'>
      `;
      }else{
        tempHTML = tempHTML + `
        <h2 class='main-content-title text-${option.section_category_align} md-mb-5 mb-10 md-text-3xl text-5xl'>${caName}</h2>
        <div class='grid grid-cols-2 md-gap-2 gap-4'>
      `;
      }
 
    }else{
      tempHTML = tempHTML + `
      <div class='grid grid-cols-2 md-gap-2 gap-4'>
    `;
    }
    $.each(tempLIST, function(key, items){
      let idx = items.idx;
      let subCaName = g_sub_category_list.filter((items2) => {
        return Number(items2.idx) === Number(items.sub_category_idx);
      });
      if(subCaName.length != 0){
        subCaName = subCaName[0].name;
      }else{
        subCaName = items.page_title;
      }
      tempHTML = tempHTML + `<div class="w-full md-block flex btn_go_sub_page items-center mb-10" data-idx=${idx}>
      <div class="w-full section-bg2 md-h-52 h-60 w-2-4" style="background-image: url('img/${items.category_idx}/${items.main_page_thumnail}')">
      </div>
      <div class="w-full w-2-4 p-5">
        <h2 class="md-text-xl font-bold mb-5 text-3xl main-color">${subCaName}</h2>
        <p class="sub-text md-text-lg text-2xl">${items.page_sub_title}</p>
      </div>
      </div>`;
    });
    tempHTML = tempHTML + `</div></div>`;
  }
  target.html(tempHTML);
}
function draw_tenmplate_card_slide(option, target){ // 카드슬라이드형

}

// 서브페이지의 배너를 그린다
function draw_sub_banner(){
  let target = $('#banner');

  let tempJSON = g_webzine_content_list.filter((items) => {
    return Number(items.idx) === Number(PAGE_IDX);
  });
  tempJSON = tempJSON[0];
  let title_info = urldecode(tempJSON.title_info);
  title_info = JSON.parse(title_info);
  console.log(title_info);
  let banner_name = tempJSON.page_banner;
  let banner_height = title_info.banner_height;
  if(Number(banner_height) === 0){
    banner_height = "h-screen";
  }else{
    banner_height = "h-h-screen";
  }

  banner_name = banner_name.replaceAll(',', '');
  let sub_name = tempJSON.sub_category_idx;
  sub_name = g_sub_category_list.filter((items) => {
    return Number(items.idx) === Number(sub_name);
  });
  if(sub_name.length != 0){
    sub_name = sub_name[0].name;
  }else{
    sub_name = tempJSON.category_idx;
    sub_name = g_category_list.filter((items) => {
      return Number(items.idx) === Number(sub_name);
    });
    sub_name = sub_name[0].name;
  }
  let subName = title_info.title;
  if(subName === "국제표준 개발목록" || subName === sub_name){
    subName = "";
  }
  let tempHTML = `<div class="w-full relative section-bg ${banner_height}" style="background-image: url('img/${tempJSON.category_idx}/${banner_name}')">`;
  if(String(title_info.title_banner_position) === "fixed"){ // 배너안에 위치
    tempHTML = tempHTML + `
        <div class='sub-banner-overlay'></div>
        <div class='w-full position-${title_info.title_position} text-${title_info.title_align}'>
          <h1 class='sub-page-title'>${sub_name}</h1>
          <h2 class='sub-page-sub-title'>${subName}</h2>
        </div>
      </div>
    `;

  }else{ // 배너 밖에 위치
    tempHTML = tempHTML + `
    </div>
    <div class='mt-5 text-${title_info.title_align}'>
      <h1 class='sub-page-title'>${title_info.title}</h1>
      <h2 class='sub-page-sub-title'>${title_info.sub_title}</h2>
    </div>
`;
  }
  target.html(tempHTML);
  // 타이틀 스타일 추가
  $('.sub-page-title').css({
    'font-size': `${title_info.title_size}`,
    'font-weight' : 'bold',
    'color' : `${title_info.title_color}`
  });
  $('.sub-page-sub-title').css({
    'font-size': `${title_info.sub_title_size}`,
    'font-weight' : 'bold',
    'color' : `${title_info.title_color}`
  });
  console.log(g_webzine_main_list);
  let mainJSON = g_webzine_main_list.filter((items) => {
    return String(items.webzine_month) === String(WEZINE_MONTH);
  });
  mainJSON = mainJSON[0].main_info;
  mainJSON = urldecode(mainJSON);
  mainJSON = JSON.parse(mainJSON);
  console.log(mainJSON);
  let sec_width = mainJSON.section[0].width;  
  if(String(sec_width) === "100%"){
    sec_width = "w-full";
  }else{
    sec_width = `header-width-${sec_width}`;
  }
  let section_target = $('#content');
  let sectionHTML = `
  <div class='${sec_width} md-px-5 px-0' id='tap_area'></div>
  <section class='${sec_width} md-px-5 px-0 sub-contents md-mb-20 mb-40' id='section'></section>
  <section id='other_list'></section>
  `;
  section_target.html(sectionHTML);
}

// 서브페이지의 내용을 그린다
function draw_sub_content(){
  let target = $('#section');
  let tempJSON = g_webzine_content_list.filter((items) => {
    return Number(items.idx) === Number(PAGE_IDX);
  });
  tempJSON = tempJSON[0];
  let contents = urldecode(tempJSON.contents);
  contents = contents.replaceAll('../tempUpload',`img/${tempJSON.category_idx}`);
  contents = contents.replaceAll(`../webzine_folder/${UUID}/${WEZINE_MONTH}/`, "");
  contents = contents.replaceAll(`<p><strong>Q.`, "<p class='q-color'><strong>Q.");

  let word_break = tempJSON.title_info;
  word_break = urldecode(word_break);
  word_break = JSON.parse(word_break);
  word_break = word_break.word_break;
  target.html(contents);
  if(Number(word_break) === 0){
    $('p').addClass('width-word-1');
  }else if(Number(word_break) === 1){
    $('p').addClass('width-word-2');
  }else if(Number(word_break) === 2){
    $('p').addClass('width-word-3');
  }
}

// 탭버튼을 그린다
function draw_tab_btn(){
  let target = $("#tap_area");
  let tempJSON = g_webzine_content_list.filter((items) => {
    return String(items.webzine_month) === String(WEZINE_MONTH);
  });
  let thisJSON = tempJSON.filter((items) => {
    return Number(items.idx) === Number(PAGE_IDX);
  });
  thisJSON = thisJSON[0];
  tempJSON = tempJSON.filter((items) => {
    return Number(items.category_idx) === Number(thisJSON.category_idx);
  });
  tempJSON.sort((a, b) => {
    return Number(a.view_order) - Number(b.view_order);
  });
  let boolean = true;
  let tempHTML = "<ul class='flex flex-wrap items-center gap-4 mb-20 justify-center'>";
  if(tempJSON.length === 0){
    return;
  }else{
    $.each(tempJSON, function(key, items){
      let ca_name = items.sub_category_idx;
      ca_name = g_sub_category_list.filter((items2) => {
        return Number(items2.idx) === Number(ca_name);
      });
      if(ca_name.length !=0){
        ca_name = ca_name[0].name;
        tempHTML = tempHTML + `<li class='btn_go_sub_page tab-li tab-li-${items.idx}' data-idx=${items.idx}>${ca_name}</li>`;
      }else{
        boolean = false;
      }
     
    });
    if(boolean){
      tempHTML = tempHTML + `</ul>`;
      target.html(tempHTML);
      $(`.tab-li-${PAGE_IDX}`).addClass('active');
    }else{
      return;
    }
  }
}

// 서브페이지에서 다른 페이지 보기 리스트
function draw_other_page_view(){
  let target = $('#other_list');
  let mainJSON = g_webzine_main_list.filter((items) => {
    return String(items.webzine_month) === String(WEZINE_MONTH);
  });
  mainJSON = mainJSON[0].main_info;
  mainJSON = urldecode(mainJSON);
  mainJSON = JSON.parse(mainJSON);
  let sec_width = mainJSON.section[0].width;  
  if(String(sec_width) === "100%"){
    sec_width = "w-full";
  }else{
    sec_width = `header-width-${sec_width}`;
  }
  let tempHTML = `<div class='w-full md-px-5 px-0 bg-gray-300 py-10'>
    <h3 class='${sec_width} other-area-h3 mb-5'>다른 기사 보기</h3>
    <div class='${sec_width} block flex'>
    <ul class='md-w-full w-1-5 md-flex block items-center md-mb-5 mb-0 flex-wrap'>
  `;

  let categoryJSON = g_category_list.sort(function(a, b) {
    return a.view_order - b.view_order;
  });

  for(let i = 0; i < categoryJSON.length; i++){
    let viewList = g_webzine_content_list.filter((items) => {
      return items.webzine_month === WEZINE_MONTH;
    });

    let boolean = false;
    for(let j = 0; j < viewList.length; j++){
      if(Number(viewList[j].category_idx) === Number(categoryJSON[i].idx)){
        boolean = true;
      }
    }
    if(boolean){
      tempHTML = tempHTML + `
      <li class='other-tab other-tab-${categoryJSON[i].idx}' data-idx=${categoryJSON[i].idx}>${categoryJSON[i].name}</li>
    `;
    }
  }
  tempHTML = tempHTML + `</ul><div class='md-w-full w-4-5 grid md-grid-cols-2 grid-cols-4 md-gap-2 gap-4 pl-5' id='other_page_list'>`;
  
  let thisJSON = g_webzine_content_list.filter((items) => {
    return Number(items.idx) === Number(PAGE_IDX);
  });
  thisJSON = thisJSON[0];

  let allJSON = g_webzine_content_list.filter((items) => {
    return String(items.webzine_month) === String(WEZINE_MONTH);
  });
  allJSON = allJSON.filter((items) => {
    return Number(items.category_idx) === Number(thisJSON.category_idx);
  });
  allJSON.sort((a, b) => {
    return Number(a.view_order) - Number(b.view_order);
  });

  $.each(allJSON, function(key, items){
    let sub_caname = g_sub_category_list.filter((items2) => {
      return Number(items2.idx) === Number(items.sub_category_idx)
    });
    if(sub_caname.length != 0){
      sub_caname = sub_caname[0].name;
    }else{
      sub_caname = g_category_list.filter((items2) => {
        return Number(items2.idx) === Number(items.category_idx);
      });
      sub_caname = sub_caname[0].name;
    }
    let title = items.page_sub_title;
    if(title === sub_caname){
      title = "";
    }
    tempHTML = tempHTML + `
    <div class="box-shadow btn_go_sub_page other-border" data-idx=${items.idx}>
      <div class="w-full md-h-40 h-52 section-bg border-bt-line" style="background-image: url(img/${items.category_idx}/${items.main_page_thumnail});"></div>
      <div class="tem-3-textbox md-p-3 p-5 bg-white other-text-height">
        <h4 class="mb-2 font-bold md-text-base text-xl">${sub_caname}</h4>
        <p class="md-text-sm text-lg line-1">${title}</p>
      </div>
  </div>
    `
  });
  tempHTML = tempHTML + `</div></div></div>`;

  target.html(tempHTML);
  $(`.other-tab-${thisJSON.category_idx}`).addClass('active');
}

// 플로팅메뉴를 그린다
function draw_floating(){
  let target = $('#floating');
  let main_option = g_webzine_main_list.filter((items) => {
    return String(items.webzine_month) === String(WEZINE_MONTH);
  });
  main_option = main_option[0];


  let floating_option = urldecode(g_webzine_option[0].template_info);
  floating_option = JSON.parse(floating_option);

  let gudok_active = floating_option.gudok_active;
  let gu_url = floating_option.gu_url;
  floating_option = floating_option.floating;

  if(Number(floating_option.visible) === 1){
    let tempHTML = "";
    let template = floating_option.template;
    tempHTML = tempHTML + `<div class='floating-${template}'>
      <ul class='floating-ul-${template}'>
    `;
    if(Number(gudok_active) === 2){
      tempHTML = tempHTML + `<li class='cursor-pointer'>
      <a href='${gu_url}' target='_blank'><img class='block' src='https://webzine.menteimo.com/img/btn_gudok.png' alt='구독 버튼'></a>
    </li>`;
    }
    let share_list = floating_option.list;
    for(let i = 0; i < share_list.length; i++){
      if(share_list[i] === "pdf"){
        tempHTML = tempHTML + `<li class='cursor-pointer'>
        <a href='img/${main_option.main_pdf_file}' download><img class='block' src='https://webzine.menteimo.com/img/btn_sns_download_pdf.png' alt='pdf다운로드 버튼'></a>
      </li>`;
      }
    }
    for(let i = 0; i < share_list.length; i++){
      if(share_list[i] === "kakao"){
        tempHTML = tempHTML + `<li class='cursor-pointer' onclick="kakao();">
          <img class='block' src='https://webzine.menteimo.com/img/btn_sns_kakao.png' alt='카카오로고'>
        </li>`;
      }else if(share_list[i] === "facebook"){
        tempHTML = tempHTML + `<li class='cursor-pointer' onclick="facebook();">
          <img class='block' src='https://webzine.menteimo.com/img/btn_sns_facebook.png' alt='페이스북로고'>
        </li>`;
      }else if(share_list[i] === "naver"){
        tempHTML = tempHTML + `<li class='cursor-pointer' onclick="blog();">
        <img class='block' src='https://webzine.menteimo.com/img/btn_sns_naver.png' alt='네이버로고'>
      </li>`;
      }else if(share_list[i] === "link"){
        tempHTML = tempHTML + `<li class='cursor-pointer relative' id='btn_link_share'>
        <img class='block' src='https://webzine.menteimo.com/img/btn_sns_share.png' alt='링크공유 버튼'>
        <span class='link-text' id='link_result_text'>링크가 복사되었습니다.</span>
      </li>`;
      }
    }

    tempHTML = tempHTML + `<li class='cursor-pointer' id='btn_top'>
      <img class='block' src='https://webzine.menteimo.com/img/btn_sns_top2.png' alt='탑 버튼'>
      </li></ul>
      </div>
    `;
    target.html(tempHTML);
  }else{
    return;
  }


}