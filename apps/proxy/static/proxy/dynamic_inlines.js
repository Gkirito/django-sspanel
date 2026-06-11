(function () {
    "use strict";

    // Map node_type values to inline formset prefixes (server-side group names).
    // Mirrors apps/proxy/admin.py get_inlines() and StackedInline definitions.
    var NODE_TYPE_TO_INLINE_PREFIX = {
        ss: "ss_config",
        trojan: "trojan_config",
        hysteria2: "hysteria_config",
        anytls: "anytls_config",
    };

    var ALWAYS_VISIBLE_PREFIXES = ["occupancy_config"];

    // XRAY_NODE_TYPES mirrors apps/proxy/models.py NODE_TYPE_SS/TROJAN/SSR/VMESS/VLESS
    var XRAY_NODE_TYPES = ["ss", "trojan", "ssr", "vmess", "vless"];

    // ---- helpers ----

    function escapeSelector(str) {
        if (window.CSS && CSS.escape) {
            return CSS.escape(str);
        }
        return str.replace(/([!"#$%&'()*+,-./:;<=>?@[\]^`{|}~])/g, "\\$1");
    }

    function groupSelector(prefix) {
        return "#" + escapeSelector(prefix + "-group");
    }

    function hasAdminErrors(el) {
        if (!el) return false;
        return el.querySelector(".errorlist, .errors, .errornote") !== null;
    }

    function setElementVisible(el, visible) {
        if (!el) return;
        var shouldShow = visible || hasAdminErrors(el);
        el.hidden = !shouldShow;
        el.setAttribute("aria-hidden", shouldShow ? "false" : "true");
        el.style.display = shouldShow ? "" : "none";
    }

    // ---- fieldset visibility ----

    function updateXrayFieldsetVisibility(nodeType) {
        var type = nodeType;
        if (type === undefined || type === null) {
            var sel = document.getElementById("id_node_type");
            if (!sel) return;
            type = sel.value;
        }
        var showXray = XRAY_NODE_TYPES.indexOf(type) !== -1;
        var fieldset = document.querySelector("fieldset.xray-fieldset");
        setElementVisible(fieldset, showXray);
    }

    // ---- inline formset visibility ----

    function setGroupVisible(prefix, visible) {
        var group = document.querySelector(groupSelector(prefix));
        if (!group) return;
        var shouldShow = visible || hasAdminErrors(group);
        group.hidden = !shouldShow;
        group.setAttribute("aria-hidden", shouldShow ? "false" : "true");
        group.style.display = shouldShow ? "" : "none";
    }

    function updateInlineVisibility(nodeType) {
        var type = nodeType;
        if (type === undefined || type === null) {
            var sel = document.getElementById("id_node_type");
            if (!sel) return;
            type = sel.value;
        }
        var activePrefix = NODE_TYPE_TO_INLINE_PREFIX[type];

        Object.values(NODE_TYPE_TO_INLINE_PREFIX).forEach(function (prefix) {
            setGroupVisible(prefix, prefix === activePrefix);
        });

        ALWAYS_VISIBLE_PREFIXES.forEach(function (prefix) {
            setGroupVisible(prefix, true);
        });
    }

    // ---- initialization ----

    function refreshAll() {
        var sel = document.getElementById("id_node_type");
        if (!sel) return;
        updateInlineVisibility(sel.value);
        updateXrayFieldsetVisibility(sel.value);
    }

    function init() {
        var nodeTypeSelect = document.getElementById("id_node_type");
        if (!nodeTypeSelect) return;

        nodeTypeSelect.addEventListener("change", function (e) {
            updateInlineVisibility(e.target.value);
            updateXrayFieldsetVisibility(e.target.value);
        });

        document.addEventListener("formset:added", refreshAll);

        refreshAll();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
