const modal = document.getElementById("project-modal");
const projectForm = document.getElementById("project-form");
const projectList = document.getElementById("project-list");
const toastRegion = document.getElementById("toast-region");
const chartLine = document.getElementById("chart-line");
const chartAreaFill = document.getElementById("chart-area-fill");
const chartLabels = document.getElementById("chart-labels");
const sidebar = document.getElementById("sidebar");
const mobileMenu = document.getElementById("mobile-menu");
let projectCount = projectList.rows.length;
let previouslyFocusedElement = null;
let toastTimeout;

const chartRanges = {
    "7d": {
        total: "2,847",
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        description: "Compute usage has increased steadily over the last seven days",
        path: "M0 137 C33 125 46 126 78 117 S119 131 156 112 S202 98 234 109 S282 77 312 85 S351 98 390 67 S435 78 468 60 S513 73 546 47 S593 58 624 35 S665 40 700 19"
    },
    "30d": {
        total: "11,420",
        labels: ["Oct 1", "Oct 5", "Oct 10", "Oct 15", "Oct 20", "Oct 25", "Today"],
        description: "Compute usage over the last thirty days",
        path: "M0 127 C38 113 40 134 78 116 S116 88 156 101 S198 105 234 81 S276 99 312 70 S352 83 390 66 S430 91 468 57 S508 70 546 44 S586 55 624 31 S665 43 700 16"
    },
    "90d": {
        total: "34,782",
        labels: ["Aug 1", "Aug 15", "Sep 1", "Sep 15", "Oct 1", "Oct 15", "Today"],
        description: "Compute usage over the last ninety days",
        path: "M0 154 C35 147 47 127 78 135 S118 113 156 120 S194 94 234 101 S274 83 312 91 S352 67 390 74 S430 59 468 65 S508 42 546 51 S586 38 624 42 S665 23 700 14"
    }
};

function showToast(title, detail) {
    const toast = document.createElement("div");
    toast.className = "toast";

    const icon = document.createElement("span");
    icon.className = "toast-icon";
    icon.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>';

    const copy = document.createElement("span");
    copy.className = "toast-copy";
    const heading = document.createElement("strong");
    heading.textContent = title;
    const message = document.createElement("span");
    message.textContent = detail;
    copy.append(heading, message);

    const dismiss = document.createElement("button");
    dismiss.className = "toast-dismiss";
    dismiss.type = "button";
    dismiss.setAttribute("aria-label", "Dismiss notification");
    dismiss.textContent = "×";
    dismiss.addEventListener("click", () => toast.remove());

    toast.append(icon, copy, dismiss);
    toastRegion.replaceChildren(toast);
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.remove(), 4800);
}

function openProjectModal() {
    previouslyFocusedElement = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("project-name-input").focus();
}

function closeProjectModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
    }
}

function createProjectRow(name, region) {
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const row = document.createElement("tr");
    const projectCell = document.createElement("td");
    const projectName = document.createElement("div");
    projectName.className = "project-name";
    const symbol = document.createElement("span");
    symbol.className = "project-symbol symbol-indigo";
    symbol.textContent = name.trim().charAt(0).toUpperCase();
    const projectDetails = document.createElement("span");
    const projectTitle = document.createElement("strong");
    projectTitle.textContent = name.trim();
    const projectSlug = document.createElement("small");
    projectSlug.textContent = slug || "new-project";
    projectDetails.append(projectTitle, projectSlug);
    projectName.append(symbol, projectDetails);
    projectCell.append(projectName);

    const statusCell = document.createElement("td");
    const status = document.createElement("span");
    status.className = "status-badge building";
    const statusDot = document.createElement("i");
    const statusText = document.createTextNode("Provisioning");
    status.append(statusDot, statusText);
    statusCell.append(status);

    const regionCell = document.createElement("td");
    regionCell.textContent = region;
    const deployedCell = document.createElement("td");
    deployedCell.textContent = "Just now";
    const spendCell = document.createElement("td");
    spendCell.className = "spend-value";
    spendCell.textContent = "—";
    const actionCell = document.createElement("td");
    const deployButton = document.createElement("button");
    deployButton.className = "row-action deploy-action";
    deployButton.type = "button";
    deployButton.dataset.project = name.trim();
    deployButton.append(document.createTextNode("Deploy "));
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    deployButton.append(arrow);
    actionCell.append(deployButton);

    row.append(projectCell, statusCell, regionCell, deployedCell, spendCell, actionCell);
    return row;
}

