
import React from "react";

/**
 * VisualizationDataGuide
 * 사용자가 CSV 데이터를 올바르게 작성해 원하는 시각화를 얻을 수 있도록
 * 작성 요령 · 샘플 구조 · 변환 과정을 ‘일관된 포맷’으로 정리한 안내 페이지입니다.
 *
 * 본 가이드는 다음 전제에 맞춰 작성되었습니다.
 * - CSV의 첫 행은 헤더, 이후는 데이터 행입니다.
 * - 숫자처럼 보이는 값은 숫자로 자동 인식됩니다(예: "70" → 70).
 * - 한 행은 하나의 관측치(레코드)를 의미하며, 쉼표(,)로 구분합니다.
 *
 * 참고: 실제 파서는 첫 줄을 헤더로 사용하고, 각 행을 쉼표로 분할하여
 *      숫자 여부를 판별해 숫자/문자열로 저장합니다.
 */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="space-y-3 text-gray-800">{children}</div>
  </section>
);

const Block: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border rounded-xl p-4 bg-white shadow-sm">
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    <div className="text-sm leading-6">{children}</div>
  </div>
);

const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <pre className="bg-gray-50 border rounded-lg p-3 text-xs overflow-x-auto">
    <code className="font-mono">{children}</code>
  </pre>
);

const Tip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-xs text-gray-600">
    <span className="font-semibold">💡 Tip:</span> {children}
  </div>
);

const Details: React.FC<{ summary: string; children: React.ReactNode }> = ({ summary, children }) => (
  <details className="border rounded-xl p-4 bg-gray-50">
    <summary className="cursor-pointer font-medium text-gray-900">{summary}</summary>
    <div className="mt-3 space-y-3 text-sm leading-6">{children}</div>
  </details>
);

