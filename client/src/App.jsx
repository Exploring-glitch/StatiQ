import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LogoMarquee from './components/LogoMarquee';
import ForCompanies from './components/ForCompanies';
import ForCandidates from './components/ForCandidates';
import ReachFeature from './components/ReachFeature';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-base">
      <Navbar />
      <main>
        <Hero />
        <LogoMarquee />
        <ForCompanies />
        <ForCandidates />
        <ReachFeature />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
