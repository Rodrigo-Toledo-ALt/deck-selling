// DeckForm.tsx
// Formulario para crear/editar un mazo (admin).
// - sube imágenes a Supabase
// - prepara payload y llama a un webhook (n8n) que procesa el mazo (Scryfall, OCR, etc.)
// Comentarios en español, concisos para el TFG.

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

// Extrae todas las rutas de imagen almacenadas en deckData (para limpieza en edición)
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

// Parsea un decklist en texto (formato "1x Sol Ring" y comentarios //section)
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

// Convierte PNG a JPG usando canvas (para reducir compatibilidad/size)
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

// Sanitiza nombre de archivo para usar en rutas de almacenamiento
function sanitizeFileName(name: string) {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

// Formatea bytes a texto legible
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024; const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Opciones de colores (UI + mapeo a códigos)
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

// Esquema Zod para validar el formulario (client-side)
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
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Colorless no puede combinarse con otros colores', path: ['colorsCodes'] });
    }
    if (!data.colorless && (data.colorsCodes?.length || 0) === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecciona Colorless o al menos un color', path: ['colorsCodes'] });
    }
});

type DeckFormValues = z.infer<typeof deckSchema>;

// Pasos de procesamiento mostrados en overlay (informativo)
const PROCESSING_STEPS = [
    { label: 'Subiendo imágenes...', duration: 0 },
    { label: 'Enviando mazo a procesamiento...', duration: 8000 },
    { label: 'Obteniendo datos de Scryfall...', duration: 20000 },
    { label: 'Cruzando imágenes de cartas...', duration: 45000 },
    { label: 'Construyendo estructura del mazo...', duration: 75000 },
    { label: 'Guardando en base de datos...', duration: 110000 },
    { label: 'Casi listo...', duration: 150000 },
];

interface ProcessingOverlayProps {
    elapsedSeconds: number;
    error: string | null;
    onDismissError: () => void;
}

