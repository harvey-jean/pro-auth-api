# Product Authentication API

## Description
The Product Authentication API is a robust and secure backend service designed to manage user authentication and product verification. Built with Node.js, Express, and MongoDB, this API provides endpoints for user registration, login, and product authentication, ensuring that only legitimate users can access and verify products.

### Motivation
In today's market, counterfeit products are a significant issue, leading to loss of revenue and trust for businesses. This API aims to provide a reliable solution for businesses to authenticate their products and ensure that their customers receive genuine items.

### Goal
The goal of this API is to offer a seamless and secure way for businesses to manage user authentication and product verification, thereby reducing the risk of counterfeit products and enhancing customer trust.

### Problem to Solve
Counterfeit products can damage a brand's reputation and lead to financial losses. By providing a robust authentication system, this API helps businesses protect their brand and ensure that customers receive authentic products.

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/harvey-jean/pro-auth-api.git
    cd product-authentication-api
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    Create a `.env` file in the root directory and add the following:
    ```env
    PORT=3001
    MONGODB_URI=mongodb://127.0.0.1:27017/proauth_db
    EMAIL_SENDER=proauthnotifier@gmail.com
    ```

4. Start the server:
    ```bash
    npm start
    ```