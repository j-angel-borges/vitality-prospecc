# **App Name**: ProspectFlow

## Core Features:

- Multi-Step Lead Capture: Guided, slide-deck style UI for collecting prospect information across several screens, managing state locally until final submission.
- Discovery Question Flow: Carousel or sequence of 3 slides for interactive prospect discovery, with image and text placeholders and navigation buttons.
- Lead Data Entry Form: Form inputs for full name, cellphone number, district, and sales representative selection with validation but no immediate save.
- Dynamic Sales Rep QR Code Display: Conditional display of a QR code placeholder based on the selected sales representative, prompting for contact addition.
- Internal Prospect Notes: Prominent textarea for sales representatives to add detailed internal notes about the prospect.
- Firestore Data Submission: Trigger a single write operation to the 'leads' Firestore collection, saving all collected data (name, phone, district, sales rep, notes, timestamp) upon final action.
- Application Reset & Success: Display a success message upon data submission and a button to reset the app to the first step for a new prospect.

## Style Guidelines:

- Primary brand color (headers, main accents): Royal Blue (#004D99). Its rich, deep tone suggests professionalism and trust, ideal for a lead generation tool.
- Secondary brand color (supporting elements): Blueberry (#4A8FD8). This lighter, harmonious blue complements the primary for diverse UI components.
- Accent color (Call-To-Action buttons, highlights): Mango (#FFD34E). Its vibrant and inviting yellow creates high contrast, drawing attention to critical actions.
- Backgrounds: Predominantly Light Gray (#D1D3D4) and White for a clean, unobtrusive canvas, enhancing readability and content focus.
- All text: 'Inter' (sans-serif). A modern and highly readable typeface suitable for both headlines and body text, maintaining a clean and professional aesthetic across the wizard-style flow.
- Utilize crisp, clear icons for navigation, status indicators, and feature representations, maintaining a consistent, flat design language.
- Mobile-first, full-screen wizard/slide-deck design, ensuring optimal readability and interaction on small screens. Implement 16:9 aspect ratio image placeholders for a consistent visual presentation.
- Subtle, smooth slide transitions to reinforce the 'slide-deck' feel, enhancing the user experience between steps without distracting from content.