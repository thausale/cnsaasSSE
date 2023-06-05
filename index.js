import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let clients = [];

/* This code sets up a server-sent events (SSE) endpoint at the `/sse` route. When a client connects to
this endpoint, the server sets the appropriate headers for SSE and adds the client's response object
to an array of clients. */
app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  clients.push(res);

  // Close the SSE connection when the client disconnects
  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
});

/* This code sets up a POST endpoint at the `/notification` route. When a client sends a POST request
to this endpoint with a JSON payload containing `target` and `message` properties, the server sends
a server-sent event (SSE) to all connected clients. The SSE contains the `target` and `message`
properties in JSON format. Finally, the server sends a response to the client with a status code of
200 and a JSON payload containing the `message` and `target` properties. */
app.post("/notification", (req, res) => {
  const { target, message } = req.body;
  const data = JSON.stringify({ target, message });

  clients.forEach((client) => {
    client.write(`event: notification\n`);
    client.write(`data: ${data}\n\n`);
  });

  res.status(200).send({ message, target });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
