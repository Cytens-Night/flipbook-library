import { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/globalStyles';
import { theme } from './styles/theme';
import ShelfView from './components/Shelf/ShelfView';
import ReadingView from './components/ReadingView/ReadingView';
import Toast from './components/Toast/Toast';
import { useLibraryStore } from './store/useStore';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

function App() {
  const [currentView, setCurrentView] = useState('shelf'); // 'shelf' or 'reading'
  const [currentBook, setCurrentBook] = useState(null);
  const [toasts, setToasts] = useState([]);
  const { toggleBookmark, addQuote } = useLibraryStore();

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  };

  const handleOpenBook = (book) => {
    setCurrentBook(book);
    setCurrentView('reading');
  };

  const handleCloseBook = () => {
    setCurrentBook(null);
    setCurrentView('shelf');
  };

  const handleBookmark = (pageNumber) => {
    if (currentBook) {
      toggleBookmark(currentBook.id, pageNumber);
      showToast('Bookmark toggled!', 'success');
    }
  };

  const handleAddQuote = (quote) => {
    if (currentBook) {
      addQuote({
        bookId: currentBook.id,
        text: quote.text,
        page: quote.page,
        note: quote.note || ''
      });
      showToast('Quote saved!', 'success');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AppContainer>
        <MainContent>
          {currentView === 'shelf' ? (
            <ShelfView onOpenBook={handleOpenBook} showToast={showToast} />
          ) : (
            <ReadingView 
              book={currentBook}
              onClose={handleCloseBook}
              onBookmark={handleBookmark}
              onAddQuote={handleAddQuote}
            />
          )}
        </MainContent>
        <Toast toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
