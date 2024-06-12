// 서버로부터 페이지 정보 템플릿 정보를 불러와 저장한다.
// 페이지 로드시마다 불러올 경우 페이지 로딩 시간이 길어질 수 있으므로
// html 구조를 미리 불러와 저장한 후 로컬에서 로드하도록 구현
async function getPageList(PList){
  try{
    await fetchAllPagesContent(PList)
  }
  catch(e){
    alert(e.message);
  }
}

// 셀랙박스 그리기
function draw_select_box(pData, pTarget, type=""){
  let tempHTML = "";
  if(!isEmpty(type)){
    tempHTML = `<option value="" selected>원하는 항목을 선택하세요</option>`;
  }

  if(type === "main"){
    $.each(pData, function(key, items){
      tempHTML = tempHTML + `<option value="${items.idx}">${items.webzine_month}</option>`;
    });
  }else{
    $.each(pData, function(key, items){
      tempHTML = tempHTML + `<option value="${items.idx}">${items.name}</option>`;
    });
  }


  pTarget.html(tempHTML);
}


// 웹진 메인페이지 그리기
function draw_main_webzine_list(){
  let target = $('#webzine_main_area');
  let tempHTML = "";

  $.each(g_webzine_main_list, (key, items) => {
    let active = items.webzine_active;
    if(Number(active) === 0){
      active = "미발행";
    }else{
      active = "발행";
    }
    tempHTML = tempHTML + `<li class='btn_view_webzine_list btn_view_webzine_list_${items.idx}' data-idx=${items.idx}>
                              <div class="card" style="width: 12rem;">
                              <img src="../webzine_folder/${g_login.uuid}/${items.webzine_month}/img/${items.webzine_thumnail}" class="card-img-top" alt="메인 썸네일" style="
                              height: 120px;
                              object-fit: cover;
                              background-color: #00000052;">
                              <div class="card-body" data-idx=${items.idx} style="
                              padding: 10px;">
                                <h5 class="mb-2 text-base font-bold md:text-xl">${items.webzine_month}</h5>
                                <p class="card-text">${active}</p>
                                <button class="btn btn-primary btn-sm btn_main_update">수정</button>
                                <button class="btn btn-danger btn-sm btn_main_web_del">삭제</button>
                                <button class="btn btn-success btn-sm btn_preview">미리보기</button>
                              </div>
                            </div>
                          </li>`;
  });
  target.html(tempHTML);
}

// 웹진 카테고리 그리기
function draw_webzine_category_list(){
  let target = $('#webzine_category_area');
  let tempJSON = g_category_list.sort(function(a, b) {
    return a.view_order - b.view_order;
  });
  let tempHTML = "";
  $.each(tempJSON, (key, items) => {
    tempHTML = tempHTML + `<li class="bg-gray-500 rounded h-fit">
                            <div class="btn btn-primary btn-sm flex justify-between items-center gap-5 btn_sub_ca_view" data-idx='${items.idx}'>
                              <p class='btn-main-category'>${items.name}</p>
                              <div>
                                <button class="btn btn-warning btn-sm btn_category_update text-xs" data-type='main' data-idx='${items.idx}'>수정</button>
                                <button class="btn btn-danger btn-sm btn_category_del text-xs" data-type='main' data-idx='${items.idx}'>삭제</button>
                              </div>
                            </div>
                            <ul class='none-view p-2 sub-category' id='sub_category_area_${items.idx}'>
                              
                            </ul>
                          </li>`;
  });

  target.html(tempHTML);

  $.each(g_sub_category_list, (key, items) => {
    let tempSubHTML = `<li class=" mb-1"> 
      <div class="btn btn-success btn-sm flex justify-between items-center">
        <p>${items.name}</p>
        <div>
          <button class="btn btn-warning btn-sm btn_category_update text-xs" data-type='sub' data-idx='${items.idx}'>수정</button>
          <button class="btn btn-danger btn-sm btn_sub_category_del text-xs" data-type='sub' data-idx='${items.idx}'>삭제</button>
        </div>
      </div>
    </li>`;
    let target = $(`#sub_category_area_${items.parent_idx}`);
    target.append(tempSubHTML);
  });
}

