const extractId = (text, prefix) => {
  const match = text?.match(new RegExp(`${prefix}-(\\d+)`, "i"));
  return match ? match[1] : null;
};

const findId = (text, prefixes) => {
  return prefixes.map(prefix => extractId(text, prefix)).find(Boolean)
}

const createButtons = (ticketId, runbotTicketId, branchName) => {
  const showTaskButton = ticketId || runbotTicketId;
  const buttons = [];

  if (showTaskButton) {
    const openTaskButton = document.createElement("a");
    openTaskButton.className = "odoo-task-button";
    openTaskButton.textContent = "🔗 Task";
    openTaskButton.title = "Open corresponding Odoo task";
    
    Object.assign(openTaskButton.style, {
      background: "#714B67",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "5px 12px",
      fontSize: "12px",
      fontWeight: "500",
      marginLeft: "8px",
      cursor: "pointer",
      transition: "background 0.2s ease, transform 0.1s ease",
    });

    const openTaskListener = () => {
      let url;
      if (ticketId) {
        url = `https://www.odoo.com/odoo/all-tasks/${ticketId}`;
      } else {
        url = `https://runbot.odoo.com/odoo/runbot.build.error/${runbotTicketId}`
      }
      window.open(url, "_blank");
    }
    openTaskButton.addEventListener("click", openTaskListener);
    buttons.push(openTaskButton);
  }

  const odooCopyButton = document.createElement("a");
  odooCopyButton.className = "odoo-branch-button";
  odooCopyButton.textContent = "📋 Branch";
  odooCopyButton.title = "Copy branch name";
  Object.assign(odooCopyButton.style, {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "8px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: "500",
    textDecoration: "none",
    color: "#ffffff",
    background: "#238636",
    border: "1px solid rgba(240,246,252,0.1)",
    borderRadius: "6px",
    cursor: "pointer",
  });

  odooCopyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(branchName);
      odooCopyButton.textContent = "✅ Copied!";
      setTimeout(() => (odooCopyButton.textContent = "📋 Branch"), 1500);
    } catch (err) {
      console.error(err);
    }
  });
  buttons.push(odooCopyButton);

  return buttons;
};

const run = () => {
  try {
    const [branchElement, stickyBranchElement] = document.querySelectorAll('a[href*="odoo-dev"][class^="PullRequestBranchName"]');
    
    const pullRequestBody = document.querySelector('.js-command-palette-pull-body')?.textContent;
    const branchTitle = (branchElement?.getAttribute("href") || stickyBranchElement?.getAttribute("href"))?.split("/").pop();
    const ticketId = findId(branchTitle, ["opw", "task"]) || findId(pullRequestBody, ["opw", "task"]);
    const runbotTicketId = findId(branchTitle, ["runbot"]) || findId(pullRequestBody, ["runbot"]);

    // Add buttons to main header
    if (branchElement && !branchElement.closest("div").querySelector(".odoo-task-button, .odoo-branch-button")) {
      const container = branchElement;
      const buttons = createButtons(ticketId, runbotTicketId, branchTitle);
      buttons.forEach(button => container.closest("span").lastElementChild.after(button));
    }

    // Add buttons to sticky header
    if (stickyBranchElement && !branchElement.closest("div").querySelector(".odoo-task-button, .odoo-branch-button")) {
      const stickyContainer = stickyBranchElement;
      const buttons = createButtons(ticketId, runbotTicketId, branchTitle);
      buttons.forEach(button => stickyContainer.closest("span").lastElementChild.after(button));
    }
  } catch (error) {
    console.log("Odoo github extension", error)
  }
}

window.addEventListener('load', () => {
  run();
});