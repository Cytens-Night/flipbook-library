import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLibraryStore } from '../../store/useStore';
import BookUpload from '../BookUpload/BookUpload';
import BookCard from '../BookCard/BookCard';
import GroupStack from '../GroupStack/GroupStack';
import SearchBar from '../SearchBar/SearchBar';
import GroupViewModal from '../GroupView/GroupViewModal';
import { DndContext, pointerWithin, useDroppable, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Settings, Trash2, RotateCcw, XCircle } from 'lucide-react';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

const ShelfContainer = styled.div`
  width: 100%;
  cursor: ${({ $isDragging }) => $isDragging ? 'grabbing' : 'default'};
  
  * {
    cursor: ${({ $isDragging }) => $isDragging ? 'grabbing !important' : 'inherit'};
  }
`;

const ShelfHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ShelfTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 140px);
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, 120px);
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  gap: ${({ theme }) => theme.spacing.lg};
  opacity: 0;
  animation: emptyFade 0.6s forwards cubic-bezier(0.4,0,0.2,1);
  
  @keyframes emptyFade { 0% { opacity:0; transform: translateY(20px); } 100% { opacity:1; transform: translateY(0); } }
  
  h2 {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.accentHover});
    -webkit-background-clip: text;
    color: transparent;
  }
  
  p {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    max-width: 640px;
    line-height: 1.5;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex: 1;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accent};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 36px;
  height: 36px;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.background};
  }
`;

const SettingsModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${({ $show }) => $show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const SettingsContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: 12px;
  min-width: 400px;
  max-width: 600px;
`;

const SettingsTitle = styled.h2`
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 1.5rem;
`;

const FloatingBin = styled.button`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ $hasItems, $isOver, theme }) => $hasItems || $isOver ? `${theme.spacing.lg} ${theme.spacing.xl}` : `${theme.spacing.md} ${theme.spacing.lg}`};
  background: ${({ $hasItems, $isOver, theme }) => 
    $isOver ? 'linear-gradient(135deg, #EF5350, #E53935)' : 
    $hasItems ? 'linear-gradient(135deg, #EF5350, #E57373)' : 
    theme.colors.surface};
  color: ${({ $hasItems, $isOver, theme }) => $hasItems || $isOver ? '#FFFFFF' : theme.colors.textMuted};
  border: ${({ $isOver, theme }) => $isOver ? `3px dashed ${theme.colors.text}` : `2px solid ${theme.colors.border}`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ $hasItems, $isOver, theme }) => $hasItems || $isOver ? theme.fontSizes.base : theme.fontSizes.sm};
  font-weight: 700;
  cursor: pointer;
  box-shadow: ${({ $hasItems, $isOver }) => 
    $isOver ? '0 16px 48px rgba(239, 83, 80, 0.95), 0 0 80px rgba(239, 83, 80, 0.7)' : 
    $hasItems ? '0 8px 24px rgba(239, 83, 80, 0.6), 0 0 40px rgba(239, 83, 80, 0.4)' : 
    '0 4px 12px rgba(0, 0, 0, 0.2)'};
  transition: all ${({ theme }) => theme.transitions.medium};
  z-index: 1000;
  backdrop-filter: blur(12px);
  transform: ${({ $isOver }) => $isOver ? 'scale(1.2) translateY(-10px) rotate(-3deg)' : 'scale(1)'};
  animation: ${({ $hasItems }) => $hasItems ? 'pulse 2s ease-in-out infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { box-shadow: 0 8px 24px rgba(239, 83, 80, 0.6), 0 0 40px rgba(239, 83, 80, 0.4); }
    50% { box-shadow: 0 8px 24px rgba(239, 83, 80, 0.8), 0 0 60px rgba(239, 83, 80, 0.6); }
  }

  &:hover {
    background: ${({ $hasItems, $isOver }) => 
      $isOver ? 'linear-gradient(135deg, #EF5350, #E53935)' : 
      $hasItems ? 'linear-gradient(135deg, #E53935, #D32F2F)' : 
      'rgba(239, 83, 80, 0.15)'};
    color: ${({ $hasItems }) => $hasItems ? '#FFFFFF' : '#EF5350'};
    transform: ${({ $isOver }) => $isOver ? 'scale(1.2) translateY(-10px) rotate(-3deg)' : 'scale(1.08) translateY(-6px)'};
    box-shadow: ${({ $hasItems, $isOver }) => 
      $isOver ? '0 16px 48px rgba(239, 83, 80, 0.95), 0 0 80px rgba(239, 83, 80, 0.7)' : 
      $hasItems ? '0 12px 32px rgba(239, 83, 80, 0.8), 0 0 60px rgba(239, 83, 80, 0.6)' : 
      '0 8px 20px rgba(239, 83, 80, 0.4)'};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const BinModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px);
  display: ${({ $show }) => $show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2500;
`;

const BinModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: 16px;
  width: clamp(340px, 60vw, 720px);
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 16px 40px rgba(0,0,0,0.45);
`;

const BinHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const BinTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.accent};
`;

const BinActionsRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const BinActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: 8px;
  padding: 0.5rem 0.9rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: background 0.25s;
  &:hover { background: ${({ theme }) => theme.colors.accent}; color: ${({ theme }) => theme.colors.background}; }
  &.danger:hover { background: ${({ theme }) => theme.colors.error}; color: #fff; }
`;

const BinItems = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-right: 0.25rem;
`;

const BinItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.surfaceHover};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.cardBackground};
  transition: background 0.25s;
  &:hover { background: ${({ theme }) => theme.colors.cardHover}; }
`;

const BinThumb = styled.div`
  width: 40px;
  height: 56px;
  border-radius: 6px;
  background: ${({ $image, theme }) => $image ? `url(${$image}) center/cover` : theme.colors.surface};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.textMuted};
  overflow: hidden;
`;

const BinMeta = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const BinTitleText = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BinSubtitle = styled.span`
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BinItemButtons = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const DragActionLabel = styled.div`
  position: fixed;
  bottom: 6rem;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme, $mode }) => 
    $mode === 'group' ? 'linear-gradient(135deg, #89B4FA, #74A0F8)' :
    'linear-gradient(135deg, #94E2D5, #7FC8B8)'};
  color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255,255,255,0.1);
  z-index: 2000;
  pointer-events: none;
  display: ${({ $show }) => $show ? 'flex' : 'none'};
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  animation: labelFade 0.2s ease-out;
  
  @keyframes labelFade {
    0% { transform: translateX(-50%) translateY(8px); opacity: 0; }
    100% { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
`;

