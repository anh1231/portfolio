let data = [];

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  processCommits();
  displayStats();
  createscatterplot();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

let commits = [];

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        // add the lines array as a hidden property
        enumerable: false,
      });

      return ret;
    });
}

function displayStats() {
  // Process commits first
  processCommits();

  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add title
  dl.append('dt').attr('class', 'title').text('Summary');

  // Add another element with class stats-grid
  dl.append('div').attr('class', 'stats-grid');

  const statsGrid = dl.select('.stats-grid');

  // Add total LOC
  statsGrid.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>:');
  statsGrid.append('dd').text(data.length);

  // Add total commits
  statsGrid.append('dt').text('Total commits:');
  statsGrid.append('dd').text(commits.length);

  // add these aggregate stats: Number of files in the codebase
  const files = d3.groups(data, (d) => d.file);
  statsGrid.append('dt').text('Number of files:');
  statsGrid.append('dd').text(files.length);

  // add these aggregate stats: Maximum file length (in lines)
  const maxFileLength = d3.max(files, ([_, lines]) => lines.length);
  statsGrid.append('dt').text('Maximum file length:');
  statsGrid.append('dd').text(maxFileLength);

  // add these aggregate stats: Average line length (in characters)
  const avgLineLength = d3.mean(data, (d) => d.length);
  statsGrid.append('dt').text('Average line length:');
  statsGrid.append('dd').text(avgLineLength.toFixed(2));
}

const fileLengths = d3.rollups(
  data,
  (v) => d3.max(v, (v) => v.line),
  (d) => d.file
);

let xScale = d3;
let yScale = d3;

function createscatterplot() {
  const width = 1000;
const height = 600;

const margin = { top: 10, right: 10, bottom: 30, left: 20 };

const usableArea = {
  top: margin.top,
  right: width - margin.right,
  bottom: height - margin.bottom,
  left: margin.left,
  width: width - margin.left - margin.right,
  height: height - margin.top - margin.bottom,
};

const svg = d3
  .select('#chart')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('overflow', 'visible');

xScale = d3
  .scaleTime()
  .domain(d3.extent(commits, (d) => d.datetime))
  .range([0, width])
  .nice();

yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

// Update scales with new ranges
xScale.range([usableArea.left, usableArea.right]);
yScale.range([usableArea.bottom, usableArea.top]);

// Add gridlines BEFORE the axes
const gridlines = svg
  .append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${usableArea.left}, 0)`);

// Create gridlines as an axis with no labels and full-width ticks
gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

// Add CSS to make gridlines less prominent
svg.selectAll('.gridlines .tick line')
  .attr('stroke', (d) => {
    const hour = d % 24;
    return hour >= 6 && hour < 18 ? 'orange' : 'blue';
  })
  .attr('stroke-dasharray', '2,2');

const xAxis = d3.axisBottom(xScale);
const yAxis = d3
  .axisLeft(yScale)
  .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

// Add X axis
svg
  .append('g')
  .attr('transform', `translate(0, ${usableArea.bottom})`)
  .call(xAxis);

// Add Y axis
svg
  .append('g')
  .attr('transform', `translate(${usableArea.left}, 0)`)
  .call(yAxis);

const dots = svg.append('g').attr('class', 'dots');
const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
const rScale = d3
  .scaleSqrt() // Change only this line
  .domain([minLines, maxLines])
  .range([3, 15]);

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

dots.selectAll('circle').data(sortedCommits).join('circle')
  .data(commits)
  .join('circle')
  .attr('cx', (d) => xScale(d.datetime))
  .attr('cy', (d) => yScale(d.hourFrac))
  .attr('r', (d) => rScale(d.totalLines))
  .style('fill-opacity', 0.7) // Add transparency for overlapping dots
  .attr('fill', 'steelblue')
  .on('mouseenter', (event, commit) => {
    d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
    updateTooltipContent(commit);
    updateTooltipVisibility(true);
    updateTooltipPosition(event);
  })
  .on('mouseleave', () => {
    d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore transparency
    updateTooltipContent({});
    updateTooltipVisibility(false);
  });
  
  const chartDiv = document.getElementById('chart');

  chartDiv.addEventListener('mouseenter', () => {
    brushSelector();
  });

  chartDiv.addEventListener('mouseleave', () => {
    d3.select('svg').call(d3.brush().on('start brush end', null));
  });
}

function updateTooltipContent(commit) {
  const tooltip = document.querySelector('.tooltip');
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');

  if (!commit || Object.keys(commit).length === 0) {
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
    return;
  }

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });

  tooltip.style.opacity = '1';
  tooltip.style.visibility = 'visible';

}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function brushSelector() {
  const svg = document.querySelector('svg');
  d3.select(svg).call(d3.brush().on('start brush end', brushed));

// Raise dots and everything after overlay
d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}

let brushSelection = null;

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function brushed(event) {
  brushSelection = event.selection;
  updateSelection()
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  if (!brushSelection) return false;
  const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
  const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
  const x = xScale(commit.date);
  const y = yScale(commit.hourFrac);
  return x >= min.x && x <= max.x && y >= min.y && y <= max.y; }

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type
    );
  
    // Update DOM with breakdown
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
  
    return breakdown;
  }