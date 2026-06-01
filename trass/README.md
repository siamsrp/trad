<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/113696e3-dec3-47e2-9d82-a99e1e75534b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## New Feature: Interactive 3D Hero Card

We have implemented a state-of-the-art **Interactive 3D Card** directly in the Hero Section.

### Key Features:
- **360° 3D Rotation**: Smooth animation on click using Framer Motion.
- **Dual Market Support**: Toggle between **Forex** and **Real (Stock) Markets** directly on the card.
- **Secure Data Fetching**: Simulated JWT and API-Key header implementation for institutional-grade data integrity.
- **Performance Optimized**: 60fps rotation and responsive design.
- **Bengali Localization**: Back-face includes the slogan "এই ওয়েবসাইট ট্রেডিং-এর জন্য সবচেয়ে ভালো প্ল্যাটফর্ম".
- **CTA Integration**: "Start Trading" button integrated for immediate user conversion.

## Deployment

This app is ready for deployment on platforms like Vercel, Netlify, or Firebase Hosting.

**Vercel Deployment:**
1. Connect your GitHub repository to Vercel.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Add your environment variables (Firebase config, Gemini API key).

**Deployment Link:** [https://rubicon-liberty-simulation.netlify.app](https://rubicon-liberty-simulation.netlify.app) *(Example link)*