// 웹진 리스트 그리기
function draw_webzine_content_list(pJSON){

  let tempJSON;

  if(!isEmpty(g_make_main_idx)){
    tempJSON = pJSON.filter((items) => {
      return Number(items.parent_idx) === Number(g_make_main_idx);
    });
    $(`.btn_view_webzine_list_${g_make_main_idx}`).addClass('active');
  }else{
    tempJSON = [...pJSON];
  }

  $('#webzine_table').DataTable().clear().destroy();
  table = new DataTable('#webzine_table', {
    rowCallback: function(row, data, index) {
      $(row).attr('data-idx', data.idx);
    },
    // "search" : {
    //   "search" : local_search_data
    // },
    // order : [[local_table_order_index, local_table_order]],
     // 칼럼 Resize 및 보이기 숨기기
    // dom : l : Length Change, f : 필터, t : 테이블, i : 정보출력, p : 페이지네이션, r:
    dom: 'C<"clear">B<"clear">lfrtip',
    // 페이지 유지
    stateSave: false,
    // 랭기지팩 적용
    language: {url : 'ko.json'},
    // 한화면 출력 개수 
    lengthMenu: [
      [5, 10, 20, -1],
      [5, 10, 20, '모두 보기']
    ],
    responsive: true,
    columnDefs: [
      {
        'targets': 0,
        'checkboxes': {
          'selectRow': true
        }
      },
    ],
    // 멀티 체크 적용
    select: {
      'style': 'multi'
    },
    data: tempJSON,

    paging: true,              // 페이징을 한다.
    pageLength: 15, 
    buttons: [
      {
          extend: 'copyHtml5'
      }
    ],
    columns: [
        {
          targets: 0,
          defaultContent: '',
          orderable: false,
          className: 'select-checkbox',
          width: 15
        },
        { className: "text-center",
          data: function(objectJSON){ //번호
            let rtnVal = objectJSON.idx;  
          return rtnVal;
          },
          width: 20
        },
        { className: "text-center", 
          data: function(objectJSON){// 웹진 월
            return objectJSON.webzine_month;
          }
        },
        { className: "text-center btn_content_update cursor-pointer hover:bg-gray-200", // page_name
          data: function(objectJSON){
            let page_name = objectJSON.category_idx;
            page_name = g_category_list.filter((items) => {
              return Number(page_name) === Number(items.idx);
            });
            page_name = page_name[0].name;
            return page_name;
          }
        },
        { className: "text-center", // sub_page_name
          data: function(objectJSON){
            let sub_page_name = objectJSON.sub_category_idx;
            sub_page_name = g_sub_category_list.filter((items) => {
              return Number(sub_page_name) === Number(items.idx);
            });
            if(sub_page_name.length === 0){
              sub_page_name = "없음";
            }else{
              sub_page_name = sub_page_name[0].name;
            }
            return sub_page_name;
          }
        },
        { className: "text-center", 
          data: function(objectJSON){// 웹진 제목
            return objectJSON.page_title;
          }
        },
        { className: "text-center", 
          data: function(objectJSON){// 작성일
            return objectJSON.write_date;
          }
        }
    ],
    order: [[2, 'asc']]
  });

  g_make_main_idx = "";
}

