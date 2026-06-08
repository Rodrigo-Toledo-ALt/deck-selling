// DeckForm.tsx
// Form to create/edit a deck (admin).
// - uploads images to Supabase
// - prepares payload and calls an n8n webhook that processes the deck (Scryfall, OCR, etc.)
// Comments in English for final project documentation.

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDeckById, DeckData } from '@/data/decks_remote';
import {
    Form, FormField, FormItem, FormLabel, FormMessage, FormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/supabase/AuthProvider';
import { supabase } from '@/supabase/supabase-client.ts';
import 'mana-font/css/mana.css';
import Navbar from "@/components/Navbar.tsx";

// Extract all stored image paths from deckData (used to clean up on edit)
function extractAllCardImagePaths(deckData: DeckData): string[] {
    const sections = [
        'commander', 'creatures', 'sorceries', 'instants',
        'artifacts', 'enchantments', 'lands', 'planeswalkers',
        'sideboard', 'tokens', 'others',
    ] as const;

    const paths: string[] = [];
    for (const section of sections) {
        const cards = deckData[section] ?? [];
        for (const card of cards) {
            for (const face of card.faces ?? []) {
                if (face.image) paths.push(face.image);
            }
        }
    }
    return paths;
}

// Parse a decklist text (format "1x Sol Ring" and section comments //section)
function parseDecklistToItems(input: string): { name: string; quantity: number; section: string }[] {
    const lines = input.split(/\r?\n/);
    const cards: { name: string; quantity: number; section: string }[] = [];
    let currentSection = 'main';
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('//')) {
            const sectionName = trimmed.substring(2).trim().toLowerCase();
            if (sectionName.includes('commander')) currentSection = 'commander';
            else if (sectionName.includes('sideboard') || sectionName.includes('outside')) currentSection = 'sideboard';
            else if (sectionName.includes('token')) currentSection = 'tokens';
            else currentSection = 'main';
            continue;
        }
        const match = trimmed.match(/^(\d+)x?\s+(.+)$/);
        if (!match) continue;
        cards.push({ quantity: parseInt(match[1], 10), name: match[2].trim(), section: currentSection });
    }
    return cards;
}

// Convert PNG to JPG using canvas (to reduce compatibility/size)
async function convertToJpg(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Could not get 2D context');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (!blob) return reject('Conversion failed');
                resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg', lastModified: Date.now() }));
            }, 'image/jpeg', quality);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

// Sanitize filename for storage paths
function sanitizeFileName(name: string) {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

// Format bytes to readable text
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024; const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Color options (UI + mapping to codes)
const colorOptions = ['White', 'Blue', 'Black', 'Red', 'Green', 'Colorless'] as const;
const colorMap: Record<typeof colorOptions[number], 'W'|'U'|'B'|'R'|'G'|''> = {
    White: 'W', Blue: 'U', Black: 'B', Red: 'R', Green: 'G', Colorless: '',
};
const manaClasses: Record<typeof colorOptions[number], string> = {
    White: 'ms ms-w ms-cost', Blue: 'ms ms-u ms-cost', Black: 'ms ms-b ms-cost',
    Red: 'ms ms-r ms-cost', Green: 'ms ms-g ms-cost', Colorless: 'ms ms-c ms-cost',
};

const ColorIcon = ({ color, selected }: { color: typeof colorOptions[number]; selected: boolean }) => (
    <div className={`mana-icon-button ${selected ? 'active' : ''}`}>
        <i className={`${manaClasses[color]} text-3xl`} title={color} />
    </div>
);

// Zod schema for client-side validation
const deckSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
    format: z.string().min(1, 'Format is required'),
    colorsCodes: z.array(z.enum(['W','U','B','R','G'])).optional(),
    colorless: z.boolean().default(false),
    author_name: z.string().min(3, 'Author name is required'),
    author_website: z.string().url().optional().or(z.literal('')),
    decklist: z.string().min(10, 'Decklist must be at least 10 characters'),
}).superRefine((data, ctx) => {
    if (data.colorless && (data.colorsCodes?.length || 0) > 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Colorless cannot be combined with other colors', path: ['colorsCodes'] });
    }
    if (!data.colorless && (data.colorsCodes?.length || 0) === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select Colorless or at least one color', path: ['colorsCodes'] });
    }
});

type DeckFormValues = z.infer<typeof deckSchema>;

// Processing steps shown in overlay (informational)
const PROCESSING_STEPS = [
    { label: 'Uploading images...', duration: 0 },
    { label: 'Sending deck for processing...', duration: 8000 },
    { label: 'Fetching Scryfall data...', duration: 20000 },
    { label: 'Matching card images...', duration: 45000 },
    { label: 'Building deck structure...', duration: 75000 },
    { label: 'Saving to database...', duration: 110000 },
    { label: 'Almost done...', duration: 150000 },
];

interface ProcessingOverlayProps {
    elapsedSeconds: number;
    error: string | null;
    onDismissError: () => void;
}

// Overlay that shows progress/status while the deck is being processed
const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ elapsedSeconds, error, onDismissError }) => {
    const currentStep = PROCESSING_STEPS.reduce((acc, step) =>
            elapsedSeconds * 1000 >= step.duration ? step : acc
        , PROCESSING_STEPS[0]);

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const timeStr = minutes > 0 ? `${minutes}m ${seconds.toString().padStart(2, '0')}s` : `${seconds}s`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-8 p-10 rounded-2xl border border-border bg-card shadow-2xl max-w-md w-full mx-4">
                {error ? (
                    <>
                        {/* Error state: show message and close button */}
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive">
                            <i className="ms ms-ability-deathtouch ms-3x text-destructive" />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-bold text-destructive">Processing error</h2>
                            <p className="text-sm text-muted-foreground">An error occurred while processing the deck.</p>
                        </div>
                        <div className="w-full bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                            <p className="text-sm text-destructive font-mono break-words">{error}</p>
                        </div>
                        <p className="text-xs text-muted-foreground tabular-nums">Failed at: {timeStr}</p>
                        <Button variant="outline" onClick={onDismissError} className="w-full">
                            Close and retry
                        </Button>
                    </>
                ) : (
                    <>
                        {/* Processing state: spinner, current step and bar */}
                        <div className="relative flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full border-4 border-muted animate-spin border-t-primary" />
                            <div className="absolute">
                                <i className="ms ms-planeswalker ms-4x text-primary opacity-80" />
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <h2 className="text-xl font-bold tracking-tight">Processing Deck</h2>
                            <p className="text-sm text-muted-foreground">
                                This may take a few minutes. Please do not close this tab.
                            </p>
                        </div>
                        <div className="w-full text-center">
                            <p className="text-sm font-medium text-primary animate-pulse">{currentStep.label}</p>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: '40%', animation: 'progressSlide 2s ease-in-out infinite' }}
                            />
                        </div>
                        <div className="flex gap-2">
                            {PROCESSING_STEPS.map((step, i) => {
                                const active = elapsedSeconds * 1000 >= step.duration;
                                return (
                                    <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${active ? 'bg-primary scale-125' : 'bg-muted'}`} />
                                );
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground tabular-nums">Time: {timeStr}</p>
                    </>
                )}
            </div>
            <style>{`
                @keyframes progressSlide {
                    0%   { transform: translateX(-100%); }
                    50%  { transform: translateX(150%); }
                    100% { transform: translateX(350%); }
                }
            `}</style>
        </div>
    );
};

const DeckForm: React.FC = () => {
    const navigate = useNavigate();
    const { deckId } = useParams<{ deckId?: string }>();
    const isEditMode = Boolean(deckId);
    const { toast } = useToast();
    const { user, role, loading } = useAuth();

    // react-hook-form with Zod validation
    const form = useForm<DeckFormValues>({
        resolver: zodResolver(deckSchema),
        defaultValues: {
            name: '', description: '', price: '0.00', format: 'Commander',
            colorsCodes: [], colorless: false, author_name: '', author_website: '', decklist: '',
        },
    });

    // observed form values
    const selectedCodes = form.watch('colorsCodes') || [];
    const colorless = form.watch('colorless');

    // file / processing / existing deck states
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [deckImages, setDeckImages] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingError, setProcessingError] = useState<string | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [loadingDeck, setLoadingDeck] = useState(isEditMode);
    const [existingDeck, setExistingDeck] = useState<DeckData | null>(null);

    // Require admin role: redirect if not allowed
    useEffect(() => {
        if (!loading && role !== 'admin') {
            toast({ title: 'Access denied', description: 'You must be an administrator', variant: 'destructive' });
            navigate('/login');
        }
    }, [loading, role, toast, navigate]);

    // If editing, load the deck and prefill the form
    useEffect(() => {
        if (!isEditMode || !deckId) return;
        (async () => {
            try {
                setLoadingDeck(true);
                const deck = await getDeckById(deckId, true);
                if (!deck) {
                    toast({ title: 'Error', description: 'Deck not found', variant: 'destructive' });
                    navigate('/admin/decks');
                    return;
                }
                setExistingDeck(deck);

                const isColorless = deck.colors.length === 0;
                form.reset({
                    name: deck.name, description: deck.description,
                    price: deck.price.toFixed(2), format: deck.format,
                    colorsCodes: isColorless ? [] : (deck.colors as any),
                    colorless: isColorless, author_name: deck.author_name ?? '',
                    author_website: deck.author_website ?? '', decklist: '',
                });
            } catch (e) {
                console.error('Error loading deck:', e);
                toast({ title: 'Error', description: 'Could not load the deck', variant: 'destructive' });
            } finally {
                setLoadingDeck(false);
            }
        })();
    }, [deckId, isEditMode]);

    // Timer while processing (for overlay)
    useEffect(() => {
        if (!isProcessing || processingError) {
            if (!isProcessing) setElapsedSeconds(0);
            return;
        }
        const interval = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [isProcessing, processingError]);

    // Handle clicking color icons (toggle)
    const handleColorClick = (color: typeof colorOptions[number]) => {
        if (color === 'Colorless') {
            form.setValue('colorless', true, { shouldValidate: true });
            form.setValue('colorsCodes', [], { shouldValidate: true });
            return;
        }
        if (colorless) form.setValue('colorless', false, { shouldValidate: true });
        const code = colorMap[color];
        if (!code) return;
        const cur = new Set(selectedCodes);
        if (cur.has(code)) cur.delete(code); else cur.add(code);
        form.setValue('colorsCodes', Array.from(cur) as any, { shouldValidate: true });
    };

    // Find existing card by section and name to try to preserve 'faces'
    function findExistingCard(section: string, name: string) {
        if (!existingDeck) return undefined;
        const list = (existingDeck as any).deckData?.[section] ?? [];
        return list.find((c: any) => c.name === name);
    }

    // Submit: upload images (if any), prepare payload and call n8n webhook
    const onSubmit = async (values: DeckFormValues) => {
        try {
            setProcessingError(null);
            setIsProcessing(true);

            // 1) Main image: upload to Supabase (remove previous if editing)
            let mainImagePath = '';
            if (mainImage) {
                if (existingDeck?.main_image_path) {
                    await supabase.storage.from('main_deck_images').remove([existingDeck.main_image_path]);
                }
                let file = mainImage;
                if (file.type === 'image/png') file = await convertToJpg(file, 0.85);
                const objectPath = `products/${Date.now()}-${sanitizeFileName(file.name)}`;
                const { data: mainUp, error: mainErr } = await supabase.storage
                    .from('main_deck_images')
                    .upload(objectPath, file, { cacheControl: '3600', upsert: true });
                if (mainErr) throw mainErr;
                mainImagePath = mainUp?.path || '';
            } else if (isEditMode && existingDeck) {
                mainImagePath = existingDeck.main_image_path;
            }

            // 2) Deck images: upload and (if editing) remove previous ones in chunks
            const deckImagePaths: { originalName: string; path: string }[] = [];
            if (deckImages.length > 0) {
                if (existingDeck) {
                    const oldCardPaths = extractAllCardImagePaths(existingDeck.deckData);
                    if (oldCardPaths.length > 0) {
                        const CHUNK = 100;
                        for (let i = 0; i < oldCardPaths.length; i += CHUNK) {
                            await supabase.storage.from('deck_archives').remove(oldCardPaths.slice(i, i + CHUNK));
                        }
                    }
                }

                const folderName = isEditMode && deckId ? deckId : crypto.randomUUID();
                for (let i = 0; i < deckImages.length; i++) {
                    let file = deckImages[i];
                    const originalName = file.name.replace(/\.[^.]+$/, '');
                    if (file.type === 'image/png') file = await convertToJpg(file, 0.85);
                    const objectPath = `${folderName}/${Date.now()}-${i}-${sanitizeFileName(file.name)}`;
                    const { data: up, error: err } = await supabase.storage
                        .from('deck_archives')
                        .upload(objectPath, file, { cacheControl: '3600', upsert: true });
                    if (err) throw err;
                    deckImagePaths.push({ originalName, path: up?.path || '' });
                }
            }

            // 3) Process decklist and prepare payload
            const colorsCsv = values.colorless ? '' : (values.colorsCodes || []).join(',');
            const parsedCards = parseDecklistToItems(values.decklist);

            let existing_deck_json = undefined;
            let existing_deck_cards: any[] | undefined = undefined;
            if (isEditMode && deckId && existingDeck) {
                existing_deck_json = existingDeck.deckData;

                // If no new photos were uploaded, try to preserve 'faces' found previously
                if ((!deckImages || deckImages.length === 0)) {
                    existing_deck_cards = parsedCards.map(pc => {
                        const found = findExistingCard(pc.section, pc.name);
                        return {
                            name: pc.name,
                            quantity: pc.quantity,
                            section: pc.section,
                            faces: found?.faces ?? [],
                        };
                    });
                }
            }

            const payload: any = {
                name: values.name,
                description: values.description,
                price: parseFloat(values.price),
                format: values.format,
                colors: colorsCsv,
                author_name: values.author_name,
                author_website: values.author_website,
                main_image_path: mainImagePath,
                cards: parsedCards,
                deck_image_paths: deckImagePaths,
                created_by: user?.id ?? null,
                ...(isEditMode ? { deckId: deckId } : { is_visible: false }),
            };

            if (existing_deck_json) payload.existing_deck_json = existing_deck_json;
            if (existing_deck_cards) payload.existing_deck_cards = existing_deck_cards;
            if (existing_deck_cards) payload.preserve_card_images = true; // flag for the n8n flow

            // 4) Call the webhook (n8n) with admin user's token (if exists)
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;

            const res = await fetch(`${import.meta.env.VITE_N8N_WEBHOOK_URL}/deck-process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Webhook error: ${res.status}`);

            // Done: feedback and redirect
            setIsProcessing(false);
            toast({
                title: isEditMode ? 'Deck updated ✓' : 'Deck created ✓',
                description: isEditMode
                    ? 'Data and images have been updated.'
                    : 'Deck created. It is invisible until you publish it.',
            });
            navigate('/admin/decks');
        } catch (err: any) {
            console.error('Error in onSubmit:', err);
            // Save message to show in overlay error
            setProcessingError(err?.message ?? 'Unknown error while saving.');
        }
    };

    const handleDismissError = () => {
        setIsProcessing(false);
        setProcessingError(null);
    };

    // Handle multiple deck images selection
    const handleDeckImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setDeckImages(files.filter((f) => f.type.startsWith('image/')));
    };

    if (loading || loadingDeck) return <div className="p-8">Loading...</div>;

    return (
        <>
            {isProcessing && <ProcessingOverlay elapsedSeconds={elapsedSeconds} error={processingError} onDismissError={handleDismissError} />}
            <div className={`flex flex-col min-h-screen ${isProcessing ? 'pointer-events-none' : ''}`}>
                <Navbar />
                <AdminLayout>
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold mb-8">{isEditMode ? 'Edit Deck' : 'Create New Deck'}</h1>
                        <div className="bg-card rounded-lg border border-border p-8">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="price" render={({ field }) => (
                                        <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="format" render={({ field }) => (
                                        <FormItem><FormLabel>Format</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormItem>
                                        <FormLabel>Colors</FormLabel>
                                        <div className="flex flex-wrap gap-3">
                                            {colorOptions.map((color) => (
                                                <button key={color} type="button" onClick={() => handleColorClick(color)}>
                                                    <ColorIcon color={color} selected={color === 'Colorless' ? colorless : selectedCodes.includes(colorMap[color] as any)} />
                                                </button>
                                            ))}
                                        </div>
                                    </FormItem>
                                    <FormField control={form.control} name="author_name" render={({ field }) => (
                                        <FormItem><FormLabel>Author</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="author_website" render={({ field }) => (
                                        <FormItem><FormLabel>Author Website</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormItem>
                                        <FormLabel>Main Image</FormLabel>
                                        <div className="flex items-center gap-4">
                                            <label className="px-4 py-2 bg-secondary rounded shadow cursor-pointer">
                                                Select Image
                                                <Input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    setMainImage(file ? (file.type === 'image/png' ? await convertToJpg(file, 0.85) : file) : null);
                                                }} />
                                            </label>
                                            {mainImage && <span className="text-sm">{mainImage.name}</span>}
                                        </div>
                                    </FormItem>
                                    <FormItem>
                                        <FormLabel>Deck Images (Optional in edit)</FormLabel>
                                        <div className="flex items-center gap-4">
                                            <label className="px-4 py-2 bg-secondary rounded shadow cursor-pointer">
                                                Select Multiple
                                                <Input type="file" accept="image/*" multiple className="hidden" onChange={handleDeckImagesChange} />
                                            </label>
                                            {deckImages.length > 0 && <span className="text-sm">{deckImages.length} images</span>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">If you upload new photos, the previous ones linked to this deck will be deleted.</p>
                                    </FormItem>
                                    <FormField control={form.control} name="decklist" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Decklist (Will update only if n8n processes)</FormLabel>
                                            <FormControl><Textarea {...field} rows={10} placeholder="1 Sol Ring..." /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="flex justify-end gap-4 pt-4">
                                        <Button type="button" variant="outline" onClick={() => navigate('/admin/decks')}>Cancel</Button>
                                        <Button type="submit" disabled={isProcessing}>
                                            {isProcessing ? 'Saving...' : isEditMode ? 'Update Deck' : 'Create Deck'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>
                </AdminLayout>
            </div>
        </>
    );
};

export default DeckForm;