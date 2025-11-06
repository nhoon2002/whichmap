// TODO: Replace with real API data from Google Maps, Apple Maps, and Waze
const MOCK_DATA = {
    google: {
        provider: 'Google Maps',
        eta: 25,
        distance: '15.2 mi',
        unit: 'min'
    },
    apple: {
        provider: 'Apple Maps',
        eta: 23,
        distance: '15.1 mi',
        unit: 'min'
    },
    waze: {
        provider: 'Waze',
        eta: 27,
        distance: '15.3 mi',
        unit: 'min'
    }
};

// State management
const state = {
    start: '',
    end: '',
    results: [],
    isLoading: false,
    error: null
};

// DOM elements
const form = document.getElementById('compareForm');
const startInput = document.getElementById('startLocation');
const endInput = document.getElementById('endLocation');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');
const loadingState = document.getElementById('loadingState');
const resultsContainer = document.getElementById('resultsContainer');

// Initialize app
function init() {
    form.addEventListener('submit', handleSubmit);
}

// Form submission handler
function handleSubmit(event) {
    event.preventDefault();

    state.start = startInput.value.trim();
    state.end = endInput.value.trim();

    // Validation
    if (!state.start || !state.end) {
        showError('Please enter both starting location and destination');
        return;
    }

    clearError();
    compareRoutes(state.start, state.end);
}

// Main comparison logic
async function compareRoutes(start, end) {
    showLoadingState();

    try {
        // TODO: Implement real geocoding to convert addresses to coordinates
        // TODO: Replace simulated delay with actual API calls
        const results = await fetchAllProviders(start, end);

        state.results = results;
        const fastest = findFastestRoute(results);

        hideLoadingState();
        renderResults(results, fastest);
    } catch (error) {
        hideLoadingState();
        showError('Failed to fetch route data. Please try again.');
        console.error(error);
    }
}

// TODO: Fetch data from all providers using real APIs in parallel
async function fetchAllProviders(start, end) {
    // TODO: Remove simulated delay and implement actual API calls
    await delay(1500);

    return [
        { ...MOCK_DATA.google, id: 'google' },
        { ...MOCK_DATA.apple, id: 'apple' },
        { ...MOCK_DATA.waze, id: 'waze' }
    ];
}

// Find the fastest route
function findFastestRoute(results) {
    return results.reduce((fastest, current) => {
        return current.eta < fastest.eta ? current : fastest;
    });
}

// Render results
function renderResults(results, fastest) {
    resultsSection.hidden = false;
    resultsContainer.innerHTML = '';

    results.forEach(result => {
        const isFastest = result.id === fastest.id;
        const card = createResultCard(result, isFastest);
        resultsContainer.appendChild(card);
    });
}

// Create individual result card
function createResultCard(result, isFastest) {
    const article = document.createElement('article');
    article.setAttribute('role', 'listitem');
    article.dataset.provider = result.id;

    if (isFastest) {
        article.setAttribute('data-fastest', 'true');
        article.setAttribute('aria-label', `${result.provider} - Fastest route`);
    }

    const heading = document.createElement('h3');
    heading.textContent = result.provider;

    const eta = document.createElement('p');
    const etaStrong = document.createElement('strong');
    etaStrong.textContent = `${result.eta} ${result.unit}`;
    eta.appendChild(etaStrong);

    const distance = document.createElement('p');
    distance.textContent = result.distance;

    if (isFastest) {
        const badge = document.createElement('span');
        badge.setAttribute('aria-label', 'Fastest route');
        badge.textContent = '🏆 Fastest';
        article.appendChild(badge);
    }

    const link = document.createElement('a');
    link.href = generateDeepLink(result.id, state.start, state.end);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `Open in ${result.provider}`;

    article.appendChild(heading);
    article.appendChild(eta);
    article.appendChild(distance);
    article.appendChild(link);

    return article;
}

// Generate deep links for each provider
function generateDeepLink(provider, start, end) {
    const encodedStart = encodeURIComponent(start);
    const encodedEnd = encodeURIComponent(end);

    switch (provider) {
        case 'google':
            return `https://www.google.com/maps/dir/?api=1&origin=${encodedStart}&destination=${encodedEnd}`;
        case 'apple':
            return `https://maps.apple.com/?saddr=${encodedStart}&daddr=${encodedEnd}`;
        case 'waze':
            // TODO: Use coordinate format (ll.{lat},{lon}) when geocoding is implemented
            return `https://www.waze.com/live-map/directions?from=${encodedStart}&to=${encodedEnd}`;
        default:
            return '#';
    }
}

// UI State Management
function showLoadingState() {
    state.isLoading = true;
    loadingState.hidden = false;
    resultsContainer.innerHTML = '';
    form.querySelector('button[type="submit"]').disabled = true;
}

function hideLoadingState() {
    state.isLoading = false;
    loadingState.hidden = true;
    form.querySelector('button[type="submit"]').disabled = false;
}

function showError(message) {
    state.error = message;
    errorMessage.textContent = message;
    errorMessage.hidden = false;
}

function clearError() {
    state.error = null;
    errorMessage.textContent = '';
    errorMessage.hidden = true;
}

// Utility functions
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start the app
init();
