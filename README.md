# mysql-files-to-s3

A TypeScript-based microservice that uploads MySQL blob files to S3-compatible cloud storage (MinIO), processes them, and stores metadata in MongoDB Atlas.

## Overview

This application is a modernized version of a file processing microservice that:

- Retrieves blob data from MySQL databases
- Converts data to RTF files using a predefined header template
- Converts RTF files to PDF using LibreOffice
- Uploads PDFs to S3-compatible cloud storage (MinIO)
- Stores file metadata and encrypted URLs in MongoDB Atlas
- Implements automatic file retention and cleanup policies

## Features

- **TypeScript**: Full type safety and modern JavaScript features
- **Cloud Storage**: Support for S3-compatible services (MinIO)
- **Database Support**: MySQL for source data, MongoDB Atlas for metadata storage
- **File Processing**: Automated RTF to PDF conversion using LibreOffice
- **Security**: Encrypted file URLs and secure cloud storage integration
- **Retention Management**: Automatic cleanup of outdated files
- **Container Ready**: Docker support for easy deployment

## Tech Stack

- **Runtime**: Node.js 22+
- **Language**: TypeScript 5.9+
- **Database**: MySQL (source), MongoDB Atlas (metadata)
- **Cloud Storage**: S3-compatible services (MinIO)
- **File Processing**: LibreOffice (for RTF to PDF conversion)
- **Build Tools**: TypeScript compiler, Node.js runtime for development

## Prerequisites

### System Dependencies

The application requires the following system packages to be installed:

- **LibreOffice Writer**: Version 6 or above (for RTF to PDF conversion)
- **OpenJDK Runtime Environment (JRE)**: Required by LibreOffice
- **Liberation Fonts**: Ensures font compatibility across different systems

### Node.js Dependencies

The application includes the following runtime dependencies:

```json
{
  "crypto-js": "^4.2.0",
  "minio": "^8.0.6",
  "mongodb": "^6.20.0",
  "mysql2": "^3.15.3",
  "node-gzip": "^1.1.2",
  "typescript": "^5.9.3"
}
```

Development dependencies include TypeScript types and build tools.

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd mysql-files-to-s3
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **System Dependencies** (Ubuntu/Debian):

   ```bash
   sudo apt-get update
   sudo apt-get install libreoffice-writer default-jre ttf-liberation
   ```

4. **Build the application**:
   ```bash
   npm run build
   ```

## Configuration

The application uses a JSON configuration file to specify database connections, cloud storage settings, and processing options.

### Configuration File Structure

```json
{
  "crypto_key": "your-secret-encryption-key",
  "mysql": {
    "query": "SELECT your_blob_column FROM your_table",
    "connectionParameters": {
      "host": "your-mysql-host",
      "port": 3306,
      "database": "your-database",
      "user": "your-username",
      "password": "your-password"
    }
  },
  "mongo": {
    "db": "your-database-name",
    "collection": "your-collection-name",
    "connectionParameters": {
      "uri": "mongodb+srv://username:password@cluster.mongodb.net/",
      "options": {
        "useNewUrlParser": true,
        "useUnifiedTopology": true
      }
    }
  },
  "s3": {
    "fileRetention": 30,
    "defaultPrefix": "documents",
    "bucket": "your-bucket-name",
    "connectionParameters": {
      "uri": "https://your-s3-endpoint.com",
      "user": "your-access-key",
      "password": "your-secret-key"
    }
  }
}
```

### Configuration Parameters

- **crypto_key**: Secret key for encrypting URLs and sensitive data
- **mysql**: MySQL database connection and query configuration
  - `query`: SQL query to select blob data
  - `connectionParameters`: MySQL connection details
- **mongo**: MongoDB Atlas connection configuration
  - `db`: Database name
  - `collection`: Collection name for storing file metadata
  - `connectionParameters`: MongoDB connection URI and options
- **s3**: S3 configuration for cloud storage
  - `fileRetention`: Days to keep files in cloud storage after local reference is lost
  - `defaultPrefix`: Storage folder/prefix for uploaded files
  - `bucket`: S3 bucket name
  - `connectionParameters`: S3 endpoint and credentials

## Usage

### Running the Application

**Development mode**:

```bash
npm run dev
```

**Production mode**:

```bash
npm run build
npm start
```

**With custom configuration**:

```bash
npm start path/to/your/config.json
```

### Docker Deployment

