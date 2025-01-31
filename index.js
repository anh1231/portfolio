import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');
renderProjects(latestProjects, projectsContainer, 'h2');
const githubData = await fetchGitHubData('anh1231');
const profileStats = document.querySelector('#profile-stats');
if (profileStats && githubData) {
    profileStats.style.display = 'block';

    profileStats.innerHTML = `
          <dl class="stats-grid">
            <h4 class="stats">GitHub Stats</h4>
            <dt class="stats-head">Public Repos:</dt><dd class="stats-text">${githubData.public_repos}</dd>
            <dt class="stats-head">Public Gists:</dt><dd class="stats-text">${githubData.public_gists}</dd>
            <dt class="stats-head">Followers:</dt><dd class="stats-text">${githubData.followers}</dd>
            <dt class="stats-head">Following:</dt><dd class="stats-text">${githubData.following}</dd>
          </dl>
      `;
  }
