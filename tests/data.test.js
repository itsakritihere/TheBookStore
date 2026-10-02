"use strict";


const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const { validateEventData } = require("../script/utils");

const root = path.join(__dirname, "..");

describe("assests/data/events.json", () => {
    const events = JSON.parse(
        fs.readFileSync(path.join(root, "assests/data/events.json"), "utf8")
    );

    test("is a non-empty array", () => {
        assert.ok(Array.isArray(events));
        assert.ok(events.length > 0);
    });

    test("every event has a unique id", () => {
        const ids = events.map((event) => event.id);
        assert.equal(new Set(ids).size, ids.length);
    });

    test("every event passes form validation rules", () => {
        events.forEach((event) => {
            const result = validateEventData({
                name: event.name,
                category: event.category,
                date: event.date,
                time: event.time,
                host: event.host,
                location: event.location
            });

            assert.equal(result.isValid, true, `${event.id}: ${JSON.stringify(result.errors)}`);
        });
    });
});

describe("config.js", () => {
    const sandbox = { window: {} };

    vm.runInNewContext(
        fs.readFileSync(path.join(root, "config.js"), "utf8"),
        sandbox
    );

    const config = sandbox.window.APP_CONFIG;

    test("defines the required settings", () => {
        assert.equal(typeof config.dataUrl, "string");
        assert.equal(typeof config.storageKey, "string");
        assert.equal(typeof config.loadingDelay, "number");
    });

    test("points at a data file that exists", () => {
        assert.ok(fs.existsSync(path.join(root, config.dataUrl)));
    });
});
