# Bible Study Creator

A comprehensive tool for creating Bible studies, generating church-related images, and providing writing assistance for ministry content.

## Features

- **Bible Study Creator**: Generate customized Bible studies based on sermons, Bible passages, or topics
- **Image Generator**: Create church-related graphics using AI
- **Writing Assistant**: Get help with ministry-related writing tasks

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_IDEOGRAM_API_KEY=your_ideogram_api_key
   ```

## Running the Application

This application requires both a frontend and a backend server to run properly.

### Start the Backend Server

The backend server handles API proxying to avoid CORS issues with the Ideogram API:

```
node server.js
```

### Start the Frontend Development Server

In a separate terminal:

```
npm run dev
```

## Image Generation

The image generator uses the Ideogram API to create church-related graphics. Due to CORS restrictions, all API calls are proxied through the Express server.

## Deployment

To build the application for production:

```
npm run build
```

This will create a `dist` directory with the compiled assets.

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI API
- Ideogram API
- Express (for API proxying)