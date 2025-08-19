# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/1059cc01-4973-4332-949e-9cedd2543d08

## How can I edit this code?

## Supabase Setup

This project uses Supabase for the database. To connect your Supabase project:

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from the project settings
3. Create a `.env.local` file in the root directory with:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the database migrations to create the required tables
5. The app will automatically connect to your Supabase database

### Database Schema

The project expects a `products` table with the following structure:
- `id` (uuid, primary key)
- `name` (text)
- `description` (text)
- `price` (numeric)
- `deck_cards` (jsonb) - stores the card data
- `main_image_url` (text)
- `colors` (text array)
- `format` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1059cc01-4973-4332-949e-9cedd2543d08) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1059cc01-4973-4332-949e-9cedd2543d08) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