// 콘텐츠 입력시 내용 입력화면 그리기
function draw_content_type_view(pType, pTarget){
  let pIdx;
  let tempHTML = "";

  let items_length = $('.content-items');
  pIdx = Number(items_length.length) + 1;

  if(Number(pType) === 1){ // 페이지의 타이틀
    tempHTML = `<div class="row mb-2 items-center mb-3 content-items ma-none" id='content_item_${pIdx}'>
                  <label for="content_title_${pIdx}" class="col-12 col-md-2 col-form-label
                      form-label text-muted">제목</label>
                  <div class="col-11 col-md-9">
                    <input type="text" id="content_title_${pIdx}" maxlength="100" class="form-control" placeholder="내용의 제목을 입력하세요.">
                  </div>
                  <button class='btn btn-danger btn-sm col-1 col-md-1 btn_content_del' data-id=${pIdx}>x</button>
                </div>`;
  }else if(Number(pType) === 2){ // 페이지의 내용
    tempHTML = `<div class="row mb-2 mb-3 content-items ma-none" id='content_item_${pIdx}'>
                  <label for="content_text_${pIdx}" class="col-12 col-md-2 col-form-label
                      form-label text-muted">내용</label>
                  <div class="col-11 col-md-9">
                    <textarea id="content_text_${pIdx}" class="form-control" placeholder="내용을 입력하세요."></textarea>
                  </div>
                  <button class='btn btn-danger btn-sm col-1 col-md-1 btn_content_del' data-id=${pIdx}>x</button>
                </div>`;
  }else if(Number(pType) === 3){ // 페이지의 이미지
    tempHTML = `<div class="row mb-2 items-center mb-3 ma-none" id='content_item_${pIdx}'>
                  <label for="webzine_content_img_${pIdx}" class="col-12 col-md-2 col-form-label
                      form-label text-muted">이미지</label>
                  <div class="col-11 col-md-9">
                    <input type="file" id="webzine_content_img_${pIdx}" class="form-control" placeholder="내용 이미지를 입력하세요.">
                  </div>
                  <button class='btn btn-danger btn-sm col-1 col-md-1 btn_content_del' data-id=${pIdx}>x</button>
                </div>`;
  }else if(Number(pType) === 4){ // 페이지의 공백(줄 바꿈)
    tempHTML = `<div class="row mb-2 items-center mb-3 ma-none" id='content_item_${pIdx}'>
                  <label for="webzine_content_br_${pIdx}" class="col-12 col-md-2 col-form-label
                      form-label text-muted">공백</label>
                  <div class="col-11 col-md-9">
                    <input type="text" id="webzine_content_br_${pIdx}" class="form-control" placeholder="공백" value='<br>' disabled readonly>
                  </div>
                  <button class='btn btn-danger btn-sm col-1 col-md-1 btn_content_del' data-id=${pIdx}>x</button>
                </div>`;
  }

  pTarget.append(tempHTML);
  content_list_array.push(pIdx);
}


// 고객사 리스트 만들기
function draw_customer_list(pJSON){
  $('#customer_table').DataTable().clear().destroy();
  table = new DataTable('#customer_table', {
    rowCallback: function(row, data, index) {
      $(row).attr('data-idx', data.idx);
    },
    // "search" : {
    //   "search" : local_search_data
    // },
    // order : [[local_table_order_index, local_table_order]],
     // 칼럼 Resize 및 보이기 숨기기
    // dom : l : Length Change, f : 필터, t : 테이블, i : 정보출력, p : 페이지네이션, r:
    dom: 'C<"clear">B<"clear">lfrtip',
    // 페이지 유지
    stateSave: false,
    // 랭기지팩 적용
    language: {url : 'ko.json'},
    // 한화면 출력 개수 
    lengthMenu: [
      [5, 10, 20, -1],
      [5, 10, 20, '모두 보기']
    ],
    responsive: true,
    columnDefs: [
      {
        'targets': 0,
        'checkboxes': {
          'selectRow': true
        }
      },
    ],
    // 멀티 체크 적용
    select: {
      'style': 'multi'
    },
    data: pJSON,

    paging: true,              // 페이징을 한다.
    pageLength: 10, 
    buttons: [
      {
          extend: 'copyHtml5'
      }
    ],
    columns: [
        {
          targets: 0,
          defaultContent: '',
          orderable: false,
          className: 'select-checkbox',
          width: 15
        },
        { className: "text-center",
          data: function(objectJSON){ //번호
            let rtnVal = objectJSON.idx;  
          return rtnVal;
          },
          width: 20
        },
        { className: "text-center cursor-pointer btn_update_customer cursor-pointer hover:bg-gray-200", // 아이디
          data: function(objectJSON){// 고객사 명
            return objectJSON.name;
          }
        },
        { className: "text-center", // UUID
          data: function(objectJSON){
            return objectJSON.uuid;
          }
        },
        { className: "text-center", // 추가 된 날짜
          data: function(objectJSON){
            return objectJSON.write_date;
          }
        }
    ],
    order: [[2, 'asc']]
  });
}

