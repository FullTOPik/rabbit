const amqp = require("amqplib");
const { v4: uuidv4 } = require("uuid");

const rabbitUrl = "amqp://localhost";
const requestQueue = "request_queue";
const responseQueue = "response_queue";

class RabbitFabric {
  channel = null;
  handlers = [];

  async startService() {
    try {
      const connection = await amqp.connect(rabbitUrl);
      this.channel = await connection.createChannel();

      await this.channel.assertQueue(requestQueue, { durable: true });
      await this.channel.assertQueue(responseQueue, { durable: true });

      this.handlers[0] && this.startHandlers();

      console.log("Rabbit initialization success");
    } catch (error) {
      console.error("Error:", error);
    }
  }

  addHandler(name, callback) {
    this.handlers.push({ method: name, callback });
  }

  startHandlers() {
    this.channel.consume(requestQueue, async (message) => {
      const requestData = JSON.parse(message.content.toString());
      const { method, data } = requestData;

      const handler = this.handlers.find(
        (handler) => handler.method === method
      );
      const handleResult = await handler?.callback(data);

      this.channel.sendToQueue(
        message.properties.replyTo,
        Buffer.from(JSON.stringify(handleResult ?? "")),
        {
          correlationId: message.properties.correlationId,
          persistent: true,
        }
      );

      this.channel.ack(message);
    });
  }

  sendMessageAndGetAnswer(messageData) {
    return new Promise((resolve, reject) => {
      try {
        const messageForSecondServer = Buffer.from(JSON.stringify(messageData));
        const correlationId = uuidv4();
        const sendingParams = {
          persistent: true,
          correlationId,
          replyTo: responseQueue,
        };

        this.channel.sendToQueue(
          requestQueue,
          messageForSecondServer,
          sendingParams
        );

        const handlerAnswer = (message) => {
          if (message.properties.correlationId !== correlationId) return;

          const responseData = JSON.parse(message.content.toString());
          resolve(responseData);

          this.channel.cancel(message.fields.consumerTag);
        };

        this.channel.consume(responseQueue, handlerAnswer);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = RabbitFabric;
