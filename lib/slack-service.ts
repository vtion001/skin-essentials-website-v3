const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface SlackMessage {
  text: string;
  blocks?: any[];
}

export async function sendSlackAlert(message: string, context?: any) {
  if (!SLACK_WEBHOOK_URL) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Would send to Slack:', message);
    }
    return;
  }

  const payload: SlackMessage = {
    text: `🚨 System Alert: ${message}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🚨 System Alert",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Message:*\n${message}`
          },
          {
            type: "mrkdwn",
            text: `*Environment:*\n${process.env.NODE_ENV}`
          }
        ]
      }
    ]
  };

  if (context) {
    payload.blocks?.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Context:*\n\`\`\`${JSON.stringify(context, null, 2).substring(0, 2000)}\`\`\``
      }
    });
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to send Slack alert:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Slack alert:', error);
  }
}