// 멤버 리스트 만들기
function draw_member_list(pJSON){
  $('#member_table').DataTable().clear().destroy();
  table = new DataTable('#member_table', {
    rowCallback: function(row, data, index) {
      $(row).attr('data-idx', data.idx);
    },
    // "search" : {
    //   "search" : local_search_data
    // },
    // order : [[local_table_order_index, local_table_order]],
     // 칼럼 Resize 및 보이기 숨기기
    // dom : l : Length Change, f : 필터, t : 테이블, i : 정보출력, p : 페이지네이션, r:
    dom: 'C<"clear">B<"clear">lfrtip',
    // 페이지 유지
    stateSave: false,
    // 랭기지팩 적용
    language: {url : 'ko.json'},
    // 한화면 출력 개수 
    lengthMenu: [
      [5, 10, 20, -1],
      [5, 10, 20, '모두 보기']
    ],
    responsive: true,
    columnDefs: [
      {
        'targets': 0,
        'checkboxes': {
          'selectRow': true
        }
      },
    ],
    // 멀티 체크 적용
    select: {
      'style': 'multi'
    },
    data: pJSON,

    paging: true,              // 페이징을 한다.
    pageLength: 10, 
    buttons: [
      {
          extend: 'copyHtml5'
      }
    ],
    columns: [
        {
          targets: 0,
          defaultContent: '',
          orderable: false,
          className: 'select-checkbox',
          width: 15
        },
        { className: "text-center",
          data: function(objectJSON){ //번호
            let rtnVal = objectJSON.idx;  
          return rtnVal;
          },
          width: 20
        },
        { className: "text-center cursor-pointer btn_update_member cursor-pointer hover:bg-gray-200", // 아이디
          data: function(objectJSON){
            return objectJSON.mem_id;
          }
        },
        { className: "text-center", // 이름
          data: function(objectJSON){
            return objectJSON.mem_name;
           }
        },
        { className: "text-center", // 고객사명
          data: function(objectJSON){
            return objectJSON.customer_name;
          }
        },
        { className: "text-center", // 승인상태
          data: function(objectJSON){
            let active = objectJSON.member_active;
            if(Number(active) === 0){
              active = "<p class='none-active'>승인 대기중</p>";
            }else{
              active = "<p class='y-active'>승인 완료</p>";
            }
            return active;
          }
        },
        { className: "text-center", // 가입일
          data: function(objectJSON){
            return objectJSON.sign_date;
          }
        },
        { className: "text-center", // 최근 로그인 일시
          data: function(objectJSON){
            let login_date = objectJSON.mem_login_date;
            if(isEmpty(login_date)){
              login_date = "최근 로그인 기록 없음";
            }
            return login_date;
          }
        }
    ],
    order: [[2, 'asc']]
  });
}

// 타입에 맞는 카테고리 인풋 그리기
function draw_category_banner_type(type){
  let target = $('#sel_banner_area');
  let tempHTML = "";
  let inputType = "";
  if(Number(type) === 0){
    inputType = "radio";
  }else{
    inputType = "checkbox";
  }

  $.each(g_category_list, function(key, items){
    tempHTML = tempHTML + `<div class="form-check">
      <input class="form-check-input" type=${inputType} name="chk_banner_category" id="chk_banner_category_${items.idx}" value=${items.idx}>
      <label class="form-check-label" for="chk_banner_category_${items.idx}">
        ${items.name}
      </label>
    </div>`;
  });
  target.html(tempHTML);
}

