## AI Voice Keyboard

Small Next.js app that turns speech into clean, formatted text using OpenAI Whisper.

### Tech stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS  
- **Backend**: Next.js API routes, Prisma, PostgreSQL  
- **Auth**: Email/password with JWT  

### Quick start
- **Install**: `npm install`  
- **Configure**: create a `.env` with `DATABASE_URL` and `OPENAI_API_KEY`  
- **Database**: `npm run prisma:migrate`  
- **Dev server**: `npm run dev` and open `http://localhost:3000`  

### Notes
- Dictation page lets you record, see recent transcripts, and copy text.
- Long transcripts can be expanded in a modal for easier reading.
