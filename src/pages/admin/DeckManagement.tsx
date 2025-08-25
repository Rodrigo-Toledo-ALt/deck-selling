
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Deck, decks as initialDecks } from '@/data/decks.ts';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AdminLayout from '@/components/AdminLayout';

const DeckManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [decks, setDecks] = useState<Deck[]>([]);
  
  useEffect(() => {
    // Check if user is admin, if not redirect to login
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      toast({
        title: "Access denied",
        description: "You need to be logged in as admin to view this page",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    // Load decks (in a real app, this would be from API)
    setDecks(initialDecks);
  }, [navigate, toast]);

  const handleEditDeck = (deckId: string) => {
    navigate(`/admin/decks/edit/${deckId}`);
  };

  const handleDeleteDeck = (deckId: string) => {
    if (window.confirm('Are you sure you want to delete this deck?')) {
      setDecks(decks.filter(deck => deck.id !== deckId));
      
      toast({
        title: "Deck deleted",
        description: "The deck has been successfully deleted",
      });
    }
  };

  const handleCreateDeck = () => {
    navigate('/admin/decks/create');
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">Manage Decks</h1>
          <Button onClick={handleCreateDeck} className="flex items-center gap-2">
            <Plus size={16} />
            <span>Create New Deck</span>
          </Button>
        </div>
        
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Archetype</TableHead>
                <TableHead>Colors</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {decks.map((deck) => (
                <TableRow key={deck.id}>
                  <TableCell>
                    <img 
                      src={deck.imageUrl} 
                      alt={deck.name} 
                      className="w-16 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{deck.name}</TableCell>
                  <TableCell>{deck.archetype}</TableCell>
                  <TableCell>{deck.colors.join(', ')}</TableCell>
                  <TableCell>€{deck.price}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditDeck(deck.id)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteDeck(deck.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DeckManagement;