// 섹션 리스트 그리기
function draw_section_list(section_start_number){
  let target = $('#section_div');
  let tempHTML = `<div class='bg-gray-100 p-5 mb-4' id='section_list_div_${section_start_number}'>
    <button class='btn btn-danger mb-1 btn-sm btn_section_list_del' data-idx=${section_start_number}>삭제</button>
    <div class="row items-center mb-4">
      <label for="chk_section_width_${section_start_number}" class="col-12 col-md-2 col-form-label
          form-label text-muted">섹션 넓이</label>
        <div class="col-12 col-md-10 flex items-center gap-2">
          <div class="form-check">
            <input class="form-check-input" type="radio" name="chk_section_width_${section_start_number}" data-idx=${section_start_number} id="chk_section_width_${section_start_number}_1" value="100%">
            <label class="form-check-label" for="chk_section_width_${section_start_number}_1">
              100%
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="chk_section_width_${section_start_number}" data-idx=${section_start_number} id="chk_section_width_${section_start_number}_2" value="write">
            <label class="form-check-label" for="chk_section_width_${section_start_number}_2">
              직접입력
            </label>
          </div>
          <div class="col-4">
            <input type="number" id="section_width_${section_start_number}" maxlength="100" class="form-control col-2" placeholder="섹션의 넓이를 작성해주세요." disabled>
          </div>
        </div>
    </div>
    <div class="row items-center mb-4 sub-view">
      <label for="section_category_${section_start_number}" class="col-12 col-md-2 col-form-label
          form-label text-muted">카테고리</label>
      <div class="col-12 col-md-10">
        <select class="form-select" id="section_category_${section_start_number}">
        </select>
      </div>
    </div>
    <div class="row items-center mb-4">
      <label for="chk_category_view_${section_start_number}" class="col-12 col-md-2 col-form-label
          form-label text-muted">카테고리명 노출</label>
        <div class="col-12 col-md-10 flex items-center gap-2">
          <div class="form-check">
            <input class="form-check-input" type="radio" name="chk_category_view_${section_start_number}" data-idx=${section_start_number} id="chk_category_view_${section_start_number}_1" value="1">
            <label class="form-check-label" for="chk_category_view_${section_start_number}_1">
              노출
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="chk_category_view_${section_start_number}" data-idx=${section_start_number} id="chk_category_view_${section_start_number}_2" value="0">
            <label class="form-check-label" for="chk_category_view_${section_start_number}_2">
              미노출
            </label>
          </div>
        </div>
    </div>
    <div class="row items-center mb-4">
      <label for="chk_category_view_${section_start_number}" class="col-12 col-md-2 col-form-label
          form-label text-muted">카테고리명 정렬</label>
        <div class="col-12 col-md-10 flex items-center gap-2">
          <div class="form-check">
            <input class="form-check-input" type="radio" name="chk_category_align_${section_start_number}" data-idx=${section_start_number} id="chk_category_align_${section_start_number}_1" value="left">
            <label class="form-check-label" for="chk_category_align_${section_start_number}_1">
              left
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="chk_category_align_${section_start_number}" data-idx=${section_start_number} id="chk_category_align_${section_start_number}_2" value="center">
            <label class="form-check-label" for="chk_category_align_${section_start_number}_2">
              center
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="chk_category_align_${section_start_number}" data-idx=${section_start_number} id="chk_category_align_${section_start_number}_2" value="right">
            <label class="form-check-label" for="chk_category_align_${section_start_number}_2">
              right
            </label>
          </div>
        </div>
    </div>
    <div class="row items-center mb-4">
      <label for="category_description_${section_start_number}" class="col-12 col-md-2 col-form-label
          form-label text-muted">카테고리 설명</label>
        <div class="col-12 col-md-10 flex items-center gap-2">
          <input type='text' class='form-control' id='category_description_${section_start_number}' placeholder='카테고리 주요 설명을 작성하세요. (생략가능)'>
        </div>
    </div>
    <div class="row items-center mb-4">
      <label for="chk_page_type" class="col-12 col-md-2 col-form-label
          form-label text-muted">탬플릿 </label>
      <div class="col-12 col-md-10 flex flex-wrap items-center gap-2">
        <div class="form-check">
          <input class="form-check-input" type="radio" name="chk_section_tem_${section_start_number}" id="chk_section_tem_${section_start_number}_1" value="0">
          <label class="form-check-label" for="chk_section_tem_${section_start_number}_1">
            상자형
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="chk_section_tem_${section_start_number}" id="chk_section_tem_${section_start_number}_2" value="1">
          <label class="form-check-label" for="chk_section_tem_${section_start_number}_2">
            카드형
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="chk_section_tem_${section_start_number}" id="chk_section_tem_${section_start_number}_3" value="2">
          <label class="form-check-label" for="chk_section_tem_${section_start_number}_3">
            리스트형
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="chk_section_tem_${section_start_number}" id="chk_section_tem_${section_start_number}_4" value="3">
          <label class="form-check-label" for="chk_section_tem_${section_start_number}_4">
            카드형 2
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="chk_section_tem_${section_start_number}" id="chk_section_tem_${section_start_number}_5" value="4">
          <label class="form-check-label" for="chk_section_tem_${section_start_number}_5">
            카드형 3
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="chk_section_tem_${section_start_number}" id="chk_section_tem_${section_start_number}_6" value="5">
          <label class="form-check-label" for="chk_section_tem_${section_start_number}_6">
            카드 슬라이드형
          </label>
        </div>
      </div>
    </div>
  </div>`;
  target.append(tempHTML);
  let sel_target = $(`#section_category_${section_start_number}`);
  draw_select_box(g_category_list, sel_target, 'ok');
}

