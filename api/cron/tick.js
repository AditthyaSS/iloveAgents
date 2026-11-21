let status = 'success'
let output = ''
let error = null
let notificationError = null

// After successful AI execution
if (
  auto.email_notification &&
  auto.notification_email &&
  process.env.RESEND_API_KEY
) {
  try {
    await sendCronEmailNotification(
      process.env.RESEND_API_KEY,
      {
        to: auto.notification_email,
        name: auto.name,
        output,
      }
    )
  } catch (err) {
    notificationError = err.message || 'Notification failed'
  }
}
