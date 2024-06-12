<?php
  // 브라우저에서 쿠키 조회 불가, 서버로 Request할 경우에만 쿠키 사용
  if (session_status() == PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
  } 

  /* JWT 
    jwt 검증 : https://jwt.io/
    jwt : 헤더 (Header), 페이로드 (Payload), 서명 (Signature) 세 부분으로 구성, 각 구성요소는 점 (.) 으로 분리
      => Header.Payload.Signature
  */

  include_once 'config.php';
  include_once 'database.php';
  include_once "crypt.php";
  include_once "function.php";
  include_once "jwt_func.php";

  // axio에서 전달된 파라미터를 못받을 수 있으므로 헤드 정보 추가 (필요한지는 다시 한번 확인이 필요함)
  header("Access-Control-Allow-credentials: true");
  header("Access-Control-Allow-Origin: *");
  // header("Access-Control-Allow-Origin: *");
  //header("Content-Type: text/html; charset=UTF-8");
  header("Access-Control-Allow-Methods: POST, GET");
  header("Access-Control-Max-Age: 3600");
  // X-Requested-With : 요청이 Ajax라는 것을 의미
  header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

  // 파이썬 파일
  $pythonScript = 'make_webzine.py';

  // 리턴 변수 선언
  $rtn_access_token = "";     // 리턴될 Access Token
  $rtnmessage = "";
  $data_array = array();      // 임시 배열 선언
  $bregen = false;            // 엑세스 토큰 재발행 여부 확인
  $resultdata = array();      // 결과 JSON 저장 배열
  $tokendata = array();       // 토큰에 포함된 데이터를 저장하기 위한 변수

  // Request Content Type를 구한다.
  $requestContentType = getRequstContentType($_SERVER['CONTENT_TYPE']);

  $request_body = file_get_contents('php://input');


  switch ($requestContentType) {
    case "json" :
      $request_body = json_decode($request_body);
      $cmd = $request_body->cmd;
      break;
    case "urlencoded" : // 텍스트 파싱
      $cmd = fn_URIString("cmd", "string", "");
      break;
    case "text" :
      $paramdata = $request_body;
      break;
    default :
      $cmd = "";
      break;
  }

  if ($cmd == ""){
    $cmd = isset($_POST['cmd']) ? $_POST['cmd'] : "";
    if ($cmd == ""){
      ReturnData(500, "error", "명령 파라미터 전달 오류", "", "", NULL);
      die();
    }
  
  }
  else if ($cmd == "logout"){
    // 쿠키를 초기화한다.
    setcookie('rtoken', "", time() - 3600,'/', DOMAIN, false, true);
    // 쿠키를 저장한 테이블이 존재할 경우 삭제한다.
    $resultdata["status"] = 200;
    ReturnData($resultdata["status"], $cmd, "", "", "", NULL);
    die();
  }

  // 데이터베이스 연결(로그인)
  $databaseService = new DatabaseService();
  $conn = $databaseService->getConnection();
  if ($conn === NULL)
  {
    http_response_code(500);  
    ReturnData(500, "dbcon", "데이터베이스 연결 오류", "", "", NULL);
    die();
  }
  // PDO 실행 에러를 처리 하기 위해 
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  // 데이터베이스 연결(카드뉴스 사이트)
  $databaseService_2 = new DatabaseService_2();
  $conn_webzine = $databaseService_2->getConnection();
  if ($conn_webzine === NULL)
  {
    http_response_code(500);  
    ReturnData(500, "dbcon", "데이터베이스 연결 오류", "", "", NULL);
    die();
  }
  // PDO 실행 에러를 처리 하기 위해 
  $conn_webzine->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);



  // 로그인 전에 처리되어야하는 정보
  $param = new stdClass();
  switch ($cmd){
    case "load_webzine_category":                    
    case "load_webzine_sub_category":                    
    case "load_webzine_list":                                       
    case "load_main_webzine":                    
    case "load_webzine_option":                    
        if (isset($request_body->tbl_name) && isset($request_body->c_idx)){
          $tbl_name = $request_body->tbl_name;
          $c_idx = $request_body->c_idx;
        } 
        else{
          ReturnData(500, $cmd, "파라미터 오류", "", "", $conn_webzine);
          $conn_webzine = null;
          die();
        }
        $sql = "SELECT * FROM " . $tbl_name . " WHERE c_idx = " . $c_idx . " ORDER BY idx ASC";  
        try{
          $stmt = $conn_webzine->prepare($sql);
          //$stmt->debugDumpParams();
          $stmt->execute();
          //$stmt->debugDumpParams();
  
          $row = $stmt->fetchAll(PDO::FETCH_ASSOC);
          $data_array = $row;
  
          $result_data["tabledata"] = $data_array;
          ReturnData(200, $cmd, $rtnmessage, "", $result_data, $conn_webzine);
        }
        catch(PDOException $e){
            ReturnData(600, $cmd, $e->getMessage(), "", "", $conn_webzine);
        }
        die();
      break;
    case "load_webzine_option_uuid":                    
    case "load_webzine_category_uuid":                    
    case "load_webzine_sub_category_uuid":                    
    case "load_main_webzine_uuid":                    
    case "load_webzine_contents_uuid":                
      if (isset($request_body->tbl_name) && isset($request_body->uuid)){
        $tbl_name = $request_body->tbl_name;
        $uuid = $request_body->uuid;
      } 
      else{
        ReturnData(500, $cmd, "파라미터 오류", "", "", $conn_webzine);
        $conn_webzine = null;
        die();
      }
      $sql = "SELECT * FROM " . $tbl_name . " WHERE uuid = '" . $uuid . "' ORDER BY idx ASC";  
      try{
        $stmt = $conn_webzine->prepare($sql);
        //$stmt->debugDumpParams();
        $stmt->execute();
        //$stmt->debugDumpParams();

        $row = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $data_array = $row;

        $result_data["tabledata"] = $data_array;
        ReturnData(200, $cmd, $rtnmessage, "", $result_data, $conn_webzine);
      }
      catch(PDOException $e){
          ReturnData(600, $cmd, $e->getMessage(), "", "", $conn_webzine);
      }
      die();
    break;
      break;
  }

 


  // 테이블 존재 검사 없으면 true를 리턴
  function ExistsTable($tablename, $dbcon){
    $rtnvalue = true;
    if ($tablename == ""){
      return $rtnvalue;
    }
    try{
      $resulttable = "";
      //테이블이 존재하는지 검사
      $checktable = "SHOW tables LIKE '" . $tablename . "'";
      $stmt = $dbcon->prepare($checktable);
      $stmt->execute();
      $resulttable = $stmt->fetchColumn();
      if ($resulttable != ""){
        $rtnvalue = false;
      }
    }catch(PDOException $e){
      $rtnvalue = false;  
    }
    return $rtnvalue;
  }

  // 결과 데이터 리턴 함수
  function ReturnData($status, $cmd, $message, $atoken, $data, $conn_webzine){
    $return_data = array();     // 결과값 리턴 배열 선언
    unset($return_data);
    $tmp_json["status"] = $status;
    $tmp_json["cmd"] = $cmd;
    $tmp_json["message"] = $message;
    $tmp_json["token"] = $atoken;
    $tmp_json["data"] = $data;
    $return_data = json_encode($tmp_json, JSON_UNESCAPED_UNICODE + JSON_PRETTY_PRINT);
    echo ($return_data);
    if (isset($conn_webzine)){
      $conn_webzine = null;
    }
  }

 



  // 배열로 넘어온 테이블이 있는지 확인한다.
