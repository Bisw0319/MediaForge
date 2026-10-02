import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';

// Pages
import HomePage from './pages/HomePage';
import ImageCompressorPage from './pages/ImageCompressorPage';
import VideoCompressorPage from './pages/VideoCompressorPage';
import PdfCompressorPage from './pages/PdfCompressorPage';
import AudioCompressorPage from './pages/AudioCompressorPage';
import BackgroundRemoverPage from './pages/BackgroundRemoverPage';
import ImageResizerPage from './pages/ImageResizerPage';
import ImageConverterPage from './pages/ImageConverterPage';
import VideoConverterPage from './pages/VideoConverterPage';
import ZipCreatorPage from './pages/ZipCreatorPage';
import PdfToolsPage from './pages/PdfToolsPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [preloadedFile, setPreloadedFile] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pdfInitialTab, setPdfInitialTab] = useState('img-to-pdf');
  const [backendOffline, setBackendOffline] = useState(false);

  // Monitor backend API connectivity
  useEffect(() => {
    let isMounted = true;
    const verifyBackendHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (isMounted) {
          setBackendOffline(!res.ok);
        }
      } catch {
        if (isMounted) {
          setBackendOffline(true);
        }
      }
    };
    verifyBackendHealth();
    const timer = setInterval(verifyBackendHealth, 6000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // Prevent unwanted browser file opens when dropping outside dropzones
  useEffect(() => {
    const handleWindowDragOver = (e) => e.preventDefault();
    const handleWindowDrop = (e) => e.preventDefault();
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);
    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, []);

  // Global Ctrl+K / Cmd+K shortcut to open the Command Palette / Search Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Transition from Home universal dropzone to a specific tool with the preloaded file
  const handleFileSelectedForPage = (targetPage, fileOrFiles) => {
    setPreloadedFile(fileOrFiles);
    setActivePage(targetPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavBack = () => {
    setActivePage('home');
    setPreloadedFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerUpload = () => {
    // If not already on a tool page, navigate to image compressor
    if (activePage === 'home') {
      setActivePage('image-compressor');
    }
  };

  const handleSelectPdfTab = (tab) => {
    setPdfInitialTab(tab);
    setActivePage('pdf-tools');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Backend Offline Warning Banner (Shown only if port 8000 is down) */}
      {backendOffline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2.5 text-center font-medium shadow-md flex items-center justify-center space-x-2 animate-fadeIn z-50 sticky top-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-200" />
          <span>
            <strong>Backend Server Offline (Status 502):</strong> Python FastAPI on port 8000 is not running. Start it with <code className="bg-black/25 px-1.5 py-0.5 rounded font-mono font-bold">run.bat</code> or <code className="bg-black/25 px-1.5 py-0.5 rounded font-mono font-bold">npm run dev</code>.
          </span>
        </div>
      )}

      {/* Sticky Navbar with Search Icon */}
      <Navbar
        activePage={activePage}
        setActivePage={(p) => {
          setActivePage(p);
          setPreloadedFile(null);
        }}
        onTriggerUpload={handleTriggerUpload}
        onOpenSearch={() => setIsSearchOpen(true)}
        onSelectPdfTab={handleSelectPdfTab}
      />

      {/* Global Spotlight / Search Palette Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={(toolId, tab) => {
          if (tab) setPdfInitialTab(tab);
          setActivePage(toolId);
          setPreloadedFile(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            setActivePage={(p) => {
              setActivePage(p);
              setPreloadedFile(null);
            }}
            onFileSelectedForPage={handleFileSelectedForPage}
            onSelectPdfTab={handleSelectPdfTab}
          />
        )}

        {activePage === 'image-compressor' && (
          <ImageCompressorPage
            initialFile={preloadedFile}
            onBack={handleNavBack}
          />
        )}

        {activePage === 'video-compressor' && (
          <VideoCompressorPage
            initialFile={preloadedFile}
            onBack={handleNavBack}
          />
        )}

        {activePage === 'pdf-compressor' && (
          <PdfCompressorPage
            initialFile={preloadedFile}
            onBack={handleNavBack}
          />
        )}

        {activePage === 'pdf-tools' && (
          <PdfToolsPage
            initialTab={pdfInitialTab}
            initialFile={preloadedFile}
            onBack={handleNavBack}
            onNavigateToCompressor={() => {
              setActivePage('pdf-compressor');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'audio-compressor' && (
          <AudioCompressorPage
            initialFile={preloadedFile}
            onBack={handleNavBack}
          />
        )}

        {activePage === 'background-remover' && (
          <BackgroundRemoverPage
            initialFile={preloadedFile}
            onBack={handleNavBack}
          />
        )}

        {activePage === 'image-resizer' && (
          <ImageResizerPage
            initialFile={preloadedFile}
            onBack={handleNavBack}
          />
        )}

        {activePage === 'image-converter' && (
          <ImageConverterPage
            initialFile={preloadedFile}
            onBack={handleNavBack}
          />
        )}

        {activePage === 'video-converter' && (
          <VideoConverterPage
            initialFile={preloadedFile}
            onBack={handleNavBack}
          />
        )}

        {activePage === 'zip-creator' && (
          <ZipCreatorPage
            initialFile={preloadedFile}
            onBack={handleNavBack}
          />
        )}

        {activePage === 'about' && (
          <AboutPage setActivePage={setActivePage} />
        )}

        {activePage === 'privacy' && (
          <PrivacyPage />
        )}

        {activePage === 'terms' && (
          <TermsPage />
        )}
      </main>

      {/* Footer */}
      <Footer setActivePage={setActivePage} />

    </div>
  );
}
