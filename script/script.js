"use strict";



const CONFIG = Object.assign(
    {
        dataUrl: "assests/data/events.json",
        storageKey: "bookstore-events",
        loadingDelay: 400
    },
    window.APP_CONFIG
);


const toast = document.getElementById("toast");
const eventList = document.getElementById("eventList");
const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");

const searchInput = document.getElementById("eventSearch");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearFiltersButton = document.getElementById("clearFilters");

const eventForm = document.getElementById("eventForm");
const submitButton = document.getElementById("submitEvent");
const formStatus = document.getElementById("formStatus");

const connectionStatus = document.getElementById("connectionStatus");

let events = [];
let currentCategory = "all";
let currentSearch = "";
let toastTimer = null;
let loadingTimer = null;


function showToast(message, type = "error") {
    toast.textContent = message;

    toast.className = "toast";
    toast.classList.add(type);
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function saveEvents() {
    try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(events));
    } catch (error) {
        console.error("Could not save events:", error);
    }
}

async function fetchDefaultEvents() {
    const response = await fetch(CONFIG.dataUrl);

    if (!response.ok) {
        throw new Error(`Failed to load ${CONFIG.dataUrl} (${response.status})`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error(`${CONFIG.dataUrl} did not contain a list of events`);
    }

       return data.map((item, index) => ({
        ...item,
        id: item.id || `event-default-${index}`
    }));
}

async function loadEvents() {
    let saved = null;

    try {
        saved = parseStoredEvents(localStorage.getItem(CONFIG.storageKey));
    } catch (error) {
        console.error("Could not read saved events:", error);
    }

    if (saved) {
        events = saved;
        return events;
    }

    events = await fetchDefaultEvents();
    saveEvents();

    return events;
}


function trackInteraction(action) {
    console.log(
        `[Analytics] User interacted with Independent Bookstore Events Page - ${action}`
    );
}

function updateConnectionStatus() {
    if (!connectionStatus) {
        return;
    }

    const text = connectionStatus.querySelector("span:last-child");

    if (navigator.onLine) {
        connectionStatus.classList.remove("offline");

        if (text) {
            text.textContent = "Online";
        }
    } else {
        connectionStatus.classList.add("offline");

        if (text) {
            text.textContent = "Offline";
        }
    }
}

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);

function showLoading() {
    loadingState.hidden = false;
    eventList.hidden = true;
    emptyState.hidden = true;
}

function hideLoading() {
    clearTimeout(loadingTimer);
    loadingTimer = null;
    loadingState.hidden = true;
}
function showLoadingIfSlow() {
    clearTimeout(loadingTimer);
    loadingTimer = setTimeout(showLoading, CONFIG.loadingDelay);
}

function createEventCard(event) {
    const article = document.createElement("article");

    article.className = "event-card";

    const formattedDate = formatDate(event.date);

    article.innerHTML = `
        <div class="event-card-top">

            <div class="event-date">
                <span class="event-day">
                    ${escapeHTML(formattedDate.day)}
                </span>

                <span class="event-month">
                    ${escapeHTML(formattedDate.month)}
                </span>
            </div>

            <span class="event-category">
                ${escapeHTML(getCategoryLabel(event.category))}
            </span>

        </div>

        <div class="event-card-body">

            <h3>
                ${escapeHTML(event.name)}
            </h3>

            <div class="event-meta">

                <span>
                    <span aria-hidden="true">◷</span>
                    ${escapeHTML(formatTime(event.time))}
                </span>

                <span>
                    <span aria-hidden="true">✦</span>
                    ${escapeHTML(event.host)}
                </span>

                <span>
                    <span aria-hidden="true">⌖</span>
                    ${escapeHTML(event.location)}
                </span>

            </div>

        </div>

               <div class="event-card-footer">
            <span>${escapeHTML(getCategoryLabel(event.category))}</span>

            <button
                type="button"
                class="delete-btn"
                data-id="${escapeHTML(event.id)}"
                aria-label="Delete event: ${escapeHTML(event.name)}"
            >
                <span aria-hidden="true">🗑</span> Delete
            </button>
        </div>
    `;

    return article;
}

function renderEvents(list) {
    eventList.innerHTML = "";

    if (list.length === 0) {
        eventList.hidden = true;
        emptyState.hidden = false;
        return;
    }

    eventList.hidden = false;
    emptyState.hidden = true;

    const fragment = document.createDocumentFragment();

    list.forEach((event) => {
        fragment.appendChild(createEventCard(event));
    });

    eventList.appendChild(fragment);
}

