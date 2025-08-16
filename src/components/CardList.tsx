import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { renderManaCost } from "@/lib/methods";

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
  return (
    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold ${getSymbolStyle(symbol)}`}>
      {symbol}
    </span>
  );
};

const CardList = ({ title, cards, onCardHover, onCardLeave }: CardListProps) => {


  return (
    <Card className="bg-card border-border -mb-4 break-inside-avoid border-0  bg-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground">{title} ({cards.length}) </CardTitle >
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 ">
          {cards.map((card, index) => (
              <div
                  key={index}
                  className="flex items-center justify-between py-1 px-2 rounded text-sm hover:bg-accent cursor-pointer transition-colors border-t"
                  onMouseEnter={() => onCardHover(card)}  
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