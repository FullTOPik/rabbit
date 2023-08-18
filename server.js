const express = require("express");
const bodyParser = require("body-parser");
const Rabbit = require("./rabbit");

const rabbit = new Rabbit();

const app = express();
app.use(bodyParser.json());

app.get("/process/:id", async (req, res) => {
  const { id } = req.params;

  const book = await rabbit.sendMessageAndGetAnswer({
    data: { id },
    method: "book",
  });
  const author = await rabbit.sendMessageAndGetAnswer({
    data: { id },
    method: "author",
  });

  res.status(200).send({ book, author });
});

app.listen(3001, () => {
  rabbit.startService().catch(console.error);
  console.log("First service listening on port 3001");
});
