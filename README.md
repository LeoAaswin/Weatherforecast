# 🌤️ Modern Weather Forecast App

A beautiful, responsive weather forecast application built with Next.js 14, TypeScript, and modern web technologies. Get accurate weather information for any city worldwide with a sleek, modern interface.

## ✨ Features

- 🌍 **Global Weather Search** - Search weather for any city worldwide
- 📍 **Current Location** - Get weather for your current location with geolocation
- 🌡️ **Temperature Units** - Switch between Celsius and Fahrenheit
- 📊 **5-Day Forecast** - Extended weather forecast with detailed information
- 🎨 **Modern UI/UX** - Beautiful, responsive design with smooth animations
- 🌙 **Dark Mode Support** - Automatic dark/light mode based on system preferences
- ♿ **Accessibility** - Full keyboard navigation and screen reader support
- 📱 **Mobile First** - Optimized for all device sizes
- ⚡ **Fast & Reliable** - Built with Next.js 14 and modern performance optimizations

## 🚀 Live Demo

[View Live Demo](https://weatherforecast-azure.vercel.app/)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: SCSS with CSS Modules
- **API**: OpenWeatherMap API
- **Deployment**: Vercel
- **Font**: Inter (Google Fonts)

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenWeatherMap API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Weatherforecast
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenWeatherMap API key:
   ```env
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
   ```

4. **Get your API key**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key
   - Add it to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── pages/Home/        # Home page components
├── components/            # Reusable UI components
│   ├── ErrorMessage.tsx   # Error display component
│   ├── LoadingSpinner.tsx # Loading indicator
│   ├── SearchForm.tsx     # Search input form
│   ├── WeatherCard.tsx    # Weather display card
│   └── WeatherForecast.tsx # 5-day forecast
├── config/               # Configuration files
│   └── weather.ts        # Weather API configuration
├── services/             # API services
│   └── weatherService.ts # Weather API service
└── types/                # TypeScript type definitions
    └── weather.ts        # Weather-related types
```

## 🎨 Design Features

- **Modern Gradient Backgrounds** - Beautiful color gradients
- **Glass Morphism** - Frosted glass effects with backdrop blur
- **Smooth Animations** - CSS transitions and keyframe animations
- **Responsive Grid Layout** - Adaptive layouts for all screen sizes
- **Custom Scrollbars** - Styled scrollbars for better UX
- **Focus States** - Accessible focus indicators
- **Loading States** - Smooth loading animations

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 API Integration

This app uses the OpenWeatherMap API for weather data:

- **Current Weather**: Real-time weather conditions
- **5-Day Forecast**: Extended weather predictions
- **Geolocation**: Weather based on current location
- **Weather Icons**: Visual weather representations

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data API
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Vercel](https://vercel.com/) for hosting and deployment

---

Made with ❤️ and modern web technologies
