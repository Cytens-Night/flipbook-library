import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import HTMLFlipBook from 'react-pageflip';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Quote, 
  Volume2, 
  VolumeX,
  BookmarkCheck,
  X,
  Trash2,
  Moon,
  Sun,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useSettingsStore, useLibraryStore } from '../../store/useStore';
import { ttsService } from '../../utils/ttsService';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import PDFPageRenderer from './PDFPageRenderer';

const ReadingViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid rgba(137, 180, 250, 0.2);
  position: relative;
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: ${({ $progress }) => $progress}%;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.accentHover});
  transition: width 0.3s ease;
  box-shadow: 0 0 8px ${({ theme }) => theme.colors.accentGlow};
`;

const BookTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: ${props => props.theme.colors.accent};
`;

const ControlButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const IconButton = styled.button`
  background: transparent;
  border: 1px solid ${props => props.theme.colors.accent};
  color: ${props => props.theme.colors.accent};
  padding: ${props => props.theme.spacing.sm};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.colors.accent};
    color: ${props => props.theme.colors.background};
  }
  
  &.active {
    background: ${props => props.theme.colors.accent};
    color: ${props => props.theme.colors.background};
  }
`;

const ReadingControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.surfaceHover};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const FontSizeButton = styled.button`
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  padding: 0.35rem 0.65rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.theme.colors.accent};
    color: ${props => props.theme.colors.background};
    border-color: ${props => props.theme.colors.accent};
  }
`;

const VoiceSelector = styled.select`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  padding: 0.35rem 0.65rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.theme.colors.accent};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.accent};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.accentGlow};
  }
`;

const FlipbookContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.lg};
  overflow: hidden;
`;

const Page = styled.div`
  position: relative;
  background: ${props => props.$bgColor || '#FFFFFF'};
  color: ${props => props.$textColor || '#000000'};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  overflow: auto;
  font-family: ${props => props.$fontFamily || 'Georgia, serif'};
  font-size: ${props => props.$fontSize || '16px'};
  line-height: ${props => props.$lineHeight || '1.6'};
  user-select: text;
`;

const PageContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const PageBookmarkButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.sm};
  right: ${props => props.theme.spacing.sm};
  background: rgba(137, 180, 250, 0.9);
  border: none;
  color: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.sm};
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  &:hover {
    background: rgba(137, 180, 250, 1);
    transform: scale(1.1);
  }
`;

const PageImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const NavigationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border-top: 1px solid rgba(137, 180, 250, 0.2);
`;

const NavButton = styled.button`
  background: ${props => props.theme.colors.accent};
  color: ${props => props.theme.colors.background};
  border: none;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-weight: 500;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.colors.textSecondary};
  gap: ${props => props.theme.spacing.md};
`;

const SidePanel = styled.div`
  position: fixed;
  right: ${props => props.$isOpen ? '0' : '-400px'};
  top: 0;
  width: 400px;
  height: 100vh;
  background: ${props => props.theme.colors.surface};
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
  transition: right 0.3s ease;
  z-index: 1300;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid rgba(137, 180, 250, 0.2);
`;

const PanelTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.accent};
  font-size: 1.125rem;
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.md};
`;

const QuoteItem = styled.div`
  background: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.md};
  border-radius: 8px;
  margin-bottom: ${props => props.theme.spacing.md};
  border-left: 3px solid ${props => props.theme.colors.accent};
`;

const QuoteText = styled.p`
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-style: italic;
  line-height: 1.5;
`;

const QuoteMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const BookmarkItem = styled.div`
  background: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.md};
  border-radius: 8px;
  margin-bottom: ${props => props.theme.spacing.sm};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;

  &:hover {
    color: #E57373;
  }
`;

