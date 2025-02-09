import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const titleElement = document.querySelector('.projects-title');
titleElement.textContent = `${projects.length} Projects`;

let selectedIndex = -1; // -1 means no selection
let query = ''; // Search query state

function renderPieChart(projectsGiven) {
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    if (rolledData.length === 0) {
        console.warn("No data available for pie chart.");
        return;
    }

    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));

    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);

    let svg = d3.select('svg');
    svg.selectAll('path').remove(); // Remove previous slices
    d3.selectAll('.legend-item').remove(); // Clear legend

    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Draw pie chart wedges
    arcData.forEach((d, idx) => {
        svg.append('path')
            .attr('d', arcGenerator(d))
            .attr('fill', colors(idx))
            .attr('class', 'pie-slice')
            .on('mouseover', function (_, idx) {
                if (selectedIndex === -1) { // ✅ Only apply hover effect when no slice is selected
                    svg.selectAll('path')
                        .style('opacity', 0.5); // Dim all slices
                    d3.select(this)
                        .style('opacity', 1); // Keep hovered slice bright
                }
            })
            .on('mouseout', function () {
                if (selectedIndex === -1) { // ✅ Reset opacity when leaving hover
                    svg.selectAll('path')
                        .style('opacity', 1);
                }
            })
            .on('click', function () {
                selectedIndex = selectedIndex === idx ? -1 : idx; // Toggle selection

                let selectedYear = selectedIndex !== -1 ? data[selectedIndex].label.toString() : null;
                
                svg.selectAll('path')
                    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''))
                    .style('fill', (_, i) => (i === selectedIndex ? 'var(--color)' : colors(i)))
                    .style('opacity', function(_, idx) {
                        if (selectedIndex === -1) {
                            return null; // ✅ Reset opacity for all slices when deselected
                        }
                        return idx === selectedIndex ? 1 : 0.3; // ✅ Dim other slices when one is selected
                    });

                // Update legend selection
                legend.selectAll('li')
                    .classed('selected', false)
                    .filter((_, i) => i === selectedIndex)
                    .classed('selected', true);
                
                
                updateFilteredProjects(selectedYear);
            });
    });

    // Render legend
    let legend = d3.select('.legend');
    legend.selectAll('li').remove(); // Clear legend items

    data.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`)
            .attr('class', 'legend-item')
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
            .on('click', function () {
                selectedIndex = selectedIndex === idx ? -1 : idx;
                let selectedYear = selectedIndex !== -1 ? data[selectedIndex].label.toString() : null;
                updateFilteredProjects(selectedYear);
            });
    });
}

// 🔹 Function to update projects based on both search + selected year
function updateFilteredProjects(selectedYear = null) {
    let filteredProjects = projects
        .filter(p => (selectedYear === null || p.year.toString() === selectedYear)) // Filter by year
        .filter(p => Object.values(p).join('\n').toLowerCase().includes(query.toLowerCase())); // Filter by search

    renderProjects(filteredProjects, projectsContainer, 'h2');
}

// Initial render
renderPieChart(projects);

// 🔹 Handle search input
document.querySelector('.searchBar').addEventListener('input', (event) => {
    query = event.target.value;
    updateFilteredProjects(selectedIndex !== -1 ? d3.selectAll('.legend-item').nodes()[selectedIndex].textContent.trim().split(" ")[0] : null);
});