function updateProjectCounts() {
    projectCount = projectList.rows.length;
    const count = String(projectCount).padStart(2, "0");
    document.getElementById("project-count").textContent = count;
    document.getElementById("heading-project-count").textContent = String(projectCount);
    document.getElementById("showing-count").textContent = String(projectCount);
    document.getElementById("total-count").textContent = String(projectCount);
    document.querySelector(".nav-count").textContent = String(projectCount);
}

document.getElementById("open-project-modal").addEventListener("click", openProjectModal);
document.getElementById("close-project-modal").addEventListener("click", closeProjectModal);
document.getElementById("cancel-project").addEventListener("click", closeProjectModal);

modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeProjectModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
        closeProjectModal();
    }
});

projectForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!projectForm.reportValidity()) {
        return;
    }

    const formData = new FormData(projectForm);
    const projectName = formData.get("projectName");
    const region = formData.get("region");

    if (typeof projectName !== "string" || typeof region !== "string") {
        return;
    }

    projectList.prepend(createProjectRow(projectName, region));
    updateProjectCounts();
    projectForm.reset();
    closeProjectModal();
    showToast("Project created", `${projectName.trim()} is being set up in ${region}.`);
});

document.querySelectorAll(".range-button").forEach((button) => {
    button.addEventListener("click", () => {
        const range = chartRanges[button.dataset.range];
        if (!range) {
            return;
        }

        document.querySelectorAll(".range-button").forEach((rangeButton) => {
            const isActive = rangeButton === button;
            rangeButton.classList.toggle("active", isActive);
            rangeButton.setAttribute("aria-pressed", String(isActive));
        });
        chartLine.setAttribute("d", range.path);
        chartAreaFill.setAttribute("d", `${range.path} V190 H0 Z`);
        chartLabels.replaceChildren(...range.labels.map((label) => {
            const item = document.createElement("span");
            item.textContent = label;
            return item;
        }));
        document.getElementById("chart-total").textContent = range.total;
        document.querySelector(".usage-chart").setAttribute("aria-label", range.description);
    });
});

projectList.addEventListener("click", (event) => {
    const button = event.target.closest(".deploy-action");
    if (!button || button.disabled) {
        return;
    }

    const row = button.closest("tr");
    const status = row.querySelector(".status-badge");
    const projectName = button.dataset.project || "Project";
    button.disabled = true;
    button.textContent = "Deploying…";
    status.className = "status-badge building";
    status.lastChild.textContent = "Deploying";
    showToast("Deployment started", `${projectName} is being deployed to production.`);

    window.setTimeout(() => {
        button.disabled = false;
        button.replaceChildren(document.createTextNode("Deploy "));
        const arrow = document.createElement("span");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "↗";
        button.append(arrow);
        status.className = "status-badge live";
        status.lastChild.textContent = "Live";
        row.cells[3].textContent = "Just now";
        showToast("Deployment successful", `${projectName} is live and ready to go.`);
    }, 1400);
});

document.querySelector(".notification-button").addEventListener("click", () => {
    showToast("You're all caught up", "We'll let you know when something needs your attention.");
});

document.querySelector(".subtle-button").addEventListener("click", () => {
    showToast("Infrastructure health", "All 12 services are responding normally.");
});

document.querySelector(".profile-button").addEventListener("click", () => {
    showToast("Account settings", "You're signed in to the Acme Workspace as its owner.");
});

document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".nav-link").forEach((item) => {
            item.classList.remove("active");
            item.removeAttribute("aria-current");
        });
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
        sidebar.classList.remove("is-open");
        mobileMenu.setAttribute("aria-expanded", "false");

        if (link.getAttribute("href") === "#settings") {
            showToast("Workspace settings", "Your workspace preferences are ready to configure.");
        } else if (link.getAttribute("href") === "#help-center") {
            showToast("Help center", "Your Cloudscape workspace is ready to explore.");
        }
    });
});

document.getElementById("current-date").textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
}).format(new Date()).toUpperCase();

mobileMenu.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("is-open");
    mobileMenu.setAttribute("aria-expanded", String(isOpen));
    mobileMenu.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});
