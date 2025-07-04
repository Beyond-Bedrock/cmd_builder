import { useDarkMode } from "./hooks/useDarkMode";

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

      //change logo and favicon
    const favicon = isDarkMode ? './assets/favicon.ico' : './assets/favicon-dark.ico';
    const logo = isDarkMode ? './assets/logo.png' : './assets/logo-dark.png';
    const faviconLink = document.getElementById('favicon');
    const logoLink = document.getElementById('logo');
    faviconLink?.setAttribute('href', favicon);
    logoLink?.setAttribute('src', logo);

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-lg transition-colors ${
        isDarkMode
          ? 'text-yellow-400 hover:bg-gray-700'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
      aria-label="Toggle dark mode"
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
