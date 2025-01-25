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
    { url: 'index.html', title: 'Home' },
    { url: 'resume/index.html', title: 'CV' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'contact/index.html', title: 'Contact' },
    { url: 'https://github.com/anh1231', title: 'Github' },
  ];
  
  let nav = document.createElement('nav');
  let ul = document.createElement('ul');
  nav.append(ul);
  document.body.prepend(nav);
  
  const BASE_PATH = '/'; // Replace with your repository name or '/' if in root
  const ARE_WE_HOME = location.pathname === '/' || location.pathname === '/index.html';
  
  for (let p of pages) {
    let url = p.url;
  
    // Adjust URLs for non-home pages
    if (!ARE_WE_HOME && !url.startsWith('http')) {
      url = '../' + url
    }
  
    let title = p.title;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
  
    // Highlight the current page
    if (a.host === location.host && a.pathname === location.pathname) {
      a.classList.add('current');
    }
  
    // Open external links in a new tab
    if (a.host !== location.host) {
      a.target = '_blank';
    }
  
    let li = document.createElement('li');
    li.append(a);
    ul.append(li);
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
  
  document.addEventListener('DOMContentLoaded', () => {
    // Get a reference to the form
    const form = document.querySelector('#contact-form');
  
    // Attach a submit event listener if the form exists
    form?.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent the default submission behavior
  
      // Create a FormData object from the form
      const data = new FormData(form);
  
      // Build the mailto: URL
      let url = form.action + '?';
      for (let [name, value] of data) {
        url += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
      }
  
      // Remove the trailing "&"
      url = url.slice(0, -1);
  
      // Open the mailto: URL
      location.href = url;
    });
  });
  