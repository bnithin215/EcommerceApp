<div align="center">
  <img src="public/img.png" alt="Srija4Her Logo" width="200" />
</div>

# Srija4Her Frontend

A modern React-based e-commerce platform specializing in women's clothing and sarees, featuring a complete admin dashboard and customer shopping experience.

## Features

### Customer Features
- **Product Catalog** - Browse and search through various categories of sarees and women's clothing
- **Advanced Product Filtering** - Filter by category, fabric, occasion, color, and price range
- **Product Pagination** - Optimized loading with pagination for better performance
- **User Authentication** - Secure login/register with Firebase Auth
- **Shopping Cart** - Add, remove, and manage products in cart with persistent storage
- **Wishlist** - Save favorite products for later
- **Checkout System** - Multi-step checkout with address management
  - Country selection (US and India)
  - Dynamic state dropdowns based on country
  - Address validation with country-specific postal codes
- **Payment Gateway** - Integrated Razorpay payment processing
  - Supports UPI, Cards, Net Banking, and Wallets
  - Secure payment processing with test mode support
- **Order Management** - Place orders and track order history
- **User Profile** - Manage personal information and preferences
- **Responsive Design** - Optimized for desktop and mobile devices
- **Image Optimization** - Lazy loading and optimized image handling

### Admin Features
- **Dashboard** - Overview of key business metrics and analytics
- **Product Management** - Add, edit, and manage product catalog with bulk upload
- **Enhanced Product Uploader** - Advanced product import with image handling
- **Inventory Management** - Track stock levels and inventory
- **Order Management** - Process and manage customer orders
- **Customer Management** - View and manage customer accounts
- **Analytics & Reports** - Sales analytics and financial reports
- **Data Converter** - Tools for data migration and format conversion
- **Settings** - Configure application settings and preferences

### Additional Features & Tools
- **Data Management** - Product data converter and bulk upload tools
- **Enhanced Product Uploader** - Advanced product management with image upload
- **Financial Reports** - Comprehensive financial analytics and reporting
- **Custom Hooks** - Reusable React hooks for common functionality
- **Utility Scripts** - Build and deployment automation scripts

## Tech Stack

- **Frontend Framework**: React 18
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **Backend**: Firebase (Firestore, Auth, Storage, Analytics)
- **Payment Gateway**: Razorpay
- **Notifications**: React Hot Toast
- **Build Tool**: Create React App
- **Package Manager**: npm

