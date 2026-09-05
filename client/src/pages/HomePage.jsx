import Hero from '../components/Hero';
import LogoMarquee from '../components/LogoMarquee';
import ForCompanies from '../components/ForCompanies';
import ForCandidates from '../components/ForCandidates';
import ReachFeature from '../components/ReachFeature';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogoMarquee />
      <ForCompanies />
      <ForCandidates />
      <ReachFeature />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
