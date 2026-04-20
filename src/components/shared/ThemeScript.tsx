/**
 * 초기 페인트 전 html 에 'dark' 클래스를 적용해 FOUC 방지.
 * localStorage 우선, 없으면 시스템 테마.
 */
export function ThemeScript() {
  const code = `
(function(){
  try {
    var saved = localStorage.getItem('oqad:theme');
    var preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved === 'dark' || (saved !== 'light' && preferDark);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`.trim();
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
