# Hospital Management System

A comprehensive hospital management system built with Next.js, TypeScript, and Tailwind CSS. This application provides role-based dashboards for different users in a hospital ecosystem.

## 🏥 Features

### Multi-Role Support
- **Med Network Admin**: Manage hospitals and hospital admins
- **Hospital Admin**: Manage doctors and view analytics
- **Doctor**: Create time slots, manage appointments
- **Patient**: Search doctors, book appointments

### Key Functionalities
- ✅ Hospital and doctor management
- ✅ Time slot creation with weekly scheduling
- ✅ Appointment booking and management
- ✅ Advanced search and filtering
- ✅ Real-time analytics
- ✅ Role-based access control

## 🚀 Live Demo

Visit the live application: [Hospital App](https://your-username.github.io/hospital-app/)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: LocalStorage (for demo purposes)
- **Deployment**: GitHub Pages

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hospital-app.git
   cd hospital-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Accounts

### Initial Setup
- **Med Network Admin**: `admin@mednetwork.com` / `admin123`
- **Password**: `admin123`

### System Flow
1. **Med Network Admin** creates hospitals and hospital admins
2. **Hospital Admin** creates doctors for their hospital
3. **Patients** sign up through the UI
4. **Doctors** create time slots and manage appointments
5. **Patients** search and book appointments

## 🚀 Deployment

This project is configured for automatic deployment to GitHub Pages.

### Manual Deployment Steps:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "GitHub Actions" as source
   - The app will be available at: `https://your-username.github.io/hospital-app/`

## 📁 Project Structure

```
hospital-app/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard components
│   │   └── ui/             # UI components
│   ├── lib/                # Utility libraries
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── .github/workflows/      # GitHub Actions
```

## 🔧 Configuration

### Environment Variables
No environment variables required for local development. The app uses localStorage for data persistence.

### Build Configuration
- **Output**: Static export for GitHub Pages
- **Base Path**: `/hospital-app` (for GitHub Pages)
- **Image Optimization**: Disabled for static export

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/your-username/hospital-app/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

---

**Note**: This is a demo application using localStorage for data persistence. For production use, consider implementing a proper backend database.
