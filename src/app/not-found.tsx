import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1),transparent_50%)]"></div>
      
      <div className="text-center relative z-10 glass p-12 rounded-3xl max-w-xl mx-auto">
        <h1 className="text-9xl font-black text-white/10 mb-4 tracking-tighter">404</h1>
        <h2 className="text-3xl font-bold mb-4">Signal Lost</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          The coordinates you entered don't exist in our network. It seems this sector is uncharted.
        </p>
        
        <Link href="/">
          <Button variant="primary">Return to Base</Button>
        </Link>
      </div>
    </div>
  );
}
