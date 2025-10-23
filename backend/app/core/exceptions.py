from fastapi import HTTPException
from typing import Optional


class CustomException(Exception):
    def __init__(
        self,
        detail: str,
        status_code: int = 400,
        error_code: Optional[str] = None
    ):
        self.detail = detail
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(detail)


class AuthenticationError(CustomException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(detail, 401, "AUTH_ERROR")


class AuthorizationError(CustomException):
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(detail, 403, "AUTHZ_ERROR")


class NotFoundError(CustomException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(detail, 404, "NOT_FOUND")


class ValidationError(CustomException):
    def __init__(self, detail: str = "Validation error"):
        super().__init__(detail, 422, "VALIDATION_ERROR")


class ConflictError(CustomException):
    def __init__(self, detail: str = "Resource conflict"):
        super().__init__(detail, 409, "CONFLICT_ERROR")


class FileUploadError(CustomException):
    def __init__(self, detail: str = "File upload failed"):
        super().__init__(detail, 400, "FILE_UPLOAD_ERROR")


class EncryptionError(CustomException):
    def __init__(self, detail: str = "Encryption/Decryption failed"):
        super().__init__(detail, 500, "ENCRYPTION_ERROR")
