// .env.example
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=flowpay_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# Frontend URL
FRONTEND_URL=http://localhost:3001

# FlowPay - Modern Fintech API

FlowPay is a modern fintech mobile application backend built with NestJS, TypeORM, PostgreSQL, and Paystack integration for seamless money management and payments.

## Features

- 🔐 **User Authentication** - JWT-based authentication with secure password hashing
- 💰 **Wallet Management** - Create and manage digital wallets
- 💸 **Money Transfers** - Send money to other FlowPay users
- 💳 **Paystack Integration** - Fund wallet via card payments
- 🏦 **Bank Withdrawals** - Withdraw to Nigerian bank accounts
- 📊 **Transaction History** - Track all financial activities
- 🔒 **Secure Transactions** - Database transactions ensure data consistency

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Payment Gateway**: Paystack
- **Validation**: class-validator & class-transformer

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE flowpay_db;
   ```

4. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

5. Update `.env` with your credentials:
   - Database credentials
   - JWT secret key
   - Paystack API keys (get from https://dashboard.paystack.com)

6. Run the application:
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000/api/v1`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### User Profile
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update profile

### Wallet
- `GET /api/v1/wallet/balance` - Get wallet balance
- `POST /api/v1/wallet/transfer` - Transfer to another user

### Paystack (Payments)
- `POST /api/v1/paystack/initialize` - Initialize payment
- `GET /api/v1/paystack/verify?reference=xxx` - Verify payment
- `GET /api/v1/paystack/banks` - Get list of banks
- `POST /api/v1/paystack/resolve-account` - Resolve account number
- `POST /api/v1/paystack/withdraw` - Withdraw to bank account

### Transactions
- `GET /api/v1/transactions` - Get transaction history
- `GET /api/v1/transactions/stats` - Get transaction statistics
- `GET /api/v1/transactions/:id` - Get single transaction

## Example Usage

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+2348012345678",
    "password": "securePassword123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### 3. Fund Wallet (Initialize Payment)
```bash
curl -X POST http://localhost:3000/api/v1/paystack/initialize \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000
  }'
```

### 4. Transfer Money
```bash
curl -X POST http://localhost:3000/api/v1/wallet/transfer \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "recipient@example.com",
    "amount": 1000
  }'
```

## Database Schema

### Users
- id, email, firstName, lastName, phoneNumber, password, avatar, isEmailVerified, isActive

### Wallets
- id, userId, balance, accountNumber, currency, isActive

### Transactions
- id, userId, reference, amount, type (credit/debit), status, description, recipientEmail, balanceBefore, balanceAfter

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Database transactions for atomic operations
- Input validation with class-validator
- Secure Paystack integration

## Production Considerations

1. Set `synchronize: false` in TypeORM config
2. Use database migrations
3. Add rate limiting
4. Implement request logging
5. Set up monitoring (e.g., Sentry)
6. Use environment-specific configs
7. Enable HTTPS
8. Add webhook handling for Paystack
9. Implement 2FA authentication
10. Add email notifications

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.


Installations
1. npm install @nestjs/typeorm typeorm
2. npm install @nestjs/config
3. npm install axios @types/axios
4. npm install class-validator
5. npm install @nestjs/jwt
6. npm install bcrypt
7. npm install --save-dev @types/bcrypt
8. npm install --save-dev @types/passport-jwt
9. npm install passport-jwt
10. npm install class-transformer
11. npm install pg




This is a Paystack account limitation, not a code issue. The withdraw endpoint requires a verified business account with Paystack. Let me update the code to handle this better and provide an alternative solution: