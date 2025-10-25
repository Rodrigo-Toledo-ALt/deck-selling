import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const N8N_API_KEY = import.meta.env.N8N_API_KEY;

// Helpers imágenes
async function convertToJpg(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
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
function sanitizeFileName(name: string) {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9.\-_]/g, '_');
}
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024; const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Apariencia de colores tipo Catalog (sin Any)
const colorOptions = ['White', 'Blue', 'Black', 'Red', 'Green', 'Colorless'] as const;
const colorMap: Record<typeof colorOptions[number], 'W'|'U'|'B'|'R'|'G'|''> = {
    White: 'W', Blue: 'U', Black: 'B', Red: 'R', Green: 'G', Colorless: '',
};
const manaClasses: Record<typeof colorOptions[number], string> = {
    White: 'ms ms-w ms-cost',
    Blue: 'ms ms-u ms-cost',
    Black: 'ms ms-b ms-cost',
    Red: 'ms ms-r ms-cost',
    Green: 'ms ms-g ms-cost',
    Colorless: 'ms ms-c ms-cost',
};
const ColorIcon = ({ color, selected }: { color: typeof colorOptions[number]; selected: boolean }) => (
    <div className={`mana-icon-button ${selected ? 'active' : ''}`}>
        <i className={`${manaClasses[color]} text-3xl`} title={color} />
    </div>
);

// Validación
const deckSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
    format: z.string().min(1, 'Format is required'),
    colorsCodes: z.array(z.enum(['W','U','B','R','G'])).optional(), // solo verdaderos colores
    colorless: z.boolean().default(false), // bandera excluyente
    author_name: z.string().min(3, 'Author name is required'),
    author_website: z.string().url().optional().or(z.literal('')),
    decklist: z.string().min(10, 'Decklist must be at least 10 characters'),
}).superRefine((data, ctx) => {
    // Regla: Colorless es excluyente
    if (data.colorless && (data.colorsCodes?.length || 0) > 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Colorless no puede combinarse con otros colores', path: ['colorsCodes'] });
    }
    // Opcional: forzar elegir algo (colorless o algún color)
    if (!data.colorless && (data.colorsCodes?.length || 0) === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecciona Colorless o al menos un color', path: ['colorsCodes'] });
    }
});

type DeckFormValues = z.infer<typeof deckSchema>;

