<?php
    $host = 'additdev.iptime.org'; // 호스트명
    $username = 'root'; // 사용자명
    $password = '!doemdlt2020#'; // 비밀번호
    $database = 'webzine_admin'; // 데이터베이스명

    // 데이터베이스 연결 설정
    $conn = new mysqli($host, $username, $password, $database);

    // 연결 확인
    if ($conn->connect_error) {
        die('데이터베이스 연결 실패: ' . $conn->connect_error);
    }

    $c_idx = 2;

    if (isset($_GET['vol'])) {
        $vol = $_GET['vol'];
        $sql = "SELECT * FROM webzine_main WHERE webzine_month = '$vol' AND c_idx = $c_idx ";
    } else {
        $sql = "SELECT * FROM webzine_main WHERE webzine_active = 1 AND c_idx = $c_idx ORDER BY idx DESC LIMIT 1";
    }

    
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // 데이터가 존재하는 경우
        $row = $result->fetch_assoc();
    
        // 데이터 처리
        $webzine_month = $row['webzine_month'];
        $webzine_thumnail = $row['webzine_thumnail'];
        $idx = $row['idx'];

        $mainImg = 'http://additdev.iptime.org:8000/webzine_make/img/'. $c_idx . '/' . $webzine_month . '/' . $webzine_thumnail;
        $page_title = '한국표준협회 웹진' . $webzine_month . '월 호';
?>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="apple-mobile-web-app-title" content="">
  <link rel="apple-touch-icon" href="#">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <link rel="apple-touch-startup-image" href="#">
  <meta name="apple-mobile-web-app-capable" content="yes">

  <meta property="og:title" content="<?php echo mb_convert_encoding($page_title, 'UTF-8'); ?>"> <!-- SNS에서 공유 시 보여주는 타이틀-->
  <meta name="og:type" content="website">
  <meta property="og:image" content="<?php echo mb_convert_encoding($mainImg, 'UTF-8'); ?>"> <!-- SNS에서 공유 시 보여주는 이미지 -->
  <meta property="og:url" content=""> <!-- SNS에서 공유 시 보여주는 이미지-->
  <meta property="og:description" content="<?php echo mb_convert_encoding($page_title, 'UTF-8'); ?>"> <!-- SNS에서 공유 시 보여주는 설명문구 -->
  <meta property="og:locale" content="kr-KR"> <!-- SNS에서 공유 시 언어-지역, en-US 등 두개 이상 둘 수 있음 -->
  <meta property="og:site-name" content="">
  <title><?php echo mb_convert_encoding($page_title, 'UTF-8'); ?></title>

  <!-- JQuery -->
  <script src="https://code.jquery.com/jquery-3.7.0.js"></script>

  <script src="https://cdn.tailwindcss.com"></script>

  <!-- hammer.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js"></script>


  <!-- swiper -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"/>
  <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>

  <!-- css -->
  <link rel="stylesheet" href="css/reset.css">
  <link rel="stylesheet" href="css/customer_style.css">

  <!-- js -->
  <script src="customer_js/template.js"></script>
  <script src="customer_js/const.js"></script>
  <script src="customer_js/api.js"></script>
  <script src="customer_js/ck_dev_event.js"></script>
  <script src="customer_js/draw.js"></script>
  <script src="customer_js/utill.js"></script>
