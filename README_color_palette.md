# 🎨 색상 팔레트 뷰어 사용법

## 개요
파이썬에서 `color_palettes.json` 파일을 읽고 색상 코드 옆에 실제 색상을 시각적으로 표시하는 도구입니다.

## 파일 구성
- **`color_palette_viewer.py`**: 메인 색상 팔레트 뷰어 클래스
- **`color_palette_example.ipynb`**: Jupyter Notebook 사용 예시
- **`json/color_palettes.json`**: 색상 팔레트 정의 파일

## 설치 및 실행

### 1. 기본 실행 (콘솔)
```bash
python color_palette_viewer.py
```

### 2. Jupyter Notebook에서 사용
```python
from color_palette_viewer import ColorPaletteViewer

# 뷰어 인스턴스 생성
viewer = ColorPaletteViewer()

# 모든 색상 팔레트 표시
viewer.show()
```

### 3. 일반 파이썬 스크립트에서 사용
```python
from color_palette_viewer import ColorPaletteViewer

viewer = ColorPaletteViewer()

# 특정 팔레트 가져오기
colors = viewer.get_palette_by_name('under_10')
print(f"10개 미만 색상: {colors}")

# 데이터 개수에 따른 팔레트 자동 선택
palette = viewer.get_palette_by_data_count(15)
print(f"15개 데이터용 색상: {palette}")
```

## 주요 기능

### 🎯 색상 팔레트 표시
- **HTML 출력**: Jupyter 환경에서 색상 스왓치와 함께 시각적 표시
- **콘솔 출력**: 터미널에서 ANSI 색상 코드로 색상 표시
- **메타데이터**: 색상 팔레트의 설명과 용도 정보 표시

### 🔍 팔레트 검색 및 선택
- **이름별 선택**: `get_palette_by_name('palette_name')`
- **자동 선택**: `get_palette_by_data_count(count)` - 데이터 개수에 따른 최적 팔레트

### 📊 색상 정보
- **색상 코드**: HEX 색상 코드 (#FF6B6B)
- **RGB 값**: RGB 색상 값 (255, 107, 107)
- **색상 번호**: 팔레트 내 순서 (#1, #2, ...)

## 색상 팔레트 종류

### 1. `under_10` - 10개 색상
- 사용자가 지정한 4개 색상 기반
- 소규모 데이터 시각화용

### 2. `12_colors` - 12개 색상
- 18개 색상에서 핵심 색상 선별
- 중간 규모 데이터 시각화용

### 3. `16_colors` - 16개 색상
- 18개 색상에서 2개 제거
- 대부분의 차트 유형에 적합

### 4. `18_colors` - 18개 색상
- 서초구 동별 색상 매핑용
- 지역별 구분이 필요한 시각화

### 5. `25_colors` - 25개 색상
- 18개 색상 확장
- 대규모 데이터 시각화용

## 사용 예시

### 기본 사용법
```python
from color_palette_viewer import ColorPaletteViewer

viewer = ColorPaletteViewer()
viewer.show()  # 모든 팔레트 표시
```

### 특정 팔레트 사용
```python
# 18개 색상 팔레트 가져오기
colors = viewer.get_palette_by_name('18_colors')

# 색상 목록 출력
for i, color in enumerate(colors, 1):
    print(f"색상 {i}: {color}")
```

### 데이터 기반 팔레트 선택
```python
# 데이터 개수에 따른 자동 선택
data_count = 15
palette = viewer.get_palette_by_data_count(data_count)
print(f"{data_count}개 데이터 → {len(palette)}개 색상 팔레트")
```

### matplotlib과 함께 사용
```python
import matplotlib.pyplot as plt

# 색상 팔레트 가져오기
colors = viewer.get_palette_by_name('under_10')

# 차트에 색상 적용
data = [10, 20, 30, 40, 50]
labels = ['A', 'B', 'C', 'D', 'E']

plt.figure(figsize=(10, 6))
bars = plt.bar(labels, data, color=colors[:len(data)])
plt.title('색상 팔레트 적용 예시')
plt.show()
```

## 환경별 출력

### Jupyter Notebook
- **HTML 출력**: 색상 스왓치, 설명, 메타데이터 포함
- **인터랙티브**: 클릭 가능한 색상 정보

### 일반 콘솔
- **ANSI 색상**: 터미널에서 지원하는 경우 실제 색상 표시
- **텍스트 정보**: 색상 코드, RGB 값, 설명

### 일반 파이썬 스크립트
- **프로그래밍 방식**: 색상 목록을 배열로 반환
- **유연한 활용**: 다양한 시각화 라이브러리와 연동

## 주의사항

### 파일 경로
- JSON 파일이 `json/color_palettes.json` 경로에 있어야 함
- 상대 경로 자동 감지 및 조정

### 의존성
- **Jupyter 환경**: `IPython.display` (선택사항)
- **기본 환경**: 표준 라이브러리만 사용

### 색상 표시
- **터미널**: ANSI 색상 코드 지원 여부에 따라 색상 표시
- **브라우저**: HTML 출력으로 정확한 색상 표시

## 확장 가능성

### 새로운 색상 팔레트 추가
1. `json/color_palettes.json`에 새 팔레트 정의
2. 자동으로 뷰어에서 인식 및 표시

### 커스텀 색상 처리
```python
# 색상 팔레트 확장
class CustomColorViewer(ColorPaletteViewer):
    def add_custom_palette(self, name, colors):
        # 커스텀 팔레트 추가 로직
        pass
```

### 다른 형식으로 내보내기
```python
# CSS 변수로 내보내기
def export_to_css(self, palette_name):
    colors = self.get_palette_by_name(palette_name)
    css = ":root {\n"
    for i, color in enumerate(colors):
        css += f"  --color-{i+1}: {color};\n"
    css += "}"
    return css
```

## 문제 해결

### 파일을 찾을 수 없는 경우
```python
# 절대 경로 지정
viewer = ColorPaletteViewer("/full/path/to/color_palettes.json")
```

### 색상이 표시되지 않는 경우
- 터미널의 ANSI 색상 지원 확인
- Jupyter 환경에서 HTML 출력 사용

### JSON 파싱 오류
- JSON 파일 형식 검증
- 인코딩 확인 (UTF-8 권장)

## 라이선스
이 도구는 프로젝트 내부 사용을 위해 제작되었습니다.