// 웹진 옵션 페이지 데이터 그리기
function draw_option_data(pData){
  let width_option = pData.width;
  let header_option = pData.header;
  let footer_option = pData.footer;
  let floating_option = pData.floating;
  let last_vol_option = pData.last_vol_active;

  // 헤더
  $(`input[name="chk_header_style"][value=${header_option.style}]`).prop('checked', true);
  let header_width = header_option.width;
  if(String(header_width) != "100%"){
    $('#chk_header_width_2').prop('checked', true);
    $('#header_width').prop('disabled', false);
    $('#header_width').val(header_width);
  }else{
    $('#chk_header_width_1').prop('checked', true);
  }
  $('#header_height').val(header_option.height);
  h_logo = header_option.logo.src;
  let h_logo_target = $('#header_logo_preview');
  h_logo_target.html(`<img class='block' style="width: 90px;" src="../webzine_folder/${g_login.uuid}/${h_logo}" alt="Uploaded Image">`);

  let logo_link = header_option.logo.link;
  if(Number(logo_link) === 0 || Number(logo_link) === 1){
    $(`input[name="chk_logo_link"][value=${logo_link}]`).prop('checked', true);
  }else{
    $('#chk_logo_link_3').prop('checked', true);
    $('#logo_link').prop('disabled', false);
    $('#logo_link').val(logo_link);
  }
  $('#header_logo_description').val(header_option.logo.description);
  $('#header_logo_width').val(header_option.logo.width);
  $(`input[name="chk_logo_position"][value=${header_option.logo.position}]`).prop('checked', true);

  let searchVisible =  header_option.search.visible;
  $(`input[name="chk_search_active"][value=${searchVisible}]`).prop('checked', true);
  if(Number(searchVisible) === 1){
    $(`input[name="chk_search_tem"][value=${header_option.search.template}]`).prop('checked', true);
    $(`input[name="chk_search_position"][value=${header_option.search.position}]`).prop('checked', true);
  }
  $(`input[name="chk_menu_position"][value=${header_option.menu.position}]`).prop('checked', true);
  $('#menu_color').val(header_option.menu.color);
  $('#menu_font_size').val(header_option.menu.size);
  $('#menu_font_size_output').css('font-size', `${header_option.menu.size}px`)
  $('#menu_font_size_output').text(header_option.menu.size);
  $(`input[name="chk_menu_weight"][value=${header_option.menu.weight}]`).prop('checked', true);

  // 메인화면 넓이
  if(String(width_option) != "100%"){
    $('#chk_main_width_2').prop('checked', true);
    $('#main_width').prop('disabled', false);
    $('#main_width').val(width_option);
  }else{
    $('#chk_main_width_1').prop('checked', true);
  }

  // 푸터
  $(`input[name="chk_footer_active"][value=${footer_option.visible}]`).prop('checked', true);
  let footer_width = footer_option.width;
  if(String(footer_width) != "100%"){
    $('#chk_footer_width_2').prop('checked', true);
    $('#footer_width').prop('disabled', false);
    $('#footer_width').val(footer_width);
  }else{
    $('#chk_footer_width_1').prop('checked', true);
  }
  $(`input[name="chk_footer_position"][value=${footer_option.position}]`).prop('checked', true);
  $(`input[name="chk_footer_align"][value=${footer_option.align}]`).prop('checked', true);
  $(`input[name="chk_footer_inner_align"][value=${footer_option.inner_align}]`).prop('checked', true);
  f_logo = footer_option.src;
  let f_logo_target = $('#footer_logo_preview');
  f_logo_target.html(`<img class='block' style="width: 90px;" src="../webzine_folder/${g_login.uuid}/${f_logo}" alt="Uploaded Image">`);
  $('#footer_logo_description').val(footer_option.description);
  let f_logo_link = footer_option.link;
  if(Number(f_logo_link) === 0 || Number(f_logo_link) === 1){
    $(`input[name="chk_f_logo_link"][value=${f_logo_link}]`).prop('checked', true);
  }else{
    $('#chk_f_logo_link_3').prop('checked', true);
    $('#f_logo_link').prop('disabled', false);
    $('#f_logo_link').val(f_logo_link);
  }
  $('#footer_logo_width').val(footer_option.logo_width);
  $('#footer_customer_name').val(footer_option.customer_name);
  $('#footer_address').val(footer_option.address);
  $('#footer_copyright').val(footer_option.copyright);

  // 지난호 보기
  $(`input[name="chk_last_vol_active"][value=${last_vol_option}]`).prop('checked', true);
  
  // 플로팅메뉴
  $(`input[name="chk_floating_menu_active"][value=${floating_option.visible}]`).prop('checked', true);
  $(`input[name="chk_gudok"][value=${pData.gudok_active}]`).prop('checked', true);
  if(Number(floating_option.visible) === 1){
    $('#floating_menu_option_area').css('display', 'block');
    $(`input[name="chk_floating_tem"][value=${floating_option.template}]`).prop('checked', true);
    for(let i = 0; i < floating_option.list.length; i++){
      $(`input[name="chk_floating_sns"][value=${floating_option.list[i]}]`).prop('checked', true);
    }
  }
  $("#chk_gudok_url").val(pData.gu_url);

  $('#btn_insert_option').text('수정');
  $('#btn_del_option').css('display','inline-block');
}

