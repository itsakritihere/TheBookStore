"use strict";

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const { validateEventData } = require("../script/utils");

const valid = {
    name: "Poetry Night",
    category: "reading",
    date: "2026-12-01",
    time: "18:00",
    host: "Rhea",
    location: "Main Hall"
};

describe("validateEventData", () => {
    test("accepts a complete, valid event", () => {
        const result = validateEventData(valid);

        assert.equal(result.isValid, true);
        assert.deepEqual(result.errors, {});
        assert.deepEqual(result.data, valid);
    });

    test("reports every missing field", () => {
        const result = validateEventData({});

        assert.equal(result.isValid, false);
        assert.deepEqual(Object.keys(result.errors).sort(), [
            "eventCategory",
            "eventDate",
            "eventHost",
            "eventLocation",
            "eventName",
            "eventTime"
        ]);
    });

    test("rejects names shorter than 3 characters", () => {
        const result = validateEventData({ ...valid, name: "Hi" });

        assert.match(result.errors.eventName, /at least 3/);
    });

    test("rejects hosts and locations shorter than 2 characters", () => {
        const result = validateEventData({ ...valid, host: "A", location: "B" });

        assert.match(result.errors.eventHost, /at least 2/);
        assert.match(result.errors.eventLocation, /at least 2/);
    });

    test("rejects an unknown category", () => {
        const result = validateEventData({ ...valid, category: "party" });

        assert.match(result.errors.eventCategory, /valid category/);
    });

    test("rejects an invalid date", () => {
        const result = validateEventData({ ...valid, date: "2026-99-99" });

        assert.match(result.errors.eventDate, /valid date/);
    });

    test("sanitizes and trims text before validating", () => {
        const result = validateEventData({ ...valid, name: "  <Poetry>  ", host: "  <b>  " });

        assert.equal(result.data.name, "Poetry");
        assert.equal(result.data.host, "b");
        assert.equal(result.errors.eventName, undefined);
        assert.match(result.errors.eventHost, /at least 2/);
    });

    test("treats whitespace-only text as missing", () => {
        const result = validateEventData({ ...valid, name: "     " });

        assert.match(result.errors.eventName, /enter an event name/);
    });
});
