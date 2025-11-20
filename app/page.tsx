import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to login for now
  // In a real app, this could be a landing page for unauthenticated users
  redirect('/auth/login');
}
