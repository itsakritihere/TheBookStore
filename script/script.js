"use strict";


const defaultEvents = [
    {
        id: "event-1",
        name: "An Evening with Arundhati Roy",
        category: "author-talk",
        date: "2026-10-05",
        time: "18:30",
        host: "Arundhati Roy",
        location: "Main Reading Room"
    },
    {
        id: "event-2",
        name: "Sunday Poetry Reading",
        category: "reading",
        date: "2026-10-11",
        time: "17:00",
        host: "Rhea Kapoor",
        location: "Poetry Corner"
    },
    {
        id: "event-3",
        name: "Creative Writing Workshop",
        category: "workshop",
        date: "2026-10-18",
        time: "11:00",
        host: "Kabir Mehta",
        location: "Workshop Studio"
    },
    {
        id: "event-4",
        name: "Community Book Club",
        category: "community",
        date: "2026-10-22",
        time: "16:00",
        host: "Meera Sharma",
        location: "Community Hall"
    },
    {
        id: "event-5",
        name: "Meet the Author: The Himalayan Trail",
        category: "author-talk",
        date: "2026-10-28",
        time: "18:00",
        host: "Aarav Joshi",
        location: "Main Reading Room"
    },
    {
        id: "event-6",
        name: "Children's Storytelling Afternoon",
        category: "reading",
        date: "2026-11-02",
        time: "15:30",
        host: "Nisha Verma",
        location: "Children's Section"
    }
];

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


function showLoading() {
    loadingState.hidden = false;
    eventList.hidden = true;
    emptyState.hidden = true;
}

function hideLoading() {
    loadingState.hidden = true;
    eventList.hidden = false;
}



function getCategoryLabel(category) {
    const categories = {
        "author-talk": "Author Talk",
        "reading": "Reading",
        "workshop": "Workshop",
        "community": "Community"
    };

    return categories[category] || "Event";
}


function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return {
            day: "--",
            month: "Unknown"
        };
    }

    return {
        day: date.toLocaleDateString("en-US", {
            day: "2-digit"
        }),

        month: date.toLocaleDateString("en-US", {
            month: "short"
        })
    };
}



