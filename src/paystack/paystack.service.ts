import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;

  constructor(
    private configService: ConfigService,
    private walletService: WalletService,
  ) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') ?? '';
  }

  async initializePayment(email: string, amount: number, userId: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Convert to kobo
          callback_url: `${this.configService.get('FRONTEND_URL')}/payment/callback`,
          metadata: {
            userId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference: response.data.data.reference,
      };
    } catch (error) {
      console.log(error)
      throw new BadRequestException('Failed to initialize payment');
    }
  }

  async verifyPayment(reference: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      const { status, amount, metadata } = response.data.data;

      if (status === 'success') {
        const amountInNaira = amount / 100;
        await this.walletService.fundWallet(
          metadata.userId,
          amountInNaira,
          reference,
        );

        return {
          status: 'success',
          message: 'Payment verified and wallet funded',
          amount: amountInNaira,
        };
      }

      return {
        status: 'failed',
        message: 'Payment verification failed',
      };
    } catch (error) {
      throw new BadRequestException('Failed to verify payment');
    }
  }

  async getBanks() {
    try {
      const response = await axios.get(`${this.baseUrl}/bank?currency=NGN`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      return response.data.data;
    } catch (error) {
      throw new BadRequestException('Failed to fetch banks');
    }
  }

   async resolveAccountNumber(accountNumber: string, bankCode: string) {
      try {
        const response = await axios.get(
          `${this.baseUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
          {
            headers: {
              Authorization: `Bearer ${this.secretKey}`,
            },
          },
        );
  
        return response.data.data;
      } catch (error) {
        // Handle rate limit error (429) for test mode
        if (error.response?.status === 429 || error.response?.data?.code === 'unknown') {
          // Use test bank codes for development
          if (bankCode === '001' || bankCode === '044') {
            // Return mock data for test banks
            return {
              account_number: accountNumber,
              account_name: 'TEST ACCOUNT NAME',
              bank_id: parseInt(bankCode),
            };
          }
          throw new BadRequestException(
            'Test mode daily limit exceeded. Use test bank code 001 (Access Bank) or 044 (Access Bank) for testing, or upgrade to live mode.'
          );
        }
  
        // Handle other errors
        const errorMessage = error.response?.data?.message || 'Failed to resolve account number';
        throw new BadRequestException(errorMessage);
      }
    }

  async createTransferRecipient(
    accountNumber: string,
    bankCode: string,
    name: string,
  ) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transferrecipient`,
        {
          type: 'nuban',
          name,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN',
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.data;
    } catch (error) {
      throw new BadRequestException('Failed to create transfer recipient');
    }
  }

  async initiateTransfer(recipientCode: string, amount: number, reason: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transfer`,
        {
          source: 'balance',
          amount: amount * 100, // Convert to kobo
          recipient: recipientCode,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.data;
    } catch (error) {
      console.log("eror", error)
      throw new BadRequestException('Failed to initiate transfer');
    }
  }
}