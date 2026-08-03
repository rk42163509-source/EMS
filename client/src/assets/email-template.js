export const emailTemplates = {
  welcome: (employee) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Employee MS</h2>
      <p>Hello ${employee?.firstName || "there"},</p>
      <p>Your account has been created successfully.</p>
    </div>
  `,
  attendance: (employee, attendance) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Attendance Recorded</h2>
      <p>Hello ${employee?.firstName || "there"},</p>
      <p>Your attendance for ${attendance?.date || "today"} has been recorded.</p>
    </div>
  `,
  leave: (employee, leaveApplication) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Leave Application Update</h2>
      <p>Hello ${employee?.firstName || "there"},</p>
      <p>Your leave application status: ${leaveApplication?.status || "updated"}.</p>
    </div>
  `,
};
