export default defineBackground(() => {
  // create context menu on extension install/startup
  browser.runtime.onInstalled.addListener(() => {
    createContextMenu();
  });
  browser.runtime.onStartup.addListener(() => {
    createContextMenu();
  });

  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener(async (info, _tab) => {
    if (info.menuItemId === "save-to-query") {
      browser.action.openPopup();
    }
  });

  // Listen for keyboard commands
  browser.commands.onCommand.addListener(async (command, _tab) => {
    if (command === "save-link") {
      browser.action.openPopup();
    }
  });

  // Handle messages from content script and popup example
  // browser.runtime.onMessage.addListener(
  //   async (message: ExtensionMessage, sender, sendResponse) => {
  //     try {
  //       switch (message.type) {
  //         case "GET_CURRENT_PAGE":
  //           if (sender.tab?.id) {
  //             const [result] = await browser.scripting.executeScript({
  //               target: { tabId: sender.tab.id },
  //               func: getPageMetadata,
  //             });
  //             sendResponse({ success: true, data: result.result });
  //           } else {
  //             sendResponse({ success: false, error: "No tab available" });
  //           }
  //           break;
  //
  //         default:
  //           sendResponse({ success: false, error: "Unknown message type" });
  //       }
  //     } catch (error) {
  //       console.error("Error handling message:", error);
  //       sendResponse({
  //         success: false,
  //         error: error instanceof Error ? error.message : "Unknown error",
  //       });
  //     }
  //   },
  // );
});

async function createContextMenu() {
  await browser.contextMenus.removeAll();

  browser.contextMenus.create({
    id: "save-to-query",
    title: "Save to Haibrid Query",
    contexts: ["page", "link", "selection"],
  });
}
