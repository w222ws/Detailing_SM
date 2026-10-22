import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Services from './components/Services';
import Works from './components/Works';
import Partners from './components/Partners';
import Reviews from './components/Reviews';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import ReviewPage from './components/ReviewPage';
import { REVIEW_PATH } from './config/review';

const isReviewPage =
  window.location.pathname.replace(/\/+$/, '') === REVIEW_PATH;

export default function App() {
  if (isReviewPage) return <ReviewPage />;

  return (
    <div className="relative min-h-screen bg-bg-main text-text-main bg-grain font-sans overflow-x-hidden selection:bg-accent-yellow selection:text-bg-main">
      <Header />

      <main>
        <Hero />
        <Marquee />
        <Services />
        <Works />
        <Partners />
        <Reviews />
        <FAQ />
        <Contact />
      </main>
    </div>
  );
}