</head>
<body>
  <header id='header'></header>

  <main class='mb-20 md:mb-40 full-content' id="main_banner" id='section_0'></main>

  <section class='mb-20 md:mb-40 w-1200 mx-auto px-5 md:px-0 full-content' id='section_1'></section>

  <section class='mb-20 md:mb-40 w-1200 mx-auto px-5 md:px-0 full-content' id='section_2'></section>

  <!-- 더미데이터 -->
  <section class='mb-20 md:mb-40 px-5 md:px-0 overflow-x-hidden full-content' id='section_3'>
    <div class='w-1200 mx-auto relative dumi-h'>
      <h2 class="main-content-title text-center mb-3 text-3xl md:text-4xl">국제표준협력 뉴스</h2>
      <div class='dumi-css w-full md:w-screen'>
        <div class="swiper swiper2 mySwiper2">
          <div class="swiper-wrapper">
            <div class="swiper-slide swiper-slide2 block"  style="text-align: left;">
              <div class='w-full bg-gray-200 p-10'>
                <h3 class='mb-2 text-lg md:text-2xl font-theme font-bold'>무궁화 꽃이 피었습니다.</h3>
                <p class='mb-20 text-lf text-base md:text-lg'>무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.</p>
                <span class='font-basic text-lf'>2024.01.01</span>
              </div>
              <div class='section-bg h-96 w-full' style="background-image: url('img/2/2024-01/9/dsfdsfvc.jpg');"></div>
            </div>
            <div class="swiper-slide swiper-slide2 block"  style="text-align: left">
              <div class='w-full bg-gray-200 p-10'>
                <h3 class='mb-2 text-lg md:text-2xl font-theme font-bold'>무궁화 꽃이 피었습니다.</h3>
                <p class='mb-20 text-lf text-base md:text-lg'>무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.</p>
                <span class='font-basic text-lf'>2024.01.01</span>
              </div>
              <div class='section-bg h-96 w-full' style="background-image: url('img/2/2024-01/9/dsfdsfvc.jpg');"></div>
            </div>
            <div class="swiper-slide swiper-slide2 block"  style="text-align: left">
              <div class='w-full bg-gray-200 p-10'>
                <h3 class='mb-2 text-lg md:text-2xl font-theme font-bold'>무궁화 꽃이 피었습니다.</h3>
                <p class='mb-20 text-lf text-base md:text-lg'>무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.</p>
                <span class='font-basic text-lf'>2024.01.01</span>
              </div>
              <div class='section-bg h-96 w-full' style="background-image: url('img/2/2024-01/9/dsfdsfvc.jpg');"></div>
            </div>
            <div class="swiper-slide swiper-slide2 block"  style="text-align: left">
              <div class='w-full bg-gray-200 p-10'>
                <h3 class='mb-2 text-lg md:text-2xl font-theme font-bold'>무궁화 꽃이 피었습니다.</h3>
                <p class='mb-20 text-lf text-base md:text-lg'>무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.</p>
                <span class='font-basic text-lf'>2024.01.01</span>
              </div>
              <div class='section-bg h-96 w-full' style="background-image: url('img/2/2024-01/9/dsfdsfvc.jpg');"></div>
            </div>
            <div class="swiper-slide swiper-slide2 block"  style="text-align: left">
              <div class='w-full bg-gray-200 p-10'>
                <h3 class='mb-2 text-lg md:text-2xl font-theme font-bold'>무궁화 꽃이 피었습니다.</h3>
                <p class='mb-20 text-lf text-base md:text-lg'>무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.</p>
                <span class='font-basic text-lf'>2024.01.01</span>
              </div>
              <div class='section-bg h-96 w-full' style="background-image: url('img/2/2024-01/9/dsfdsfvc.jpg');"></div>
            </div>
            <div class="swiper-slide swiper-slide2 block"  style="text-align: left">
              <div class='w-full bg-gray-200 p-10'>
                <h3 class='mb-2 text-lg md:text-2xl font-theme font-bold'>무궁화 꽃이 피었습니다.</h3>
                <p class='mb-20 text-lf text-base md:text-lg'>무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.</p>
                <span class='font-basic text-lf'>2024.01.01</span>
              </div>
              <div class='section-bg h-96 w-full' style="background-image: url('img/2/2024-01/9/dsfdsfvc.jpg');"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
  <!-- 더미데이터 끝 -->

  <section class='mb-20 md:mb-40 w-1200 mx-auto px-5 md:px-0 full-content' id='section_4'></section>

  <footer class='bg-gray-300' id='footer'></footer>

  <!-- pagenetion -->
  <!-- <div class="pagenation">
    <span class="fullpage-btn active" data-index= 0><span class="fullpage-btn-inner"></span></span>
    <span class="fullpage-btn" data-index= 1><span class="fullpage-btn-inner"></span></span>
    <span class="fullpage-btn" data-index= 2><span class="fullpage-btn-inner"></span></span>
    <span class="fullpage-btn" data-index= 3><span class="fullpage-btn-inner"></span></span>
    <span class="fullpage-btn" data-index= 4><span class="fullpage-btn-inner"></span></span>
  </div> -->
  
  <script src="customer_js/load.js"></script>
</body>
</html>
<?php
} else {
    echo "데이터가 존재하지 않습니다.";
}

// 연결 종료
$conn->close();
?>