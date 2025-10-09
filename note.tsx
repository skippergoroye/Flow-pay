// # FlowPay Withdrawal Feature - Setup Guide

// ## 🚨 Issue: Bank Transfer Limitation

// The error you're seeing is from **Paystack**, not your code:

// ```
// "You cannot initiate third party payouts as a starter business"
// ```

// ### Why This Happens:

// Paystack's **Transfer API** (for bank withdrawals) requires:
// - ✅ A **registered business** account
// - ✅ **Verified business documents** (CAC, ID, etc.)
// - ✅ **Live mode** (not test mode)
// - ✅ Compliance with their KYC requirements

// **Test accounts cannot make transfers** - this is a security measure.

// ---

// ## Solution Options

// ### Option 1: Upgrade Paystack Account (Production)

// **For production deployment:**

// 1. **Complete Business Registration:**
//    - Go to https://dashboard.paystack.com
//    - Navigate to **Settings → Business Profile**
//    - Upload required documents:
//      - Company registration (CAC for Nigeria)
//      - Valid ID of company director
//      - Proof of address
//      - Bank account details

// 2. **Enable Transfers:**
//    - Go to **Settings → Preferences**
//    - Enable "Payouts" feature
//    - Wait for verification (1-5 business days)

// 3. **Switch to Live Keys:**
//    - Use `sk_live_...` instead of `sk_test_...`
//    - Update your `.env` file

// 4. **Fund Your Paystack Balance:**
//    - You need funds in your Paystack balance to make transfers
//    - Transfer money to your Paystack settlement account

// ---

// ### Option 2: Mock Withdrawal (Development/Testing)

// **For testing without a verified account:**

// Create a mock withdrawal endpoint that simulates the process:

// ```typescript
// // src/wallet/wallet.service.ts - Add this method

// async withdrawToBank(
//   userId: string,
//   amount: number,
//   accountNumber: string,
//   bankCode: string,
//   accountName: string,
// ): Promise<Transaction> {
//   if (amount <= 0) {
//     throw new BadRequestException('Amount must be greater than zero');
//   }

//   const queryRunner = this.dataSource.createQueryRunner();
//   await queryRunner.connect();
//   await queryRunner.startTransaction();

//   try {
//     const wallet = await queryRunner.manager.findOne(Wallet, {
//       where: { user: { id: userId } },
//       relations: ['user'],
//     });

//     if (!wallet) {
//       throw new NotFoundException('Wallet not found');
//     }

//     if (Number(wallet.balance) < amount) {
//       throw new BadRequestException('Insufficient balance');
//     }

//     // Debit wallet
//     const balanceBefore = Number(wallet.balance);
//     wallet.balance = Number(wallet.balance) - amount;
//     await queryRunner.manager.save(wallet);

//     // Create withdrawal transaction
//     const reference = `WDR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//     const transaction = queryRunner.manager.create(Transaction, {
//       user: wallet.user,
//       reference,
//       amount,
//       type: TransactionType.DEBIT,
//       status: TransactionStatus.SUCCESS,
//       description: `Withdrawal to ${accountName} (${accountNumber})`,
//       balanceBefore,
//       balanceAfter: Number(wallet.balance),
//     });

//     const savedTransaction = await queryRunner.manager.save(transaction);
//     await queryRunner.commitTransaction();

//     return savedTransaction;
//   } catch (err) {
//     await queryRunner.rollbackTransaction();
//     throw err;
//   } finally {
//     await queryRunner.release();
//   }
// }
// ```

// **Add corresponding controller:**

// ```typescript
// // src/wallet/wallet.controller.ts - Add this endpoint

// @Post('withdraw')
// async withdrawToBank(
//   @Req() req,
//   @Body() dto: {
//     accountNumber: string;
//     bankCode: string;
//     accountName: string;
//     amount: number;
//   }
// ) {
//   return this.walletService.withdrawToBank(
//     req.user.id,
//     dto.amount,
//     dto.accountNumber,
//     dto.bankCode,
//     dto.accountName,
//   );
// }
// ```

// **Test it:**

// ```bash
// curl -X POST http://localhost:3000/api/v1/wallet/withdraw \
//   -H "Authorization: Bearer YOUR_TOKEN" \
//   -H "Content-Type: application/json" \
//   -d '{
//     "accountNumber": "0123456789",
//     "bankCode": "058",
//     "accountName": "JOHN DOE",
//     "amount": 1000
//   }'
// ```

// ---

// ### Option 3: Use Paystack Inline (For Wallet Funding Only)