// Overlay que muestra progreso/estado durante el procesamiento del mazo
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
                        {/* Estado de error: muestra mensaje y botón para cerrar */}
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive">
                            <i className="ms ms-ability-deathtouch ms-3x text-destructive" />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-bold text-destructive">Error de procesamiento</h2>
                            <p className="text-sm text-muted-foreground">Ocurrió un error al procesar el deck.</p>
                        </div>
                        <div className="w-full bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                            <p className="text-sm text-destructive font-mono break-words">{error}</p>
                        </div>
                        <p className="text-xs text-muted-foreground tabular-nums">Falló a los: {timeStr}</p>
                        <Button variant="outline" onClick={onDismissError} className="w-full">
                            Cerrar e intentar de nuevo
                        </Button>
                    </>
                ) : (
                    <>
                        {/* Estado procesando: animación, paso actual y barra */}
                        <div className="relative flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full border-4 border-muted animate-spin border-t-primary" />
                            <div className="absolute">
                                <i className="ms ms-planeswalker ms-4x text-primary opacity-80" />
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <h2 className="text-xl font-bold tracking-tight">Procesando Mazo</h2>
                            <p className="text-sm text-muted-foreground">
                                Esto puede tardar unos minutos. Por favor, no cierres esta pestaña.
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
                        <p className="text-xs text-muted-foreground tabular-nums">Tiempo: {timeStr}</p>
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

    // react-hook-form con validación Zod
    const form = useForm<DeckFormValues>({
        resolver: zodResolver(deckSchema),
        defaultValues: {
            name: '', description: '', price: '0.00', format: 'Commander',
            colorsCodes: [], colorless: false, author_name: '', author_website: '', decklist: '',
        },
    });

    // Valores observados del formulario
    const selectedCodes = form.watch('colorsCodes') || [];
    const colorless = form.watch('colorless');

    // Estados de archivos / procesamiento / deck existente
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [deckImages, setDeckImages] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingError, setProcessingError] = useState<string | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [loadingDeck, setLoadingDeck] = useState(isEditMode);
    const [existingDeck, setExistingDeck] = useState<DeckData | null>(null);

    // Requiere rol admin: redirige si no tiene acceso
    useEffect(() => {
        if (!loading && role !== 'admin') {
            toast({ title: 'Acceso denegado', description: 'Debes ser administrador', variant: 'destructive' });
            navigate('/login');
        }
    }, [loading, role, toast, navigate]);

    // Si es edición, cargar el mazo y prellenar el formulario
    useEffect(() => {
        if (!isEditMode || !deckId) return;
        (async () => {
            try {
                setLoadingDeck(true);
                const deck = await getDeckById(deckId, true);
                if (!deck) {
                    toast({ title: 'Error', description: 'Mazo no encontrado', variant: 'destructive' });
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
                toast({ title: 'Error', description: 'No se pudo cargar el mazo', variant: 'destructive' });
            } finally {
                setLoadingDeck(false);
            }
        })();
    }, [deckId, isEditMode]);

    // Cronómetro mientras se procesa (para overlay)
    useEffect(() => {
        if (!isProcessing || processingError) {
            if (!isProcessing) setElapsedSeconds(0);
            return;
        }
        const interval = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [isProcessing, processingError]);

    // Maneja el click en los iconos de color (toggle)
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

    // Busca una carta existente por sección y nombre para intentar preservar 'faces'
    function findExistingCard(section: string, name: string) {
        if (!existingDeck) return undefined;
        const list = (existingDeck as any).deckData?.[section] ?? [];
        return list.find((c: any) => c.name === name);
    }

    // Submit: sube imágenes (si hay), prepara payload y llama al webhook n8n
    const onSubmit = async (values: DeckFormValues) => {
        try {
            setProcessingError(null);
            setIsProcessing(true);

            // 1) Imagen principal: subir a Supabase (borrar anterior si edita)
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

            // 2) Imágenes del mazo: subir y (si edita) borrar las anteriores en chunks
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

            // 3) Procesar decklist y preparar payload
            const colorsCsv = values.colorless ? '' : (values.colorsCodes || []).join(',');
            const parsedCards = parseDecklistToItems(values.decklist);

            let existing_deck_json = undefined;
            let existing_deck_cards: any[] | undefined = undefined;
            if (isEditMode && deckId && existingDeck) {
                existing_deck_json = existingDeck.deckData;

                // Si no subieron nuevas fotos, intentamos preservar las 'faces' encontradas
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
            if (existing_deck_cards) payload.preserve_card_images = true; // bandera para el flujo n8n

            // 4) Llamada al webhook (n8n) con token del usuario admin (si existe)
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

            if (!res.ok) throw new Error(`Error en webhook: ${res.status}`);

            // Done: feedback y redirección
            setIsProcessing(false);
            toast({
                title: isEditMode ? 'Mazo actualizado ✓' : 'Mazo creado ✓',
                description: isEditMode
                    ? 'Se han actualizado los datos y fotos.'
                    : 'Mazo creado. Es invisible hasta que lo publiques.',
            });
            navigate('/admin/decks');
        } catch (err: any) {
            console.error('Error en onSubmit:', err);
            // Guardar mensaje para mostrar en overlay de error
            setProcessingError(err?.message ?? 'Error desconocido al guardar.');
        }
    };

    const handleDismissError = () => {
        setIsProcessing(false);
        setProcessingError(null);
    };

    // Maneja selección múltiple de imágenes del mazo
    const handleDeckImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setDeckImages(files.filter((f) => f.type.startsWith('image/')));
    };

    if (loading || loadingDeck) return <div className="p-8">Cargando...</div>;

    return (
        <>
            {isProcessing && <ProcessingOverlay elapsedSeconds={elapsedSeconds} error={processingError} onDismissError={handleDismissError} />}
            <div className={`flex flex-col min-h-screen ${isProcessing ? 'pointer-events-none' : ''}`}>
                <Navbar />
                <AdminLayout>
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold mb-8">{isEditMode ? 'Editar Mazo' : 'Crear Nuevo Mazo'}</h1>
                        <div className="bg-card rounded-lg border border-border p-8">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="price" render={({ field }) => (
                                        <FormItem><FormLabel>Precio</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="format" render={({ field }) => (
                                        <FormItem><FormLabel>Formato</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormItem>
                                        <FormLabel>Colores</FormLabel>
                                        <div className="flex flex-wrap gap-3">
                                            {colorOptions.map((color) => (
                                                <button key={color} type="button" onClick={() => handleColorClick(color)}>
                                                    <ColorIcon color={color} selected={color === 'Colorless' ? colorless : selectedCodes.includes(colorMap[color] as any)} />
                                                </button>
                                            ))}
                                        </div>
                                    </FormItem>
                                    <FormField control={form.control} name="author_name" render={({ field }) => (
                                        <FormItem><FormLabel>Autor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="author_website" render={({ field }) => (
                                        <FormItem><FormLabel>Web del Autor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormItem>
                                        <FormLabel>Imagen Principal</FormLabel>
                                        <div className="flex items-center gap-4">
                                            <label className="px-4 py-2 bg-secondary rounded shadow cursor-pointer">
                                                Seleccionar Imagen
                                                <Input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    setMainImage(file ? (file.type === 'image/png' ? await convertToJpg(file, 0.85) : file) : null);
                                                }} />
                                            </label>
                                            {mainImage && <span className="text-sm">{mainImage.name}</span>}
                                        </div>
                                    </FormItem>
                                    <FormItem>
                                        <FormLabel>Imágenes del Mazo (Opcional en edición)</FormLabel>
                                        <div className="flex items-center gap-4">
                                            <label className="px-4 py-2 bg-secondary rounded shadow cursor-pointer">
                                                Seleccionar Múltiples
                                                <Input type="file" accept="image/*" multiple className="hidden" onChange={handleDeckImagesChange} />
                                            </label>
                                            {deckImages.length > 0 && <span className="text-sm">{deckImages.length} imágenes</span>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Si subes fotos nuevas, se borrarán las anteriores vinculadas a este mazo.</p>
                                    </FormItem>
                                    <FormField control={form.control} name="decklist" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Decklist (Actualizará solo si n8n procesa)</FormLabel>
                                            <FormControl><Textarea {...field} rows={10} placeholder="1 Sol Ring..." /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="flex justify-end gap-4 pt-4">
                                        <Button type="button" variant="outline" onClick={() => navigate('/admin/decks')}>Cancelar</Button>
                                        <Button type="submit" disabled={isProcessing}>
                                            {isProcessing ? 'Guardando...' : isEditMode ? 'Actualizar Mazo' : 'Crear Mazo'}
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