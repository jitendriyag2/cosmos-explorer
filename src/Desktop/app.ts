import { resolve } from "path";
import { app, BrowserWindow } from "electron";
import { server, url } from "./server";

let main: BrowserWindow | undefined;

const mainWindowUrl = new URL("/hostedExplorer.html", url);

server.listen(url.port);

app.on("ready", createMainWindow);
app.on("activate", createMainWindow);
app.on("window-all-closed", onWindowAllClosed);

function createMainWindow() {
  if (main) {
    return;
  }

  // Create the browser window.
  main = new BrowserWindow({
    icon: resolve(__dirname, "..", "..", "src", "Desktop", "cosmosdb.ico"),
    width: 1024,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      sandbox: true
    }
  });

  main.removeMenu();
  main.on("closed", () => {
    main = undefined;
  });

  main.loadURL(mainWindowUrl.href);
}

function onWindowAllClosed() {
  // On macOS applications stay active until the user quits explicitly
  if (process.platform !== "darwin") {
    app.quit();
  }
}