const VisualizationDataGuide: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-4">데이터 작성 입력 가이드</h1>
      <p className="text-gray-700 mb-6">
        원하는 시각화 결과를 얻기 위해 <span className="font-semibold">표준화된 가이드라인을 잘 읽고</span>데이터를 작성하시기 바랍니다. 아래 가이드라인에 맞추어 CSV 파일을 준비해 주세요.
      </p>

      <Section title="공통 규칙">
        <Block title="CSV 기본 원칙">
          <ul className="list-disc pl-5 space-y-1">
            <li>첫 행(헤더)은 컬럼명을 정의합니다. 예: <em>월,부서,값</em></li>
            <li>각 데이터 행은 헤더 순서를 그대로 따릅니다.</li>
            <li>숫자처럼 보이는 값은 자동으로 숫자로 처리됩니다. 빈 칸은 넣지 말고, 값이 없으면 0 또는 적절한 결측 표시(예: <em>NA</em>)를 사용하세요.</li>
            <li>날짜는 가급적 <em>YYYY-MM-DD</em> 형식으로 작성하세요.</li>
            <li>카테고리 값은 오탈자/띄어쓰기 차이로 중복이 생기지 않도록 주의하세요. (예: “문화관광과” vs “문화 관광과”)</li>
          </ul>
          <Tip>붙임표(-)가 들어간 값 등 쉼표 외 구분 문자가 섞이지 않도록 주의하세요.</Tip>
        </Block>

        <Block title="권장 데이터 품질 체크리스트">
          <ul className="list-disc pl-5 space-y-1">
            <li>헤더가 누락되지 않았는가?</li>
            <li>예시 템플릿의 컬럼 개수/의미와 동일한가?</li>
            <li>숫자 컬럼에 문자가 섞이지 않았는가?</li>
            <li>카테고리 철자/대소문자/공백이 일관적인가?</li>
            <li>중복 행이나 극단치(오타로 인한 10배 값 등)가 없는가?</li>
          </ul>
        </Block>

        <Details summary="파서(Parsing) 동작 방식 이해하기">
          <ul className="list-disc pl-5 space-y-1">
            <li>입력 전체를 줄 단위로 나눈 뒤, 첫 줄을 헤더로 사용합니다.</li>
            <li>각 줄을 쉼표(,)로 분할해 헤더와 인덱스를 일치시켜 객체로 매핑합니다.</li>
            <li>각 값은 숫자 여부를 판별해 숫자/문자열로 저장합니다.</li>
          </ul>
          <Tip>따옴표를 포함한 텍스트나 쉼표가 들어간 값은 CSV 표준에 맞춰 따옴표로 감싸 주세요.</Tip>
        </Details>
      </Section>

      <Section title="차트 유형별 템플릿">
        <Details summary="📋 선형(Line) / 📈 누적영역(Area)">
          <Block title="작성 요령">
            <ul className="list-disc pl-5 space-y-1">
              <li>1열: X축 기준값(시간/카테고리)</li>
              <li>2열: 시리즈(범례에 표시될 그룹)</li>
              <li>3열: 값(수치)</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV)">
            <Code>{`월,분야,값
1월,일반행정,419
2월,일반행정,458
1월,사회복지,516
2월,사회복지,622`}</Code>
          </Block>
          <Block title="변환 과정">
            <ul className="list-disc pl-5 space-y-1">
              <li>X축: 1열(월)</li>
              <li>범례: 2열(분야)</li>
              <li>Y축: 3열(값)</li>
              <li>Area의 경우 시리즈별 값을 누적해 영역으로 표시합니다.</li>
            </ul>
          </Block>
        </Details>

        <Details summary="📊 막대(Bar)">
          <Block title="작성 요령 (정정)">
            <ul className="list-disc pl-5 space-y-1">
              <li>1열: X축 카테고리(예: 권역)</li>
              <li>2열: 시리즈(예: 성별)</li>
              <li>3열: 값(예: 인구수)</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV)">
            <Code>{`권역,성별,인구수
서초권역,남성,13200
서초권역,여성,11800
반포권역,남성,13800
반포권역,여성,12400`}</Code>
          </Block>
          <Block title="변환 과정">
            <ul className="list-disc pl-5 space-y-1">
              <li>X축: 1열(권역)</li>
              <li>범례: 2열(성별)</li>
              <li>Y축: 3열(인구수)</li>
              <li>군집 막대 형태로 카테고리별 시리즈를 나란히 비교합니다.</li>
            </ul>
          </Block>
        </Details>

        <Details summary="📚 누적 막대(Stacked Bar)">
          <Block title="작성 요령">
            <ul className="list-disc pl-5 space-y-1">
              <li>1열: X축 기준값</li>
              <li>2열: 시리즈</li>
              <li>3열: 값</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV)">
            <Code>{`월,유형,값
1월,생활쓰레기,661
2월,생활쓰레기,817
1월,재활용,635
2월,재활용,808`}</Code>
          </Block>
          <Block title="변환 과정">
            <ul className="list-disc pl-5 space-y-1">
              <li>X축: 1열(월)</li>
              <li>범례: 2열(유형)</li>
              <li>Y축: 3열(값), 시리즈별 값을 누적</li>
            </ul>
          </Block>
        </Details>

        <Details summary="🥧 원형(Pie) / 🍩 도넛(Donut)">
          <Block title="작성 요령">
            <ul className="list-disc pl-5 space-y-1">
              <li>1열: 항목명(조각)</li>
              <li>2열: 값(비율/개수)</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV)">
            <Code>{`항목,값
일반행정,20
사회복지,24
보건,12
환경,10`}</Code>
          </Block>
          <Block title="변환 과정">
            <ul className="list-disc pl-5 space-y-1">
              <li>조각: 1열(항목)</li>
              <li>크기: 2열(값)</li>
              <li>도넛은 가운데에 합계/설명을 배치할 수 있습니다.</li>
            </ul>
          </Block>
        </Details>

        <Details summary="☀️ 선버스트(Sunburst) / 🌳 트리맵(Treemap)">
          <Block title="작성 요령">
            <ul className="list-disc pl-5 space-y-1">
              <li>선버스트: 1열(대분류) · 2열(중분류) · 3열(소분류, 선택) · 4열(값)</li>
              <li>트리맵: 1열(분류 항목) · 2열(값)</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV) - 선버스트">
            <Code>{`국,과,세부,값
문화행정국,문화관광과,세부1,120
문화행정국,문화관광과,세부2,80
문화행정국,체육진흥과,세부1,90
기획재정국,기획예산과,세부1,140`}</Code>
          </Block>
          <Block title="샘플 구조 (CSV) - 트리맵">
            <Code>{`분야,값
복지,242
보건,58
환경,133
교통,117
문화,271`}</Code>
          </Block>
          <Block title="변환 과정">
            <ul className="list-disc pl-5 space-y-1">
              <li>선버스트: (대분류→중분류→소분류) 계층을 원형 레이어로 표현, 4열 값으로 크기 결정</li>
              <li>트리맵: 각 분류를 사각형으로 배치, 2열 값으로 면적 결정</li>
            </ul>
          </Block>
        </Details>

        <Details summary="🔵 산점도(Scatter) / 💭 버블(Bubble)">
          <Block title="작성 요령">
            <ul className="list-disc pl-5 space-y-1">
              <li>산점도: 1열(범례/그룹) · 2열(X값) · 3열(Y값)</li>
              <li>버블: 산점도 + 4열(버블 크기)</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV) - 버블">
            <Code>{`행정동,PM2.5,응급내원율,인구
서초1동,70,10,12943
서초2동,58,20,55541
서초3동,70,21,38309
서초4동,52,5,58986`}</Code>
          </Block>
          <Block title="변환 과정">
            <ul className="list-disc pl-5 space-y-1">
              <li>색상/범례: 1열(행정동)</li>
              <li>X축: 2열(PM2.5)</li>
              <li>Y축: 3열(응급내원율)</li>
              <li>버블 크기: 4열(인구)</li>
            </ul>
          </Block>
        </Details>

        <Details summary="📊 히스토그램(Histogram) / 📦 박스플롯(Boxplot)">
          <Block title="작성 요령">
            <ul className="list-disc pl-5 space-y-1">
              <li>히스토그램: 1열(값) — 단일 수치열</li>
              <li>박스플롯: 1열(그룹) · 2열(값) — 그룹별 분포 비교</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV)">
            <Code>{`# 히스토그램
값
97
49
64
133
87

# 박스플롯
부서군,점수
A부서,33.2
A부서,45.32
A부서,43.35
B부서,40.85
B부서,74.72`}</Code>
          </Block>
          <Block title="변환 과정">
            <ul className="list-disc pl-5 space-y-1">
              <li>히스토그램: 값 분포를 구간별 빈도로 집계</li>
              <li>박스플롯: 그룹별 사분위/중앙값/이상치를 계산하여 상자-수염으로 표시</li>
            </ul>
          </Block>
        </Details>

        <Details summary="🎯 레이더(Radar)">
          <Block title="작성 요령 (와이드 포맷 표준화)">
            <ul className="list-disc pl-5 space-y-1">
              <li>1열: 지표(평가 항목)</li>
              <li>2열~N열: 대상별 점수(열 헤더에 대상 이름)</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV)">
            <Code>{`지표,김철수,이영희,박민수,최지영
민원처리능력,3.5,2.8,1.4,4.8
의사소통,2.8,5,4.2,3.8
법규지식,4.8,4.5,4.7,4.8
고객서비스,5,3.3,4.4,4.2`}</Code>
          </Block>
          <Block title="변환 과정">
            <ul className="list-disc pl-5 space-y-1">
              <li>축(지표): 1열</li>
              <li>각 대상의 점수: 2~N열</li>
              <li>대상별 다각형으로 시각화</li>
            </ul>
          </Block>
        </Details>

        <Details summary="⏰ 타임라인(공정표)">
          <Block title="작성 요령">
            <ul className="list-disc pl-5 space-y-1">
              <li>1열: 작업명</li>
              <li>2열: 시작일(YYYY-MM-DD)</li>
              <li>3열: 종료일(YYYY-MM-DD)</li>
              <li>4열: 진행률(0~100, 선택)</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV)">
            <Code>{`작업명,시작일,종료일,진행률
민원접수,2024-01-01,2024-01-01,100
민원검토,2024-01-02,2024-01-03,80
민원처리,2024-01-04,2024-01-05,60`}</Code>
          </Block>
        </Details>

        <Details summary="🎯 게이지(Gauge)">
          <Block title="작성 요령">
            <ul className="list-disc pl-5 space-y-1">
              <li>1열: 지표명</li>
              <li>2열: 현재값(0~100 권장)</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV)">
            <Code>{`지표,값
처리기한 준수율,75
고객만족도,82
목표달성률,91
업무효율성,68`}</Code>
          </Block>
        </Details>

        <Details summary="☁️ 워드클라우드(Word Cloud)">
          <Block title="작성 요령">
            <ul className="list-disc pl-5 space-y-1">
              <li>1열: 단어/키워드</li>
              <li>2열: 가중치(빈도/중요도)</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV)">
            <Code>{`단어,가중치
서초구,157
서초구청,277
서초1동,172
서초2동,200`}</Code>
          </Block>
        </Details>

        <Details summary="🔥 히트맵(Heatmap)">
          <Block title="작성 요령">
            <ul className="list-disc pl-5 space-y-1">
              <li>1열: 행 카테고리(예: 요일)</li>
              <li>2열: 열 카테고리(예: 시간)</li>
              <li>3열: 값(색 강도)</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV)">
            <Code>{`요일,시간,값
월,0:00,61
월,1:00,65
화,0:00,44
화,1:00,56`}</Code>
          </Block>
        </Details>

        <Details summary="🌊 워터폴(Waterfall)">
          <Block title="작성 요령">
            <ul className="list-disc pl-5 space-y-1">
              <li>1열: 항목명(단계)</li>
              <li>2열: 변화량(+, - 허용)</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV)">
            <Code>{`항목,변화
전년도 이월,0
지방교부세,380
국고보조,240
세외수입,70
인건비,-320
복지지출,-340`}</Code>
          </Block>
          <Block title="변환 과정">
            <ul className="list-disc pl-5 space-y-1">
              <li>X축: 항목, Y축: 누적 값</li>
              <li>양/음수 막대를 누적하여 흐름을 표현</li>
            </ul>
          </Block>
        </Details>

        <Details summary="🔀 콤보(막대+선)">
          <Block title="작성 요령">
            <ul className="list-disc pl-5 space-y-1">
              <li>1열: X축 기준값(예: 월)</li>
              <li>2열: 막대 값(절대값)</li>
              <li>3열: 선 값(비율 등)</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV)">
            <Code>{`월,민원건수,집행률(%)
1월,3082,70
2월,3250,76
3월,3304,78
4월,3525,80`}</Code>
          </Block>
        </Details>

        <Details summary="📋 패널(Panel/Small Multiples)">
          <Block title="작성 요령">
            <ul className="list-disc pl-5 space-y-1">
              <li>1열: X축 기준값(시간/카테고리)</li>
              <li>2열: 패널 구분(그룹/영역)</li>
              <li>3열: 값</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV)">
            <Code>{`월,권역,값
1월,서초권역,1025
2월,서초권역,1063
1월,반포권역,1212
2월,반포권역,1221`}</Code>
          </Block>
        </Details>

        <Details summary="🗺️ 지도(Map)">
          <Block title="작성 요령">
            <ul className="list-disc pl-5 space-y-1">
              <li>필수: 1열 주소, 2열 이름, 3열 설명, 4열 카테고리</li>
              <li>선택: 우선순위, 상태 등 추가 열을 붙일 수 있습니다.</li>
            </ul>
          </Block>
          <Block title="샘플 구조 (CSV)">
            <Code>{`주소,서비스명,설명,카테고리,우선순위,상태
서울특별시 서초구 남부순환로 2584,서초구청,서초구 행정 서비스 제공,구청,높음,운영중
서울특별시 서초구 사임당로 89,서초1동 주민센터,서초1동 주민 서비스,동 주민센터,높음,운영중`}</Code>
          </Block>
        </Details>
      </Section>

      <Section title="자주 묻는 질문">
        <Details summary="엑셀에서 CSV로 저장했는데 숫자가 깨집니다.">
          <p>쉼표, 따옴표, 날짜 서식을 확인하고, 저장 시 인코딩(UTF-8)과 구분 기호를 ‘쉼표’로 설정하세요. 값에 쉼표가 포함되면 따옴표로 감싸야 합니다.</p>
        </Details>
        <Details summary="문자열 숫자('070')를 그대로 보존할 수 있나요?">
          <p>현재 파서는 숫자처럼 보이는 값을 숫자로 변환합니다. 전화번호 등 앞자리 0을 보존해야 할 값은 문자표시(예: 'Tel070-...')로 명시하거나 별도 옵션을 사용하세요.</p>
        </Details>
      </Section>

      <footer className="text-xs text-gray-500 mt-8">
        © {new Date().getFullYear()} 데이터 시각화 도구. All rights reserved.
      </footer>
    </div>
  );
};

export default VisualizationDataGuide;
