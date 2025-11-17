import { create } from 'zustand';
import localforage from 'localforage';

// Configure localforage for IndexedDB
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'FlipbookLibrary',
  version: 1.0,
  storeName: 'library_data',
});

// Library Store with initial state from storage
let initialLibraryState = {
  books: [],
  groups: [],
  recycleBin: [],
  quotes: [],
};

// Try to load initial state synchronously
try {
  const stored = localStorage.getItem('flipbook-library-cache');
  if (stored) {
    initialLibraryState = JSON.parse(stored);
  }
} catch (e) {
  console.log('No cached state found');
}

export const useLibraryStore = create((set, get) => ({
      // Books state
      books: initialLibraryState.books || [],
      groups: initialLibraryState.groups || [],
      recycleBin: initialLibraryState.recycleBin || [],
      quotes: initialLibraryState.quotes || [],
      
      // Add a book
      addBook: (book) => {
        const newBook = {
          id: Date.now() + Math.random(),
          title: book.title,
          author: book.author || 'Unknown Author',
          coverImage: book.coverImage || null,
          format: book.format, // 'pdf', 'epub', 'txt'
          pages: book.pages || [],
          totalPages: book.totalPages || 0,
          currentPage: 0,
          bookmarks: [],
          uploadDate: new Date().toISOString(),
          lastRead: null,
          fileHash: book.fileHash,
          metadata: book.metadata || {},
        };
        
        set((state) => ({
          books: [...state.books, newBook],
        }));
        
        return newBook;
      },
      
      // Update book
      updateBook: (bookId, updates) => {
        set((state) => ({
          books: state.books.map((book) =>
            book.id === bookId ? { ...book, ...updates } : book
          ),
        }));
      },
      
      // Reorder books
      reorderBooks: (bookIds) => {
        set((state) => {
          const bookMap = new Map(state.books.map(b => [b.id, b]));
          const reorderedBooks = bookIds.map(id => bookMap.get(id)).filter(Boolean);
          const remainingBooks = state.books.filter(b => !bookIds.includes(b.id));
          return { books: [...reorderedBooks, ...remainingBooks] };
        });
      },
      
      // Delete book (move to recycle bin) and remove from groups
      deleteBook: (bookId) => {
        const { books, groups, recycleBin } = get();
        const book = books.find((b) => b.id === bookId);
        if (book) {
          const updatedGroups = groups
            .map((g) => ({ ...g, bookIds: g.bookIds.filter((id) => id !== bookId) }))
            .filter((g) => g.bookIds.length > 0);
          set({
            books: books.filter((b) => b.id !== bookId),
            groups: updatedGroups,
            recycleBin: [...recycleBin, { ...book, deletedAt: new Date().toISOString() }],
          });
        }
      },
      
      // Restore from recycle bin
      restoreBook: (bookId) => {
        const book = get().recycleBin.find((b) => b.id === bookId);
        if (book) {
          const { deletedAt, ...restoreBook } = book;
          set((state) => ({
            recycleBin: state.recycleBin.filter((b) => b.id !== bookId),
            books: [...state.books, restoreBook],
          }));
        }
      },
      
      // Permanently delete from bin
      permanentlyDelete: (bookId) => {
        set((state) => ({
          recycleBin: state.recycleBin.filter((b) => b.id !== bookId),
        }));
      },
      
      // Empty recycle bin
      emptyRecycleBin: () => {
        set({ recycleBin: [] });
      },
      
      // Check if book exists (by hash)
      bookExists: (fileHash) => {
        const { books, recycleBin } = get();
        return (
          books.some((book) => book.fileHash === fileHash) ||
          recycleBin.some((book) => book.fileHash === fileHash)
        );
      },
      
      // Group management
      createGroup: (name, bookIds = []) => {
        const newGroup = {
          id: Date.now() + Math.random(),
          name,
          bookIds,
          color: '#89B4FA', // Default accent color
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          groups: [...state.groups, newGroup],
        }));
        
        return newGroup;
      },
      
      updateGroup: (groupId, updates) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId ? { ...group, ...updates } : group
          ),
        }));
      },
      
      renameGroup: (groupId, newName) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId ? { ...group, name: newName } : group
          ),
        }));
      },
      
      deleteGroup: (groupId) => {
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
        }));
      },
      
      addBookToGroup: (groupId, bookId) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId && !group.bookIds.includes(bookId)
              ? { ...group, bookIds: [...group.bookIds, bookId] }
              : group
          ),
        }));
      },
      
      removeBookFromGroup: (groupId, bookId) => {
        set((state) => {
          const updatedGroups = state.groups.map((group) =>
            group.id === groupId
              ? { ...group, bookIds: group.bookIds.filter((id) => id !== bookId) }
              : group
          );
          // Auto delete empty groups
          return { groups: updatedGroups.filter((g) => g.bookIds.length > 0) };
        });
      },
      
      reorderBooksInGroup: (groupId, bookIds) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? { ...group, bookIds }
              : group
          ),
        }));
      },

      // Reorder groups
      reorderGroups: (groupIds) => {
        set((state) => {
          const groupMap = new Map(state.groups.map(g => [g.id, g]));
          const reordered = groupIds.map(id => groupMap.get(id)).filter(Boolean);
          const remaining = state.groups.filter(g => !groupIds.includes(g.id));
          return { groups: [...reordered, ...remaining] };
        });
      },

      // Swap position between book and group
      swapBookAndGroup: (bookId, groupId) => {
        set((state) => {
          const bookIndex = state.books.findIndex(b => b.id === bookId);
          const groupIndex = state.groups.findIndex(g => g.id === groupId);
          
          if (bookIndex === -1 || groupIndex === -1) return state;
          
          // Create new arrays with swapped positions
          const newBooks = [...state.books];
          const newGroups = [...state.groups];
          
          // If group is before book in visual order (group comes first)
          if (groupIndex <= bookIndex) {
            // Move book to group's position, push group after
            const [book] = newBooks.splice(bookIndex, 1);
            newBooks.splice(groupIndex, 0, book);
          } else {
            // Group is after book, move group to book's position
            const [group] = newGroups.splice(groupIndex, 1);
            newGroups.splice(bookIndex, 0, group);
          }
          
          return { books: newBooks, groups: newGroups };
        });
      },
      
      // Quotes management
      addQuote: (quote) => {
        const newQuote = {
          id: Date.now() + Math.random(),
          bookId: quote.bookId,
          text: quote.text,
          page: quote.page,
          createdAt: new Date().toISOString(),
          note: quote.note || '',
        };
        
        set((state) => ({
          quotes: [...state.quotes, newQuote],
        }));
        
        return newQuote;
      },
      
      deleteQuote: (quoteId) => {
        set((state) => ({
          quotes: state.quotes.filter((q) => q.id !== quoteId),
        }));
      },
      
      // Bookmark management
      toggleBookmark: (bookId, pageNumber) => {
        set((state) => ({
          books: state.books.map((book) => {
            if (book.id === bookId) {
              const bookmarks = book.bookmarks.includes(pageNumber)
                ? book.bookmarks.filter((p) => p !== pageNumber)
                : [...book.bookmarks, pageNumber].sort((a, b) => a - b);
              
              return { ...book, bookmarks };
            }
            return book;
          }),
        }));
      },
      
      // Search functionality
      searchBooks: (query) => {
        const { books, groups } = get();
        const lowerQuery = query.toLowerCase();
        
        return books.filter((book) => {
          const titleMatch = book.title.toLowerCase().includes(lowerQuery);
          const authorMatch = book.author.toLowerCase().includes(lowerQuery);
          const groupMatch = groups.some(
            (group) =>
              group.bookIds.includes(book.id) &&
              group.name.toLowerCase().includes(lowerQuery)
          );
          
          return titleMatch || authorMatch || groupMatch;
        });
      },
    }));

