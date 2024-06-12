$(async function(){
  await load_structure();
  await load_main();
  await load_category();
  await load_sub();

  // 헤더를 그린다
  draw_header();

  // 배너를 그린다
  draw_banner();

  // 메인페이지에 콘텐츠들을 그린다
  draw_main_contents();

  // footer를 그린다
  draw_main_footer();
});