const DeckForm: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, role, loading } = useAuth();

    const form = useForm<DeckFormValues>({
        resolver: zodResolver(deckSchema),
        defaultValues: {
            name: '',
            description: '',
            price: '0.00',
            format: 'Commander',
            colorsCodes: [],
            colorless: false,
            author_name: '',
            author_website: '',
            decklist: '',
        },
    });

    // Estado UI para resaltar selección (derivado de form)
    const selectedCodes = form.watch('colorsCodes') || [];
    const colorless = form.watch('colorless');

    const [mainImage, setMainImage] = useState<File | null>(null);
    const [deckImages, setDeckImages] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!loading && role !== 'admin') {
            toast({ title: 'Access denied', description: 'You need to be logged in as admin to access this page', variant: 'destructive' });
            navigate('/login');
        }
    }, [loading, role, toast, navigate]);

    // Click handler con “Colorless” excluyente
    const handleColorClick = (color: typeof colorOptions[number]) => {
        if (color === 'Colorless') {
            // Activar colorless y vaciar colores
            form.setValue('colorless', true, { shouldDirty: true, shouldValidate: true });
            form.setValue('colorsCodes', [], { shouldDirty: true, shouldValidate: true });
            return;
        }
        // Si había colorless, lo quitamos
        if (colorless) {
            form.setValue('colorless', false, { shouldDirty: true, shouldValidate: true });
        }
        // Toggle del color correspondiente
        const code = colorMap[color];
        if (!code) return;
        const cur = new Set(selectedCodes);
        if (cur.has(code)) cur.delete(code); else cur.add(code);
        form.setValue('colorsCodes', Array.from(cur) as any, { shouldDirty: true, shouldValidate: true });
    };

    const onSubmit = async (values: DeckFormValues) => {
        try {
            setIsProcessing(true);

            // Imagen principal
            let mainImagePath = '';
            if (mainImage) {
                let file = mainImage;
                if (file.type === 'image/png') file = await convertToJpg(file, 0.85);
                const objectPath = `products/${Date.now()}-${sanitizeFileName(file.name)}`;
                const { data: mainUp, error: mainErr } = await supabase.storage
                    .from('main_deck_images')
                    .upload(objectPath, file, { cacheControl: '3600', upsert: true });
                if (mainErr) throw mainErr;
                mainImagePath = mainUp?.path || '';
            }

            // Imágenes del mazo
            const deckImagePaths: { originalName: string; path: string }[] = [];
            const safeDeckName = sanitizeFileName(values.name);
            for (let i = 0; i < deckImages.length; i++) {
                let file = deckImages[i];
                const originalName = file.name.replace(/\.[^.]+$/, '');
                if (file.type === 'image/png') file = await convertToJpg(file, 0.85);
                const objectPath = `${safeDeckName}/${Date.now()}-${i}-${sanitizeFileName(file.name)}`;
                const { data: up, error: err } = await supabase.storage
                    .from('deck_archives')
                    .upload(objectPath, file, { cacheControl: '3600', upsert: true });
                if (err) throw err;
                deckImagePaths.push({ originalName, path: up?.path || '' });
            }

            // Persistencia colores
            const colorsCsv = values.colorless
                ? '' // incoloro
                : (values.colorsCodes || []).join(',');

            const payload = {
                name: values.name,
                description: values.description,
                price: parseFloat(values.price),
                format: values.format,
                colors: colorsCsv,
                author_name: values.author_name,
                author_website: values.author_website,
                main_image_path: mainImagePath,
                decklist: values.decklist,
                deck_image_paths: deckImagePaths,
                created_by: user?.id ?? null,
            };

            const res = await fetch('http://192.168.1.134:5679/webhook/deck-process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'N8N_API_KEY': N8N_API_KEY },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`Webhook failed: ${res.status} ${res.statusText}`);
            const data = await res.json();

            toast({ title: 'Deck created', description: `Deck creado con id ${data.id} y ${deckImagePaths.length} imágenes.` });
            navigate('/admin/decks');
        } catch (err: any) {
            console.error('Error en onSubmit:', err);
            toast({ title: 'Error', description: err?.message ?? 'Ocurrió un error al crear el deck.', variant: 'destructive' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeckImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) {
            setDeckImages([]);
            return;
        }
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        console.log(`📁 Seleccionadas ${files.length} imágenes, total ${formatBytes(totalSize)}`);
        setDeckImages(files.filter((f) => f.type.startsWith('image/')));
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
        <AdminLayout>


            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Create New Deck</h1>

                <div className="bg-card rounded-lg border border-border p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Name */}
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Description */}
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea {...field} rows={4} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Price */}
                            <FormField control={form.control} name="price" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Format */}
                            <FormField control={form.control} name="format" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Format</FormLabel>
                                    <FormControl><Input {...field} placeholder="Commander / Modern..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Selector de colores (sin Any) con Colorless excluyente */}
                            <FormItem>
                                <FormLabel>Colors</FormLabel>
                                <div className="flex flex-wrap gap-3">
                                    {colorOptions.map((color) => {
                                        const selected =
                                            color === 'Colorless'
                                                ? colorless
                                                : selectedCodes.includes(colorMap[color] as any);
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => handleColorClick(color)}
                                                className="focus:outline-none"
                                                aria-label={`Select ${color}`}
                                            >
                                                <ColorIcon color={color} selected={selected} />
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="text-sm text-muted-foreground mt-2">
                                    Colorless es excluyente y no puede combinarse con otros colores.
                                </div>
                                <div className="text-sm mt-1">
                                    Selected: {colorless ? 'Colorless' : (selectedCodes.length ? selectedCodes.join(', ') : '—')}
                                </div>
                                <FormMessage />
                            </FormItem>

                            {/* Author */}
                            <FormField control={form.control} name="author_name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Author Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="author_website" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Author Website</FormLabel>
                                    <FormControl><Input {...field} placeholder="Optional" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Main image */}
                            <FormItem>
                                <FormLabel>Main image (upload)</FormLabel>
                                <div className="flex items-center gap-4">
                                    <label className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md shadow cursor-pointer hover:bg-secondary/80">
                                        Choose File
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0] || null;
                                                if (file) setMainImage(file.type === 'image/png' ? await convertToJpg(file, 0.85) : file);
                                                else setMainImage(null);
                                            }}
                                        />
                                    </label>
                                    {mainImage && <span className="text-sm text-muted-foreground">{mainImage.name}</span>}
                                </div>
                            </FormItem>

                            {/* Deck images */}
                            <FormItem>
                                <FormLabel>Deck Card Images</FormLabel>
                                <div className="flex items-center gap-4">
                                    <label className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md shadow cursor-pointer hover:bg-secondary/80">
                                        Select Multiple Images
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleDeckImagesChange}
                                        />
                                    </label>
                                    {deckImages.length > 0 && (
                                        <span className="text-sm text-muted-foreground">
                      {deckImages.length} images selected ({formatBytes(deckImages.reduce((s, f) => s + f.size, 0))})
                    </span>
                                    )}
                                </div>
                            </FormItem>

                            {/* Decklist */}
                            <FormField control={form.control} name="decklist" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Decklist</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={10} placeholder={'1 Card Name\n1 Another Card...'} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => navigate('/admin/decks')}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isProcessing}>
                                    {isProcessing ? 'Processing...' : 'Create Deck'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </AdminLayout>
    </div>
    );
};

export default DeckForm;