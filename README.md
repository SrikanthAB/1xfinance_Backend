# Project Structure

This project is organized into the following main directories:

## `src`
Contains the source code of the application. It is further divided into subdirectories:

### `config`
Contains configuration files and utilities for the application, such as:
- `config.ts`: General configuration settings.
- `logger.ts`: Logging utilities.
- `mobileOtp.ts`: Mobile OTP configuration.
- `morgan.ts`: HTTP request logger.
- `roles.ts`: Role-based configurations.
- `s3.ts`: AWS S3 configurations.
- `tokens.ts`: Token-related configurations.

### `controllers`
Contains the controllers that handle incoming requests and responses. Subdirectories are organized by feature, such as:
- `admin`
- `asset`
- `company`
- `document-signature`
- `order`
- `poll`
- `superAdmin`
- `user`
- `web3`

### `errors`
Contains custom error handling utilities, such as:
- `customErrors.ts`: Definitions for custom errors.

### `helpers`
Contains helper functions and utilities, such as:
- `mobileOtp.helper.ts`: Helper functions for mobile OTP.

### `interfaces`
Contains TypeScript interfaces for various entities, organized by feature, such as:
- `admin.ts`
- `employee.ts`
- `global.ts`
- `role.ts`
- `superAdmin.ts`
- `token.ts`

### `middleware`
Contains middleware functions for request handling, such as:
- `auth.middleware.ts`: Authentication middleware.
- `globalErrorHandler.ts`: Global error handling middleware.
- `validateRequest.ts`: Request validation middleware.

### `models`
Contains database models for various entities, organized by feature, such as:
- `admin.model.ts`
- `employee.model.ts`
- `feepercentage.model.ts`
- `role.model.ts`
- `tokens.model.ts`

### `playground`
Contains experimental or temporary scripts, such as:
- `order-tracking.ts`

### `routes`
Contains route definitions for the application, organized by feature, such as:
- `employee.route.ts`
- `fee-percentage.route.ts`
- `getLocations.route.ts`
- `tableConfig.route.ts`
- `template.route.ts`

### `services`
Contains service layer logic for the application, organized by feature, such as:
- `assetS3Object.service.ts`
- `employee.ts`
- `getLocations.service.ts`
- `s3.service.ts`
- `tableConfig.service.ts`

### `types`
Contains global TypeScript type definitions, such as:
- `global.ts`
- `index.d.ts`

### `utils`
Contains utility functions for common operations, such as:
- `aggregateWithPagination.ts`
- `ApiError.ts`
- `ApiResponse.ts`
- `calculateDistanceKm.ts`
- `calculatePagination.ts`
- `catchAsync.ts`
- `comparePassword.ts`
- `generateOTP.ts`

### `validations`
Contains validation logic for incoming requests.

---

## Installation and Running the Application

To set up and run the application, follow these steps:

### Prerequisites
Ensure you have the following installed:
- Node.js (v16 or higher)
- npm (v7 or higher)
- TypeScript

### Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd ownmali-backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Compile TypeScript files:
   ```bash
   npm run build
   ```

5. Start the application:
   ```bash
   npm start
   ```

6. For development mode with hot-reloading:
   ```bash
   npm run dev
   ```

---

## Additional Files

### `package.json`
Defines project dependencies and scripts.

### `tsconfig.json`
TypeScript configuration file.

### `tslint.json`
Linting configuration for TypeScript.

---

This structure ensures modularity and scalability, making it easier to maintain and extend the application.




// user onboarding 

<!-- mobile and password 

otp  -->