// 다음 월호를 추가할때 이전에 했던 옵션들은 그대로 그린다
function draw_before_setting(pJSON){
  let main_info = urldecode(pJSON.main_info);
  main_info = JSON.parse(main_info);
  let banner_option = main_info.banner;
  let banner_width = banner_option.width;
  let banner_height = banner_option.height;

  if(!isEmpty(banner_width)){
    if(String(banner_width) != "100%"){
      $('#chk_banner_width_2').prop('checked', true);
      $('#banner_width').prop('disabled', false);
      $('#banner_width').val(banner_width);
    }else{
      $('#chk_banner_width_1').prop('checked', true);
    }
  }

  $(`input[name="chk_banner_height"][value=${banner_height}]`).prop('checked', true);
  $(`input[name="chk_banner_type"][value=${banner_option.type}]`).prop('checked', true);
  $(`input[name="chk_banner_link"][value=${banner_option.link_active}]`).prop('checked', true);

  if(Number(banner_option.link_active) === 0){
    $('#webzine_main_banner').prop('disabled', false);
    $('input[name="chk_banner_link_sel"]').prop('disabled', true);
  }else{
    $('#webzine_main_banner').prop('disabled', true);
    $('input[name="chk_banner_link_sel"]').prop('disabled', false);
    $(`input[name="chk_banner_link_sel"][value=${banner_option.category_type}]`).prop('checked', true);
    $('#category_select_div').css('display', 'flex');
    draw_category_banner_type(banner_option.category_type);
    if(Number(banner_option.category_type) === 0){
      $(`input[name="chk_banner_category"][value=${banner_option.link}]`).prop('checked', true);
    }else{
      for(let i = 0; i < banner_option.link.length; i++){
        $(`#chk_banner_category_${banner_option.link[i]}`).prop('checked', true);
      }
    }
  }

  $(`input[name="chk_banner_title_visible"][value=${banner_option.title_visible}]`).prop('checked', true);
  $('#title_font_size').val(banner_option.title_size);
  $('#font_size_output').css('font-size',`${banner_option.title_size}px`);
  $('#font_size_output').text(banner_option.title_size);
  $(`input[name="chk_font_weight"][value=${banner_option.title_weight}]`).prop('checked', true);
  $('#webzine_main_sub_title').val(banner_option.sub_title);
  $('#sub_title_font_size').val(banner_option.sub_title_size);
  $('#sub_title_font_size').css('font-size',`${banner_option.sub_title_size}px`);
  $('#sub_title_font_size').text(banner_option.sub_title_size);

  $(`input[name="chk_sub_font_weight"][value=${banner_option.sub_title_weight}]`).prop('checked', true);
  $(`input[name="chk_title_align"][value=${banner_option.title_align}]`).prop('checked', true);
  $(`input[name="chk_title_position"][value=${banner_option.title_position}]`).prop('checked', true);
  $(`input[name="chk_title_logo_view"][value=${banner_option.title_logo_view}]`).prop('checked', true);

  $(`input[name="chk_page_type"][value=${main_info.page_type}]`).prop('checked', true);

   // 콘텐츠 설정
   let section = main_info.section;
   for(let i = 0; i < section.length; i++){
     let idx = section[i].idx
     section_list.push(idx);
     draw_section_list(idx);

     let section_width = section[i].width;
     if(!isEmpty(section_width)){
       if(String(section_width) != "100%"){
         $(`#chk_section_width_${idx}_2`).prop('checked', true);
         $(`#section_width_${idx}`).prop('disabled', false);
         $(`#section_width_${idx}`).val(section_width);
       }else{
         $(`#chk_section_width_${idx}_1`).prop('checked', true);
       }
     }
     $(`#section_category_${idx}`).val(section[i].category_idx);
     $(`input[name="chk_category_view_${idx}"][value=${section[i].section_category_view}]`).prop('checked', true);
     $(`input[name="chk_category_align_${idx}"][value=${section[i].section_category_align}]`).prop('checked', true);
     $(`#category_description_${idx}`).val(section[i].category_description);
     $(`input[name="chk_section_tem_${idx}"][value=${section[i].section_template}]`).prop('checked', true);
     if (i === section.length - 1) {
       section_start_number = Number(idx) + 1;
     }
   }
}

