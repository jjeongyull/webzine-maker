let editor2;
const ComponentList = {
  "sidebar" : "component/sidebar.html"
}
const status_sucess_code = [200, 201, 202, 400];

let PagesContent = {};

// modal
let modal_object = {
  type: "",
  main_text: "",
  sub_text: "",
  icon: ""
}

const MODAL_ICON_OBJ = {
  info: "<i class='bx bx-info-circle'></i>",
  success : "<i class='bx bx-check-circle text-green'></i>",
  error: "<i class='bx bx-info-circle text-red'></i>"
}

// 로그인 변수
let g_access_token = "";
let g_login = {};

// 고객사 변수
let g_customer_table_data = {};
let g_customer_all_data = {};

// 사용자
let g_user_table_data = {};

// 게시판
let g_notice_data = {};
let g_notice_one_data = {};
let g_reple_data = {};

// 페이지네시션 변수
const TABLE_VIEW_COUNT = 15;
const PAGE_NATION_COUNT = 5;

let main_result_file = [];   // 파일업로드 시 기존 등록된 메인 파일 리스트
let main_files = [];      // 메인 파일 관련
let delete_main_data = []; // 파일 삭제를 위한 메인이미지 변수

const FILE_COUNT = 10;

const SIDEBAR_HTML = `<header>
<div class="image-text">
  <span class="image">
    <img class="logo-img" src="images/logo.png" alt="logo">
  </span>

  <div class="text header-text">
    <span class="name">Customer</span>
    <span class="profession">bulletin board</span>
  </div>
</div>
<i class='bx bx-chevron-right toggle'></i>
</header>
<div class="menu-bar">
<div class="menu">
  <ul class="menu-links">
    <li class="search-box display-none" id="search_notice_div">
      <i class='bx bx-search-alt-2 icon'></i>
      <input class="search-input" id="search_notice" type="search" placeholder="Search...">
    </li>
    <li class="nav-link" id="mainPage_li">
      <a class="nav-a" href="index.html" id="mainPage">
        <i class='bx bx-home-alt icon'></i>
        <span class="nav-text">
          고객사 게시판
        </span>
      </a>
    </li>
    <li class="nav-link" id="customer_li">
      <a class="nav-a" href="customer.html" id="customer">
        <i class='bx bx-buildings icon'></i>
        <span class="nav-text">
          고객사 관리
        </span>
      </a>
    </li>
    <li class="nav-link" id="user_page_li">
      <a class="nav-a" href="user.html" id="user_page">
        <i class='bx bx-user icon'></i>
        <span class="nav-text">
          사용자 관리
        </span>
      </a>
    </li>
  </ul>
</div>

<div class="bottom-content">

  <li class="nav-link">
    <a class="nav-a" href="#" id="btn_logout">
      <i class='bx bx-log-out icon'></i>
      <span class="nav-text text">Logout</span>
    </a>
  </li>

  <li class="mode">
    <div class="moon-sun">
      <i class='bx bx-moon icon moon' ></i>
      <i class='bx bx-sun icon sun' ></i>
    </div>
    <span class="mode-text text">Dark Mode</span>
    <div class="toggle-switch">
      <span class="switch"></span>
    </div>
  </li>

</div>
</div>`