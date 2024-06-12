import sys

param1 = sys.argv[1]
param2 = sys.argv[2]
param3 = sys.argv[3]
param4 = sys.argv[4]

# HTML 파일을 읽어들임
with open('../index.html', 'r') as file:
    for line in file:
        # HTML 파일의 각 라인을 반복하여 처리
        # 예시로 <meta> 태그를 수정하는 것으로 가정
        if '<meta name="param1"' in line:
            # param1 값을 변경하여 새로운 라인 생성
            new_line = line.replace('content="old_value"', f'content="{param1}"')
            line = new_line  # 현재 줄을 새로운 값으로 업데이트
        elif '<meta name="param2"' in line:
            # param2 값을 변경하여 새로운 라인 생성
            new_line = line.replace('content="old_value"', f'content="{param2}"')
            line = new_line  # 현재 줄을 새로운 값으로 업데이트
        elif '<meta name="param3"' in line:
            # param3 값을 변경하여 새로운 라인 생성
            new_line = line.replace('content="old_value"', f'content="{param3}"')
            line = new_line  # 현재 줄을 새로운 값으로 업데이트
        elif '<meta name="param4"' in line:
            # param4 값을 변경하여 새로운 라인 생성
            new_line = line.replace('content="old_value"', f'content="{param4}"')
            line = new_line  # 현재 줄을 새로운 값으로 업데이트
        
        # 새로운 라인을 리스트에 추가
        new_lines.append(line)

# 변경된 내용으로 새 파일 생성
with open('webzine_folder/' + param2 + "/" + param4 + '/index.html', 'w') as new_file:
    new_file.writelines(new_lines)

print("파일이 성공적으로 수정되었습니다.")