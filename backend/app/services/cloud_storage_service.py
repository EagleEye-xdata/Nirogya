import boto3
from botocore.exceptions import ClientError
from typing import Optional
from app.core.config import settings


class CloudStorageService:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.S3_BUCKET_NAME
    
    async def upload_file(self, file_path: str, s3_key: str) -> str:
        """Upload file to S3 and return URL"""
        try:
            # Upload file to S3
            self.s3_client.upload_file(
                file_path,
                self.bucket_name,
                s3_key
            )
            
            # Generate presigned URL for secure access
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key},
                ExpiresIn=3600  # 1 hour
            )
            
            return url
        except ClientError as e:
            raise Exception(f"Failed to upload file: {str(e)}")
    
    async def upload_file_object(self, file_obj, s3_key: str) -> str:
        """Upload file object to S3 and return URL"""
        try:
            # Upload file object to S3
            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket_name,
                s3_key
            )
            
            # Generate presigned URL for secure access
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key},
                ExpiresIn=3600  # 1 hour
            )
            
            return url
        except ClientError as e:
            raise Exception(f"Failed to upload file: {str(e)}")
    
    async def delete_file(self, s3_key: str) -> bool:
        """Delete file from S3"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True
        except ClientError as e:
            print(f"Failed to delete file: {str(e)}")
            return False
    
    async def generate_presigned_url(self, s3_key: str, expiration: int = 3600) -> str:
        """Generate presigned URL for file access"""
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            raise Exception(f"Failed to generate presigned URL: {str(e)}")
    
    async def get_file_metadata(self, s3_key: str) -> Optional[dict]:
        """Get file metadata from S3"""
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return {
                'size': response['ContentLength'],
                'last_modified': response['LastModified'],
                'content_type': response['ContentType']
            }
        except ClientError:
            return None