## Dependencies

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.1",
  "firebase": "^11.9.1",
  "lucide-react": "^0.263.1",
  "react-hot-toast": "^2.4.1"
}
```

### Styling & UI
```json
{
  "tailwindcss": "^3.4.17",
  "@tailwindcss/forms": "^0.5.10",
  "@tailwindcss/aspect-ratio": "^0.4.2"
}
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd srija4her-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following configuration:
   
   **Firebase Configuration:**
   ```env
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```
   
   **Razorpay Configuration:**
   ```env
   REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   REACT_APP_RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```
   
   **Note:** 
   - Get Firebase config from [Firebase Console](https://console.firebase.google.com/)
   - Get Razorpay keys from [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Razorpay Key Secret should only be used on backend (not in frontend)
   - After creating/updating `.env`, **restart the development server**

4. **Start the development server**
   ```bash
   npm start
   ```

   **Important**: After creating or modifying the `.env` file, you **must restart** the development server for changes to take effect.

The application will open at [http://localhost:3000](http://localhost:3000)

### Troubleshooting

#### Environment Variables Not Loading
- Make sure `.env` file is in the root directory (same level as `package.json`)
- Restart the development server after creating/modifying `.env`
- Check browser console for configuration logs

#### Payment Gateway Not Working
- Verify Razorpay keys are correctly set in `.env`
- Ensure keys start with `rzp_test_` for test mode
- Check browser console for Razorpay configuration status
- Restart server after adding Razorpay keys

#### Firebase Connection Issues
- Verify all Firebase environment variables are set
- Check Firebase project settings in Firebase Console
- Ensure Firestore rules allow read/write access
- Check browser console for Firebase initialization logs

## Project Structure

```
src/
├── components/
│   ├── admin/           # Admin dashboard components
│   │   ├── AdminPanel.js
│   │   ├── AnalyticsPage.js
│   │   ├── CustomersManagement.js
│   │   ├── DataConverter.js
│   │   ├── EnhancedProductUploader.js
│   │   ├── FinancialReports.js
│   │   ├── InventoryManagement.js
│   │   ├── OrderManagement.js
│   │   ├── ProductForm.js
│   │   ├── ProductManagement.js
│   │   ├── ProductUploader.js
│   │   └── SettingsPage.js
│   ├── auth/            # Authentication components
│   │   ├── Login.js
│   │   └── Register.js
│   ├── cart/            # Shopping cart components
│   │   ├── Cart.js
│   │   └── CartItem.js
│   ├── common/          # Shared components
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   └── Loader.js
│   ├── products/        # Product-related components
│   │   ├── ProductCard.js
│   │   ├── ProductDetail.js
│   │   └── ProductList.js
│   └── user/            # User profile components
│       ├── OrderHistory.js
│       ├── UserProfile.js
│       └── Wishlist.js
├── context/             # React Context providers
│   ├── AuthContext.js
│   └── CartContext.js
├── hooks/               # Custom React hooks
├── pages/               # Main page components
│   ├── Admin.js
│   ├── Checkout.js
│   ├── Home.js
│   ├── ProductDetails.js
│   └── Products.js
├── scripts/             # Build and utility scripts
│   └── uploadProducts.js
├── services/            # API and external services
│   ├── api.js
│   ├── firebase.js
│   ├── payment.js
│   └── productsService.js
├── styles/              # Global styles
│   └── globals.css
├── utils/               # Utility functions and constants
│   ├── constants.js
│   └── helpers.js
├── App.css             # Main app styles
├── App.js              # Main application component
├── index.css           # Global CSS
├── index.js            # Application entry point
├── products.json       # Product data
├── cors.json           # CORS configuration
├── postcss.config.js   # PostCSS configuration
└── tailwind.config.js  # Tailwind CSS configuration
```

## Available Scripts

- **`npm start`** - Runs the app in development mode
- **`npm test`** - Launches the test runner
- **`npm run build`** - Builds the app for production
- **`npm run eject`** - Ejects from Create React App (irreversible)

### Utility Scripts
- **`node src/scripts/uploadProducts.js`** - Bulk upload products to Firebase

## Authentication & Authorization

The application uses Firebase Authentication with role-based access:

- **Customer Role**: Access to shopping features, profile, and order history
- **Admin Role**: Access to admin dashboard and management features

## Product Categories

The platform supports various product categories:
- **Silk Sarees** - Premium silk sarees
- **Cotton Sarees** - Comfortable cotton sarees
- **Designer Sarees** - Latest designer collections
- **Wedding Collection** - Special wedding sarees
- **Casual Wear** - Everyday casual sarees
- **Party Wear** - Party and festive sarees

## Checkout & Shipping

### Supported Countries
- **India** - All states and union territories
- **United States** - All 50 states plus DC

### Address Features
- Country selection dropdown
- Dynamic state/province dropdowns based on country
- Country-specific postal code validation:
  - India: 6-digit pincode
  - US: 5-digit ZIP or 5+4 format
- Phone number validation based on country
- Separate billing and shipping addresses

## Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices

## State Management

- **Authentication State**: Managed via React Context (AuthContext)
- **Shopping Cart**: Managed via React Context (CartContext)
- **Component State**: React hooks (useState, useEffect, useCallback, useMemo)

## Performance Optimizations

### Product Loading
- **Pagination**: Loads 20 products per page (configurable)
- **Smart Loading**: Loads up to 100 products when no filters applied
- **Caching**: SessionStorage caching for faster subsequent loads
- **Lazy Loading**: Images load lazily for better initial page load

### Image Optimization
- Lazy loading for product images
- Image preloading for featured products
- Error handling with fallback placeholders
- Optimized image formats and sizes

### Code Optimization
- React.memo for ProductCard components
- useCallback and useMemo for expensive operations
- Debounced search and filter operations
- Optimized re-renders with proper dependency arrays

## Key Files & Configuration

- **`products.json`** - Sample product data for initial setup
- **`cors.json`** - CORS configuration for Firebase
- **`tailwind.config.js`** - Tailwind CSS customization
- **`postcss.config.js`** - PostCSS configuration for styling
- **`src/scripts/uploadProducts.js`** - Utility for bulk product upload

## Styling Approach

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Reusable UI components
- **Responsive Design**: Mobile-first approach
- **Global Styles**: Custom CSS in `styles/globals.css`
- **Dark Mode Ready**: Prepared for dark mode implementation

## Deployment

### Build for Production
```bash
npm run build
```

This creates a `build` folder with optimized production files.

### Deployment Options
- **Firebase Hosting**: Recommended for Firebase integration
- **Netlify**: Easy deployment with continuous integration
- **Vercel**: Great for React applications
- **Traditional Web Hosting**: Upload build folder contents

## Configuration

### Firebase Configuration
Update Firebase configuration in your environment variables or Firebase config file.

### Payment Gateway
The application is integrated with **Razorpay** for secure payment processing.

#### Features:
- **Multiple Payment Methods**: UPI, Credit/Debit Cards, Net Banking, Wallets
- **Test Mode Support**: Configured for testing with test API keys
- **Secure Processing**: Payment data encrypted and secure
- **Error Handling**: Comprehensive error handling and user feedback

#### Setup:
1. Get your Razorpay API keys from [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Add keys to `.env` file:
   ```env
   REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   REACT_APP_RAZORPAY_KEY_SECRET=your_key_secret
   ```
3. Restart the development server

#### Test Cards:
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVV**: Any 3 digits (e.g., `123`)

#### Security:
- Key ID (public key) is safe to use in frontend
- Key Secret should **only** be used on backend for payment verification
- All keys stored in `.env` file (not hardcoded)

## Analytics & Monitoring

The admin dashboard includes:
- Sales analytics
- Customer insights
- Product performance metrics
- Financial reporting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary. All rights reserved.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Future Enhancements

- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Product recommendations
- [ ] Loyalty program integration
- [ ] Mobile app development
- [ ] AI-powered size recommendations

---

**Built with care for Srija4Her**