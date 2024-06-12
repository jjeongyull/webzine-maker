<?php
$data = array();

if (isset($_FILES['upload']['name'])) {
    $file_name = $_FILES['upload']['name'];
    $file_path = '../tempUpload/' . $file_name;
    $file_extension = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));

    if ($file_extension == 'jpg' || $file_extension == 'jpeg' || $file_extension == 'png' || $file_extension == 'JPG') {
        if (move_uploaded_file($_FILES['upload']['tmp_name'], $file_path)) {
            $data['file'] = $file_name;
            $data['url'] = $file_path;
            $data['uploaded'] = 1;
        } else {
            $data['uploaded'] = 0;
            $data['error']['message'] = 'Error! File not uploaded';
        }
    } else {
        $data['uploaded'] = 0;
        $data['error']['message'] = 'Invalid extension';
    }
}

// 사용자가 파일을 삭제하는 경우
if (isset($_POST['action']) && $_POST['action'] === 'deleteFile') {
    $file_to_delete = '../tempUpload/' . $_POST['fileNameToDelete'];

    // 파일 삭제 시도
    if (file_exists($file_to_delete) && unlink($file_to_delete)) {
        $data['fileDeleted'] = true;
    } else {
        $data['fileDeleted'] = false;
        $data['error']['message'] = 'Error! File not deleted';
    }
}

echo json_encode($data);
?>