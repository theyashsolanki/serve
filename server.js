const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");
const platform = require("os").platform();
const { exec } = require("child_process");

const working_dir = process.argv[3];
const indexFilePath = process.argv[2];
const PORT = process.argv[4];
const autoReload = process.argv[5] || "false";
const isDynamicRoutes = process.argv[6] || "false";

const routesTable = new Map();

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(req.url);
  console.log(
    req.method,
    pathname,
    req.connection.remoteAddress.split(":").pop(),
  );
  const ext = pathname.split(".").pop();
  fs.readFile(
    pathname == "/" ? indexFilePath : working_dir + pathname,
    (err, data) => {
      if (err && routesTable.has(pathname) && isDynamicRoutes) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(routesTable.get(pathname));
        return;
      }
      if (err) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(
          "<h1 style='text-align: center;' >404 Not Found</h1>",
        );
        return;
      }
      data = data.toString();
      res.writeHead(200, { "Content-Type": getContentType(ext) });
      if (autoReload === "true" && (ext === "html" || pathname === "/")) {
        data = processHtml(data);
      }
      res.end(data);
    },
  );
});

function getContentType(ext) {
  switch (ext) {
    case "/":
    case "html":
      return "text/html";
    case "css":
      return "text/css";
    case "js":
      return "application/javascript";
    case "jpg":
    case "jpeg":
    case "png":
      return "image/" + ext;
    case "svg":
      return "image/svg+xml";
    case "ico":
      return "image/x-icon";
    default:
      return "application/octet-stream"; // Default to binary data
  }
}

function processHtml(htmlData) {
  const routeManageComponent = `
        let currentPath = window.location.pathname;
        setInterval(() => {
          if(window.location.pathname !== currentPath){
            console.log("path changed");
            const data = JSON.stringify({path : window.location.pathname, html : document.documentElement.outerHTML});
            socket.send(data);
            currentPath = window.location.pathname;
          };
        }, 100);
`;

  const scriptComponent = `
    <!-- this script is injected by serve -->
    <script>
        const socket = new WebSocket(window.location.href.replace("http", "ws"));
        socket.addEventListener('message', function (event) {
          if (event.data === 'reload') {
              window.location.reload();
          };
        });
        ${isDynamicRoutes === "true" ? routeManageComponent : ""}
    </script> 
`;

  const headTag = htmlData.indexOf("<head>");
  if (headTag === -1) {
    return htmlData.replace(
      "<head>",
      `
            <head>
            ${scriptComponent}
          `,
    );
  }
  const bodyTag = htmlData.indexOf("</body>");
  if (bodyTag !== -1) {
    return htmlData.replace(
      "</body>",
      `
            ${scriptComponent}
            </body>
        `,
    );
  }
}

function startWebSocket() {
  const socket = new WebSocket.Server({ server });
  let reloadTimeout;
  socket.on("connection", (ws) => {
    fs.watch(working_dir, (eventType, filename) => {
      if (
        eventType === "change" && (filename.endsWith(".js") ||
          filename.endsWith(".css") || filename.endsWith(".html"))
      ) {
        clearTimeout(reloadTimeout);
        reloadTimeout = setTimeout(() => {
          ws.send("reload");
        }, 500);
      }
    });
    ws.on("message", (message) => {
      console.log("path changed");
      const receivedData = JSON.parse(message);
      if (!routesTable.has(receivedData.path)) {
        routesTable.set(receivedData.path, receivedData.html);
      }
    });
  });
}

if (autoReload === "true") {
  startWebSocket();
}

server.listen(PORT, () => {
  console.log(`server started at ${PORT}`);
  if (platform === "win32") {
    exec(`start http://localhost:${PORT}`);
  } else if (platform === "darwin") {
    exec(`open http://localhost:${PORT}`);
  } else if (platform === "linux") {
    exec(`xdg-open http://localhost:${PORT}`);
  }
});