1. **Build the Docker image**:

   ```bash
   docker build -t mysql-files-to-s3 .
   ```

2. **Run the container**:
   ```bash
   docker run --rm \
     --mount type=bind,source="$(pwd)"/src/config.json,target=/app/src/config.json,readonly \
     --mount type=bind,source="$(pwd)"/files,target=/app/files \
     mysql-files-to-s3
   ```

**Docker Notes**:

- The configuration file must be mounted to `/app/src/config.json`
- The files directory should be mounted for temporary file processing
- The container includes all necessary system dependencies

## Application Workflow

The application follows this processing pipeline:

1. **Initialization**: Load configuration and validate connections
2. **Data Retrieval**: Fetch blob data from MySQL database
3. **File Creation**: Convert data to RTF files using predefined templates
4. **Format Conversion**: Convert RTF files to PDF using LibreOffice
5. **Local Cleanup**: Remove temporary RTF files
6. **Cloud Upload**: Upload PDF files to S3-compatible storage
7. **Metadata Storage**: Save file metadata and encrypted URLs to MongoDB
8. **Remote Cleanup**: Remove local PDF files
9. **Retention Management**: Clean up outdated files from cloud storage
10. **Final Results**: Store processing results in MongoDB

## Project Structure

```
├── src/
│   ├── index.ts                 # Main application entry point
│   ├── types/
│   │   └── shared.ts           # Shared TypeScript type definitions
│   ├── utils/
│   │   ├── index.ts            # Utility functions exports
│   │   ├── daysBetweenDates.ts # Date utility functions
│   │   ├── encrypt.ts          # Encryption utilities
│   │   ├── errorHandler.ts     # Error handling patterns
│   │   └── rtfHeaderRaw.ts     # RTF header template
│   ├── cleanData.ts            # Data cleaning and validation
│   ├── convertFiles.ts         # RTF to PDF conversion
│   ├── deleteLocalFiles.ts     # Local file cleanup
│   ├── getData.ts              # MySQL data retrieval
│   ├── remoteFilesRetention.ts # S3 storage retention management
│   ├── saveLocalRtfFiles.ts    # RTF file creation
│   ├── sendResults.ts          # MongoDB result storage
│   ├── s3Data.ts               # S3/MinIO storage operations
│   └── uploadFiles.ts          # S3 file upload operations
├── dist/                       # Compiled JavaScript output
├── files/                      # Temporary file processing directory
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## Build Commands

- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run the compiled application
- `npm run dev`: Run the compiled application in development mode
- `npm run clean`: Remove build artifacts
- `npm run type-check`: Validate TypeScript types without compilation

## Error Handling

The application implements comprehensive error handling:

- Database connection failures
- File processing errors
- Cloud storage upload failures
- Configuration validation errors
- Graceful shutdown on critical errors

All errors are logged to stdout with detailed context information.

## Security Considerations

- **Encryption**: URLs are encrypted using crypto-js
- **Secrets**: Sensitive configuration should be managed through environment variables in production
- **Database Security**: Use connection pooling and prepared statements
- **File Access**: Implement proper access controls for cloud storage

## Development

### Adding New Features

1. Follow TypeScript strict mode requirements
2. Add comprehensive JSDoc documentation
3. Include proper error handling
4. Update type definitions in `src/types/shared.ts`
5. Add unit tests for new functionality

### Code Quality

- TypeScript strict mode enabled
- No `any` types (except in rare, well-documented cases)
- Comprehensive JSDoc comments
- Consistent error handling patterns
- Modular code organization

## Troubleshooting

### Common Issues

**LibreOffice not found**:

- Ensure LibreOffice is installed: `sudo apt-get install libreoffice-writer`
- Verify JRE is installed: `java -version`

**MySQL connection fails**:

- Check connection parameters in configuration
- Ensure MySQL server is accessible
- Verify firewall settings

**MongoDB connection issues**:

- Check MongoDB Atlas IP whitelist
- Verify connection URI format
- Ensure network connectivity

**S3 upload fails**:

- Verify S3 endpoint and credentials
- Check bucket permissions and access policies
- Ensure sufficient storage quota/limits

### Logs

The application provides detailed logging throughout the process. Monitor stdout for:

- Configuration loading status
- Database connection results
- File processing progress
- Upload and cleanup operations
- Error details and stack traces

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript typing
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Author

André Martins <fmartins.andre@gmail.com>
