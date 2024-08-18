import { Channel } from "amqplib";

export default class Producer {
  constructor(private channel: Channel) {}

  async produceMessages(
    data: any,
    correlationId: string,
    replyToQueue: string
  ) {
    if (!data) {
      throw new Error('Data is undefined or null');
    }

    const messageString = JSON.stringify(data);
    if (typeof messageString !== 'string') {
      throw new Error('Data cannot be converted to a string');
    }

    try {
      this.channel.sendToQueue(replyToQueue, Buffer.from(messageString), {
        correlationId: correlationId,
      });
    } catch (error) {
      console.error('Failed to send message to queue:', error);
    }
  }
}
