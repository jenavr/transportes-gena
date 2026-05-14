import { Navbar } from './components/Navbar';
import { Hero } from './sections/Hero';
import { Services } from './sections/Services';
import { Quoter } from './sections/Quoter';
import { MapSection } from './sections/MapSection';
import { CtaBanner } from './sections/CtaBanner';
import { Footer } from './sections/Footer';
import { useTheme } from './hooks/useTheme';
import { RouteProvider } from './contexts/RouteContext';

const INITIAL_STOP = {
  origin: '',
  destination: '',
};

const App = () => {
  const { theme, toggle } = useTheme();

  return (
    <RouteProvider initial={INITIAL_STOP}>
      <div className="min-h-screen">
        <Navbar theme={theme} onToggleTheme={toggle} />
        <main>
          <Hero />
          <MapSection />
          <Services />
          <Quoter />
          <CtaBanner />
        </main>
        <Footer />
      </div>
    </RouteProvider>
  );
};

export default App;
