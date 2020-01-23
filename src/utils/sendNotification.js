const { Expo } = require('expo-server-sdk');

const sendNotification = async (pushToken, glucoseValue) => {
  // Create a new Expo SDK client
  const expo = new Expo();

  // Check that your push token appear to be valid Expo push token
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
  } else {
    // Create the message that you want to send to clents
    const messages = [createMessage(pushToken, glucoseValue)];
    let ticket;

    try {
      ticket = await expo.sendPushNotificationsAsync(messages);

      // NOTE: If a ticket contains an error code in ticket.details.error, you
      // must handle it appropriately. The error codes are listed in the Expo
      // documentation:
      // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
    } catch (error) {
      console.error(error);
    }

    // Later, after the Expo push notification service has delivered the
    // notifications to Apple or Google (usually quickly, but allow the the service
    // up to 30 minutes when under load), a "receipt" for each notification is
    // created. The receipts will be available for at least a day; stale receipts
    // are deleted.
    //
    // The ID of each receipt is sent back in the response "ticket" for each
    // notification. In summary, sending a notification produces a ticket, which
    // contains a receipt ID you later use to get the receipt.
    //
    // The receipts may contain error codes to which you must respond. In
    // particular, Apple or Google may block apps that continue to send
    // notifications to devices that have blocked notifications or have uninstalled
    // your app. Expo does not control this policy and sends back the feedback from
    // Apple and Google so you can handle it appropriately.
    let receiptIds = [];

    // NOTE: Not all tickets have IDs; for example, tickets for notifications
    // that could not be enqueued will have error information and no receipt ID.
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }

    try {
      let receipt = await expo.getPushNotificationReceiptsAsync(receiptIds);

      // The receipts specify whether Apple or Google successfully received the
      // notification and information about an error, if one occurred.

      if (receipt.status === 'error') {
        console.error(
          `There was an error sending a notification: ${receipt.message}`
        );
        if (receipt.details && receipt.details.error) {
          // The error codes are listed in the Expo documentation:
          // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
          // You must handle the errors appropriately.
          console.error(`The error code is ${receipt.details.error}`);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
};

const createMessage = (pushToken, value) => {
  // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications)
  const highOrLow = value > 7 ? 'High' : 'Low';

  return {
    to: pushToken,
    sound: 'default',
    title: `BG ${highOrLow}!`,
    body: `Glucose is ${value}. Please take appropriate action.`,
    _displayInForeground: true,
  };
};

module.exports = sendNotification;
