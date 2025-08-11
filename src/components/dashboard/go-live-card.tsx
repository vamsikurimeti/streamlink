'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { goLive } from '@/lib/actions/youtube';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Copy, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export default function GoLiveCard() {
  const [isPending, startTransition] = useTransition();
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGoLive = () => {
    startTransition(async () => {
      const result = await goLive();
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        setStreamUrl(null);
      } else if (result?.streamUrl) {
        setStreamUrl(result.streamUrl);
        toast({
          title: 'Success!',
          description: 'Your live stream is ready.',
        });
      }
    });
  };
  
  const copyToClipboard = () => {
    if (streamUrl) {
      navigator.clipboard.writeText(streamUrl);
      toast({
        title: 'Copied!',
        description: 'Stream URL copied to clipboard.',
      });
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          <span>Start a New Live Stream</span>
        </CardTitle>
        <CardDescription>
          Click the button below to start a new YouTube live stream. You will be provided with a link to share with your audience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={handleGoLive} disabled={isPending} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
            {isPending ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting Stream...
            </>
            ) : "Go Live"}
          </Button>
        </div>
        {streamUrl && (
            <div className="mt-4 space-y-2">
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Live Stream Created!</AlertTitle>
                    <AlertDescription>
                        Share this URL with your audience.
                    </AlertDescription>
                </Alert>
                <div className="flex items-center space-x-2">
                    <Input value={streamUrl} readOnly />
                    <Button variant="outline" size="icon" onClick={copyToClipboard} aria-label="Copy stream URL">
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
