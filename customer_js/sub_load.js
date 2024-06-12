$(async function(){
  var urlParams = new URLSearchParams(window.location.search);
  g_idx = urlParams.get('idx');
  let param = {};

  if(!isEmpty(g_idx)){
    // 서브페이지들을 불러온다
    param = {};
    param.cmd = "load_webzine_list";
    param.tbl_name = "webzine_contents";
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

    // 현재 페이지의 콘텐츠를 구한다
    let thisPage = g_webzine_content_list.filter(items => Number(items.idx) === Number(g_idx));
    thisPage = thisPage[0];

    // 월호
    g_month = thisPage.webzine_month;

    // 웹진 옵션을 구한다
    let webzineOption = g_webzine_option[0];
    console.log(webzineOption);

    let webzineList = g_webzine_content_list.filter(items => String(items.webzine_month) === String(thisPage.webzine_month));
    console.log(webzineList);

    // 카테고리수가 많으면 탭버튼을 그린다
    let category_idx = thisPage.category_idx;
    let tap_arr = webzineList.filter(items => Number(items.category_idx) === Number(category_idx));
    if(tap_arr.length > 1){ // 해당 카테고리의 페이지가 1개 이상일때만 탭을 그린다.
      draw_tab_btn(tap_arr);
    }



    draw_main_page_header(webzineOption, webzineList);
    draw_sub_banner(thisPage);
    draw_sub_content(thisPage);
    draw_sub_prev_list(thisPage, webzineList);
    draw_footer(webzineOption);
  }else{
    alert('잘못된 접근입니다.');
    gotoPage('index.php', '');
  }

  
	// <![CDATA[  <-- For SVG support
	if ('WebSocket' in window) {
		(function () {
			function refreshCSS() {
				var sheets = [].slice.call(document.getElementsByTagName("link"));
				var head = document.getElementsByTagName("head")[0];
				for (var i = 0; i < sheets.length; ++i) {
					var elem = sheets[i];
					var parent = elem.parentElement || head;
					parent.removeChild(elem);
					var rel = elem.rel;
					if (elem.href && typeof rel != "string" || rel.length == 0 || rel.toLowerCase() == "stylesheet") {
						var url = elem.href.replace(/(&|\?)_cacheOverride=\d+/, '');
						elem.href = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_cacheOverride=' + (new Date().valueOf());
					}
					parent.appendChild(elem);
				}
			}
			var protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
			var address = protocol + window.location.host + window.location.pathname + '/ws';
			var socket = new WebSocket(address);
			socket.onmessage = function (msg) {
				if (msg.data == 'reload') window.location.reload();
				else if (msg.data == 'refreshcss') refreshCSS();
			};
			if (sessionStorage && !sessionStorage.getItem('IsThisFirstTime_Log_From_LiveServer')) {
				console.log('Live reload enabled.');
				sessionStorage.setItem('IsThisFirstTime_Log_From_LiveServer', true);
			}
		})();
	}
	else {
		console.error('Upgrade your browser. This Browser is NOT supported WebSocket for Live-Reloading.');
	}
	// ]]>
});