// Subscribe to changes and persist to both localStorage (fast) and localforage (persistent)
useLibraryStore.subscribe((state) => {
  // Full state for IndexedDB (keep pages & covers)
  const fullState = {
    books: state.books,
    groups: state.groups,
    recycleBin: state.recycleBin,
    quotes: state.quotes,
  };

  // Trimmed cache for localStorage (omit heavy page arrays & large covers)
  const cacheBooks = state.books.map((b) => {
    const { pages, coverImage, ...rest } = b;
    // Only keep small cover strings (< 120k chars) to avoid quota blowups
    const smallCover = coverImage && coverImage.length < 120000 ? coverImage : null;
    return {
      ...rest,
      coverImage: smallCover,
      pagesLength: Array.isArray(pages) ? pages.length : 0,
    };
  });
  const cacheRecycle = state.recycleBin.map((b) => {
    const { pages, coverImage, ...rest } = b;
    const smallCover = coverImage && coverImage.length < 120000 ? coverImage : null;
    return {
      ...rest,
      coverImage: smallCover,
      pagesLength: Array.isArray(pages) ? pages.length : 0,
    };
  });
  const cacheState = {
    books: cacheBooks,
    groups: state.groups,
    recycleBin: cacheRecycle,
    quotes: state.quotes,
  };

  // Quick localStorage cache (best effort)
  try {
    localStorage.setItem('flipbook-library-cache', JSON.stringify(cacheState));
  } catch (e) {
    // Silently fail quota issues without spamming logs every set
    if (!e?.message?.includes('QuotaExceededError')) {
      console.error('Failed to cache to localStorage:', e);
    }
  }

  // Persistent IndexedDB storage for full data
  localforage.setItem('library-storage', fullState).catch(err => {
    console.error('Failed to persist to IndexedDB:', err);
  });
});

