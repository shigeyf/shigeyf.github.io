function getTheme(){return localStorage.getItem('theme')?localStorage.getItem('theme'):null;}
function setTheme(style){document.documentElement.setAttribute('data-theme',style);localStorage.setItem('theme',style);}
function init(){var theme=getTheme();const userPrefersDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;if(theme===null){if(userPrefersDark){setTheme('dark');}
else{setTheme('light');}}
else{if(theme=='light'){document.documentElement.setAttribute('data-theme','light');}
else{document.documentElement.setAttribute('data-theme','dark');}}}
function switchTheme(e){var theme=getTheme();if(theme=='light'){setTheme('dark');}
else{setTheme('light');}}
document.addEventListener('DOMContentLoaded',function(){var darkModeSwitcher=document.querySelector('.darkmode-switch');darkModeSwitcher.addEventListener('click',switchTheme,false);var darkModeSwitcherMobile=document.querySelector('.darkmode-switch-mobile');darkModeSwitcherMobile.addEventListener('click',switchTheme,false);},false);init();