const HighlightButton = styled.button`
  position: fixed;
  background: ${props => props.theme.colors.accent};
  color: ${props => props.theme.colors.background};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1200;
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const ReadingView = ({ book, onClose, onBookmark, onAddQuote }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState(null);
  const [showQuotesPanel, setShowQuotesPanel] = useState(false);
  const [showBookmarksPanel, setShowBookmarksPanel] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const bookRef = useRef(null);
  const settingsStore = useSettingsStore();
  const { books, quotes: allQuotes } = useLibraryStore();
  const settings = {
    backgroundColor: nightMode ? '#1A1A1A' : (settingsStore.backgroundColor || '#FFFFFF'),
    textColor: nightMode ? '#E8EAED' : (settingsStore.textColor || '#000000'),
    fontFamily: settingsStore.fontFamily || 'Georgia, serif',
    fontSize: `${fontSize}px`,
    lineHeight: settingsStore.lineHeight || '1.6',
  };
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState('danny');

  // Get current book data from store
  const currentBookData = books.find(b => b.id === book?.id);
  const bookmarks = currentBookData?.bookmarks || [];
  const quotes = allQuotes.filter(q => q.bookId === book?.id) || [];

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      setSelectedText(text);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionPosition({
        top: rect.top + window.scrollY - 50,
        left: rect.left + window.scrollX + (rect.width / 2) - 75
      });
      
      // If TTS is playing, interrupt and start from selected text
      if (isSpeaking) {
        handleReadFromSelection(text);
      }
    } else {
      setSelectedText('');
      setSelectionPosition(null);
    }
  };
  
  const handleReadFromSelection = async (selectedText) => {
    // Stop current reading
    ttsService.stop();
    if (currentAudio && currentAudio.pause) {
      currentAudio.pause();
    }
    
    // Get full page text
    let pageText = '';
    if (book.content) {
      pageText = book.content;
    } else if (book.pages && book.pages[currentPage]) {
      const page = book.pages[currentPage];
      pageText = page.text || '';
    }
    
    if (!pageText) return;
    
    // Start reading from selected position
    const audio = await ttsService.speakFromSelection(pageText, selectedText, {
      voice: selectedVoice,
      rate: settingsStore.ttsRate || 1.0,
      pitch: settingsStore.ttsPitch || 1.0,
      onEnd: () => setIsSpeaking(false)
    });
    
    setCurrentAudio(audio);
    setIsSpeaking(true);
  };

  const handleAddQuote = () => {
    if (selectedText && onAddQuote) {
      onAddQuote({
        text: selectedText,
        page: currentPage + 1,
        timestamp: new Date().toISOString()
      });
      setSelectedText('');
      setSelectionPosition(null);
      window.getSelection().removeAllRanges();
    }
  };
  
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 28));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));
  const toggleNightMode = () => setNightMode(prev => !prev);

  const nextPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const prevPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const handleToggleBookmark = () => {
    if (onBookmark) {
      onBookmark(currentPage + 1);
    }
  };

  const handlePageBookmark = (pageNum) => {
    if (onBookmark) {
      onBookmark(pageNum);
    }
  };
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    'arrowright': nextPage,
    'arrowleft': prevPage,
    'ctrl+b': handleToggleBookmark,
    'ctrl+n': toggleNightMode,
    'ctrl+=': increaseFontSize,
    'ctrl+-': decreaseFontSize,
    'escape': onClose,
  }, !showQuotesPanel && !showBookmarksPanel);

  const isBookmarked = bookmarks.includes(currentPage + 1);

  const handleTTS = async () => {
    if (isSpeaking) {
      ttsService.stop();
      if (currentAudio && typeof currentAudio.pause === 'function') {
        currentAudio.pause();
      }
      setIsSpeaking(false);
      setCurrentAudio(null);
    } else if (book.pages && book.pages[currentPage]) {
      const page = book.pages[currentPage];
      // Extract text from page - handle both text and image pages
      let pageText = page.text || '';
      
      // If it's an image page (PDF), we can't read it directly
      if (page.image && !pageText) {
        alert('Text-to-speech is not available for image-based pages. Please use a PDF with text layer.');
        return;
      }
      
      setIsSpeaking(true);
      const audio = await ttsService.speak(pageText, {
        voice: selectedVoice,
        rate: settingsStore.ttsRate || 1.0,
        pitch: settingsStore.ttsPitch || 1.0,
        onEnd: () => setIsSpeaking(false)
      });
      setCurrentAudio(audio);
    }
  };

  const goToBookmark = (pageNum) => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flip(pageNum - 1);
      setShowBookmarksPanel(false);
    }
  };

  const onFlip = (e) => {
    setCurrentPage(e.data);
  };

  // Stop TTS when component unmounts or page changes
  useEffect(() => {
    return () => ttsService.stop();
  }, [currentPage]);

  // Clear selection when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.highlight-button')) {
        setSelectedText('');
        setSelectionPosition(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!book || !book.pages || book.pages.length === 0) {
    return (
      <ReadingViewContainer>
        <TopBar>
          <BookTitle>{book?.title || 'Unknown Book'}</BookTitle>
          <IconButton onClick={onClose}>
            Close
          </IconButton>
        </TopBar>
        <EmptyState>
          <BookOpen size={64} />
          <p>No pages available to display</p>
        </EmptyState>
      </ReadingViewContainer>
    );
  }

  return (
    <ReadingViewContainer>
      <TopBar>
        <BookTitle>{book.title}</BookTitle>
        <ReadingControls>
          <FontSizeButton onClick={decreaseFontSize} title="Decrease Font">
            <ZoomOut size={16} />
          </FontSizeButton>
          <span style={{ fontSize: '0.875rem', color: '#9AA0A6', minWidth: '45px', textAlign: 'center' }}>{fontSize}px</span>
          <FontSizeButton onClick={increaseFontSize} title="Increase Font">
            <ZoomIn size={16} />
          </FontSizeButton>
          <IconButton 
            onClick={toggleNightMode} 
            title={nightMode ? "Light Mode" : "Night Mode"}
            className={nightMode ? 'active' : ''}
          >
            {nightMode ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
          <VoiceSelector 
            value={selectedVoice} 
            onChange={(e) => setSelectedVoice(e.target.value)}
            title="Select TTS Voice"
          >
            <option value="danny">🎙️ Danny (Male)</option>
            <option value="lessac">🎙️ Lessac (Female)</option>
          </VoiceSelector>
        </ReadingControls>
        <ControlButtons>
          <IconButton 
            onClick={() => setShowQuotesPanel(!showQuotesPanel)} 
            title="View Quotes"
            style={{ background: showQuotesPanel ? '#89B4FA' : 'transparent', color: showQuotesPanel ? '#0A0A0A' : '#89B4FA' }}
          >
            <Quote size={20} />
            {quotes.length > 0 && <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }}>({quotes.length})</span>}
          </IconButton>
          <IconButton 
            onClick={() => setShowBookmarksPanel(!showBookmarksPanel)} 
            title="View Bookmarks"
            style={{ background: showBookmarksPanel ? '#89B4FA' : 'transparent', color: showBookmarksPanel ? '#0A0A0A' : '#89B4FA' }}
          >
            {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            {bookmarks.length > 0 && <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }}>({bookmarks.length})</span>}
          </IconButton>
          <IconButton onClick={handleToggleBookmark} title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}>
            {isBookmarked ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
          </IconButton>
          <IconButton onClick={handleTTS} title={isSpeaking ? "Stop Reading" : "Read Aloud"}>
            {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </IconButton>
          <IconButton onClick={onClose} title="Close">
            Close
          </IconButton>
        </ControlButtons>
        <ProgressBar $progress={(currentPage / (book.pages.length - 1)) * 100} />
      </TopBar>

      {/* Highlight/Quote Button */}
      {selectionPosition && (
        <div style={{ 
          position: 'absolute', 
          top: `${selectionPosition.top}px`, 
          left: `${selectionPosition.left - 75}px`,
          display: 'flex',
          gap: '8px',
          zIndex: 1000
        }}>
          <HighlightButton
            className="highlight-button"
            $show={!!selectedText}
            onClick={handleAddQuote}
          >
            <Quote size={16} />
            Save Quote
          </HighlightButton>
          <HighlightButton
            className="highlight-button"
            $show={!!selectedText}
            onClick={() => handleReadFromSelection(selectedText)}
            style={{ background: '#F38BA8' }}
          >
            <Volume2 size={16} />
            Read from here
          </HighlightButton>
        </div>
      )}

      {/* Quotes Panel */}
      <SidePanel $isOpen={showQuotesPanel}>
        <PanelHeader>
          <PanelTitle>Saved Quotes ({quotes.length})</PanelTitle>
          <IconButton onClick={() => setShowQuotesPanel(false)}>
            <X size={20} />
          </IconButton>
        </PanelHeader>
        <PanelContent>
          {quotes.length === 0 ? (
            <p style={{ color: '#9AA0A6', textAlign: 'center', marginTop: '2rem' }}>
              No quotes saved yet. Select text and click "Save Quote" to add one.
            </p>
          ) : (
            quotes.map((quote, index) => (
              <QuoteItem key={index}>
                <QuoteText>"{quote.text}"</QuoteText>
                <QuoteMeta>
                  <span>Page {quote.page}</span>
                  <span>{new Date(quote.timestamp).toLocaleDateString()}</span>
                </QuoteMeta>
              </QuoteItem>
            ))
          )}
        </PanelContent>
      </SidePanel>

      {/* Bookmarks Panel */}
      <SidePanel $isOpen={showBookmarksPanel}>
        <PanelHeader>
          <PanelTitle>Bookmarks ({bookmarks.length})</PanelTitle>
          <IconButton onClick={() => setShowBookmarksPanel(false)}>
            <X size={20} />
          </IconButton>
        </PanelHeader>
        <PanelContent>
          {bookmarks.length === 0 ? (
            <p style={{ color: '#9AA0A6', textAlign: 'center', marginTop: '2rem' }}>
              No bookmarks yet. Click the bookmark button to mark a page.
            </p>
          ) : (
            bookmarks.sort((a, b) => a - b).map((pageNum) => (
              <BookmarkItem key={pageNum} onClick={() => goToBookmark(pageNum)}>
                <span style={{ color: '#E8EAED' }}>Page {pageNum}</span>
                <DeleteButton onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(pageNum);
                }}>
                  <Trash2 size={16} />
                </DeleteButton>
              </BookmarkItem>
            ))
          )}
        </PanelContent>
      </SidePanel>

      <FlipbookContainer>
        <HTMLFlipBook
          ref={bookRef}
          width={550}
          height={733}
          size="stretch"
          minWidth={315}
          maxWidth={1000}
          minHeight={420}
          maxHeight={1350}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={onFlip}
          className="flipbook"
        >
          {book.pages.map((page, index) => {
            const pageNum = index + 1;
            const isPageBookmarked = bookmarks.includes(pageNum);
            
            return (
              <Page
                key={index}
                $bgColor={settings.backgroundColor}
                $textColor={settings.textColor}
                $fontFamily={settings.fontFamily}
                $fontSize={settings.fontSize}
                $lineHeight={settings.lineHeight}
                onMouseUp={handleTextSelection}
              >
                {book.format === 'pdf' && book.pdfData ? (
                  <PDFPageRenderer
                    pdfData={new Uint8Array(book.pdfData)}
                    pageNumber={pageNum}
                    scale={1.5}
                    isBookmarked={isPageBookmarked}
                    onBookmarkToggle={handlePageBookmark}
                    onTextSelect={(text) => {
                      setSelectedText(text);
                      const selection = window.getSelection();
                      if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const rect = range.getBoundingClientRect();
                        setSelectionPosition({
                          top: rect.top + window.scrollY - 50,
                          left: rect.left + window.scrollX,
                        });
                      }
                    }}
                    bgColor={settings.backgroundColor}
                  />
                ) : (
                  <PageContent>
                    <PageBookmarkButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePageBookmark(pageNum);
                      }}
                      title={isPageBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                    >
                      {isPageBookmarked ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
                    </PageBookmarkButton>
                    {page.image ? (
                      <PageImage src={page.image} alt={`Page ${pageNum}`} />
                    ) : (
                      <div>{page.text || ''}</div>
                    )}
                  </PageContent>
                )}
              </Page>
            );
          })}
        </HTMLFlipBook>
      </FlipbookContainer>

      <NavigationBar>
        <NavButton onClick={prevPage} disabled={currentPage === 0}>
          <ChevronLeft size={20} />
          Previous
        </NavButton>
        <PageInfo>
          Page {currentPage + 1} of {book.pages.length}
        </PageInfo>
        <NavButton onClick={nextPage} disabled={currentPage >= book.pages.length - 1}>
          Next
          <ChevronRight size={20} />
        </NavButton>
      </NavigationBar>
    </ReadingViewContainer>
  );
};

export default ReadingView;