function formatTime(timeString) {
    if (!timeString) {
        return "Time unavailable";
    }

    const [hours, minutes] = timeString.split(":");

    const date = new Date();

    date.setHours(
        Number(hours),
        Number(minutes),
        0,
        0
    );

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
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
        const card = createEventCard(event);

        fragment.appendChild(card);
    });

    eventList.appendChild(fragment);
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
            ${escapeHTML(getCategoryLabel(event.category))}
        </div>
    `;

    return article;
}



function getFilteredEvents() {
    const searchTerm = currentSearch
        .toLowerCase()
        .trim();

    return events.filter((event) => {

        const matchesCategory =
            currentCategory === "all" ||
            event.category === currentCategory;

        const searchableText = [
            event.name,
            event.host,
            event.location,
            getCategoryLabel(event.category)
        ]
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            searchTerm === "" ||
            searchableText.includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

}
function applyFilters() {
    showLoading();

   
    setTimeout(() => {
        const filteredEvents = getFilteredEvents();

        hideLoading();

        renderEvents(filteredEvents);

    }, 250);
}



searchInput.addEventListener("input", (event) => {

    currentSearch = sanitizeText(event.target.value);

    applyFilters();

});



filterButtons.forEach((button) => {

    button.addEventListener("click", () => {

        currentCategory =
            button.dataset.category || "all";

        filterButtons.forEach((filterButton) => {

            const isActive =
                filterButton === button;

            filterButton.classList.toggle(
                "active",
                isActive
            );

            filterButton.setAttribute(
                "aria-pressed",
                String(isActive)
            );
        });

        trackInteraction(
            `Category filter: ${currentCategory}`
        );

        applyFilters();
    });

});


clearFiltersButton.addEventListener("click", () => {

    searchInput.value = "";

    currentSearch = "";
    currentCategory = "all";

    filterButtons.forEach((button) => {

        const isAll =
            button.dataset.category === "all";

        button.classList.toggle(
            "active",
            isAll
        );

        button.setAttribute(
            "aria-pressed",
            String(isAll)
        );
    });

    trackInteraction("Filters cleared");

    applyFilters();
});



const fields = {
    eventName: {
        input: document.getElementById("eventName"),
        error: document.getElementById("eventNameError"),
        label: "Event name"
    },

    eventCategory: {
        input: document.getElementById("eventCategory"),
        error: document.getElementById("eventCategoryError"),
        label: "Category"
    },

    eventDate: {
        input: document.getElementById("eventDate"),
             error: document.getElementById("eventDateError"),
        label: "Date"
    },

    eventTime: {
        input: document.getElementById("eventTime"),
        error: document.getElementById("eventTimeError"),
        label: "Time"
    },

        eventHost: {
            input: document.getElementById("eventHost"),
            error: document.getElementById("eventHostError"),
            label: "Host / Author"
        },

    eventLocation: {
        input: document.getElementById("eventLocation"),
        error: document.getElementById("eventLocationError"),
        label: "Location"
    }
};



function clearFieldError(field) {

    field.input.setAttribute(
        "aria-invalid",
        "false"
    );

    field.error.textContent = "";
}



function showFieldError(field, message) {

    field.input.setAttribute(
        "aria-invalid",
        "true"
    );

    field.error.textContent = message;
}


function validateForm() {

    let isValid = true;

    Object.values(fields).forEach(clearFieldError);

    const name = sanitizeText(
        fields.eventName.input.value
    );

    const category =
        fields.eventCategory.input.value;

    const date =
        fields.eventDate.input.value;

    const time =
        fields.eventTime.input.value;

    const host = sanitizeText(
        fields.eventHost.input.value
    );

    const location = sanitizeText(
        fields.eventLocation.input.value
    );




    if (!name) {

        showFieldError(
            fields.eventName,
            "Please enter an sevent name."
        );

        isValid = false;

    } else if (name.length < 3) {

        showFieldError(
            fields.eventName,
            "Event name must contain at least some characters."
        );

        isValid = false;
    }



    if (!category) {

        showFieldError(
            fields.eventCategory,
            "Please select a category."
        );

        isValid = false;
    }


 

    if (!date) {

        showFieldError(
            fields.eventDate,
            "Please select an event date."
        );

        isValid = false;

    } else {

        const selectedDate =
            new Date(`${date}T00:00:00`);

        if (Number.isNaN(selectedDate.getTime())) {

            showFieldError(
                fields.eventDate,
                "Please enter a valid date."
            );

            isValid = false;
        }
    }




    if (!time) {

        showFieldError(
            fields.eventTime,
            "Please select an event time."
        );

        isValid = false;
    }




    if (!host) {

        showFieldError(
            fields.eventHost,
            "Please enter the host or author name."
        );

        isValid = false;

    } else if (host.length < 2) {

        showFieldError(
            fields.eventHost,
            "Host name must contain at least 2 characters."
        );

        isValid = false;
    }


    
    if (!location) {

        showFieldError(
            fields.eventLocation,
            "Please enter the event location."
        );

        isValid = false;

    } else if (location.length < 2) {

        showFieldError(
            fields.eventLocation,
            "Location must contain at least 2 characters."
        );

        isValid = false;
    }


    return {
        isValid,
        data: {
            name,
            category,
            date,
            time,
            host,
            location
        }
    };
}



eventForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    formStatus.textContent = "";

    const validation =
        validateForm();

    if (!validation.isValid) {

        formStatus.textContent =
            "Please correct the highlighted wornf fields.";

        formStatus.setAttribute(
            "role",
            "alert"
        );


        trackInteraction("Invalid form submission");

        return;
    }




    submitButton.disabled = true;
    submitButton.setAttribute(
        "aria-busy",
        "true"
    );

    submitButton.textContent =
        "Adding Event...";

    formStatus.textContent =
        "Saving event...";


   

    await new Promise((resolve) => {
        setTimeout(resolve, 800);
    });


    const newEvent = {
        id: `event-${Date.now()}`,
        name: validation.data.name,
        category: validation.data.category,
        date: validation.data.date,
        time: validation.data.time,
        host: validation.data.host,
        location: validation.data.location
    };


    events.push(newEvent);

    saveEvents();




    eventForm.reset();

    Object.values(fields).forEach(clearFieldError);

    formStatus.removeAttribute("role");

    formStatus.textContent =
        "Event added successfully.";



    submitButton.disabled = false;

    submitButton.setAttribute(
        "aria-busy",
        "false"
    );

    submitButton.textContent =
        "Add Event";




    currentSearch = "";
    currentCategory = "all";

    searchInput.value = "";

    filterButtons.forEach((button) => {

        const isAll =
            button.dataset.category === "all";

        button.classList.toggle(
            "active",
            isAll
        );

        button.setAttribute(
            "aria-pressed",
            String(isAll)
        );
    });

    applyFilters();

    trackInteraction("Event added successfully");
});



Object.values(fields).forEach((field) => {

    field.input.addEventListener("input", () => {

        if (
            field.input.getAttribute("aria-invalid") === "true"
        ) {
            clearFieldError(field);
        }
    });

    field.input.addEventListener("change", () => {

        if (
            field.input.getAttribute("aria-invalid") === "true"
        ) {
            clearFieldError(field);
        }
    });
});


function initializeApp() {

    updateConnectionStatus();

    loadEvents();

    showLoading();

   
    setTimeout(() => {

        hideLoading();

        renderEvents(
            getFilteredEvents()
        );

    }, 500);
}

