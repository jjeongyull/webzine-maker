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
  include_once 'api_login.php';
  include_once "crypt.php";
  include_once "function.php";
  include_once "jwt_func.php";
  include_once "sendmail.php"; 

  // axio에서 전달된 파라미터를 못받을 수 있으므로 헤드 정보 추가 (필요한지는 다시 한번 확인이 필요함)
  header("Access-Control-Allow-credentials: true");
  header("Access-Control-Allow-Origin: " . DOMAIN);
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
    //http_response_code(500);  
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
    //http_response_code(500);  
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
    case "load_customer":                                      
      if (isset($request_body->tbl_name)){
        $tbl_name = $request_body->tbl_name;
      } 
      else{
        ReturnData(500, $cmd, "파라미터 오류", "", "", $conn_webzine);
        $conn_webzine = null;
        die();
      }
      $sql = "SELECT * FROM " . $tbl_name . " ORDER BY idx ASC"; 
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
    case "load_member":                    // 업로드한 개별 정보                    // 업로드한 개별 정보
      if (isset($request_body->tbl_name)){
        $tbl_name = $request_body->tbl_name;
      } 
      else{
        ReturnData(500, $cmd, "파라미터 오류", "", "", $conn_webzine);
        $conn_webzine = null;
        die();
      }
      $sql = "SELECT * FROM " . $tbl_name . " ORDER BY idx ASC";  
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
  case "insert_member" : 
    if ( isset($request_body->mem_id) && isset($request_body->mem_password) 
    && isset($request_body->mem_name) && isset($request_body->customer_idx)
    && isset($request_body->customer_name) && isset($request_body->uuid)
    && isset($request_body->member_active)
    ){
      $mem_id = $request_body->mem_id;
      $mem_password = $request_body->mem_password;
      $mem_name = $request_body->mem_name;
      $customer_idx = $request_body->customer_idx;
      $customer_name = $request_body->customer_name;
      $uuid = $request_body->uuid;
      $member_active = $request_body->member_active;
    }
    else{
        ReturnData(500, $cmd, "파라미터 오류", "", "", $conn_webzine);
        die();
    }

    try{
        // 동일한 정보가 존재하는지 확인한다.
        $sql = "SELECT COUNT(mem_id) as cnt FROM webzine_member WHERE mem_id = '" . $mem_id . "'";
        $stmt = $conn_webzine->prepare($sql);
        $stmt->execute();
        $resultcount = $stmt->fetchColumn();
        if ($resultcount > 0){
            ReturnData(500, $cmd, "해당 아이디는 이미 사용중입니다.", $rtn_access_token, "", $conn_webzine);
            die();    
        }

        // 관리자 아이디는 등록할 수 없다.
        if ($mem_id === "admin"){
            ReturnData(500, $cmd, "허용되지 않는 아이디입니다.", $rtn_access_token, "", $conn_webzine);
            die();    
        }

        // 주의 : PDO를 사용할 경우 Update가 일어나지 않을 경우 rowCount는 0을 반환 (mysql에서 동일한 값이 있을 경우 0을 반환한다.)
        $sql = "INSERT INTO webzine_member (mem_id, mem_name, mem_password, customer_idx, customer_name, member_active, uuid, sign_date)";
        $sql = $sql .  " VALUES (:mem_id, :mem_name, :mem_password, :customer_idx, :customer_name, :member_active, :uuid, now())";
        // PDO 준비
        //$conn->beginTransaction();
        $stmt = $conn_webzine->prepare($sql);

        // 파라미터 바인딩, ?로 할 경우 bindValue로 
        $stmt->bindValue(":mem_id", $mem_id, PDO::PARAM_STR);
        $stmt->bindValue(":mem_name", $mem_name, PDO::PARAM_STR);

        $change_password = hash("sha256", utf8_encode($mem_password));
        $stmt->bindValue(":mem_password", $change_password, PDO::PARAM_STR);
        $stmt->bindValue(":customer_idx", $customer_idx, PDO::PARAM_INT);
        $stmt->bindValue(":customer_name", $customer_name, PDO::PARAM_STR);
        $stmt->bindValue(":member_active", $member_active, PDO::PARAM_INT);
        $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);

        $stmt->execute();
        $count = $stmt->rowCount();
        if ($count == 1){
            //$conn->commit();
            ReturnData(200, $cmd, "", $rtn_access_token, "", $conn_webzine);
        }
        else{
            // $stmt->debugDumpParams();
            ReturnData(500, $cmd, $sql, $rtn_access_token, "", $conn_webzine);
        }
    }
    catch(PDOException $e){
        //$conn->rollback();
        ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn_webzine);
    }
    die();
    break;

    case "insert_customer_sign":
      if (isset($request_body->name))
      {
          $name = $request_body->name;
      }
      else{
          ReturnData(500, $cmd, "파라미터 오류", "", "", $conn_webzine);
          $conn_webzine = null;
          die();
      }
      $uuid = uniqid();
      $sql = "SELECT COUNT(*) FROM customer WHERE name = '" . $name . "'";
      $stmt = $conn_webzine->prepare($sql);
      $stmt->execute();
      $resultcount = $stmt->fetchColumn();
      
      if ($resultcount > 0){
          $sql = "SELECT * FROM customer WHERE name = :name";
          $stmt = $conn_webzine->prepare($sql);
          $stmt->bindValue(':name', $name, PDO::PARAM_STR);
          $stmt->execute();
          $result = $stmt->fetchAll(PDO::FETCH_ASSOC); // 데이터 가져오기
          $result_data["tabledata"] = $result;
          ReturnData(200, $cmd, "해당 고객사는 이미 사용중입니다.", "", $result_data, $conn_webzine);
          die();    
      }
  
      $sql = "INSERT INTO customer (name, uuid, write_date)";
      $sql = $sql . " VALUES (:name, :uuid, now())";
  
      try{
        // PDO 준비
        $conn_webzine->beginTransaction();     // 트랜잭션 시작
        $stmt = $conn_webzine->prepare($sql);
  
        // 파라미터 바인딩, ?로 할 경우 bindValue로 
        $stmt->bindValue(":name", $name, PDO::PARAM_STR);
        $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
        $stmt->execute();
        //$stmt->debugDumpParams();
        $count = $stmt->rowCount();
        if ($count == 1){
          $lastInsertId = $conn_webzine->lastInsertId();
          $conn_webzine->commit();     // 트랜잭션 성공
  
          $selectSql = "SELECT * FROM customer WHERE idx = :id";
          $selectStmt = $conn_webzine->prepare($selectSql);
          $selectStmt->bindValue(":id", $lastInsertId, PDO::PARAM_INT);
          $selectStmt->execute();
          $result = $selectStmt->fetchAll(PDO::FETCH_ASSOC);
          $data_array = $result;
          $result_data["tabledata"] = $data_array;
          ReturnData(200, $cmd, "", $rtn_access_token, $result_data, $conn_webzine);
          die();
        }
        else{
            //$stmt->debugDumpParams();
            $conn_webzine->rollBack();     // 트랜잭션 실패
            ReturnData(502, $cmd, $sql, $rtn_access_token, "", $conn_webzine);
        }
      }
      catch(PDOException $e){
          //$stmt->debugDumpParams();
          $conn_webzine->rollBack();     // 트랜잭션 실패
          ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn_webzine);
      }
      die();
      break;
    // case "update_product_list_hit":                    // 업로드한 개별 정보
    //   if (isset($request_body->tbl_name) && isset($request_body->idx)){
    //     $tbl_name = $request_body->tbl_name;
    //     $idx = $request_body->idx;
    //   } 
    //   else{
    //     ReturnData(500, $cmd, "파라미터 오류", "", "", $conn_webzine);
    //     $conn_webzine = null;
    //     die();
    //   }
     
    //   try{
    //     $sql = "UPDATE " . $tbl_name . " SET hit = hit + 1 WHERE idx = :idx";
    //     $stmt = $conn_webzine->prepare($sql);
    //     $stmt->bindValue(":idx", $idx, PDO::PARAM_INT);
    //     $stmt->execute();
    //     $count = $stmt->rowCount();
      
    //     if ($count > 0){
    //       ReturnData(200, $cmd, "", "", "", $conn_webzine); 
    //     }
    //     else{
    //       ReturnData(501, $cmd, "조회수 처리중 오류가 발생했습니다.", 
    //                 "", "", $conn_webzine);
    //       die();  
    //     }
    //   }
    //   catch(PDOException $e){
    //       ReturnData(600, $cmd, $e->getMessage(), "", "", $conn_webzine);
    //   }
    //   die();
    //   break;
      break;
  }



  // 헤더의 HTTP_AUTHORIZATION에 엑세스 토큰이 실려있는가?
  if (! preg_match('/Bearer\s(\S+)/', isset($_SERVER['HTTP_AUTHORIZATION']) && $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
    // Access 토큰이 없을 경우
    // 1) 리프레시 토큰 체크
    $rtoken = getCookieFromHeader("rtoken");
    $rtncode = 0;
    // 토큰 data 정보를 저장하기 위한 배열 선언
    if ($rtoken !== ""){
      $rjwt = hex2bin($rtoken);
      $rtncode = ValidateToken($rjwt, TOKEN_KEY, $tokendata);
    }
    
    if ($rtncode != 200){ // 리프레시 토큰이 유효하지 않을 경우
      // 데이터베이스 로그인 처리
      if ( isset($request_body->mem_id) && isset($request_body->mem_password) ){
        $mem_id = $request_body->mem_id;
        $mem_password = $request_body->mem_password;
      }
      else{
        ReturnData(400, "login", "파라미터 오류(access_token(x), refresh_token(x))", "", "", $conn_webzine);
        die();
      }
      if (Login($conn_webzine, TBL_MEMBER, $mem_id, $mem_password, $resultdata)) {
        // Refresh 토큰 발행
        if ($resultdata["status"] == 200){
          $refresh_token = genToken(TOKEN_KEY, REFRESH_TIME, $resultdata["data"]["idx"], $resultdata["data"]["mem_id"], $resultdata["data"]["mem_name"], $resultdata["data"]["mem_level"], $resultdata["data"]["customer_idx"], $resultdata["data"]["customer_name"], $resultdata["data"]["uuid"]);
          $refresh_token = json_decode($refresh_token);
          $tmp_token = bin2hex($refresh_token->token);
          // Refresh 토큰을 쿠키에 저장
          setcookie('rtoken', $tmp_token, $refresh_token->exp + 100, '/', DOMAIN, false, true);
          // AccessToken 발행
          $access_token = genToken(TOKEN_KEY, ACCESS_TIME, $resultdata["data"]["idx"], $resultdata["data"]["mem_id"], $resultdata["data"]["mem_name"], $resultdata["data"]["mem_level"], $resultdata["data"]["customer_idx"], $resultdata["data"]["customer_name"], $resultdata["data"]["uuid"]);
          $access_token = json_decode($access_token);
          $rtn_access_token = bin2hex($access_token->token);
          $tokendata["idx"] = $resultdata["data"]["idx"];
          $tokendata["mem_id"] = $resultdata["data"]["mem_id"];
          $tokendata["mem_level"] = $resultdata["data"]["mem_level"];
          $tokendata["mem_name"] = $resultdata["data"]["mem_name"];
          $tokendata["customer_idx"] = $resultdata["data"]["customer_idx"];
          $tokendata["customer_name"] = $resultdata["data"]["customer_name"];
          $tokendata["uuid"] = $resultdata["data"]["uuid"];
          $rtnmessage = "1. 엑세스 토큰 미전송, 리프레시 토큰 미유효, DB 로그인처리, 신규 토큰 발행, 로그인 성공";
        }
      }
      else{
        ReturnData(204, "login", "권한 없음", "", "", $conn_webzine);
        die();  
      }
    } // 엑세스 토큰 재발행
    else{
      // AccessToken 발행 및 로그인 성공 처리
      $resultdata["status"] = 201;
      $access_token = genToken(TOKEN_KEY, ACCESS_TIME, $tokendata["idx"], $tokendata["mem_id"], $tokendata["mem_name"], $tokendata["mem_level"], $tokendata["customer_idx"], $tokendata["customer_name"], $tokendata["uuid"]);
      $access_token = json_decode($access_token);
      $rtn_access_token = bin2hex($access_token->token);
      $rtnmessage = "2. 엑세스 토큰 미전송, 리프레시 토큰 유효, 엑세스 토큰 재발행, 로그인 성공";
      $bregen = true;
    }
  }
  // 엑세스 토큰이 존재할 경우 엑세스 토큰 검증
  else{
    $jwt = $matches[1];
    if ($jwt !== ""){
      $atoken = hex2bin($jwt);
      $rtncode = ValidateToken($atoken, TOKEN_KEY, $tokendata);
    }

    // Access 토큰이 유효하지 않을 경우 리프레시 토큰 검증
    if ($rtncode != 200){
      $rtoken = getCookieFromHeader("rtoken");
      $rtncode = 0;
      if ($rtoken !== ""){
        $rjwt = hex2bin($rtoken);
        $rtncode = ValidateToken($rjwt, TOKEN_KEY, $tokendata);
        
      }
      // Refresh 토큰 검증
      if ($rtncode != 200){
        // 데이터베이스 로그인 처리 및 토큰 재발급
        if ( isset($request_body->id) && isset($request_body->password) ){
          $id = $request_body->id;
          $password = $request_body->password;
        }
        else{
          ReturnData(400, "login", "파라미터 오류(access_token(x), refresh_token(x))", "", "", $conn_webzine);
          $conn_webzine = null;
          die();
        }
        if (Login($conn_webzine, TBL_MEMBER, $id, $password, $resultdata)) {
          // Refresh 토큰 발행
          if ($resultdata["status"] == 200){
            $refresh_token = genToken(TOKEN_KEY, REFRESH_TIME, $resultdata["data"]["idx"], $resultdata["data"]["mem_id"], $resultdata["data"]["mem_name"], $resultdata["data"]["mem_level"], $resultdata["data"]["customer_idx"], $resultdata["data"]["customer_name"], $resultdata["data"]["uuid"]);
            $refresh_token = json_decode($refresh_token);
            $tmp_token = bin2hex($refresh_token->token);
            // Refresh 토큰을 쿠키에 저장
            setcookie('rtoken', $tmp_token, $refresh_token->exp + 100, '/', DOMAIN, false, true);
            // AccessToken 발행
            $access_token = genToken(TOKEN_KEY, ACCESS_TIME, $resultdata["data"]["idx"], $resultdata["data"]["mem_id"], $resultdata["data"]["mem_name"], $resultdata["data"]["mem_level"], $resultdata["data"]["customer_idx"], $resultdata["data"]["customer_name"], $resultdata["data"]["uuid"]);
            $access_token = json_decode($access_token);
            $rtn_access_token = bin2hex($access_token->token);
            $tokendata["idx"] = $resultdata["data"]["idx"];
            $tokendata["mem_id"] = $resultdata["data"]["mem_id"];
            $tokendata["mem_level"] = $resultdata["data"]["mem_level"];
            $tokendata["mem_name"] = $resultdata["data"]["mem_name"];
            $tokendata["customer_idx"] = $resultdata["data"]["customer_idx"];
            $tokendata["customer_name"] = $resultdata["data"]["customer_name"];
            $tokendata["uuid"] = $resultdata["data"]["uuid"];
            $rtnmessage = "3. 엑세스 토큰 전송(미유효), 리프레시 토큰(미유효), DB 로그인처리, 토큰 발행(ALL), 로그인 성공";
          }
        }
        else{
          ReturnData(204, "login", "권한 없음", "", "", $conn_webzine);
          die();  
        }  
      }
      else{
        // AccessToken 발행
        $resultdata["status"] = 201;
        $access_token = genToken(TOKEN_KEY, ACCESS_TIME, $tokendata["idx"], $tokendata["mem_id"], $tokendata["mem_name"], $tokendata["mem_level"], $tokendata["customer_idx"], $tokendata["customer_name"], $tokendata["uuid"]);
        $access_token = json_decode($access_token);
        $rtn_access_token = bin2hex($access_token->token);
        $rtnmessage = "4. 엑세스 토큰 전송(미유효), 리프레시 토큰(유효), 엑세스토큰 재발행, 로그인 성공";
        $bregen = true;
      }
    } 
    // 토큰이 유효할 경우 로그인 성공 리턴
    else{
      $resultdata["status"] = 201;
      $rtnmessage = "5. 엑세스 토큰 전송(유효), 로그인 성공";
      $rtn_access_token = $jwt;
    }
  }


  switch ($cmd){
    case "login" :
    case "login_token" :
      $memdata["idx"] = $tokendata["idx"];
      $memdata["user_id"] = $tokendata["mem_id"];
      $memdata["user_level"] = $tokendata["mem_level"];
      $memdata["user_name"] = $tokendata["mem_name"];
      $memdata["customer_idx"] = $tokendata["customer_idx"];
      $memdata["customer_name"] = $tokendata["customer_name"];
      $memdata["uuid"] = $tokendata["uuid"];
      ReturnData($resultdata["status"], $cmd, $rtnmessage, $rtn_access_token, $memdata, $conn_webzine);
      break;
    default;
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

  // 로그인 처리
  function Login($conn_webzine, $table_name, $id, $pwd, &$result){
    $tmpresult = array();
    try{
      // 쿼리 설정
      $query = "SELECT * FROM " . $table_name . " WHERE mem_id = :mem_id AND mem_password = :mem_password";
      // 쿼리 연결
      $stmt = $conn_webzine->prepare($query);
      // 파라미터 바인딩 
      $stmt->bindParam(":mem_id", $id, PDO::PARAM_STR);
      $password_hash = hash("sha256", utf8_encode($pwd));
      $stmt->bindParam('mem_password', $password_hash, PDO::PARAM_STR);
      // PDO 실행
      $stmt->execute();
      $num = $stmt->rowCount();

      $tmpresult["idx"] = "";
      $tmpresult["mem_id"] = "";
      $tmpresult["mem_name"] = "";
      $tmpresult["mem_level"] = "";
      $tmpresult["customer_idx"] = "";
      $tmpresult["customer_name"] = "";
      $tmpresult["uuid"] = "";

      if ($num > 0){
          $row = $stmt->fetch(PDO::FETCH_ASSOC);
          if ($row['member_active'] == 0) {
            $result["status"] = 502;
            $result["message"] = "계정이 승인되지 않았습니다.";
            return false;
          }
          $result["status"] = 200;

          // 로그인 일시를 업데이트 시킨다.
          $sql = "UPDATE " . $table_name . " SET mem_login_date = now() WHERE mem_id = :mem_id";
          $stmt = $conn_webzine->prepare($sql);
          $stmt->bindParam('mem_id', $id, PDO::PARAM_STR);
          $stmt->execute();

          $count = $stmt->rowCount();
          if ($stmt) {
            $tmpresult["idx"] = $row['idx'];
            $tmpresult["mem_id"] = $row['mem_id'];
            $tmpresult["mem_name"] = $row['mem_name'];
            $tmpresult["mem_level"] = $row['mem_level'];
            $tmpresult["customer_idx"] = $row['customer_idx'];
            $tmpresult["customer_name"] = $row['customer_name'];
            $tmpresult["uuid"] = $row['uuid'];
            $result["data"] = $tmpresult;
          }
          return true;
      }
      else{
        $result["status"] = 501;
        $result["message"] = "로그인 정보가 올바르지 않습니다.";
        return false;
      }
    }
    catch(PDOException $e){
      $result["status"] = 600;
      $result["message"] = $e->getMessage();
      return false;
    }
  }

switch ($cmd){
  case "update_member" : 
    if (isset($request_body->idx) && isset($request_body->mem_id)
    && isset($request_body->mem_name) && isset($request_body->member_active) 
    && isset($request_body->customer_idx) && isset($request_body->customer_name)
    && isset($request_body->uuid)) {
      $idx = $request_body->idx;
      $mem_id = $request_body->mem_id;
      $mem_name = $request_body->mem_name;
      $member_active = $request_body->member_active;
      $customer_idx = $request_body->customer_idx;
      $customer_name = $request_body->customer_name;
      $uuid = $request_body->uuid;
    }
    else{
      ReturnData(500, $cmd, "파라미터 오류", $rtn_access_token, "", $conn_webzine);
      die();
    }    
    try{
      $sql = "UPDATE webzine_member SET mem_id = :mem_id, mem_name = :mem_name, customer_idx = :customer_idx, customer_name = :customer_name, member_active = :member_active, uuid = :uuid WHERE idx = :idx";
      $stmt = $conn_webzine->prepare($sql);

      $stmt->bindValue(":idx", $idx, PDO::PARAM_INT);
      $stmt->bindValue(":mem_id", $mem_id, PDO::PARAM_STR);
      $stmt->bindValue(":mem_name", $mem_name, PDO::PARAM_STR);
      $stmt->bindValue(":member_active", $member_active, PDO::PARAM_INT);
      $stmt->bindValue(":customer_idx", $customer_idx, PDO::PARAM_INT);
      $stmt->bindValue(":customer_name", $customer_name, PDO::PARAM_STR);
      $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
      $stmt->execute();
      $count = $stmt->rowCount();
      if ($count > 0){
        ReturnData(200, $cmd, "", $rtn_access_token, "", $conn_webzine); 
      }
      else{
        ReturnData(501, $cmd, "업데이트 항목이 없거나 처리중 오류가 발생했습니다.", 
                  $rtn_access_token, "", $conn_webzine);
        die();  
      }
    }catch (PDOException $e) {
      ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn_webzine);
    }
    break;
  case "insert_category":
    if ( isset($request_body->tbl_name) && isset($request_body->name)
        && isset($request_body->view_order) && isset($request_body->c_idx)
        && isset($request_body->uuid))
    {
        $tbl_name = $request_body->tbl_name;
        $name = $request_body->name;
        $view_order = $request_body->view_order;
        $c_idx = $request_body->c_idx;
        $uuid = $request_body->uuid;
    }
    else{
        ReturnData(500, $cmd, "파라미터 오류", "", "", $conn_webzine);
        $conn_webzine = null;
        die();
    }
    $sql = "INSERT INTO ". $tbl_name . " (name, c_idx, uuid, view_order)";
    $sql = $sql . " VALUES (:name, :c_idx, :uuid, :view_order)";

    try{
      // PDO 준비
      $conn_webzine->beginTransaction();     // 트랜잭션 시작
      $stmt = $conn_webzine->prepare($sql);

      // 파라미터 바인딩, ?로 할 경우 bindValue로 
      $stmt->bindValue(":name", $name, PDO::PARAM_STR);
      $stmt->bindValue(":c_idx", $c_idx, PDO::PARAM_INT);
      $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
      $stmt->bindValue(":view_order", $view_order, PDO::PARAM_INT);
     
      $stmt->execute();
      //$stmt->debugDumpParams();
      $count = $stmt->rowCount();
      if ($count == 1){
        $conn_webzine->commit();     // 트랜잭션 성공
        ReturnData(200, $cmd, "", $rtn_access_token, "", $conn_webzine);
        die();
      }
      else{
          //$stmt->debugDumpParams();
          $conn_webzine->rollBack();     // 트랜잭션 실패
          ReturnData(502, $cmd, $sql, $rtn_access_token, "", $conn_webzine);
      }
    }
    catch(PDOException $e){
        //$stmt->debugDumpParams();
        $conn_webzine->rollBack();     // 트랜잭션 실패
        ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn_webzine);
    }
    break;
  case "insert_customer_name":
    if (isset($request_body->name))
    {
        $name = $request_body->name;
    }
    else{
        ReturnData(500, $cmd, "파라미터 오류", "", "", $conn_webzine);
        $conn_webzine = null;
        die();
    }
    $uuid = uniqid();
    $sql = "SELECT COUNT(name) as cnt FROM customer WHERE name = '" . $name . "'";
    $stmt = $conn_webzine->prepare($sql);
    $stmt->execute();
    $resultcount = $stmt->fetchColumn();
    if ($resultcount > 0){
        ReturnData(500, $cmd, "해당 고객사는 이미 사용중입니다.", $rtn_access_token, "", $conn_webzine);
        die();    
    }

    $sql = "INSERT INTO customer (name, uuid, write_date)";
    $sql = $sql . " VALUES (:name, :uuid, now())";

    try{
      // PDO 준비
      $conn_webzine->beginTransaction();     // 트랜잭션 시작
      $stmt = $conn_webzine->prepare($sql);

      // 파라미터 바인딩, ?로 할 경우 bindValue로 
      $stmt->bindValue(":name", $name, PDO::PARAM_STR);
      $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
      $stmt->execute();
      //$stmt->debugDumpParams();
      $count = $stmt->rowCount();
      if ($count == 1){
        $conn_webzine->commit();     // 트랜잭션 성공
        ReturnData(200, $cmd, "", $rtn_access_token, "", $conn_webzine);
        die();
      }
      else{
          //$stmt->debugDumpParams();
          $conn_webzine->rollBack();     // 트랜잭션 실패
          ReturnData(502, $cmd, $sql, $rtn_access_token, "", $conn_webzine);
      }
    }
    catch(PDOException $e){
        //$stmt->debugDumpParams();
        $conn_webzine->rollBack();     // 트랜잭션 실패
        ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn_webzine);
    }
    break;
  case "update_category" : 
    if (isset($request_body->idx) && isset($request_body->tbl_name)
    && isset($request_body->name) && isset($request_body->c_idx) && isset($request_body->uuid) && isset($request_body->view_order)) {
      $idx = $request_body->idx;
      $tbl_name = $request_body->tbl_name;
      $name = $request_body->name;
      $c_idx = $request_body->c_idx;
      $uuid = $request_body->uuid;
      $view_order = $request_body->view_order;
    }
    else{
      ReturnData(500, $cmd, "파라미터 오류", $rtn_access_token, "", $conn_webzine);
      die();
    }    
    try{
      $sql = "UPDATE " . $tbl_name . " SET name = :name, c_idx = :c_idx, uuid = :uuid, view_order = :view_order WHERE idx = :idx";
      $stmt = $conn_webzine->prepare($sql);

      $stmt->bindValue(":idx", $idx, PDO::PARAM_INT);
      $stmt->bindValue(":c_idx", $c_idx, PDO::PARAM_INT);
      $stmt->bindValue(":view_order", $view_order, PDO::PARAM_INT);
      $stmt->bindValue(":name", $name, PDO::PARAM_STR);
      $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
      $stmt->execute();
      $count = $stmt->rowCount();
      if ($count > 0){
        ReturnData(200, $cmd, "", $rtn_access_token, "", $conn_webzine); 
      }
      else{
        ReturnData(501, $cmd, "업데이트 항목이 없거나 처리중 오류가 발생했습니다.", 
                  $rtn_access_token, "", $conn_webzine);
        die();  
      }
    }catch (PDOException $e) {
      ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn_webzine);
    }
    break;
  case "update_customer_name" : 
    if (isset($request_body->idx) && isset($request_body->name)) {
      $idx = $request_body->idx;
      $name = $request_body->name;
    }
    else{
      ReturnData(500, $cmd, "파라미터 오류", $rtn_access_token, "", $conn_webzine);
      die();
    }    
    try{
      $sql = "UPDATE customer SET name = :name WHERE idx = :idx";
      $stmt = $conn_webzine->prepare($sql);

      $stmt->bindValue(":idx", $idx, PDO::PARAM_INT);
      $stmt->bindValue(":name", $name, PDO::PARAM_STR);
      $stmt->execute();
      $count = $stmt->rowCount();
      if ($count > 0){
        ReturnData(200, $cmd, "", $rtn_access_token, "", $conn_webzine); 
      }
      else{
        ReturnData(501, $cmd, "업데이트 항목이 없거나 처리중 오류가 발생했습니다.", 
                  $rtn_access_token, "", $conn_webzine);
        die();  
      }
    }catch (PDOException $e) {
      ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn_webzine);
    }
    break;
  case "insert_sub_category":
    if ( isset($request_body->tbl_name) && isset($request_body->name)
    && isset($request_body->parent_idx) && isset($request_body->c_idx)
    && isset($request_body->uuid) && isset($request_body->view_order))
    {
        $tbl_name = $request_body->tbl_name;
        $name = $request_body->name;
        $parent_idx = $request_body->parent_idx;
        $c_idx = $request_body->c_idx;
        $uuid = $request_body->uuid;
        $view_order = $request_body->view_order;
    }
    else{
        ReturnData(500, $cmd, "파라미터 오류", "", "", $conn_webzine);
        $conn_webzine = null;
        die();
    }
    $sql = "INSERT INTO ". $tbl_name . " (name, parent_idx, c_idx, view_order, uuid)";
    $sql = $sql . " VALUES (:name, :parent_idx, :c_idx, :view_order, :uuid)";

    try{
      // PDO 준비
      $conn_webzine->beginTransaction();     // 트랜잭션 시작
      $stmt = $conn_webzine->prepare($sql);

      // 파라미터 바인딩, ?로 할 경우 bindValue로 
      $stmt->bindValue(":name", $name, PDO::PARAM_STR);
      $stmt->bindValue(":parent_idx", $parent_idx, PDO::PARAM_INT);
      $stmt->bindValue(":c_idx", $c_idx, PDO::PARAM_INT);
      $stmt->bindValue(":view_order", $view_order, PDO::PARAM_INT);
      $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
     
      $stmt->execute();
      //$stmt->debugDumpParams();
      $count = $stmt->rowCount();
      if ($count == 1){
        $conn_webzine->commit();     // 트랜잭션 성공
        ReturnData(200, $cmd, "", $rtn_access_token, "", $conn_webzine);
        die();
      }
      else{
          //$stmt->debugDumpParams();
          $conn_webzine->rollBack();     // 트랜잭션 실패
          ReturnData(502, $cmd, $sql, $rtn_access_token, "", $conn_webzine);
      }
    }
    catch(PDOException $e){
        //$stmt->debugDumpParams();
        $conn_webzine->rollBack();     // 트랜잭션 실패
        ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn_webzine);
    }
    break;
  case "update_sub_category" : 
    if (isset($request_body->idx) && isset($request_body->tbl_name)
    && isset($request_body->name) && isset($request_body->parent_idx)
    && isset($request_body->c_idx)) {
      $idx = $request_body->idx;
      $tbl_name = $request_body->tbl_name;
      $name = $request_body->name;
      $parent_idx = $request_body->parent_idx;
      $c_idx = $request_body->c_idx;
    }
    else{
      ReturnData(500, $cmd, "파라미터 오류", $rtn_access_token, "", $conn_webzine);
      die();
    }    
    try{
      $sql = "UPDATE " . $tbl_name . " SET name = :name, parent_idx = :parent_idx, c_idx = :c_idx WHERE idx = :idx";
      $stmt = $conn_webzine->prepare($sql);

      $stmt->bindValue(":idx", $idx, PDO::PARAM_INT);
      $stmt->bindValue(":name", $name, PDO::PARAM_STR);
      $stmt->bindValue(":parent_idx", $parent_idx, PDO::PARAM_INT);
      $stmt->bindValue(":c_idx", $c_idx, PDO::PARAM_INT);
      $stmt->execute();
      $count = $stmt->rowCount();
      if ($count > 0){
        ReturnData(200, $cmd, "", $rtn_access_token, "", $conn_webzine); 
      }
      else{
        ReturnData(501, $cmd, "업데이트 항목이 없거나 처리중 오류가 발생했습니다.", 
                  $rtn_access_token, "", $conn_webzine);
        die();  
      }
    }catch (PDOException $e) {
      ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn_webzine);
    }
    break;
  case "insert_webzine_main" :
    // 폼데이터로 넘겨진 경우 처리를 위해 (php://input으로 처리 불가)
    $webzine_month = isset($_POST['webzine_month']) ? $_POST['webzine_month'] : "";
    $page_title = isset($_POST['page_title']) ? $_POST['page_title'] : "";
    $page_description = isset($_POST['page_description']) ? $_POST['page_description'] : "";
    $webzine_active = isset($_POST['webzine_active']) ? $_POST['webzine_active'] : "";
    $thumnail_name_file = isset($_POST['thumnail_name_file']) ? $_POST['thumnail_name_file'] : "";
    $main_pdf_file = isset($_POST['main_pdf_file']) ? $_POST['main_pdf_file'] : "";
    $main_result_file = isset($_POST['main_result_file']) ? $_POST['main_result_file'] : "";
    $c_idx = isset($_POST['c_idx']) ? $_POST['c_idx'] : "";
    $uuid = isset($_POST['uuid']) ? $_POST['uuid'] : "";
    $main_info = isset($_POST['main_info']) ? $_POST['main_info'] : "";


  
    // 파일 업로드 진행
    // 파일을 저장할 디렉터리 경로
    $uploadDirectory = '../webzine_folder/' . $uuid . '/' . $webzine_month . '/img/';
  
    if (!file_exists($uploadDirectory)) {
      // 업로드 폴더가 존재하지 않으면 폴더를 생성
      try {
        mkdir($uploadDirectory, 0777, true); // 폴더에 대한 쓰기 권한 부여
      }
      catch (ErrorException $e) {
        ReturnData(501, $cmd, $e->getMessage(), "", "", $conn);
        die();    
      }
    }

    if (!empty($_FILES['thumnail_file']['name'])) {
      handleFileUpload($uploadDirectory, $_FILES['thumnail_file'], "thumnail_file");
    }
    if (!empty($_FILES['main_files']['name'])) {
      handleFileUpload($uploadDirectory, $_FILES['main_files'], "main_files");
    }
    if (!empty($_FILES['pdf_file']['name'])) {
      handleFileUpload($uploadDirectory, $_FILES['pdf_file'], "pdf_file");
    }

    $data = array(
      'webzine_month' => $webzine_month,
      'page_title' => $page_title,
      'page_description' => $page_description,
      'thumnail_name_file' => $thumnail_name_file,
      'c_idx' => $c_idx,
      'uuid' => $uuid,
    );
    $json_data = json_encode($data);
    $fileResult = createIndexFile($json_data);
  

    $sql = "INSERT INTO webzine_main (main_info, page_title, page_description, webzine_month, webzime_main_file_name, webzine_thumnail, main_pdf_file, webzine_active, c_idx, uuid, write_date)";
    $sql = $sql . " VALUES (:main_info, :page_title, :page_description, :webzine_month, :webzime_main_file_name, :webzine_thumnail, :main_pdf_file, :webzine_active, :c_idx, :uuid, now())";

    // 디자인 결과 업데이트
    try{
      // PDO 준비
      $conn_webzine->beginTransaction();     // 트랜잭션 시작
      $stmt = $conn_webzine->prepare($sql);

      // 파라미터 바인딩, ?로 할 경우 bindValue로 
      $stmt->bindValue(":main_info", $main_info, PDO::PARAM_STR);
      $stmt->bindValue(":page_title", $page_title, PDO::PARAM_STR);
      $stmt->bindValue(":page_description", $page_description, PDO::PARAM_STR);
      $stmt->bindValue(":webzine_month", $webzine_month, PDO::PARAM_STR);
      $stmt->bindValue(":webzime_main_file_name", $main_result_file, PDO::PARAM_STR);
      $stmt->bindValue(":webzine_thumnail", $thumnail_name_file, PDO::PARAM_STR);
      $stmt->bindValue(":main_pdf_file", $main_pdf_file, PDO::PARAM_STR);
      $stmt->bindValue(":webzine_active", $webzine_active, PDO::PARAM_INT);
      $stmt->bindValue(":c_idx", $c_idx, PDO::PARAM_INT);
      $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
      
      $stmt->execute();
      //$stmt->debugDumpParams();
      $count = $stmt->rowCount();
      if ($count == 1){
        $conn_webzine->commit();     // 트랜잭션 성공
        ReturnData(200, $cmd, $fileResult, $rtn_access_token, "", $conn_webzine);
        die();
      }
      else{
          //$stmt->debugDumpParams();
          $conn_webzine->rollBack();     // 트랜잭션 실패
          ReturnData(502, $cmd, $sql, $rtn_access_token, $fileResult, $conn_webzine);
      }
    }
    catch(PDOException $e){
        //$stmt->debugDumpParams();
        $conn_webzine->rollBack();     // 트랜잭션 실패
        ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, $fileResult, $conn_webzine);
    }



  
      break;
    case "update_webzine_main" :
      $idx = isset($_POST['idx']) ? $_POST['idx'] : "";
      $webzine_month = isset($_POST['webzine_month']) ? $_POST['webzine_month'] : "";
      $page_title = isset($_POST['page_title']) ? $_POST['page_title'] : "";
      $page_description = isset($_POST['page_description']) ? $_POST['page_description'] : "";
      $webzine_active = isset($_POST['webzine_active']) ? $_POST['webzine_active'] : "";
      $thumnail_name_file = isset($_POST['thumnail_name_file']) ? $_POST['thumnail_name_file'] : "";
      $main_pdf_file = isset($_POST['main_pdf_file']) ? $_POST['main_pdf_file'] : "";
      $main_result_file = isset($_POST['main_result_file']) ? $_POST['main_result_file'] : "";
      $c_idx = isset($_POST['c_idx']) ? $_POST['c_idx'] : "";
      $uuid = isset($_POST['uuid']) ? $_POST['uuid'] : "";
      $main_info = isset($_POST['main_info']) ? $_POST['main_info'] : "";
    
    
      // 파일 업로드 진행
      // 파일을 저장할 디렉터리 경로
      $uploadDirectory = '../webzine_folder/' . $uuid . '/' . $webzine_month . '/img/';

      $deleteFileDirectory = '../webzine_folder/' . $uuid . '/' . $webzine_month . '/index.html';
    
      $del_msg = deleteFile($deleteFileDirectory);

      if (!file_exists($uploadDirectory)) {
        // 업로드 폴더가 존재하지 않으면 폴더를 생성
        try {
          mkdir($uploadDirectory, 0777, true); // 폴더에 대한 쓰기 권한 부여
        }
        catch (ErrorException $e) {
          ReturnData(501, $cmd, $e->getMessage(), "", "", $conn);
          die();    
        }
      }
    
      if (!empty($_FILES['thumnail_file']['name'])) {
        handleFileUpload($uploadDirectory, $_FILES['thumnail_file'], "thumnail_file");
      }
      if (!empty($_FILES['main_files']['name'])) {
        handleFileUpload($uploadDirectory, $_FILES['main_files'], "main_files");
      }
      if (!empty($_FILES['pdf_file']['name'])) {
        handleFileUpload($uploadDirectory, $_FILES['pdf_file'], "pdf_file");
      }

      $data = array(
        'webzine_month' => $webzine_month,
        'page_title' => $page_title,
        'page_description' => $page_description,
        'thumnail_name_file' => $thumnail_name_file,
        'c_idx' => $c_idx,
        'uuid' => $uuid,
      );
      $json_data = json_encode($data);
      $fileResult = createIndexFile($json_data);
      $fileResultMsg = $fileResult . $del_msg;
    
    try{
      $conn_webzine->beginTransaction();
  
      $sql = "UPDATE webzine_main SET main_info = :main_info, page_title = :page_title, page_description = :page_description, webzine_month = :webzine_month, webzime_main_file_name = :webzime_main_file_name, webzine_thumnail = :webzine_thumnail, main_pdf_file = :main_pdf_file, webzine_active = :webzine_active, c_idx = :c_idx, uuid = :uuid WHERE idx = :idx";
      $stmt = $conn_webzine->prepare($sql);
      $stmt->bindValue(":main_info", $main_info, PDO::PARAM_STR);
      $stmt->bindValue(":page_title", $page_title, PDO::PARAM_STR);
      $stmt->bindValue(":page_description", $page_description, PDO::PARAM_STR);
      $stmt->bindValue(":webzine_month", $webzine_month, PDO::PARAM_STR);
      $stmt->bindValue(":webzime_main_file_name", $main_result_file, PDO::PARAM_STR);
      $stmt->bindValue(":webzine_thumnail", $thumnail_name_file, PDO::PARAM_STR);
      $stmt->bindValue(":main_pdf_file", $main_pdf_file, PDO::PARAM_STR);
      $stmt->bindValue(":webzine_active", $webzine_active, PDO::PARAM_INT);
      $stmt->bindValue(":c_idx", $c_idx, PDO::PARAM_INT);
      $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
      $stmt->bindValue(":idx", $idx, PDO::PARAM_INT);
      $stmt->execute();
        if ($stmt){
          $conn_webzine->commit();
          ReturnData(200, $cmd, $fileResultMsg, $rtn_access_token, "", $conn_webzine); 
        }
        else{
          $conn_webzine->rollBack();
          ReturnData(501, $cmd, "웹진 메인 수정 오류",
                  $rtn_access_token, $fileResultMsg, $conn_webzine);
          die();  
        }
    }catch (PDOException $e) {
      $conn_webzine->rollBack();
      ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, $fileResultMsg, $conn_webzine);
    }
  
    break;
  case "insert_webzine_list" :
    // 폼데이터로 넘겨진 경우 처리를 위해 (php://input으로 처리 불가)
    $parent_idx = isset($_POST['parent_idx']) ? $_POST['parent_idx'] : "";
    $view_order = isset($_POST['view_order']) ? $_POST['view_order'] : "";
    $description = isset($_POST['description']) ? $_POST['description'] : "";
    $category_idx = isset($_POST['category_idx']) ? $_POST['category_idx'] : "";
    $sub_category_idx = isset($_POST['sub_category_idx']) ? $_POST['sub_category_idx'] : "";
    $title_info = isset($_POST['title_info']) ? $_POST['title_info'] : "";
    $page_title = isset($_POST['page_title']) ? $_POST['page_title'] : "";
    $page_sub_title = isset($_POST['page_sub_title']) ? $_POST['page_sub_title'] : "";
    $webzine_writer = isset($_POST['webzine_writer']) ? $_POST['webzine_writer'] : "";
    $writer_visible = isset($_POST['writer_visible']) ? $_POST['writer_visible'] : "";
    $page_banner = isset($_POST['page_banner']) ? $_POST['page_banner'] : "";
    $main_page_thumnail = isset($_POST['main_page_thumnail']) ? $_POST['main_page_thumnail'] : "";
    $contents = isset($_POST['content']) ? $_POST['content'] : "";
    $editor_file_name = isset($_POST['editor_file_name']) ? $_POST['editor_file_name'] : "";
    $uuid = isset($_POST['uuid']) ? $_POST['uuid'] : "";
    $webzine_month = isset($_POST['webzine_month']) ? $_POST['webzine_month'] : "";
    $c_idx = isset($_POST['c_idx']) ? $_POST['c_idx'] : "";
    
    // 파일을 저장할 디렉터리 경로
    $uploadDirectory = '../webzine_folder/' . $uuid . '/' . $webzine_month . '/img/' . $category_idx . "/";
    // $makeSubFileDirectory = '../webzine_folder/' . $uuid . '/' . $webzine_month;
    
    // 업로드 디렉터리가 없으면 생성
    if (!file_exists($uploadDirectory)) {
        try {
            mkdir($uploadDirectory, 0777, true); // 폴더 생성
        } catch (ErrorException $e) {
            ReturnData(501, $cmd, $e->getMessage(), "", "", $conn);
            die();    
        }
    }
    
    // 파일 업로드 처리
    
    if (!empty($_FILES['thumnail_file']['name'])) {
      handleFileUpload($uploadDirectory, $_FILES['thumnail_file'], "thumnail_file");
    }
    if (!empty($_FILES['main_files']['name'])) {
      handleFileUpload($uploadDirectory, $_FILES['main_files'], "main_files");
    }
    
    // 에디터 파일 처리
    $editorResult = "";
    if (!empty($editor_file_name)) {
      $editorResult = editorFileUpload($editor_file_name, $uploadDirectory);
    }
  

    $sql = "INSERT INTO webzine_contents (parent_idx, view_order, description, webzine_month, category_idx, sub_category_idx, title_info, page_title, page_sub_title, webzine_writer, writer_visible, page_banner, main_page_thumnail, contents, write_date, uuid, c_idx)";
    $sql = $sql . " VALUES (:parent_idx, :view_order, :description, :webzine_month, :category_idx, :sub_category_idx, :title_info, :page_title, :page_sub_title, :webzine_writer, :writer_visible, :page_banner, :main_page_thumnail, :contents, now(), :uuid, :c_idx)";

    // 디자인 결과 업데이트
    try{
      // PDO 준비
      $conn_webzine->beginTransaction();     // 트랜잭션 시작
      $stmt = $conn_webzine->prepare($sql);

      // 파라미터 바인딩, ?로 할 경우 bindValue로 
      $stmt->bindValue(":parent_idx", $parent_idx, PDO::PARAM_INT);
      $stmt->bindValue(":view_order", $view_order, PDO::PARAM_INT);
      $stmt->bindValue(":description", $description, PDO::PARAM_STR);
      $stmt->bindValue(":webzine_month", $webzine_month, PDO::PARAM_STR);
      $stmt->bindValue(":category_idx", $category_idx, PDO::PARAM_INT);
      $stmt->bindValue(":sub_category_idx", $sub_category_idx, PDO::PARAM_INT);
      $stmt->bindValue(":title_info", $title_info, PDO::PARAM_STR);
      $stmt->bindValue(":page_title", $page_title, PDO::PARAM_STR);
      $stmt->bindValue(":page_sub_title", $page_sub_title, PDO::PARAM_STR);
      $stmt->bindValue(":webzine_writer", $webzine_writer, PDO::PARAM_STR);
      $stmt->bindValue(":writer_visible", $writer_visible, PDO::PARAM_INT);
      $stmt->bindValue(":page_banner", $page_banner, PDO::PARAM_STR);
      $stmt->bindValue(":main_page_thumnail", $main_page_thumnail, PDO::PARAM_STR);
      $stmt->bindValue(":contents", $contents, PDO::PARAM_STR);
      $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
      $stmt->bindValue(":c_idx", $c_idx, PDO::PARAM_INT);
      
      $stmt->execute();
      $insertedId = $conn_webzine->lastInsertId();
      $data = array(
        'page_idx' => $insertedId,
        'webzine_month' => $webzine_month,
        'page_title' => $page_title,
        'description' => $description,
        'thumnail_name_file' => $main_page_thumnail,
        'c_idx' => $c_idx,
        'uuid' => $uuid,
      );
      $json_data = json_encode($data);
      $fileResult = createSubFile($json_data);
      //$stmt->debugDumpParams();
      $count = $stmt->rowCount();
      if ($count == 1){
        $conn_webzine->commit();     // 트랜잭션 성공
        ReturnData(200, $cmd, "", $rtn_access_token, $editorResult, $conn_webzine);
        die();
      }
      else{
          //$stmt->debugDumpParams();
          $conn_webzine->rollBack();     // 트랜잭션 실패
          ReturnData(502, $cmd, $sql, $rtn_access_token, $editorResult, $conn_webzine);
      }
    }
    catch(PDOException $e){
        //$stmt->debugDumpParams();
        $conn_webzine->rollBack();     // 트랜잭션 실패
        ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, $editorResult, $conn_webzine);
      }
  
      break;
    case "update_webzine_list" :
      $idx = isset($_POST['idx']) ? $_POST['idx'] : "";
      $parent_idx = isset($_POST['parent_idx']) ? $_POST['parent_idx'] : "";
      $view_order = isset($_POST['view_order']) ? $_POST['view_order'] : "";
      $description = isset($_POST['description']) ? $_POST['description'] : "";
      $category_idx = isset($_POST['category_idx']) ? $_POST['category_idx'] : "";
      $sub_category_idx = isset($_POST['sub_category_idx']) ? $_POST['sub_category_idx'] : "";
      $title_info = isset($_POST['title_info']) ? $_POST['title_info'] : "";
      $page_title = isset($_POST['page_title']) ? $_POST['page_title'] : "";
      $page_sub_title = isset($_POST['page_sub_title']) ? $_POST['page_sub_title'] : "";
      $webzine_writer = isset($_POST['webzine_writer']) ? $_POST['webzine_writer'] : "";
      $writer_visible = isset($_POST['writer_visible']) ? $_POST['writer_visible'] : "";
      $page_banner = isset($_POST['page_banner']) ? $_POST['page_banner'] : "";
      $main_page_thumnail = isset($_POST['main_page_thumnail']) ? $_POST['main_page_thumnail'] : "";
      $contents = isset($_POST['content']) ? $_POST['content'] : "";
      $editor_file_name = isset($_POST['editor_file_name']) ? $_POST['editor_file_name'] : "";
      $uuid = isset($_POST['uuid']) ? $_POST['uuid'] : "";
      $webzine_month = isset($_POST['webzine_month']) ? $_POST['webzine_month'] : "";
      $c_idx = isset($_POST['c_idx']) ? $_POST['c_idx'] : "";
    
    
     // 파일을 저장할 디렉터리 경로
     $uploadDirectory = '../webzine_folder/' . $uuid . '/' . $webzine_month . '/img/' . $category_idx . "/";

     $deleteFileDirectory = '../webzine_folder/' . $uuid . '/' . $webzine_month . '/sub_' . $idx . '.html';
     $del_msg = deleteFile($deleteFileDirectory);
     // 업로드 디렉터리가 없으면 생성
     if (!file_exists($uploadDirectory)) {
         try {
             mkdir($uploadDirectory, 0777, true); // 폴더 생성
         } catch (ErrorException $e) {
             ReturnData(501, $cmd, $e->getMessage(), "", "", $conn);
             die();    
         }
     }
     
     // 파일 업로드 처리
    if (!empty($_FILES['thumnail_file']['name'])) {
      handleFileUpload($uploadDirectory, $_FILES['thumnail_file'], "thumnail_file");
    }
    if (!empty($_FILES['main_files']['name'])) {
      handleFileUpload($uploadDirectory, $_FILES['main_files'], "main_files");
    }
     
    // 에디터 파일 처리
    $editorResult = "";
    if (!empty($editor_file_name)) {
      $editorResult = editorFileUpload($editor_file_name, $uploadDirectory);
    }

    $data = array(
      'page_idx' => $idx,
      'webzine_month' => $webzine_month,
      'page_title' => $page_title,
      'description' => $description,
      'thumnail_name_file' => $main_page_thumnail,
      'c_idx' => $c_idx,
      'uuid' => $uuid,
    );
    $json_data = json_encode($data);
    $fileResult = createSubFile($json_data);

    
    try{
      $conn_webzine->beginTransaction();
  
 
      $sql = "UPDATE webzine_contents SET parent_idx = :parent_idx, view_order = :view_order, description = :description, webzine_month = :webzine_month, category_idx = :category_idx, sub_category_idx = :sub_category_idx, title_info = :title_info, page_title = :page_title, page_sub_title = :page_sub_title, webzine_writer = :webzine_writer, writer_visible = :writer_visible, page_banner = :page_banner, main_page_thumnail = :main_page_thumnail, contents = :contents, uuid = :uuid, c_idx = :c_idx WHERE idx = :idx";
      $stmt = $conn_webzine->prepare($sql);
      $stmt->bindValue(":parent_idx", $parent_idx, PDO::PARAM_INT);
      $stmt->bindValue(":view_order", $view_order, PDO::PARAM_INT);
      $stmt->bindValue(":description", $description, PDO::PARAM_STR);
      $stmt->bindValue(":webzine_month", $webzine_month, PDO::PARAM_STR);
      $stmt->bindValue(":category_idx", $category_idx, PDO::PARAM_INT);
      $stmt->bindValue(":sub_category_idx", $sub_category_idx, PDO::PARAM_INT);
      $stmt->bindValue(":title_info", $title_info, PDO::PARAM_STR);
      $stmt->bindValue(":page_title", $page_title, PDO::PARAM_STR);
      $stmt->bindValue(":page_sub_title", $page_sub_title, PDO::PARAM_STR);
      $stmt->bindValue(":webzine_writer", $webzine_writer, PDO::PARAM_STR);
      $stmt->bindValue(":writer_visible", $writer_visible, PDO::PARAM_INT);
      $stmt->bindValue(":page_banner", $page_banner, PDO::PARAM_STR);
      $stmt->bindValue(":main_page_thumnail", $main_page_thumnail, PDO::PARAM_STR);
      $stmt->bindValue(":contents", $contents, PDO::PARAM_STR);
      $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
      $stmt->bindValue(":c_idx", $c_idx, PDO::PARAM_INT);
      $stmt->bindValue(":idx", $idx, PDO::PARAM_INT);
      $stmt->execute();
        if ($stmt){
          $conn_webzine->commit();
          ReturnData(200, $cmd, "", $rtn_access_token, $fileResult, $conn_webzine); 
        }
        else{
          $conn_webzine->rollBack();
          ReturnData(501, $cmd, "수정 오류",
                  $rtn_access_token, $fileResult, $conn_webzine);
          die();  
        }
    }catch (PDOException $e) {
      $conn_webzine->rollBack();
      ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, $fileResult, $conn_webzine);
    }
  
    break;
  case "insert_webzine_option" :
    // 폼데이터로 넘겨진 경우 처리를 위해 (php://input으로 처리 불가)
    $template_info = isset($_POST['template_info']) ? $_POST['template_info'] : "";
    $c_idx = isset($_POST['c_idx']) ? $_POST['c_idx'] : "";
    $uuid = isset($_POST['uuid']) ? $_POST['uuid'] : "";
  
  

  
    // 파일 업로드 진행
    // 파일을 저장할 디렉터리 경로
    $uploadDirectory = '../webzine_folder/' . $uuid . "/"; 
  
    if (!file_exists($uploadDirectory)) {
      // 업로드 폴더가 존재하지 않으면 폴더를 생성
      try {
        mkdir($uploadDirectory, 0777, true); // 폴더에 대한 쓰기 권한 부여
      }
      catch (ErrorException $e) {
        ReturnData(501, $cmd, $e->getMessage(), "", "", $conn);
        die();    
      }
    }
    if (!empty($_FILES['header_logo']['name'])) {
      handleFileUpload($uploadDirectory, $_FILES['header_logo'], "header_logo");
    }
    if (!empty($_FILES['footer_logo']['name'])) {
      handleFileUpload($uploadDirectory, $_FILES['footer_logo'], "header_logo");
    }
  
   
  

    $sql = "INSERT INTO webzine_option (c_idx, template_info, uuid, write_date)";
    $sql = $sql . " VALUES (:c_idx, :template_info, :uuid, now())";

    // 디자인 결과 업데이트
    try{
      // PDO 준비
      $conn_webzine->beginTransaction();     // 트랜잭션 시작
      $stmt = $conn_webzine->prepare($sql);

      // 파라미터 바인딩, ?로 할 경우 bindValue로 
      $stmt->bindValue(":c_idx", $c_idx, PDO::PARAM_INT);
      $stmt->bindValue(":template_info", $template_info, PDO::PARAM_STR);
      $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
      
      $stmt->execute();
      //$stmt->debugDumpParams();
      $count = $stmt->rowCount();
      if ($count == 1){
        $conn_webzine->commit();     // 트랜잭션 성공
        ReturnData(200, $cmd, "", $rtn_access_token, "", $conn_webzine);
        die();
      }
      else{
          //$stmt->debugDumpParams();
          $conn_webzine->rollBack();     // 트랜잭션 실패
          ReturnData(502, $cmd, $sql, $rtn_access_token, "", $conn_webzine);
      }
    }
    catch(PDOException $e){
        //$stmt->debugDumpParams();
        $conn_webzine->rollBack();     // 트랜잭션 실패
        ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn_webzine);
      }
  
      break;
  case "update_webzine_option" :
    // 폼데이터로 넘겨진 경우 처리를 위해 (php://input으로 처리 불가)
    $template_info = isset($_POST['template_info']) ? $_POST['template_info'] : "";
    $c_idx = isset($_POST['c_idx']) ? $_POST['c_idx'] : "";
    $idx = isset($_POST['idx']) ? $_POST['idx'] : "";
    $uuid = isset($_POST['uuid']) ? $_POST['uuid'] : "";
  
  

  
    // 파일 업로드 진행
    // 파일을 저장할 디렉터리 경로
    $uploadDirectory = '../webzine_folder/' . $uuid . "/"; 
  
    if (!file_exists($uploadDirectory)) {
      // 업로드 폴더가 존재하지 않으면 폴더를 생성
      try {
        mkdir($uploadDirectory, 0777, true); // 폴더에 대한 쓰기 권한 부여
      }
      catch (ErrorException $e) {
        ReturnData(501, $cmd, $e->getMessage(), "", "", $conn);
        die();    
      }
    }
  
    if (!empty($_FILES['header_logo']['name'])) {
      handleFileUpload($uploadDirectory, $_FILES['header_logo'], "header_logo");
    }
    if (!empty($_FILES['footer_logo']['name'])) {
      handleFileUpload($uploadDirectory, $_FILES['footer_logo'], "header_logo");
    }
  

    $sql = "UPDATE webzine_option SET c_idx = :c_idx, template_info = :template_info, uuid = :uuid WHERE idx = :idx";

    // 디자인 결과 업데이트
    try{
      // PDO 준비
      $conn_webzine->beginTransaction();     // 트랜잭션 시작
      $stmt = $conn_webzine->prepare($sql);

      // 파라미터 바인딩, ?로 할 경우 bindValue로 
      $stmt->bindValue(":c_idx", $c_idx, PDO::PARAM_INT);
      $stmt->bindValue(":template_info", $template_info, PDO::PARAM_STR);
      $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
      $stmt->bindValue(":idx", $idx, PDO::PARAM_INT);
      
      $stmt->execute();
      //$stmt->debugDumpParams();
      $count = $stmt->rowCount();
      if ($count == 1){
        $conn_webzine->commit();     // 트랜잭션 성공
        ReturnData(200, $cmd, "", $rtn_access_token, "", $conn_webzine);
        die();
      }
      else{
          //$stmt->debugDumpParams();
          $conn_webzine->rollBack();     // 트랜잭션 실패
          ReturnData(502, $cmd, $sql, $rtn_access_token, "", $conn_webzine);
      }
    }
    catch(PDOException $e){
        //$stmt->debugDumpParams();
        $conn_webzine->rollBack();     // 트랜잭션 실패
        ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn_webzine);
      }
  
      break;
  case "del_data":
    if (isset($request_body->tblname) && 
        isset($request_body->idx) &&
        isset($request_body->idxname) && 
        isset($request_body->dropdata)) {
      $tbl_name = $request_body->tblname;
      $idx_value = $request_body->idx;
      $idx_name = $request_body->idxname;     // 삭제할 키 값 (키값이 )
      // 테이블을 삭제해야 할 경우 dropdata에 포함되어 전송됨. ","로 구분된 문자열
      $dropdata = $request_body->dropdata;
    } else {
      ReturnData(500, $cmd, "파라미터 오류", $rtn_access_token, "", $conn_webzine);
      die();
    }
    $tmpErrorMessage = "";
    if (is_array($idx_value)) {
        $conn_webzine->beginTransaction();
        foreach ($idx_value as $idx) {
          if ($idx_name != ""){
            $sql = "DELETE FROM " . $tbl_name . " WHERE " . $idx_name . " = :idx";
            if ($b_searchdata != "")
              $sql = $sql . " AND " . $b_searchdata;
          }
          else{
            $sql = "DELETE FROM " . $tbl_name . " WHERE idx = :idx";
            if ($b_searchdata != "")
              $sql = $sql . " AND " . $b_searchdata;
          }
          try {
              $stmt = $conn_webzine->prepare($sql);
              $stmt->bindParam(":idx", $idx, PDO::PARAM_INT);
              $stmt->execute();
              $resultcount = $stmt->rowCount();
              // 영향을 받는 항목이 없을 경우 실패를 리턴
              if ($resultcount == 0) {
                  $tmpErrorMessage = "삭제할 데이터가 존재하지 않습니다.";
                  break;
              }
          } catch (PDOException $e) {
              $tmpResult = false;
              $tmpErrorMessage = $e->getMessage();
          }
        }
        if ($tmpErrorMessage == ""){
          $rtndropdata = "";
          $rtndropdata = DropTable($dropdata, $conn_webzine);
          if ($rtndropdata == ""){
            $conn_webzine->commit();
            ReturnData(200, $cmd, "", $rtn_access_token, "", $conn_webzine);    
          }
          else{
            $conn_webzine->rollBack();
            ReturnData(600, $cmd, $rtndropdat, $rtn_access_token, "", $conn_webzine);
          }
        }
        else{
            $conn_webzine->rollBack();
            ReturnData(600, $cmd, $tmpErrorMessage, $rtn_access_token, "", $conn_webzine);
        }
    } else {
        try {
          if ($idx_name != ""){
            $sql = "DELETE FROM " . $tbl_name . " WHERE " . $idx_name . " = :idx";
          }
          else{
            $sql = "DELETE FROM " . $tbl_name . " WHERE idx = :idx";
          }

          $conn_webzine->beginTransaction();
          $stmt = $conn_webzine->prepare($sql);
          $stmt->bindParam(":idx", $idx_value, PDO::PARAM_INT);
          $stmt->execute();
          $resultcount = $stmt->rowCount();
          if ($resultcount > 0) {
            $rtndropdata = "";
            $rtndropdata = DropTable($dropdata, $conn_webzine);
            if ($rtndropdata == ""){
             
              if ($tbl_name == "product_type"){
                $sql = "DELETE FROM product_list WHERE type_id = :idx";
                $stmt = $conn_webzine->prepare($sql);
                $stmt->bindParam(":idx", $idx_value, PDO::PARAM_INT);
                $stmt->execute();
              }
              $conn_webzine->commit();
              ReturnData(200, $cmd, "", $rtn_access_token, "", $conn_webzine);    
            }
            else{
              $conn_webzine->rollBack();
              ReturnData(600, $cmd, $rtndropdata, $rtn_access_token, "", $conn_webzine);
            }
          }else{
              //$stmt->debugDumpParams();
              ReturnData(500, $cmd, "삭제할 정보 없음", $rtn_access_token, "", $conn_webzine);
          }
        } catch (PDOException $e) {
            $conn_webzine->rollBack();
            ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn_webzine);
        }
    }    
    break;
  case "regen_password" :
    if (isset($request_body->idx) && isset($request_body->mem_id)
      && isset($request_body->mem_email)
    ) {
      $param->idx = $request_body->idx;
      $param->mem_id = $request_body->mem_id;
      $param->mem_email = $request_body->mem_email;
      $param->cmd = $cmd;
    }
    else{
      ReturnData(500, $cmd, "파라미터 오류", "", "", $conn);
      die();
    } 
    $param->table_name = TBL_MANAGER;
    $regenpassword = "";
    if (regen_password($param, $conn_webzine, "", $regenpassword)){
      // 비밀번호 재발행 후 메일 발송      
      $title = "[웹진메이커] 임시 비밀번호가 전송되었습니다.";
      $mail_html = get_mail_body($param,  $regenpassword);
      $sendresult = "";
      // sendmail.php 파일내의 메일 본문 생성 함수 변경 (get_mail_body)
      $sendresult = sendMail(SMTP_SERVER, SMTP_PORT, FROM_MAIL, FROM_MAIL_PASS, FROM_NAME,
            $param->mem_email, $title, $mail_html);
      if ($sendresult == "ok"){
        ReturnData(200, $param->cmd, "", "", "", $conn_webzine);
      }
      else{
        ReturnData(500, $param->cmd, $sendresult, "", "", $conn_webzine);
      }
    }
    die();
    break;
  default :
    break;
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