function DropTable($dropdata, $dbcon){
  $rtnvalue = "";
  if ($dropdata == ""){
    return;
  }
  if (is_array($dropdata)){
    foreach ($dropdata as $tablename) {
      $resulttable = "";
      $checktable = "SHOW tables LIKE '" . $dropdata . "'";
      /*
      $checktable = "SELECT CONCAT('DROP TABLE ', TABLE_SCHEMA, '.', TABLE_NAME, ';')";
      $checktable = $checktable . " FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '";
      $checktable = $checktable . $dropdata . "%'";
      */
      $stmt = $dbcon->prepare($checktable);
      $stmt->execute();
      $resulttable = $stmt->fetchColumn();
      if ($resulttable != ""){
        while($row)
        $delsql = "DROP TABLE " . $tablename;
        try{
          $stmt = $dbcon->prepare($delsql);
          $stmt->execute();
          if (!$stmt){
            $rtnvalue = "테이블 삭제 오류 : " . $delsql;
            break;
          }
        }catch(PDOException $e){
          $rtnvalue = $e->getMessage();
        }
      }
    }
  }else{
    try{
      $resulttable = "";
      //테이블이 존재하는지 검사 후 삭제한다.
      $checktable = "SHOW tables LIKE '" . $dropdata . "'";
      $stmt = $dbcon->prepare($checktable);
      $stmt->execute();
      $resulttable = $stmt->fetchColumn();
      if ($resulttable != ""){
        $delsql = "DROP TABLE " . $dropdata;
        $stmt = $dbcon->prepare($delsql);
        $stmt->execute();
        if (!$stmt){
          $rtnvalue = "테이블 삭제 오류 : " . $delsql;
        }
      }
    }catch(PDOException $e){
      $rtnvalue = $e->getMessage();
    }
  }
  return $rtnvalue;
}

// 파일 업로드 진행
function handleFileUpload($uploadDirectory, $files, $uploadType) {
  $bupload = true;
  $rtnMessage = ""; // 에러 메시지 초기화

  foreach ($files['name'] as $key => $fileName) {
      $tmpFileName = $files['tmp_name'][$key];
      $fileSize = $files['size'][$key];

      // 업로드된 파일이 없는 경우 무시
      if ($fileName === '') continue;

      // 파일 업로드 시 에러가 발생한 경우 처리
      if (!move_uploaded_file($tmpFileName, $uploadDirectory . $fileName)) {
          switch ($files['error'][$key]) {
              case UPLOAD_ERR_INI_SIZE:
                  $rtnMessage = "Uploaded file exceeds the upload_max_filesize directive in php.ini.";
                  break;
              case UPLOAD_ERR_FORM_SIZE:
                  $rtnMessage = "Uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form.";
                  break;
              case UPLOAD_ERR_PARTIAL:
                  $rtnMessage = "The uploaded file was only partially uploaded.";
                  break;
              case UPLOAD_ERR_NO_FILE:
                  $rtnMessage = "No file was uploaded.";
                  break;
              case UPLOAD_ERR_NO_TMP_DIR:
                  $rtnMessage = "Missing a temporary folder.";
                  break;
              case UPLOAD_ERR_CANT_WRITE:
                  $rtnMessage = "Failed to write file to disk.";
                  break;
              case UPLOAD_ERR_EXTENSION:
                  $rtnMessage = "A PHP extension stopped the file upload.";
                  break;
              default:
                  $rtnMessage = "Unknown upload error.";
                  break;
          }

          $bupload = false; // 파일 업로드 실패 설정
          break; // 파일 업로드 실패 시 반복문 종료
      }
  }

  // 파일 업로드 실패 시 해당 타입에 따라 적절한 에러 메시지 반환
  if (!$bupload) {
      ReturnData(500, $uploadType, $rtnMessage, "", "", NULL);
      die(); // 종료
  }
}
?>