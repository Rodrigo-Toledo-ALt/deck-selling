
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4 text-gradient">About Pauper Forge</h1>
            <p className="text-lg text-muted-foreground">
              Learn more about our premium MTG proxy deck service
            </p>
          </div>
        </section>
        
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                <p className="text-foreground/90 mb-4">
                  Pauper Forge was created by a team of passionate Magic: The Gathering players who believed that everyone should have access to a wide variety of decks for casual play and collecting without breaking the bank.
                </p>
                <p className="text-foreground/90 mb-4">
                  We understand that many iconic and powerful MTG decks can cost hundreds or even thousands of euros to build with original cards. Our mission is to provide high-quality proxies that allow players to experience these decks at an affordable price.
                </p>
                <p className="text-foreground/90">
                  All of our proxy decks are meticulously designed to look and feel as close to the original cards as possible, while being clearly marked as proxies for ethical play.
                </p>
              </div>
              
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4" id="disclaimer">Disclaimer</h2>
                <div className="bg-card p-6 rounded-lg border border-border">
                  <p className="text-foreground/90 mb-4">
                    Our proxy cards are intended for casual play, collecting, and playtesting purposes only. They are not official Magic: The Gathering cards produced by Wizards of the Coast.
                  </p>
                  <p className="text-foreground/90 mb-4">
                    Pauper Forge acknowledges that Magic: The Gathering is a registered trademark of Wizards of the Coast LLC, a subsidiary of Hasbro, Inc. We are not affiliated with, endorsed, sponsored, or specifically approved by Wizards of the Coast LLC.
                  </p>
                  <p className="text-foreground/90">
                    We recommend using our proxies only in casual, non-sanctioned play environments. These cards should not be used as substitutes for real cards in DCI-sanctioned tournaments.
                  </p>
                </div>
              </div>
              
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">What are MTG proxies?</h3>
                    <p className="text-foreground/90">
                      Proxies are unofficial copies of Magic: The Gathering cards that look similar to the original cards but are not produced by Wizards of the Coast. They allow players to experience a wider variety of decks for casual play.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">What is the quality of your proxies?</h3>
                    <p className="text-foreground/90">
                      Our proxies are printed on high-quality cardstock with vibrant colors and clear text. While they are not identical to official MTG cards, they are designed to look and feel similar for an enjoyable play experience.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">How much do your proxy decks cost?</h3>
                    <p className="text-foreground/90">
                      All of our proxy decks are priced at a flat rate of €60 with free shipping, regardless of the market value of the original cards.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Do you offer custom decks?</h3>
                    <p className="text-foreground/90">
                      Currently, we only offer the pre-designed decks listed in our catalog. We may consider custom deck options in the future.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">How long does shipping take?</h3>
                    <p className="text-foreground/90">
                      Shipping typically takes 5-10 business days within Europe, and 10-15 business days for international orders.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Are your proxies tournament legal?</h3>
                    <p className="text-foreground/90">
                      No, our proxies are not legal for use in DCI-sanctioned tournaments. They are intended for casual play only.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4" id="terms">Terms of Service</h2>
                <div className="bg-card p-6 rounded-lg border border-border">
                  <p className="text-foreground/90 mb-4">
                    By purchasing from Pauper Forge, you agree to use our proxy cards for casual play only. You acknowledge that these are not official Magic: The Gathering cards and should not be misrepresented as such.
                  </p>
                  <p className="text-foreground/90">
                    For the full terms of service, please contact us.
                  </p>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-4" id="privacy">Privacy Policy</h2>
                <div className="bg-card p-6 rounded-lg border border-border">
                  <p className="text-foreground/90 mb-4">
                    Pauper Forge respects your privacy and is committed to protecting your personal data. We collect only the information necessary to process your order and provide customer service.
                  </p>
                  <p className="text-foreground/90">
                    For the full privacy policy, please contact us.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