const ShelfView = ({ onOpenBook, showToast }) => {
  const books = useLibraryStore((state) => state.books);
  const groups = useLibraryStore((state) => state.groups);
  const recycleBin = useLibraryStore((state) => state.recycleBin);
  const deleteBook = useLibraryStore((state) => state.deleteBook);
  const restoreBook = useLibraryStore((state) => state.restoreBook);
  const purgeOne = useLibraryStore((state) => state.permanentlyDelete);
  const emptyBin = useLibraryStore((state) => state.emptyRecycleBin);
  const addBookToGroup = useLibraryStore((state) => state.addBookToGroup);
  const reorderBooks = useLibraryStore((state) => state.reorderBooks);
  const createGroup = useLibraryStore((state) => state.createGroup);
  const removeBookFromGroup = useLibraryStore((state) => state.removeBookFromGroup);
  const swapBookAndGroup = useLibraryStore((state) => state.swapBookAndGroup);
  const deleteGroup = useLibraryStore((state) => state.deleteGroup);
  const reorderBooksInGroup = useLibraryStore((state) => state.reorderBooksInGroup);
  const reorderGroups = useLibraryStore((state) => state.reorderGroups);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState(books);
  const [showSettings, setShowSettings] = useState(false);
  const [showBin, setShowBin] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [dragMode, setDragMode] = useState('reorder'); // 'reorder' or 'group'
  const [overId, setOverId] = useState(null);
  const [isShiftHeld, setIsShiftHeld] = useState(false);
  const { isOver: isBinOver, setNodeRef: setBinRef } = useDroppable({ id: 'bin-drop-zone' });
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Track shift key for mode switching
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift' && activeId) {
        setIsShiftHeld(true);
        setDragMode('group');
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        setIsShiftHeld(false);
        setDragMode('reorder');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeId]);

  const handleDragStart = (event) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setActiveId(event.active.id);
    
    const isShiftPressed = event.activatorEvent?.shiftKey;
    setIsShiftHeld(isShiftPressed);
    setDragMode(isShiftPressed ? 'group' : 'reorder');
  };

  const handleDragOver = (event) => {
    const { over } = event;
    setOverId(over?.id || null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      if (navigator.vibrate) navigator.vibrate([20, 10, 20]);
      setActiveId(null);
      setOverId(null);
      setDragMode('reorder');
      return;
    }

    if (navigator.vibrate) navigator.vibrate(25);

    // Drop on Bin
    if (over.id === 'bin-drop-zone') {
      const isGroup = String(active.id).startsWith('group-');
      if (isGroup) {
        const groupId = parseFloat(String(active.id).replace('group-', ''));
        deleteGroup(groupId);
        showToast && showToast('🗑️ Group deleted', 'info');
      } else {
        deleteBook(active.id);
        showToast && showToast('🗑️ Moved to bin', 'info');
      }
      setActiveId(null);
      setOverId(null);
      setDragMode('reorder');
      return;
    }

    const activeIsGroup = String(active.id).startsWith('group-');
    const overIsGroup = String(over.id).startsWith('group-');

    // Drop over a group tile
    if (overIsGroup && !activeIsGroup) {
      const groupId = parseFloat(String(over.id).replace('group-', ''));
      const draggedBook = books.find((b) => b.id === active.id);
      
      if (draggedBook) {
        if (isShiftHeld) {
          // Shift + drop on group = add to group
          addBookToGroup(groupId, active.id);
          showToast && showToast('📚 Added to group', 'success');
        } else {
          // Normal drop = swap positions with group
          swapBookAndGroup(active.id, groupId);
          showToast && showToast('↔️ Position swapped', 'success');
        }
      }
      setActiveId(null);
      setOverId(null);
      setDragMode('reorder');
      setIsShiftHeld(false);
      return;
    }

    // Same type interactions
    if (active.id !== over.id) {
      // Books: Group mode (Shift) or Reorder mode
      if (!activeIsGroup && !overIsGroup) {
        const activeBook = books.find((b) => b.id === active.id);
        const overBook = books.find((b) => b.id === over.id);
        
        if (activeBook && overBook) {
          if (dragMode === 'group') {
            const groupName = `${activeBook.title.substring(0, 15)} + ${overBook.title.substring(0, 15)}`;
            createGroup(groupName, [active.id, over.id]);
            showToast && showToast(`📚 Group "${groupName}" created`, 'success');
          } else {
            const bookIds = books.map((b) => b.id);
            const from = bookIds.indexOf(active.id);
            const to = bookIds.indexOf(over.id);
            if (from !== -1 && to !== -1) {
              const newOrder = arrayMove(bookIds, from, to);
              reorderBooks(newOrder);
              showToast && showToast('↔️ Position updated', 'success');
            }
          }
        }
      }
      // Groups: Always reorder
      else if (activeIsGroup && overIsGroup) {
        const activeGroupId = parseFloat(String(active.id).replace('group-', ''));
        const overGroupId = parseFloat(String(over.id).replace('group-', ''));
        if (activeGroupId !== overGroupId) {
          const groupIds = groups.map((g) => g.id);
          const from = groupIds.indexOf(activeGroupId);
          const to = groupIds.indexOf(overGroupId);
          if (from !== -1 && to !== -1) {
            const newOrder = arrayMove(groupIds, from, to);
            reorderGroups(newOrder);
            showToast && showToast('↔️ Group repositioned', 'success');
          }
        }
      }
    }

    setActiveId(null);
    setOverId(null);
    setDragMode('reorder');
    setIsShiftHeld(false);
  };



  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredBooks(books);
    } else {
      const results = useLibraryStore.getState().searchBooks(query);
      setFilteredBooks(results);
    }
  };

  // Get books that are not in any group
  const ungroupedBooks = books.filter(
    (book) => !groups.some((group) => group.bookIds.includes(book.id))
  );

  // Use filtered or ungrouped books for display
  const displayBooks = searchQuery ? filteredBooks : ungroupedBooks;
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+,': () => setShowSettings(true),
    'delete': () => recycleBin.length > 0 && setShowBin(true),
    'escape': () => {
      if (showSettings) setShowSettings(false);
      if (showBin) setShowBin(false);
      if (openGroup) setOpenGroup(null);
    },
  }, !showSettings && !showBin && !openGroup);

  return (
    <>
    <DragActionLabel 
      $show={!!activeId && !!overId && !String(overId).includes('bin')}
      $mode={dragMode}
    >
      {dragMode === 'group' ? '📚 Create Group' : '↔️ Reorder'}
    </DragActionLabel>
    <ShelfContainer $isDragging={!!activeId}>
      <ShelfHeader>
        <ShelfTitle>My Library</ShelfTitle>
        <HeaderActions>
          <SearchBar onSearch={handleSearch} />
          <IconButton title="Settings" onClick={() => setShowSettings(true)}>
            <Settings size={18} />
          </IconButton>
          <BookUpload />
        </HeaderActions>
      </ShelfHeader>

      <FloatingBin 
        ref={setBinRef}
        $hasItems={recycleBin.length > 0} 
        $isOver={isBinOver}
        title="Recycle Bin"
        onClick={(e) => { e.stopPropagation(); setShowBin(true); }}
      >
        <Trash2 size={recycleBin.length > 0 || isBinOver ? 20 : 18} />
        <span>Bin</span>
        {recycleBin.length > 0 && <span>({recycleBin.length})</span>}
      </FloatingBin>

      <BinModalOverlay $show={showBin} onClick={() => setShowBin(false)}>
        <BinModalContent onClick={(e) => e.stopPropagation()}>
          <BinHeader>
            <BinTitle>Recycle Bin</BinTitle>
            <BinActionsRow>
              {recycleBin.length > 0 && (
                <BinActionButton onClick={() => setConfirm({
                  title: 'Restore All',
                  message: 'Restore all books from the recycle bin?',
                  danger: false,
                  onConfirm: () => { recycleBin.forEach(b => restoreBook(b.id)); setConfirm(null); },
                })}>
                  <RotateCcw size={14} /> Restore All
                </BinActionButton>
              )}
              {recycleBin.length > 0 && (
                <BinActionButton className="danger" onClick={() => setConfirm({
                  title: 'Purge All',
                  message: 'Permanently delete ALL books in the recycle bin? This cannot be undone.',
                  danger: true,
                  onConfirm: () => { emptyBin(); setConfirm(null); },
                })}>
                  <Trash2 size={14} /> Purge All
                </BinActionButton>
              )}
              <BinActionButton onClick={() => setShowBin(false)}>
                <XCircle size={14} /> Close
              </BinActionButton>
            </BinActionsRow>
          </BinHeader>
          {recycleBin.length === 0 ? (
            <p style={{ color: '#9E9E9E', margin: 0 }}>Bin is empty. Deleted books will appear here.</p>
          ) : (
            <BinItems>
              {recycleBin.map((item) => (
                <BinItem key={item.id}>
                  <BinThumb $image={item.coverImage}>{!item.coverImage && 'No Cover'}</BinThumb>
                  <BinMeta>
                    <BinTitleText title={item.title}>{item.title}</BinTitleText>
                    <BinSubtitle>{item.author} • Deleted {new Date(item.deletedAt).toLocaleDateString()}</BinSubtitle>
                  </BinMeta>
                  <BinItemButtons>
                    <BinActionButton onClick={() => restoreBook(item.id)}>
                      <RotateCcw size={14} /> Restore
                    </BinActionButton>
                    <BinActionButton className="danger" onClick={() => setConfirm({
                      title: 'Purge Book',
                      message: `Permanently delete "${item.title}"? This cannot be undone.`,
                      danger: true,
                      onConfirm: () => { purgeOne(item.id); setConfirm(null); },
                    })}>
                      <Trash2 size={14} /> Purge
                    </BinActionButton>
                  </BinItemButtons>
                </BinItem>
              ))}
            </BinItems>
          )}
        </BinModalContent>
      </BinModalOverlay>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title || ''}
        message={confirm?.message || ''}
        confirmLabel={confirm?.danger ? 'Confirm' : 'OK'}
        cancelLabel="Cancel"
        danger={confirm?.danger}
        onCancel={() => setConfirm(null)}
        onConfirm={() => { if (confirm?.onConfirm) confirm.onConfirm(); }}
      />

      <SettingsModal $show={showSettings} onClick={() => setShowSettings(false)}>
        <SettingsContent onClick={(e) => e.stopPropagation()}>
          <SettingsTitle>Settings</SettingsTitle>
          <p style={{ color: '#E8EAED' }}>Settings panel coming soon...</p>
          <IconButton style={{ marginTop: '1rem' }} onClick={() => setShowSettings(false)}>
            Close
          </IconButton>
        </SettingsContent>
      </SettingsModal>

      {books.length === 0 ? (
        <EmptyState>
          <h2>Your library is empty</h2>
          <p>Upload your first book to get started</p>
        </EmptyState>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={pointerWithin} 
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <BooksGrid>
            {/* Render groups and books together in SortableContext */}
            <SortableContext 
              items={[
                ...(!searchQuery ? groups.map((g) => `group-${g.id}`) : []),
                ...displayBooks.map((b) => b.id)
              ]} 
              strategy={rectSortingStrategy}
            >
              {!searchQuery && groups.map((group) => (
                <GroupStack
                  key={group.id}
                  group={group}
                  onOpenGroup={() => setOpenGroup(group)}
                  droppableId={`group-${group.id}`}
                />
              ))}
              
              {displayBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onOpen={() => onOpenBook(book)}
                  isGroupTarget={dragMode === 'group' && overId === book.id && !!activeId && activeId !== book.id}
                  isReorderTarget={dragMode === 'reorder' && overId === book.id && !!activeId && activeId !== book.id}
                />
              ))}
            </SortableContext>
          </BooksGrid>
          <DragOverlay dropAnimation={{
            duration: 350,
            easing: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
          }}>
            {activeId ? (
              String(activeId).startsWith('group-') ? (
                <GroupStack
                  group={groups.find(g => `group-${g.id}` === activeId)}
                  droppableId={activeId}
                  isDragOverlay={true}
                />
              ) : (
                <BookCard
                  book={books.find(b => b.id === activeId)}
                  isDragOverlay={true}
                />
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      
      {openGroup && (
        <GroupViewModal
          group={openGroup}
          books={books}
          onClose={() => setOpenGroup(null)}
          onOpenBook={onOpenBook}
          onRemoveBook={removeBookFromGroup}
          onDeleteGroup={deleteGroup}
          onReorderInGroup={reorderBooksInGroup}
        />
      )}
    </ShelfContainer>
    </>
  );
};

export default ShelfView;
