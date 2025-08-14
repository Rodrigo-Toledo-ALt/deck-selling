import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CardItem {
  name: string;
  quantity: number;
  manaCost: string;
  image: string;
}

interface CardListProps {
  title: string;
  cards: CardItem[];
  onCardHover: (imageUrl: string) => void;
  onCardLeave: () => void;
}

const ManaSymbol = ({ symbol }: { symbol: string }) => {
  const getSymbolStyle = (symbol: string) => {
    switch (symbol.toLowerCase()) {
      case 'w': return 'bg-mtg-white text-mtg-black';
      case 'u': return 'bg-mtg-blue text-white';
      case 'b': return 'bg-mtg-black text-white border border-muted';
      case 'r': return 'bg-mtg-red text-white';
      case 'g': return 'bg-mtg-green text-white';
      default: return 'bg-mtg-colorless text-white border border-muted';
    }
  };

  return (
    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold ${getSymbolStyle(symbol)}`}>
      {symbol}
    </span>
  );
};

const CardList = ({ title, cards, onCardHover, onCardLeave }: CardListProps) => {
  const renderManaCost = (manaCost: string) => {
    return manaCost.split('').map((symbol, index) => (
      <ManaSymbol key={index} symbol={symbol} />
    ));
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground">{title} ({cards.length})</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {cards.map((card, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-1 px-2 rounded text-xs hover:bg-accent cursor-pointer transition-colors"
              onMouseEnter={() => onCardHover(card.image)}
              onMouseLeave={onCardLeave}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-muted-foreground w-4">{card.quantity}</span>
                <span className="text-foreground hover:text-primary transition-colors">{card.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {renderManaCost(card.manaCost)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CardList;