// Load full state from IndexedDB on startup
localforage.getItem('library-storage').then((stored) => {
  if (stored && stored.books) {
    console.log('Loading library from IndexedDB:', stored.books.length, 'books');
    useLibraryStore.setState(stored);
  }
}).catch(err => {
  console.error('Failed to load from IndexedDB:', err);
});

// Settings Store with initial state
let initialSettingsState = {
  fontSize: 16,
  fontFamily: 'Georgia, "Times New Roman", serif',
  lineHeight: 1.6,
  backgroundColor: '#0A0A0A',
  textColor: '#E8EAED',
  readingMode: 'dark',
  ttsRate: 1.0,
  ttsPitch: 1.0,
  ttsVoice: null,
  showPageNumbers: true,
  animationSpeed: 'medium',
};

try {
  const stored = localStorage.getItem('flipbook-settings-cache');
  if (stored) {
    initialSettingsState = { ...initialSettingsState, ...JSON.parse(stored) };
  }
} catch (e) {
  console.log('No cached settings found');
}

export const useSettingsStore = create((set) => ({
  // Reading settings
  fontSize: initialSettingsState.fontSize,
  fontFamily: initialSettingsState.fontFamily,
  lineHeight: initialSettingsState.lineHeight,
  backgroundColor: initialSettingsState.backgroundColor,
  textColor: initialSettingsState.textColor,
  
  // Reading modes
  readingMode: initialSettingsState.readingMode,
  
  // TTS settings
  ttsRate: initialSettingsState.ttsRate,
  ttsPitch: initialSettingsState.ttsPitch,
  ttsVoice: initialSettingsState.ttsVoice,
  
  // Display settings
  showPageNumbers: initialSettingsState.showPageNumbers,
  animationSpeed: initialSettingsState.animationSpeed,
  
  // Update settings
  updateSettings: (updates) => {
        set((state) => ({
          ...state,
          ...updates,
        }));
      },
      
      // Reading mode presets
      setReadingMode: (mode) => {
        const modes = {
          dark: {
            backgroundColor: '#0A0A0A',
            textColor: '#E8EAED',
          },
          light: {
            backgroundColor: '#FFFFFF',
            textColor: '#1A1A1A',
          },
          sepia: {
            backgroundColor: '#F4ECD8',
            textColor: '#5C4B37',
          },
        };
        
        set({
          readingMode: mode,
          ...modes[mode],
        });
      },
    }));

// Subscribe to changes and persist settings
useSettingsStore.subscribe((state) => {
  try {
    localStorage.setItem('flipbook-settings-cache', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to cache settings:', e);
  }
  localforage.setItem('settings-storage', state);
});

// Load settings from IndexedDB
localforage.getItem('settings-storage').then((stored) => {
  if (stored) {
    useSettingsStore.setState(stored);
  }
});
