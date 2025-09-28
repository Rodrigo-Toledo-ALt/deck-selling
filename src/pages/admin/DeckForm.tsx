import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
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




const N8N_API_KEY = import.meta.env.N8N_API_KEY

// ------------ 👇 Helper para convertir PNG a JPG -----------------
async function convertToJpg(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Could not get 2D context");

            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject("Conversion failed");
                    const newFile = new File(
                        [blob],
                        file.name.replace(/\.[^.]+$/, ".jpg"), // 👈 aseguramos extensión .jpg
                        {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        }
                    );
                    resolve(newFile);
                },
                "image/jpeg",
                quality
            );
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

function sanitizeFileName(name: string) {
    return name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos
        .replace(/[^a-zA-Z0-9.\-_]/g, "_"); // reemplaza caracteres no permitidos
}

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
// ----------------------------------------------------------------

const manaClasses: Record<string, string> = {
    W: 'ms ms-w ms-cost',
    U: 'ms ms-u ms-cost',
    B: 'ms ms-b ms-cost',
    R: 'ms ms-r ms-cost',
    G: 'ms ms-g ms-cost',
};

export const ColorIcon = ({ color, selected }: { color: string; selected: boolean }) => {
    return (
        <div
            className={`
        rounded-full p-0 cursor-pointer border-2 transition 
        ${selected ? 'border-primary shadow-lg' : 'border-muted-foreground/40'}
      `}
        >
            <i className={`${manaClasses[color]} text-3xl`} title={color} />
        </div>
    );
};

const deckSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
    format: z.string().min(1, 'Format is required'),
    colors: z.array(z.string()).optional(),
    author_name: z.string().min(3, 'Author name is required'),
    author_website: z.string().url().optional().or(z.literal('')),
    decklist: z.string().min(10, 'Decklist must be at least 10 characters'),
});

type DeckFormValues = z.infer<typeof deckSchema>;

const DeckForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { role, loading } = useAuth();

    const form = useForm<DeckFormValues>({
        resolver: zodResolver(deckSchema),
        defaultValues: {
            name: '',
            description: '',
            price: '0.00',
            format: 'Commander',
            colors: [],
            author_name: '',
            author_website: '',
            decklist: '',
        },
    });

    const [mainImage, setMainImage] = useState<File | null>(null);
    const [deckImages, setDeckImages] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!loading && role !== 'admin') {
            toast({
                title: 'Access denied',
                description: 'You need to be logged in as admin to access this page',
                variant: 'destructive',
            });
            navigate('/login');
        }
    }, [loading, role, toast, navigate]);

    const onSubmit = async (values: DeckFormValues) => {
        try {
            setIsProcessing(true);

            // 1. Preparar payload básico (sin subir imágenes todavía)
            const safeDeckName = sanitizeFileName(values.name);

            const payload = {
                name: values.name,
                description: values.description,
                price: parseFloat(values.price),
                format: values.format,
                colors: values.colors?.join(','),
                author_name: values.author_name,
                author_website: values.author_website,
                decklist: values.decklist,
                safeDeckName,
            };

            // 2. Llamada a n8n primero
            const res = await fetch('http://192.168.1.134:5678/webhook/deck-process', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "N8N_API_KEY": N8N_API_KEY
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error(`Webhook failed: ${res.statusText}`);
            }

            const enriched = await res.json(); // n8n responde con deck_cards enriquecidos

            // 3. Subir imágenes una vez que sabemos que el flujo es válido
            let mainImageUrl = '';
            if (mainImage) {
                let file = mainImage;
                if (file.type === "image/png") {
                    file = await convertToJpg(file, 0.85);
                }
                const safeMainName = sanitizeFileName(file.name);

                const { data, error } = await supabase.storage
                    .from("main_deck_images")
                    .upload(`products/${Date.now()}-${safeMainName}`, file, {
                        cacheControl: "3600",
                        upsert: true,
                    });
                if (error) throw error;

                const { data: publicUrl } = supabase
                    .storage
                    .from("main_deck_images")
                    .getPublicUrl(data?.path || "");

                mainImageUrl = publicUrl.publicUrl;
            }

            const deckImageUrls: { originalName: string; url: string }[] = [];
            for (let i = 0; i < deckImages.length; i++) {
                let file = deckImages[i];
                const originalName = file.name.replace(/\.[^.]+$/, "");
                if (file.type === "image/png") {
                    file = await convertToJpg(file, 0.85);
                }
                const safeName = sanitizeFileName(file.name);
                const { data, error } = await supabase.storage
                    .from("deck_archives")
                    .upload(`${safeDeckName}/${Date.now()}-${i}-${safeName}`, file, {
                        cacheControl: "3600",
                        upsert: true,
                    });
                if (error) throw error;

                const { data: publicUrl } = supabase
                    .storage
                    .from("deck_archives")
                    .getPublicUrl(data?.path || "");

                deckImageUrls.push({ originalName, url: publicUrl.publicUrl });
            }

            // 4. Ahora sí inserción definitiva en la base
            const { error: insertError } = await supabase.from("products").insert({
                ...payload,
                main_image_url: mainImageUrl,
                deck_cards: enriched.deck_cards || {},
            });
            if (insertError) throw insertError;

            toast({
                title: "Deck created",
                description: `The deck was created with ${deckImageUrls.length} images.`,
            });
            navigate("/admin/decks");
        } catch (err: any) {
            console.error("Error en onSubmit:", err);
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
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
        setDeckImages(files.filter(f => f.type.startsWith("image/")));
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
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

                            {/* Colors */}
                            <FormItem>
                                <FormLabel>Colors</FormLabel>
                                <div className="flex flex-wrap gap-3">
                                    {['W','U','B','R','G'].map(c => (
                                        <FormField key={c} control={form.control} name="colors"
                                                   render={({ field }) => {
                                                       const checked = field.value?.includes(c);
                                                       return (
                                                           <div onClick={() => {
                                                               if (checked) field.onChange(field.value?.filter((v: string) => v !== c));
                                                               else field.onChange([...(field.value || []), c]);
                                                           }} className="cursor-pointer">
                                                               <ColorIcon color={c} selected={checked} />
                                                           </div>
                                                       );
                                                   }}
                                        />
                                    ))}
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
                                        <Input type="file" accept="image/*" className="hidden"
                                               onChange={async (e) => {
                                                   const file = e.target.files?.[0] || null;
                                                   if (file) {
                                                       console.log("Imagen principal:", file.name, "-", formatBytes(file.size));
                                                       if (file.type === "image/png") {
                                                           const jpg = await convertToJpg(file, 0.85);
                                                           setMainImage(jpg);
                                                       } else {
                                                           setMainImage(file);
                                                       }
                                                   } else setMainImage(null);
                                               }} />
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
                                        <Input type="file" accept="image/*" multiple className="hidden"
                                               onChange={handleDeckImagesChange} />
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
                                    <FormControl><Textarea {...field} rows={10} placeholder="1 Card Name&#10;1 Another Card..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => navigate('/admin/decks')}>Cancel</Button>
                                <Button type="submit" disabled={isProcessing}>
                                    {isProcessing ? 'Processing...' : 'Create Deck'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DeckForm;