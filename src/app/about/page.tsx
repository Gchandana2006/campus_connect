
// src/app/about/page.tsx
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Award, ShieldCheck, Users } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutPage() {

  const aboutImage = PlaceHolderImages.find(p => p.id === 'about-student-tablet');

  return (
    <div className="container mx-auto py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">About Our Lost & Found System</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A trusted platform to <span className="text-destructive font-semibold">reconnect students</span> with their lost belongings securely.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="relative aspect-square md:aspect-[4/3] rounded-lg overflow-hidden border-4 border-primary/20 shadow-lg">
          {aboutImage && (
            <Image
              src={aboutImage.imageUrl}
              alt={aboutImage.description}
              fill
              className="object-cover"
              data-ai-hint={aboutImage.imageHint}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
           <div className="absolute top-3 left-3 bg-background/80 p-2 rounded-full">
              <Users className="h-6 w-6 text-primary" />
           </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold font-headline text-green-700">Why Choose Our Platform?</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              The University Lost & Found Portal offers a <span className="font-semibold text-destructive">seamless and secure</span> way for students to report, search, and reclaim lost items. Our community-driven approach ensures that those who return lost items are appreciated, and students can recover their belongings safely.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold font-headline text-green-700">Benefits for those who help:</h2>
            <Card className="mt-4 bg-accent/30 border-accent">
                <CardContent className="p-4 flex items-center gap-4">
                    <Award className="h-8 w-8 text-primary flex-shrink-0"/>
                    <div>
                        <p className="font-semibold text-primary">
                          100/- token reward
                        </p>
                        <p className="text-sm text-muted-foreground">
                         For individuals who return lost items, upon successful recovery by the owner.
                        </p>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