function applyFilters() {
    renderEvents(filterEvents(events, currentCategory, currentSearch));
}
function deleteEvent(id) {
    const target = events.find((item) => String(item.id) === String(id));

    if (!target) {
        return;
    }

    const confirmed = window.confirm(
        `Delete "${target.name}"? This cannot be undone.`
    );

    if (!confirmed) {
        return;
    }

    events = events.filter((item) => String(item.id) !== String(id));

    saveEvents();
    applyFilters();

    showToast("Event deleted.", "success");
    trackInteraction(`Event deleted: ${target.name}`);
}


eventList.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-btn");

    if (!button) {
        return;
    }

    deleteEvent(button.dataset.id);
});

function setActiveFilterButton(category) {
    filterButtons.forEach((button) => {
        const isActive = (button.dataset.category || "all") === category;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

searchInput.addEventListener("input", (event) => {
    currentSearch = sanitizeText(event.target.value);
    applyFilters();
});

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentCategory = button.dataset.category || "all";

        setActiveFilterButton(currentCategory);

        trackInteraction(`Category filter: ${currentCategory}`);

        applyFilters();
    });
});

clearFiltersButton.addEventListener("click", () => {
    searchInput.value = "";

    currentSearch = "";
    currentCategory = "all";

    setActiveFilterButton("all");

    trackInteraction("Filters cleared");

    applyFilters();
});


const fields = {
    eventName: {
        input: document.getElementById("eventName"),
        error: document.getElementById("eventNameError")
    },
    eventCategory: {
        input: document.getElementById("eventCategory"),
        error: document.getElementById("eventCategoryError")
    },
    eventDate: {
        input: document.getElementById("eventDate"),
        error: document.getElementById("eventDateError")
    },
    eventTime: {
        input: document.getElementById("eventTime"),
        error: document.getElementById("eventTimeError")
    },
    eventHost: {
        input: document.getElementById("eventHost"),
        error: document.getElementById("eventHostError")
    },
    eventLocation: {
        input: document.getElementById("eventLocation"),
        error: document.getElementById("eventLocationError")
    }
};

function clearFieldError(field) {
    field.input.setAttribute("aria-invalid", "false");
    field.error.textContent = "";
}

function showFieldError(field, message) {
    field.input.setAttribute("aria-invalid", "true");
    field.error.textContent = message;
}

function validateForm() {
    Object.values(fields).forEach(clearFieldError);

    const result = validateEventData({
        name: fields.eventName.input.value,
        category: fields.eventCategory.input.value,
        date: fields.eventDate.input.value,
        time: fields.eventTime.input.value,
        host: fields.eventHost.input.value,
        location: fields.eventLocation.input.value
    });

    Object.entries(result.errors).forEach(([key, message]) => {
        showFieldError(fields[key], message);
    });

    return result;
}

eventForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    formStatus.textContent = "";

    const validation = validateForm();

    if (!validation.isValid) {
        formStatus.textContent = "Please correct the highlighted fields.";
        formStatus.setAttribute("role", "alert");

        showToast("Please fill in all required fields.", "error");

        trackInteraction("Invalid form submission");

        return;
    }

    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    submitButton.textContent = "Adding Event...";

    formStatus.textContent = "Saving event...";

    // Simulated network delay (no backend yet)
    await new Promise((resolve) => {
        setTimeout(resolve, 800);
    });

    events.push({
        id: `event-${Date.now()}`,
        ...validation.data
    });

    saveEvents();

    eventForm.reset();

    Object.values(fields).forEach(clearFieldError);

    formStatus.removeAttribute("role");
    formStatus.textContent = "Event added successfully.";

    // Shown only after the event has actually been saved
    showToast("Event added successfully!", "success");

    submitButton.disabled = false;
    submitButton.setAttribute("aria-busy", "false");
    submitButton.textContent = "Add Event";

    currentSearch = "";
    currentCategory = "all";

    searchInput.value = "";

    setActiveFilterButton("all");

    applyFilters();

    trackInteraction("Event added successfully");
});

Object.values(fields).forEach((field) => {
    const clearIfInvalid = () => {
        if (field.input.getAttribute("aria-invalid") === "true") {
            clearFieldError(field);
        }
    };

    field.input.addEventListener("input", clearIfInvalid);
    field.input.addEventListener("change", clearIfInvalid);
});


async function initializeApp() {
    updateConnectionStatus();

    showLoadingIfSlow();

    try {
        await loadEvents();
    } catch (error) {
        console.error("Could not load events:", error);
        events = [];
        showToast("Could not load events. Please try again later.", "error");
    }

    hideLoading();

    applyFilters();
}

initializeApp();