// Keep withdrawals disabled and focus on:
// - ✅ **Wallet funding** via card payments (this works in test mode)
// - ✅ **User-to-user transfers** within FlowPay
// - ✅ **Transaction history**

// **This is the recommended approach for MVP/testing.**

// ---

// ## Alternative: Use Flutterwave

// If you need immediate transfer functionality for testing, consider **Flutterwave**:

// ### Flutterwave Advantages:
// - ✅ Allows test transfers in sandbox mode
// - ✅ Easier account verification process
// - ✅ Similar API to Paystack

// ### Quick Flutterwave Integration:

// ```typescript
// // src/flutterwave/flutterwave.service.ts
// import { Injectable, BadRequestException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import axios from 'axios';

// @Injectable()
// export class FlutterwaveService {
//   private readonly baseUrl = 'https://api.flutterwave.com/v3';
//   private readonly secretKey: string;

//   constructor(private configService: ConfigService) {
//     this.secretKey = this.configService.get('FLW_SECRET_KEY') || '';
//   }

//   async initiateTransfer(accountNumber: string, bankCode: string, amount: number, narration: string) {
//     try {
//       const response = await axios.post(
//         `${this.baseUrl}/transfers`,
//         {
//           account_bank: bankCode,
//           account_number: accountNumber,
//           amount,
//           narration,
//           currency: 'NGN',
//           reference: `FLW-${Date.now()}`,
//           callback_url: 'https://your-webhook-url.com',
//           debit_currency: 'NGN',
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${this.secretKey}`,
//             'Content-Type': 'application/json',
//           },
//         },
//       );

//       return response.data.data;
//     } catch (error) {
//       throw new BadRequestException('Transfer failed');
//     }
//   }
// }
// ```

// ---

// ## Testing Workflow (Recommended)

// ### Phase 1: Development (Current)
// - ✅ Use Paystack for **card payments** (funding wallet)
// - ✅ Use **mock withdrawals** or disable the feature
// - ✅ Focus on user-to-user transfers

// ### Phase 2: Pre-Production
// - ✅ Complete Paystack business verification
// - ✅ Switch to live keys
// - ✅ Test with small amounts (₦100-₦1000)

// ### Phase 3: Production
// - ✅ Enable full withdrawal functionality
// - ✅ Add withdrawal limits and KYC checks
// - ✅ Implement fraud detection

// ---

// ## Current Testing Approach

// **Skip the withdrawal endpoint for now** and test these instead:

// ### 1. Fund Wallet via Paystack ✅
// ```bash
// # Initialize payment
// curl -X POST http://localhost:3000/api/v1/paystack/initialize \
//   -H "Authorization: Bearer TOKEN" \
//   -H "Content-Type: application/json" \
//   -d '{"amount": 5000}'

// # Visit the authorization URL returned
// # Complete payment with test card: 4084084084084081
// ```

// ### 2. User-to-User Transfer ✅
// ```bash
// curl -X POST http://localhost:3000/api/v1/wallet/transfer \
//   -H "Authorization: Bearer TOKEN" \
//   -H "Content-Type: application/json" \
//   -d '{
//     "recipientEmail": "recipient@example.com",
//     "amount": 1000
//   }'
// ```

// ### 3. Check Balances ✅
// ```bash
// curl -X GET http://localhost:3000/api/v1/wallet/balance \
//   -H "Authorization: Bearer TOKEN"
// ```

// ### 4. Transaction History ✅
// ```bash
// curl -X GET http://localhost:3000/api/v1/transactions \
//   -H "Authorization: Bearer TOKEN"
// ```

// ---

// ## Summary

// **The withdrawal feature requires:**
// - Verified Paystack business account
// - Live API keys (not test keys)
// - Funds in Paystack settlement account

// **For now, focus on:**
// 1. ✅ Wallet funding (works in test mode)
// 2. ✅ User transfers (fully functional)
// 3. ✅ Transaction tracking (working)
// 4. ⏸️ Bank withdrawals (requires account upgrade)

// **Your code is correct** - this is a Paystack business requirement, not a technical issue! 

// ---

// ## Next Steps

// **Choose one:**

// 1. **Continue with current features** (recommended for MVP)
//    - Skip withdrawals for now
//    - Focus on wallet funding and P2P transfers

// 2. **Implement mock withdrawals** (for complete testing)
//    - Add the mock withdrawal code above
//    - Simulate the withdrawal process

// 3. **Upgrade Paystack account** (for production)
//    - Complete business verification
//    - Switch to live mode
//    - Test with real bank accounts

// Which approach would you like to take?













