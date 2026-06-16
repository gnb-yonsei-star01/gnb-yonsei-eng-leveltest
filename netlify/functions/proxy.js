// netlify/functions/proxy.js
// GnB BTS 레벨테스트 — 차단우회 프록시 (유형 A · 단일 GAS 주소)
// 학생앱(JSONP+POST)과 리포트 콘솔(JSONP)이 모두 이 한 주소를 사용.
const GAS_URL = "https://script.google.com/macros/s/AKfycbyx513w9QBzGBL2tRYQV6jlGa8ks5ftoX7yWTyiDAiR_cIIH110i8MYbCADoVEKytOsLw/exec";

exports.handler = async (event) => {
  try {
    const qs = event.rawQuery ? "?" + event.rawQuery : "";
    const target = GAS_URL + qs;
    const init = { method: event.httpMethod || "GET", redirect: "follow" };
    if ((event.httpMethod || "GET").toUpperCase() === "POST") {
      const raw = event.isBase64Encoded
        ? Buffer.from(event.body || "", "base64").toString("utf-8")
        : (event.body || "");
      // 학생앱은 결과 제출·스피킹 채점을 text/plain(simple request)으로 보냄
      init.headers = { "Content-Type": "text/plain;charset=utf-8" };
      init.body = raw;
    }
    const res = await fetch(target, init);
    const body = await res.text();
    const ct = res.headers.get("content-type") || "application/json; charset=utf-8";
    return {
      statusCode: 200,
      headers: {
        "Content-Type": ct,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      },
      body
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: "proxy error: " + (e && e.message ? e.message : String(e))
    };
  }
};
