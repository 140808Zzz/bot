// watch-tracker-plain.js — oddiy skript (export yo'q), konsol ilovalarida ishlaydi.
// Hech qanday login, OTP, parol yoki sessiya ma'lumoti saqlanmaydi.

// ---------- Saqlash ----------
function makeStorage(key) {
    key = key || "watch-log-v1";
    var ls = null;
    try {
        ls = window.localStorage;
        ls.setItem("__t", "1");
        ls.removeItem("__t");
    } catch (e) {
        ls = null;
    }
    if (ls) {
        return {
            load: function () {
                try { return JSON.parse(ls.getItem(key)) || []; }
                catch (e) { return []; }
            },
            save: function (rows) {
                try { ls.setItem(key, JSON.stringify(rows)); } catch (e) {}
            }
        };
    }
    var mem = [];
    return { load: function () { return mem; }, save: function (r) { mem = r; } };
}

// ---------- 1. Kundalik ----------
function WatchLog(storage) {
    this.storage = storage || makeStorage();
    this.rows = this.storage.load();
}

WatchLog.prototype.add = function (e) {
    var seconds = Number(e.seconds);
    if (!(seconds >= 0)) throw new Error("seconds musbat son bo'lishi kerak");
    var row = {
        at: new Date().toISOString(),
        title: e.title || "",
        seconds: seconds,
        bonus: Number(e.bonus) || 0,
        note: e.note || ""
    };
    this.rows.push(row);
    this.storage.save(this.rows);
    return row;
};

WatchLog.prototype.summary = function () {
    var seconds = 0, bonus = 0;
    this.rows.forEach(function (r) { seconds += r.seconds; bonus += r.bonus; });
    return {
        count: this.rows.length,
        minutes: Math.round(seconds / 60),
        bonus: bonus,
        perHour: seconds ? Number((bonus / (seconds / 3600)).toFixed(2)) : 0
    };
};

WatchLog.prototype.byDay = function () {
    var days = {};
    this.rows.forEach(function (r) {
        var d = r.at.slice(0, 10);
        if (!days[d]) days[d] = { seconds: 0, bonus: 0 };
        days[d].seconds += r.seconds;
        days[d].bonus += r.bonus;
    });
    return days;
};

// ---------- Sinov (konsolda natija ko'rinadi) ----------
(function demo() {
    var log = new WatchLog();
    log.add({ title: "Video 1", seconds: 95, bonus: 0.2 });
    log.add({ title: "Video 2", seconds: 120, bonus: 0.3 });
    console.log("Xulosa:", JSON.stringify(log.summary()));
    console.log("Kunlar:", JSON.stringify(log.byDay()));
})();
