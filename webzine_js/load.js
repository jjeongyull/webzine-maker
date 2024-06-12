$(async function(){
  let param = {};
  param.cmd = "load_webzine_option_uuid";
  param.tbl_name = "webzine_option";
  param.uuid = UUID;
  await call_ajax(param, true); 

  param = {};
  param.cmd = 'load_main_webzine_uuid';
  param.uuid = UUID;
  param.tbl_name = 'webzine_main';
  await call_ajax(param,  true);

  param = {};
  param.cmd = 'load_webzine_contents_uuid';
  param.tbl_name = 'webzine_contents';
  param.uuid = UUID;
  await call_ajax(param,  true);

  param = {};
  param.cmd = 'load_webzine_sub_category_uuid';
  param.tbl_name = 'webzine_sub_category';
  param.uuid = UUID;
  await call_ajax(param,  true);

  param = {};
  param.cmd = 'load_webzine_category_uuid';
  param.tbl_name = 'webzine_category';
  param.uuid = UUID;
  await call_ajax(param,  true);

  console.log(g_webzine_option);
  console.log(g_webzine_main_list);
  console.log(g_category_list);
  console.log(g_sub_category_list);
  console.log(g_webzine_content_list);

  draw_header();
  draw_main_banner();
  draw_main_contents();
  draw_footer();
  draw_floating();
});