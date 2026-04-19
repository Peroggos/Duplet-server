import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio' 
import * as sharp from 'sharp'

export interface MediaJobData {
    userId: string
    file: {
        buffer: Buffer
        originalName: string
        mimeType: string
    }
    type: 'avatar' | 'portfolio'
    portfolioItemId?: string
}


@Injectable()
export class MinioService {
    private buckednName: string
    private readonly minioClient: Minio.Client
    private readonly logger = new Logger(MinioService.name)    
    constructor(
        private readonly configService: ConfigService
    ){
        this.minioClient = new Minio.Client({
            endPoint: this.configService.get('MINIO_ENDPOINT') || 'localhost',
            port: Number(this.configService.get('MINIO_PORT')),
            useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
            accessKey: this.configService.get('MINIO_ACCESS_KEY'),
            secretKey: this.configService.get('MINIO_SECRET_KEY'),
        })
        this.buckednName = this.configService.get('MINIO_BUCKET_NAME') || 'min-io-st'
    }
    async updateAvatar(
        user_id:
            string, 
        file: 
            Express
                .Multer
                    .File
    ){
    
    }
    async uploadPortfolioItem(
        user_id: 
            string, 
        portfolio_id:
            string, 
        file_port: 
            Express
                .Multer
                    .File
    ) {}

    async processImage() {}

    async uploadS3() {}

    async deleteFromMinio() {}

    generateKey() {}

    private validateImageFile() {}

    async createBuckerInNotExists() {
        const buckednExists = await this.minioClient.bucketExists(this.buckednName)
        if(!buckednExists) {
        await this.minioClient.makeBucket(this.buckednName, 'eu-west-1')
        }
    } 
    async updateFiel(file: Express.Multer.File) {
        const fileName = `${Date.now()}-${file.originalname}`
        await this.minioClient.putObject(
            this.buckednName,
            fileName,
            file.buffer
        )
    }
}
