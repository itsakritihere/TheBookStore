"use strict";

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const {
    sanitizeText,
    escapeHTML,
    getCategoryLabel,
    formatDate,
    formatTime,
    filterEvents,
    parseStoredEvents
} = require("../script/utils");

const sample = [
    { name: "Sunday Poetry Reading", category: "reading", host: "Rhea Kapoor", location: "Poetry Corner" },
    { name: "Creative Writing Workshop", category: "workshop", host: "Kabir Mehta", location: "Workshop Studio" },
    { name: "Author Talk Night", category: "author-talk", host: "Aarav Joshi", location: "Main Reading Room" }
];

describe("sanitizeText", () => {
    test("trims whitespace", () => {
        assert.equal(sanitizeText("  hello  "), "hello");
    });

    test("removes angle brackets", () => {
        assert.equal(sanitizeText("<b>Hi</b>"), "bHi/b");
    });

    test("handles null and undefined", () => {
        assert.equal(sanitizeText(null), "");
        assert.equal(sanitizeText(undefined), "");
    });
});

describe("escapeHTML", () => {
    test("escapes tags and quotes", () => {
        assert.equal(
            escapeHTML(`<img src="x" onerror='y'>`),
            "&lt;img src=&quot;x&quot; onerror=&#39;y&#39;&gt;"
        );
    });

    test("escapes ampersands first", () => {
        assert.equal(escapeHTML("Tom & Jerry"), "Tom &amp; Jerry");
    });

    test("never leaves a raw <script> tag", () => {
        assert.ok(!escapeHTML("<script>alert(1)</script>").includes("<script>"));
    });
});

describe("getCategoryLabel", () => {
    test("returns known labels", () => {
        assert.equal(getCategoryLabel("author-talk"), "Author Talk");
        assert.equal(getCategoryLabel("book-launch"), "Book Launch");
        assert.equal(getCategoryLabel("workshop"), "Workshop");
    });

    test("falls back to Event for unknown categories", () => {
        assert.equal(getCategoryLabel("nope"), "Event");
        assert.equal(getCategoryLabel(undefined), "Event");
    });
});

describe("formatDate", () => {
    test("formats a valid date", () => {
        assert.deepEqual(formatDate("2026-10-05"), { day: "05", month: "Oct" });
    });

    test("returns placeholders for an invalid date", () => {
        assert.deepEqual(formatDate("garbage"), { day: "--", month: "Unknown" });
    });
});

describe("formatTime", () => {
    test("formats afternoon times", () => {
        assert.equal(formatTime("18:30"), "6:30 PM");
    });

    test("formats morning times", () => {
        assert.equal(formatTime("11:00"), "11:00 AM");
    });

    test("handles midnight and noon", () => {
        assert.equal(formatTime("00:05"), "12:05 AM");
        assert.equal(formatTime("12:00"), "12:00 PM");
    });

    test("handles empty or malformed input", () => {
        assert.equal(formatTime(""), "Time unavailable");
        assert.equal(formatTime("abc"), "Time unavailable");
    });
});

describe("filterEvents", () => {
    test("returns everything for 'all' and empty search", () => {
        assert.equal(filterEvents(sample, "all", "").length, 3);
    });

    test("filters by category", () => {
        const result = filterEvents(sample, "workshop", "");
        assert.equal(result.length, 1);
        assert.equal(result[0].name, "Creative Writing Workshop");
    });

    test("searches name, host, location and category label (case-insensitive)", () => {
        assert.equal(filterEvents(sample, "all", "POETRY").length, 1);
        assert.equal(filterEvents(sample, "all", "aarav").length, 1);
        assert.equal(filterEvents(sample, "all", "studio").length, 1);
        assert.equal(filterEvents(sample, "all", "author talk").length, 1);
    });

    test("combines category and search", () => {
        assert.equal(filterEvents(sample, "reading", "poetry").length, 1);
        assert.equal(filterEvents(sample, "workshop", "poetry").length, 0);
    });

    test("returns an empty list when nothing matches", () => {
        assert.deepEqual(filterEvents(sample, "all", "zzz"), []);
    });

    test("does not mutate the input array", () => {
        const copy = [...sample];
        filterEvents(sample, "workshop", "");
        assert.deepEqual(sample, copy);
    });
});

describe("parseStoredEvents", () => {
    test("parses a valid JSON array", () => {
        assert.deepEqual(parseStoredEvents('[{"id":"a"}]'), [{ id: "a" }]);
    });

    test("returns null for empty, invalid or non-array data", () => {
        assert.equal(parseStoredEvents(null), null);
        assert.equal(parseStoredEvents(""), null);
        assert.equal(parseStoredEvents("{not json"), null);
        assert.equal(parseStoredEvents('{"a":1}'), null);
    });
});
