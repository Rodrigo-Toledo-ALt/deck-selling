
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { Deck, decks } from '@/data/decks.ts';
import AdminLayout from '@/components/AdminLayout';

const archetypeOptions = ['Aggro', 'Control', 'Combo', 'Midrange', 'Tempo', 'Stax', 'Tribal'];
const colorOptions = [
  { id: 'W', label: 'White' },
  { id: 'U', label: 'Blue' },
  { id: 'B', label: 'Black' },
  { id: 'R', label: 'Red' },
  { id: 'G', label: 'Green' },
];

const deckSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  archetype: z.string().min(1, 'Please select an archetype'),
  colors: z.array(z.string()).min(0),
  price: z.string().min(1, 'Price is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  imageUrl: z.string().url('Please enter a valid URL')
});

type DeckFormValues = z.infer<typeof deckSchema>;

const DeckForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id, action } = useParams<{ id?: string; action: string }>();
  const isEditMode = action === 'edit';

  const form = useForm<DeckFormValues>({
    resolver: zodResolver(deckSchema),
    defaultValues: {
      name: '',
      description: '',
      archetype: '',
      colors: [],
      price: '60',
      imageUrl: '/placeholder.svg'
    }
  });

  useEffect(() => {
    // Check if user is admin, if not redirect to login
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      toast({
        title: "Access denied",
        description: "You need to be logged in as admin to access this page",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    // In edit mode, populate the form with the deck data
    if (isEditMode && id) {
      const deck = decks.find(d => d.id === id);
      if (deck) {
        form.reset({
          name: deck.name,
          description: deck.description,
          archetype: deck.archetype || archetypeOptions[0],
          colors: deck.colors,
          price: deck.price.toString(),
          imageUrl: deck.imageUrl
        });
      } else {
        toast({
          title: "Deck not found",
          description: "The deck you're trying to edit doesn't exist",
          variant: "destructive"
        });
        navigate('/admin/decks');
      }
    }
  }, [isEditMode, id, navigate, toast, form]);

  const onSubmit = (values: DeckFormValues) => {
    console.log(values);
    
    // Mock save logic (would be API in real app)
    const message = isEditMode ? "updated" : "created";
    
    toast({
      title: `Deck ${message}`,
      description: `The deck has been successfully ${message}`,
    });
    
    navigate('/admin/decks');
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gradient mb-8">
          {isEditMode ? 'Edit Deck' : 'Create New Deck'}
        </h1>
        
        <div className="bg-card rounded-lg border border-border p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deck Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Golgari Reanimator" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the deck strategy and key cards..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="archetype"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Archetype</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an archetype" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {archetypeOptions.map(archetype => (
                            <SelectItem key={archetype} value={archetype}>
                              {archetype}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (€)</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormDescription>
                        Standard price is €60
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="colors"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Colors</FormLabel>
                      <FormDescription>
                        Select all colors included in the deck
                      </FormDescription>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {colorOptions.map((color) => (
                        <FormField
                          key={color.id}
                          control={form.control}
                          name="colors"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={color.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(color.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, color.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== color.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {color.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the URL of the deck's feature image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/admin/decks')}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditMode ? 'Update Deck' : 'Create Deck'}
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
