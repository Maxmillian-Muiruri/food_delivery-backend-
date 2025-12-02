# REST Client Testing Guide

This directory contains REST client HTTP files for testing backend API modules.

## Available REST Client Files

- `auth.http` - Authentication endpoints (register, login, logout, refresh, social login)
- `users.http` - User management endpoints
- `orders.http` - Order creation and management
- `payments.http` - Payment initialization, verification, and management with Paystack integration
- `store.http` - Store creation, update, rating, verification, and querying
- `transfers.http` - Transfer payments to stores and drivers using Paystack

## Setting Environment Variables

Before running the requests, define these environment variables in your REST client or HTTP tool:

- `{{baseUrl}}` — Base URL of the running backend API (e.g., http://localhost:3000)
- `{{access_token}}` — Valid JWT access token for authentication
- `{{payment_reference}}` — Payment reference string obtained from payment initialization
- `{{transactionId}}` — Transaction ID string for fetching payment details
- `{{payment_id}}` — Payment database ID for update/delete requests
- `{{transfer_reference}}` — Transfer reference code for verifying transfer status
- `{{order_id}}` — Order ID integer for querying transfers
- `{{delivery_id}}` — Delivery ID integer for querying transfers

## Usage

- Replace all placeholder variables with actual values from your test runs.
- For authentication, use `auth.http` to register/login and obtain `access_token`.
- Use `payments.http` to initiate and verify payments using Paystack simulation.
- Use `store.http` and `transfers.http` to test store management and transfer payments respectively.

## Notes

- Ensure your backend is running and accessible at `{{baseUrl}}`.
- Authentication is required for protected endpoints via `Authorization: Bearer {{access_token}}`.
- Follow correct JSON structure and HTTP methods as indicated in each request.

If you encounter any missing environment variables during testing, replace the placeholders with real test values accordingly.

Happy Testing!





 <!-- Register/Login → 2. Add Address → 3. Browse Stores → 
4. View Menu → 5. Create Order → 6. Make Payment → 
7. Track Order → 8. Leave Review -->