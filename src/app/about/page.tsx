// src/app/about/page.tsx
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, ShieldCheck, Users, FilePenLine, Handshake } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutPage() {

  const aboutImage = PlaceHolderImages.find(p => p.id === 'about-student-tablet')!;
  const reportImage = PlaceHolderImages.find(p => p.id === 'how-it-works-report')!;
  const connectImage = PlaceHolderImages.find(p => p.id === 'how-it-works-connect')!;
  const reuniteImage = PlaceHolderImages.find(p => p.id === 'how-it-works-reunite')!;

  const howItWorksSteps = [
    {
      icon: FilePenLine,
      title: 'Report or Search',
      description: "Quickly post details about a lost or found item. Our AI helps generate descriptions from just a photo. Or, browse the listings to see if your item has been found.",
      image: reportImage,
    },
    {
      icon: ShieldCheck,
      title: 'Connect Securely',
      description: 'Use our private, integrated messaging system to communicate with the finder or owner. Your personal contact information remains confidential.',
      image: connectImage,
    },
    {
      icon: Handshake,
      title: 'Reunite Safely',
      description: 'Arrange a safe and convenient handover at a public place on campus. Once the item is returned, mark it as resolved.',
      image: reuniteImage,
    },
  ];


  return (
    <div className="container mx-auto py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">About Campus Connect</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your campus-wide solution for reuniting lost items with their owners.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-4 border-primary/20 shadow-lg">
            <Image
              src={aboutImage.imageUrl}
              alt={aboutImage.description}
              fill
              className="object-cover"
              data-ai-hint={aboutImage.imageHint}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
           <div className="absolute top-3 left-3 bg-background/80 p-2 rounded-full">
              <Users className="h-6 w-6 text-primary" />
           </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold font-headline text-primary">Why We Built This</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
             We've all felt the stress of losing something important on campus. Campus Connect was created to solve that problem. Our platform provides a centralized, secure, and easy-to-use digital lost and found, making it simple to report a lost item or post something you've found. Our goal is to foster a helpful community where students can easily reconnect with their belongings.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold font-headline text-primary">A Community of Helpers</h2>
            <Card className="mt-4 bg-accent/30 border-accent">
                <CardContent className="p-4 flex items-center gap-4">
                    <Award className="h-8 w-8 text-primary flex-shrink-0"/>
                    <div>
                        <p className="font-semibold text-primary">
                          Be a Campus Hero
                        </p>
                        <p className="text-sm text-muted-foreground">
                         By finding and returning an item, you're not just helping a fellow student—you're strengthening our campus community. Every returned item makes a difference.
                        </p>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>

       <section className="py-16 md:py-24">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">Three simple steps to reconnect with your lost items.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {howItWorksSteps.map((step) => (
                <Card key={step.title} className="bg-card pt-6 flex flex-col items-center">
                    <CardHeader className="items-center p-0">
                        <div className="relative h-32 w-32 mb-4">
                            <Image
                                src={step.image.imageUrl}
                                alt={step.image.description}
                                fill
                                className="rounded-full object-cover border-4 border-primary/20"
                                data-ai-hint={step.image.imageHint}
                                sizes="128px"
                            />
                        </div>
                        <CardTitle className="font-headline text-xl">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mt-2">{step.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    </section>

    </div>
  );
}
