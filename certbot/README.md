# PowerPi - Certbot

PowerPi service for retrieving a certificate from Let's Encrypt which the NGINX service can use to protect the UI, _deep-thought_ API and _babel-fish_ with SSL encryption.

Cerbot will automatically renew the certificate every Sunday morning at 2 AM. However, this requires port 80 to be open on your router and port forwarded to the NGINX service of PowerPi.

## Building

The Docker container can be built utilising _buildx_ as described in the [project documentation](../README.md#Building).

## Configuration

### Environment

This service expects the following environment variables to be set before it will start successfully. When using docker these are already configured in the _docker-compose_ file, however when running locally for testing we need to define these:

-   **EXTERNAL_HOST_NAME** - The domain name that certbot will generate a certificate for, e.g. _example.com_.
-   **EMAIL** - The email address to use to notify when a certificate is due to expire when automatic renewal is failing.

## Testing

There are currently no automated tests for this service.
