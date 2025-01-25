console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
 let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
  );
  
 if (currentLink) {
    // or if (currentLink !== undefined)
    currentLink.classList.add('current');
  }

 let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact'},
    { url: 'resume/', title: 'Resume'}
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
    nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
  }
  