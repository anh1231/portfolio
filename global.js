console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

 let navLinks = $$("nav a");
 let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
  );
  
 if (currentLink) {
    // or if (currentLink !== undefined)
    currentLink.classList.add('current');
  }

 let pages = [
    { url: '', title: 'Home' },
    { url: 'resume/', title: 'CV'},
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact'},
    { url: 'https://github.com/anh1231', title: 'Github'}
  ];

  let nav = document.createElement('nav');
  document.body.prepend(nav);
  
  for (let p of pages) {
    const ARE_WE_HOME = document.documentElement.classList.contains('home');
    let url = p.url;
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
      }
    let title = p.title;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
      }
    if (a.host !== location.host) {
        a.target = "_blank";
      }
    nav.append(a);
  }
  
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select>
            <option value="light dark">Automatic</option>
			<option value="light">Light</option>
			<option value="dark">Dark</option>
          </select>
      </label>`
  );

  document.addEventListener('DOMContentLoaded', () => {
    // Reference the <select> element
    const select = document.querySelector('select');
  
    // Check for a saved preference in localStorage
    if ('colorScheme' in localStorage) {
      const savedScheme = localStorage.colorScheme;
  
      // Apply the saved preference
      document.documentElement.style.setProperty('color-scheme', savedScheme);
  
      // Update the <select> element to match
      select.value = savedScheme;
    }
  
    // Add the event listener to handle user changes
    select.addEventListener('input', function (event) {
      const newScheme = event.target.value;
  
      // Apply the color scheme
      document.documentElement.style.setProperty('color-scheme', newScheme);
  
      // Save the user preference
      localStorage.colorScheme = newScheme;
    });
  });
  
  