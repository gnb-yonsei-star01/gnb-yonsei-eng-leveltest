# BTS 레벨테스트 — 차단우회 프록시 배포 (Netlify, 유형 A)

학부모 자녀보호 앱이 `script.google.com`을 막아 데이터가 안 들어오는 문제를,
**Netlify 프록시**로 우회합니다. 학생 폰은 구글로 직접 나가지 않고 Netlify 주소로만 통신합니다.

## 이 패키지 구성
```
(루트)
├─ index.html          ← 학생 진단 앱  (GS_URL = "/api" 로 변경됨)
├─ report.html         ← 교사·학부모 리포트 콘솔 (GS_URL = "/api")
├─ netlify.toml        ← 함수 폴더 + /api 리다이렉트
└─ netlify/
   └─ functions/
      └─ proxy.js        ← 실제 GAS 주소(yx513w) 보관 · redirect:follow 로 구글 점프 추적
```
- 학생 링크 = `https://(사이트).netlify.app/`  (루트가 index.html)
- 리포트 링크 = `https://(사이트).netlify.app/report.html`
- 두 앱 모두 **같은 GAS(yx513w)** 를 쓰므로 프록시 하나로 처리합니다.

## 이미 적용된 수정 (직접 안 하셔도 됨)
- 두 HTML의 `GS_URL` → `"/api"`
- 학생앱 457행 **주소 판단 코드**를 `/api`도 인정하도록 수정 (이걸 안 하면 "GS_URL이 설정되지 않았어요"로 막힘 — 매뉴얼 §4-2 함정)
- 두 HTML 상단에 **카카오톡 인앱브라우저 탈출 스크립트** 삽입
- `proxy.js` 에 운영 GAS 주소(yx513w) 박음

## 배포 순서 (GitHub 연동 — 드래그&드롭 금지)
1. **GitHub** → New repository (Public) → Create.
2. **Add file → Upload files** → 이 폴더의 **내용물**(index.html, report.html, netlify.toml, netlify 폴더)을 드래그 → Commit.
   - ⚠️ 루트에 `index.html` 이 보여야 정상. 하위 폴더 한 단계 안에 들어가면 실패.
3. **Netlify** → Add new site → Import an existing project → GitHub → 저장소 선택 → 설정 그대로 **Deploy**.
4. 수정 시: GitHub에서 파일 편집 → Commit → Netlify 자동 재배포.

> 드래그&드롭 배포는 Netlify Functions를 실행하지 않습니다. 반드시 GitHub 연동(또는 CLI).

## 검증 (차단 없는 PC 크롬에서 주소창에 직접)
1. `https://(사이트).netlify.app/api?action=getDiagnosisData&callback=cb`
   → `cb({ ... })` 형태(JSONP)가 뜨면 **읽기 성공**.
2. 학생앱 `https://(사이트).netlify.app/` 들어가 이름·학년 넣고 단어가 뜨는지.
3. 리포트 `https://(사이트).netlify.app/report.html` 에서 학생 목록이 뜨는지.
4. 마지막으로 **차단 앱이 깔린 학생 폰**에서 1~3 재확인.

| 증상 | 원인·조치 |
|---|---|
| Page not found / 404 | 파일이 루트에 없음 → 내용물만 다시 업로드 / netlify.toml 위치 확인 |
| "현재 파일을 열 수 없습니다"(구글) | GAS 배포 권한 → Apps Script 배포 액세스 "모든 사용자" 확인 |
| 빈 화면·구글 로그인 요구 | 위와 동일(권한) |
| 데이터만 안 옴 | proxy.js 의 GAS 주소가 운영(yx513w)인지 확인 |

## 주의 / 한계
- **스피킹 녹음 POST**도 이 프록시를 지나갑니다. Netlify 함수는 요청/응답 본문 약 6MB 제한이 있어, 아주 긴 녹음은 막힐 수 있습니다(보통 낭독 몇 초~십여 초는 문제없음).
- **별개 이슈(매뉴얼 §9)**: 스피킹 AI 채점은 서버(GAS)가 OpenAI를 호출하므로, 학생 폰이 OpenAI 도메인을 직접 부르지 않습니다 → 이 프록시로 충분히 우회됩니다.
- 운영 GAS는 항상 **기존 배포 편집 → 새 버전**으로만 갱신(URL 유지). proxy.js 의 주소도 그대로 유지됩니다.
