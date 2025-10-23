import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings


class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
    
    async def send_verification_email(self, email: str, token: str) -> bool:
        """Send email verification email"""
        try:
            subject = "Verify Your Nirogya Account"
            body = f"""
            Welcome to Nirogya Health Scribe!
            
            Please click the link below to verify your email address:
            {settings.CORS_ORIGINS[0]}/verify-email?token={token}
            
            This link will expire in 24 hours.
            
            If you didn't create this account, please ignore this email.
            
            Best regards,
            The Nirogya Team
            """
            
            return await self._send_email(email, subject, body)
        except Exception:
            return False
    
    async def send_password_reset_email(self, email: str, token: str) -> bool:
        """Send password reset email"""
        try:
            subject = "Reset Your Nirogya Password"
            body = f"""
            You requested a password reset for your Nirogya account.
            
            Please click the link below to reset your password:
            {settings.CORS_ORIGINS[0]}/reset-password?token={token}
            
            This link will expire in 1 hour.
            
            If you didn't request this password reset, please ignore this email.
            
            Best regards,
            The Nirogya Team
            """
            
            return await self._send_email(email, subject, body)
        except Exception:
            return False
    
    async def send_appointment_reminder(self, email: str, appointment_details: dict) -> bool:
        """Send appointment reminder email"""
        try:
            subject = "Appointment Reminder - Nirogya"
            body = f"""
            This is a reminder for your upcoming appointment:
            
            Date: {appointment_details.get('date')}
            Time: {appointment_details.get('time')}
            Doctor: {appointment_details.get('doctor_name')}
            Type: {appointment_details.get('type')}
            
            Please arrive 15 minutes early for your appointment.
            
            Best regards,
            The Nirogya Team
            """
            
            return await self._send_email(email, subject, body)
        except Exception:
            return False
    
    async def send_report_notification(self, email: str, report_details: dict) -> bool:
        """Send report notification email"""
        try:
            subject = "New Medical Report Available - Nirogya"
            body = f"""
            A new medical report has been uploaded to your Nirogya account:
            
            Report Name: {report_details.get('name')}
            Report Type: {report_details.get('type')}
            Upload Date: {report_details.get('upload_date')}
            
            You can view the report in your Nirogya dashboard.
            
            Best regards,
            The Nirogya Team
            """
            
            return await self._send_email(email, subject, body)
        except Exception:
            return False
    
    async def _send_email(self, to_email: str, subject: str, body: str) -> bool:
        """Send email using SMTP"""
        try:
            if not all([self.smtp_host, self.smtp_username, self.smtp_password]):
                # If SMTP not configured, just log (for development)
                print(f"Email would be sent to {to_email}: {subject}")
                return True
            
            msg = MIMEMultipart()
            msg['From'] = self.smtp_username
            msg['To'] = to_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            
            text = msg.as_string()
            server.sendmail(self.smtp_username, to_email, text)
            server.quit()
            
            return True
        except Exception:
            return False
