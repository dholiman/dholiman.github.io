function setTheme(el, theme) {
    if (!themeOptions.includes(theme)) {
      throw new Error(
        "Invalid theme option. Must be one of: " + themeOptions.join(", ")
      );
    }
  
    localStorage.setItem('theme', theme);
  
    if (el.classList.contains(theme)) {
      el.classList.replace(theme, "original");
      localStorage.setItem('theme', "original");
    } else {
      themeOptions.forEach((option) => {
        if (option === theme) return;
  
        if (el.classList.contains(option)) el.classList.replace(option, theme);
      });
    }
  }
  
  function switchColors(id, theme) {
    document.getElementById(id).onclick = function myFunction() {
      var el = document.getElementById("theme");
      setTheme(el, theme);
    };
  }
  
  const themeOptions = ["light", "yellow", "dark", "original"];
  
  const el = document.getElementById("theme");
  const storedTheme = localStorage.getItem('theme');
  
  if (storedTheme) {
    setTheme(el, storedTheme);
  } else {
    setTheme(el, 'original')
  }
  
  switchColors("one", "dark");
  switchColors("two", "light");
  switchColors("three", "yellow");