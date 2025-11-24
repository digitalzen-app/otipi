let _sessionData = ""; // Holds session data in memory
const ALLOWED_HOSTNAMES = ["localhost", "my.otipi.app"];
console.log("Service worker loaded");

function throwIfInvalidOrigin(event) {
  console.log("Checking origin", event.origin);
  const url = new URL(event.origin);
  if (!ALLOWED_HOSTNAMES.includes(url.hostname) && !event.origin.includes("otipi://")) {
    throw new Error("Invalid origin:" + url.hostname);
  }
}

self.addEventListener("message", (event) => {
  throwIfInvalidOrigin(event);
  const { command, data } = event.data;

  if (command === "storeSession") {
    _sessionData = data; // Store session data
    event.ports[0].postMessage({ status: "stored" });
  } else if (command === "getSession") {
    event.ports[0].postMessage({ status: "retrieved", data: _sessionData }); // Send session data back to client
  }
});
