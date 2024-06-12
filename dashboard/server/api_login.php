<?php

/*
  1) 헤더에 엑세스 토큰이 존재할 경우
    1.1) 쿠키에 리프레시 토큰이 존재할 경우
      1.1.1) 리프레시 토큰이 유효하지 않을 경우
        - 로그인 진행 (DB) -> 
        - 리프레스 토큰 발행, 엑세스 토큰 발행 (300)
      1.1.2) (200) : 리프레시 토큰이 유효
        - 엑세스 토큰 재발행 (301)
  2) 엑세스 토큰이 존재하지 않을 경우
    1.1) 쿠키에 리프레시 토큰이 존재할 경우
      1.1.1) 리프레시 토큰이 유효하지 않을 경우
        - 로그인 진행
        - 리프레스 토큰 발행, 엑세스 토큰 발행 (300)
      1.1.2) (200) : 리프레시 토큰이 유효
        - 엑세스 토큰 재발행 (301)
    1.2) 
      - 로그인 진행
      - 리프레스 토큰 발행, 엑세스 토큰 발행 (300)
*/
function jwt_login($conn, $table_name, $request_body, 
        &$rtn_access_token, &$rtnmessage, &$tokendata){
  // 헤더의 HTTP_AUTHORIZATION에 엑세스 토큰이 실려있는가?
  // var_dump($_SERVER);
  if (! preg_match('/Bearer\s(\S+)/', isset($_SERVER['HTTP_AUTHORIZATION']) && $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
    // Access 토큰이 없을 경우
    // 1) 리프레시 토큰 체크
    $rtoken = getCookieFromHeader("addit_notice_rtoken");
    $rtncode = 0;
    if (!empty($rtoken)){
      $rjwt = hex2bin($rtoken);
      // 토큰 검증 후 tokendata에 데이터를 담는다.
      $rtncode = ValidateToken($rjwt, TOKEN_ALG, DOMAIN, TOKEN_KEY, $tokendata);
    }
    
    if ($rtncode != 200){ // 리프레시 토큰이 없거나 유효하지 않을 경우
      // 데이터베이스 로그인 처리
      if ( isset($request_body->mem_id) && isset($request_body->mem_password) ){
        $mem_id = $request_body->mem_id;
        $mem_password = $request_body->mem_password;
      }
      else{
        ReturnData(400, "login", "파라미터 오류(access_token(x), refresh_token(x))", "", "", $conn);
        return false;
      }
      if (Login($conn, $table_name, $mem_id, $mem_password, $resultdata)) {
        // 로그인 성공 시
        if ($resultdata["status"] == 200){
          $refresh_token = genToken(TOKEN_KEY, TOKEN_ALG, DOMAIN, REFRESH_TIME, 
            $resultdata["data"]["mem_id"], $resultdata["data"]["mem_name"], $resultdata["data"]["mem_level"], $resultdata["data"]["mem_uuid"] ?? "", $resultdata["data"]["ad_list"] ?? "");
          $refresh_token = json_decode($refresh_token);
          $tmp_token = bin2hex($refresh_token->token);          
          // RefreshToken 쿠키 저장
          setcookie('addit_notice_rtoken', $tmp_token, $refresh_token->exp, '/', DOMAIN, false, true);
          // 로그아웃 관리 목적 refresh_token DB 저장 구현 필요 (토큰 탈취 대응)

          // AccessToken 발행
          $access_token = genToken(TOKEN_KEY,TOKEN_ALG, DOMAIN, ACCESS_TIME,  
            $resultdata["data"]["mem_id"], $resultdata["data"]["mem_name"], $resultdata["data"]["mem_level"], $resultdata["data"]["mem_uuid"] ?? "", $resultdata["data"]["ad_list"] ?? "");
          $access_token = json_decode($access_token);
          $rtn_access_token = bin2hex($access_token->token);
          $tokendata["mem_id"] = $resultdata["data"]["mem_id"];
          $tokendata["mem_name"] = $resultdata["data"]["mem_name"];
          $tokendata["mem_level"] = $resultdata["data"]["mem_level"];
          $tokendata["mem_uuid"] = $resultdata["data"]["mem_uuid"];
          $tokendata["ad_list"] = $resultdata["data"]["ad_list"];
          $rtnmessage = "1. 엑세스 토큰 미전송, 리프레시 토큰 미유효, DB 로그인처리, 신규 토큰 발행, 로그인 성공";
          return true;
        }else{
          ReturnData($resultdata["status"], "login", $resultdata["message"], "", "", $conn);
          return false;
        }
      }
      else{
        ReturnData($resultdata["status"], "login", $resultdata["message"], "", "", $conn);
        return false;
      }
    } // 엑세스 토큰 재발행
    else{
      // AccessToken 발행 및 로그인 성공 처리
      //$resultdata["status"] = 201;
      $access_token = genToken(TOKEN_KEY, TOKEN_ALG, DOMAIN, ACCESS_TIME, 
          $tokendata["mem_id"], $tokendata["mem_name"], $tokendata["mem_level"], $tokendata["data"]["mem_uuid"] ?? "", $tokendata["data"]["ad_list"] ?? "");
      $access_token = json_decode($access_token);
      $rtn_access_token = bin2hex($access_token->token);
      $rtnmessage = "2. 엑세스 토큰 미전송, 리프레시 토큰 유효, 엑세스 토큰 재발행, 로그인 성공";
      return true;
    }
  }
  // 엑세스 토큰이 존재할 경우 엑세스 토큰 검증
  else{
    $jwt = $matches[1];
    if ($jwt !== ""){
      $atoken = hex2bin($jwt);
      $rtncode = ValidateToken($atoken, TOKEN_ALG, DOMAIN, TOKEN_KEY, $tokendata);
    }
    // Access 토큰이 유효하지 않을 경우 리프레시 토큰 검증
    if ($rtncode != 200){
      $rtoken = getCookieFromHeader("addit_notice_rtoken");
      $rtncode = 0;
      if ($rtoken !== ""){
        $rjwt = hex2bin($rtoken);
        $rtncode = ValidateToken($rjwt, TOKEN_ALG, DOMAIN, TOKEN_KEY, $tokendata);        
      }

      // Refresh 토큰 검증
      if ($rtncode != 200){
        // 데이터베이스 로그인 처리 및 토큰 재발급
        if ( isset($request_body->id) && isset($request_body->password) ){
          $mem_id = $request_body->id;
          $mem_password = $request_body->password;
        }
        else{
          ReturnData(400, "login", "파라미터 오류(access_token(o), refresh_token(x))", "", "", $conn);
          return false;
        }
        if (Login($conn, $table_name, $mem_id, $mem_password, $resultdata)) {
          // Refresh 토큰 발행
          if ($resultdata["status"] == 200){
            $refresh_token = genToken(TOKEN_KEY, TOKEN_ALG, DOMAIN, REFRESH_TIME, 
                $resultdata["data"]["mem_id"], $resultdata["data"]["mem_name"], $resultdata["data"]["mem_level"], $resultdata["data"]["mem_uuid"] ?? "", $resultdata["data"]["ad_list"] ?? "");
            //$refresh_token = json_decode($refresh_token);
            $tmp_token = bin2hex($refresh_token->token);
            // Refresh 토큰을 쿠키에 저장
            setcookie('addit_notice_rtoken', $tmp_token, $refresh_token->exp, '/', DOMAIN, false, true);
            // 로그아웃 관리 목적 refresh_token DB 저장 구현 필요 (토큰 탈취 대응)
            
            // AccessToken 발행
            $access_token = genToken(TOKEN_KEY, TOKEN_ALG, DOMAIN, ACCESS_TIME, 
                $resultdata["data"]["mem_id"], $resultdata["data"]["mem_name"], $resultdata["data"]["mem_level"], $resultdata["data"]["mem_uuid"] ?? "", $resultdata["data"]["ad_list"] ?? "");
            $access_token = json_decode($access_token);
            $rtn_access_token = bin2hex($access_token->token);
            $tokendata["mem_id"] = $resultdata["data"]["mem_id"];
            $tokendata["mem_name"] = $resultdata["data"]["mem_name"];
            $tokendata["mem_level"] = $resultdata["data"]["mem_level"];
            $tokendata["mem_uuid"] = $resultdata["data"]["mem_uuid"];
            $tokendata["ad_list"] = $resultdata["data"]["ad_list"];
            $rtnmessage = "3. 엑세스 토큰 전송(미유효), 리프레시 토큰(미유효), DB 로그인처리, 토큰 발행(ALL), 로그인 성공";
            return true;
          }
          else{
            ReturnData($resultdata["status"], "login", $resultdata["message"], "", "", $conn);
            return false;  
          }
        }
        else{
          ReturnData($resultdata["status"], "login", $resultdata["message"], "", "", $conn);
          return false;
        }  
      }
      else{
        // AccessToken 발행
        $access_token = genToken(TOKEN_KEY, TOKEN_ALG, DOMAIN, ACCESS_TIME, 
            $tokendata["mem_id"], $tokendata["mem_name"], $tokendata["mem_level"], $tokendata["data"]["mem_uuid"] ?? "", $tokendata["data"]["ad_list"] ?? "");
        $access_token = json_decode($access_token);
        $rtn_access_token = bin2hex($access_token->token);
        $rtnmessage = "4. 엑세스 토큰 전송(미유효), 리프레시 토큰(유효), 엑세스토큰 재발행, 로그인 성공";
        return true;
      }
    } 
    // 토큰이 유효할 경우 로그인 성공 리턴
    else{
      $rtnmessage = "5. 엑세스 토큰 전송(유효), 로그인 성공";
      $rtn_access_token = $jwt;
      return true;
    }
  }
}

/* 로그인 처리
  $conn : 데이터베이스 connection
  $table_name : 로그인 테이블명
  $id : 아이디
  $pwd : 비밀번호
  $result : 로그인 결과 리턴
  return : 200 : 성공, 
*/
function Login($conn, $table_name, $mem_id, $mem_password, &$result){
  $tmpresult = array();
  try{
    $query = "SELECT * FROM $table_name WHERE ";
    $query = $query . " mem_id = :mem_id AND ";
    $query = $query . " mem_password = :mem_password";
    //$query = $query . " r_token = :mem_password";

    $stmt = $conn->prepare($query);
    $stmt->bindValue(":mem_id", $mem_id, PDO::PARAM_STR);

    // 2023-10-31 : utf8_encode -> php7.x 버전 이상에서는 없어질 함수, 아래 함수로 대체
    $password_hash = hash("sha256", iso8859_1_to_utf8($mem_password));
    
    $stmt->bindValue('mem_password', $password_hash, PDO::PARAM_STR);
    $stmt->execute();
    $num = $stmt->rowCount();

    $tmpresult["mem_id"] = "";
    $tmpresult["mem_name"] = "";
    $tmpresult["mem_level"] = "";
    $tmpresult["mem_uuid"] = "";
    $tmpresult["ad_list"] = "";

    if ($num > 0){
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        // 활성화 여부
        $sql = "SELECT * FROM $table_name WHERE mem_id = :mem_id";
        $stmt = $conn->prepare($sql);

        $stmt->bindParam(':mem_id', $mem_id, PDO::PARAM_STR);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $mem_active = $result['mem_active'];

        if ($mem_active == 1) {
          // 로그인 일시를 업데이트
          $sql = "UPDATE $table_name SET mem_login_date = now() WHERE mem_id = :mem_id";
          $stmt = $conn->prepare($sql);
          $stmt->bindValue('mem_id', $mem_id, PDO::PARAM_STR);
          $stmt->execute();
          if ($stmt) {
            $tmpresult["mem_id"] = $row['mem_id'];
            $tmpresult["mem_name"] = $row['mem_name'];
            $tmpresult["mem_level"] = $row['mem_level'];
            $tmpresult["mem_uuid"] = $row['mem_uuid'];
            $tmpresult["ad_list"] = $row['ad_list'];

            $result["data"] = $tmpresult;
          }
          $result["status"] = 200;
        return true;
        }else{
          $result["status"] = 401;
          $result["message"] = '관리자가 승인하지 않은 계정입니다.';
          return false;
        }
    }
    else{
      $result["status"] = 401;
      $result["message"] = '정보 없음';
      return false;
    }
  }
  catch(PDOException $e){
    $result["status"] = 401;
    $result["message"] = $e->getMessage();
    return false;
  }
}


?>