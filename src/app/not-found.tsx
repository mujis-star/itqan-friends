import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center relative px-6 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,164,0.1),transparent_50%)] pointer-events-none" />

      <div className="text-center relative z-10 glass-card p-10 md:p-14 rounded-3xl max-w-lg mx-auto border border-white/10 space-y-6">
        <h1 className="text-8xl md:text-9xl font-extrabold text-white/10 tracking-tighter leading-none">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Signal Lost</h2>
          <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
            The page or resource you are looking for does not exist in our network.
          </p>
        </div>

        <Link href="/">
          <Button variant="primary" magnetic size="lg" className="mt-4">
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
