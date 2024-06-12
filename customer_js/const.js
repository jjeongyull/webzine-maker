const c_idx = 2;
let g_access_token ="";
// 메인페이지 리스트
let g_webzine_main_list = new Object();

// 페이지의 메인이되는 월호
let g_month = "";

// 웹진 옵션
let g_webzine_option = new Object();

// 서브페이지 메뉴 리스트
let g_category_list = new Object();

// 서브메뉴인데 보류
let g_sub_category_list = new Object();

// 웹진 리스트
let g_webzine_content_list = new Object();

// 스와이퍼
let swiper;
let swiper2;

// 카테고리 번호
// const IN_FOCUS = 8;
// const KAT_ISSUE = 9;
// const TREND = 10;
// const PLAZA = 11;
// const INTRO = 12;

const IN_FOCUS = 10;
const KAT_ISSUE = 9;
const TREND = 11;
const PLAZA = 12;
const INTRO = 8;
// 서브페이지 전역변수
let g_idx = "";

let currentSection = 0; // 현재 활성화 되어있는 섹션의 인덱스(번호)를 저장, 초기값은 0
let isScrolling = false; // 현재 애니메이션이 진행중인지를 나타낼 변수, 초기값은 false

