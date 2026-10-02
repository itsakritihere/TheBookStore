"use strict";


const CATEGORY_LABELS = {
    "author-talk": "Author Talk",
    "book-launch": "Book Launch",
    "reading": "Reading",
    "workshop": "Workshop",
    "community": "Community"
};

function sanitizeText(value) {
    return String(value ?? "")
        .replace(/[<>]/g, "")
        .trim();
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getCategoryLabel(category) {
    return CATEGORY_LABELS[category] || "Event";
}

function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return { day: "--", month: "Unknown" };
    }

    return {
        day: date.toLocaleDateString("en-US", { day: "2-digit" }),
        month: date.toLocaleDateString("en-US", { month: "short" })
    };
}

function formatTime(timeString) {
    if (!timeString) {
        return "Time unavailable";
    }

    const [hours, minutes] = String(timeString).split(":").map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return "Time unavailable";
    }

    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;

    return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function filterEvents(events, category, search) {
    const term = String(search ?? "").toLowerCase().trim();

    return events.filter((event) => {
        const matchesCategory =
            category === "all" || event.category === category;

        const searchableText = [
            event.name,
            event.host,
            event.location,
            getCategoryLabel(event.category)
        ]
            .join(" ")
            .toLowerCase();

        return matchesCategory && (term === "" || searchableText.includes(term));
    });
}


function validateEventData(raw) {
    const data = {
        name: sanitizeText(raw.name),
        category: raw.category || "",
        date: raw.date || "",
        time: raw.time || "",
        host: sanitizeText(raw.host),
        location: sanitizeText(raw.location)
    };

    const errors = {};

    if (!data.name) {
        errors.eventName = "Please enter an event name.";
    } else if (data.name.length < 3) {
        errors.eventName = "Event name must contain at least 3 characters.";
    }

    if (!data.category) {
        errors.eventCategory = "Please select a category.";
    } else if (!CATEGORY_LABELS[data.category]) {
        errors.eventCategory = "Please select a valid category.";
    }

    if (!data.date) {
        errors.eventDate = "Please select an event date.";
    } else if (Number.isNaN(new Date(`${data.date}T00:00:00`).getTime())) {
        errors.eventDate = "Please enter a valid date.";
    }

    if (!data.time) {
        errors.eventTime = "Please select an event time.";
    }

    if (!data.host) {
        errors.eventHost = "Please enter the host or author name.";
    } else if (data.host.length < 2) {
        errors.eventHost = "Host name must contain at least 2 characters.";
    }

    if (!data.location) {
        errors.eventLocation = "Please enter the event location.";
    } else if (data.location.length < 2) {
        errors.eventLocation = "Location must contain at least 2 characters.";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        data
    };
}


function parseStoredEvents(raw) {
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : null;
    } catch (error) {
        return null;
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        sanitizeText,
        escapeHTML,
        getCategoryLabel,
        formatDate,
        formatTime,
        filterEvents,
        validateEventData,
        parseStoredEvents
    };
}
