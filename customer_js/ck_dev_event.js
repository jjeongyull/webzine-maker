$(window).scroll(function() {
  let scrollHeight = $(window).scrollTop();

  if(isEmpty(g_idx)){
    if (scrollHeight >= 400) {
      $("#header_inner").addClass("active");
    } else {
      $("#header_inner").removeClass("active");
    }
  }
});

// 모바일 메뉴 클릭 시
$(document).on('click', '#btn_ham', function(){
  $(this).toggleClass('active');
  $('#main_nav').toggleClass('active');
});

// 서브페이지 이동
$(document).on('click', '.btn_go_subpage', function(){
  let idx = $(this).data('idx');
  gotoPage('sub.php', `idx=${idx}`);
});

// 헤더 로고 클릭시 메인으로 이동
$(document).on('click', '#btn_go_main', function(){
  let vol = $(this).data('vol');
  gotoPage('index.php', `vol=${vol}`);
});