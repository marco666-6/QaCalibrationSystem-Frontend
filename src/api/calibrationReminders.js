import apiClient from "./client";

export async function sendDueDateReminders(daysThreshold = 7) {
  const response = await apiClient.post("/calibration-reminders/send-due-date-reminders", null, {
    params: { daysThreshold }
  });
  return response.data;
}
