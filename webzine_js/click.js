$(document).on('click', '.btn_go_sub_page', function(){
  let idx = $(this).data('idx');
  if(isEmpty(idx)){
    alert('아직 페이지가 생성되지 않았습니다.\n페이지를 생성해주세요.');
    return;
  }else{
    gotoPage(`sub_${idx}.html`, '');
  }
});

$(document).on('click', '#btn_mo_menu', function(){
  $(this).toggleClass('active');
  $('#mo_menu_1').toggleClass('active');
});

$(document).on('click', '.other-tab', function(){
  let target = $('#other_page_list');
  $('.other-tab').removeClass('active');
  let idx = $(this).data('idx');
  let tempHTML = "";
  let allJSON = g_webzine_content_list.filter((items) => {
    return String(items.webzine_month) === String(WEZINE_MONTH);
  });
  allJSON = allJSON.filter((items) => {
    return Number(items.category_idx) === Number(idx);
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
  target.html(tempHTML);
  $(`.other-tab-${idx}`).addClass('active');
});

// top 버튼 클릭 시
$(document).on('click', '#btn_top', function(){
  $('html, body').animate({scrollTop : 0},800);
  return false;
});

// 링크복사기능
$(document).on('click', '#btn_link_share', function(){
  var currentPageUrl = window.location.href;

  // 가상의 input 요소를 동적으로 생성하고 페이지 URL을 해당 input 요소에 설정
  var tempInput = $('<input>');
  $('body').append(tempInput);
  tempInput.val(currentPageUrl).select();

  // 복사 명령 실행
  document.execCommand('copy');

  // 가상의 input 요소 삭제
  tempInput.remove();

  $('#link_result_text').addClass('active');
  setTimeout(function() {
    $('#link_result_text').removeClass('active');
  }, 3000);
});

// 지난호 보기
$(document).on('click', '#btn_select_vol', function(){
  $(this).toggleClass('active');
});
$(document).on('click', '#btn_select_vol li', function(){
  let month = $(this).data('month');
  let url = `../${month}/index.html`;
  gotoPage(url, '');
});