import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Services from './components/Services';
import Process from './components/Process';
import Portfolio from './components/Portfolio';
import FAQ from './components/FAQ';
import Contact from './components/Contact';

export default function App() {
  return (
    <div className="relative min-h-screen bg-bg-main text-text-main bg-grain font-sans overflow-x-hidden selection:bg-accent-yellow selection:text-bg-main">
      <Header />

      <main>
        <Hero />
        <Marquee />
        <Services />
        <Process />
        <Portfolio />
        <FAQ />
        <Contact />
      </main>
    </div>
  );
}