// 웹진 리스트를 추가할때 이전에 했던 옵션들은 그대로 그린다
function draw_content_before_setting(pData){

  let title_info = pData.title_info;
  title_info = urldecode(title_info);
  title_info = JSON.parse(title_info);
  console.log(title_info);

  $('#webzine_name').val(pData.page_title);
  $('#webzine_sub_name').val(pData.page_sub_title);

  $(`input[name="chk_banner_height"][value=${title_info.banner_height}]`).prop('checked', true);
  $(`input[name="chk_title_visible"][value=${title_info.title_banner_position}]`).prop('checked', true);
  $(`input[name="chk_title_align"][value=${title_info.title_align}]`).prop('checked', true);
  $(`input[name="chk_title_position"][value=${title_info.title_position}]`).prop('checked', true);
  $(`input[name="chk_title_position"][value=${title_info.title_position}]`).prop('checked', true);
  $('#title_color').val(title_info.title_color);
  $('#title_font_size').val(title_info.title_size);
  $('#title_font_size_output').css('font-size', `${title_info.title_size}px`);
  $('#title_font_size_output').text(title_info.title_size);
  $('#sub_title_font_size').val(title_info.sub_title_size);
  $('#sub_title_font_size_output').css('font-size', `${title_info.sub_title_size}px`);
  $('#sub_title_font_size_output').text(title_info.sub_title_size);
  $(`input[name="chk_title_position"][value=${title_info.title_position}]`).prop('checked', true);

  $('#webzine_writer').val(pData.webzine_writer);
  $(`input[name="chk_writer_visible"][value=${pData.writer_visible}]`).prop('checked', true);
  $(`input[name="chk_word_break"][value=${title_info.word_break}]`).prop('checked', true);
}