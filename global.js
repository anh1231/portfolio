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
    { url: 'resume/index.html', title: 'CV' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'contact/index.html', title: 'Contact' },
    { url: 'https://github.com/anh1231/portfolio', title: 'Github' },
  ];

  const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Step 3: Create the <nav> element and prepend it to the <body>
let nav = document.createElement('nav');
document.body.prepend(nav);

// Step 4: Loop through the pages array and create navigation links
for (let p of pages) {
  let url = p.url;
  let title = p.title;
  
  // Adjust URL if we're not on the home page and the URL is relative
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

  // Create a link element
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  // Highlight the current page
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );

  // Open external links in a new tab
  if (a.host !== location.host) {
    a.target = '_blank';
  }

  // Append the link to the navigation menu
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
  
  export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
        }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  // Ensure the container element is valid
  if (!(containerElement instanceof HTMLElement)) {
      console.error('Invalid container element provided.');
      return;
  }

  // Validate headingLevel
  if (!/^h[1-6]$/.test(headingLevel)) {
      console.warn('Invalid heading level provided. Defaulting to h2.');
      headingLevel = 'h2';
  }

  // Clear the container before rendering
  containerElement.innerHTML = '';

  // Ensure project is a valid array
  if (!Array.isArray(project) || project.length === 0) {
      console.error('Invalid or empty project list.');
      return;
  }

  for (let p of project) {
      if (!p || typeof p !== 'object' || !p.title) {
          console.warn('Skipping invalid project:', p);
          return;
      }

      // Create article element
      const article = document.createElement('article');

      // Construct inner HTML dynamically, including year
      let projectHTML = `
          <${headingLevel}>${p.title}</${headingLevel}>
          <img src="${p.image.startsWith('http') || ARE_WE_HOME ? p.image : `../${p.image}`}" 
               alt="${p.title}" loading="lazy" class="project-image">
          <div class="project-details">
              <p>${p.description}</p>
              <span class="project-year">Year: ${p.year || 'N/A'}</span>
          </div>`;

      article.innerHTML = projectHTML;

      // Append article to container
      containerElement.appendChild(article);
  }
}


export async function fetchGitHubData(username) {
  // return statement here
  return fetchJSON(`https://api.github.com/users/${username}`);
}
