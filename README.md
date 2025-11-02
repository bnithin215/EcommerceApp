<div align="center">
  <img src="public/img.png" alt="Srija4Her Logo" width="200" />
</div>

# Srija4Her Frontend

A modern React-based e-commerce platform specializing in women's clothing and sarees, featuring a complete admin dashboard and customer shopping experience.

## Features

### Customer Features
- **Product Catalog** - Browse and search through various categories of sarees and women's clothing
- **User Authentication** - Secure login/register with Firebase Auth
- **Shopping Cart** - Add, remove, and manage products in cart
- **Wishlist** - Save favorite products for later
- **Order Management** - Place orders and track order history
- **User Profile** - Manage personal information and preferences
- **Responsive Design** - Optimized for desktop and mobile devices

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
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **Backend**: Firebase (Firestore, Auth, Storage)
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
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The application will open at [http://localhost:3000](http://localhost:3000)

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
- Traditional Sarees
- Designer Sarees
- Casual Wear
- Party Wear
- And more...

## Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices

## State Management

- **Authentication State**: Managed via React Context (AuthContext)
- **Shopping Cart**: Managed via React Context (CartContext)
- **Component State**: React hooks (useState, useEffect)

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
The application is configured to work with Razorpay for payment processing.

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