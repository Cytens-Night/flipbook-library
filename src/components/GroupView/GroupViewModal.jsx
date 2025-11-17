import styled from 'styled-components';
import { X, Trash2, FolderMinus, Edit2, Palette } from 'lucide-react';
import BookCard from '../BookCard/BookCard';
import { useState } from 'react';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import { DndContext, pointerWithin, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import DragGhost from '../Shelf/DragGhost';
import { useLibraryStore } from '../../store/useStore';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(12px);
  padding: ${({ theme }) => theme.spacing.lg};
  opacity: 0;
  animation: fadeIn 0.35s forwards cubic-bezier(0.4, 0, 0.2, 1);
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Modal = styled.div`
  width: 90%;
  max-width: 1200px;
  max-height: 85vh;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surface} 0%, ${({ theme }) => theme.colors.backgroundSecondary || theme.colors.background} 100%);
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.65), 0 0 0 1px ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: translateY(20px) scale(0.96);
  opacity: 0;
  animation: popIn 0.45s forwards cubic-bezier(0.4, 0, 0.2, 1);
  
  @keyframes popIn {
    0% { opacity: 0; transform: translateY(40px) scale(0.92); }
    60% { opacity: 1; transform: translateY(0) scale(1.02); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.xl};
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.surfaceActive || theme.colors.surface} 0%, ${({ theme }) => theme.colors.surface} 100%);
  border-bottom: 1px solid ${({ theme }) => theme.colors.surfaceHover};
  gap: ${({ theme }) => theme.spacing.md};
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TitleInput = styled.input`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surfaceHover};
  border: 2px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  flex: 1;
  outline: none;
  transition: all 0.2s;
  
  &:focus {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accentGlow};
  }
`;

const ColorPickerWrapper = styled.div`
  position: relative;
`;

const ColorOptions = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  display: ${({ $show }) => $show ? 'grid' : 'none'};
  grid-template-columns: repeat(6, 1fr);
  gap: ${({ theme }) => theme.spacing.xs};
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  z-index: 100;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ColorSwatch = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 2px solid ${({ $isActive, theme }) => $isActive ? theme.colors.text : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  
  &:hover {
    transform: scale(1.15);
    box-shadow: 0 4px 16px ${({ $color }) => $color}88;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: ${({ theme, $danger }) => $danger ? 'rgba(239, 83, 80, 0.15)' : theme.colors.surface};
  color: ${({ theme, $danger }) => $danger ? '#EF5350' : theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${({ theme, $danger }) => $danger ? '#EF5350' : theme.colors.surfaceHover};
    color: ${({ theme, $danger }) => $danger ? '#FFFFFF' : theme.colors.accent};
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xl};
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.surfaceHover} transparent;
  
  &::-webkit-scrollbar { width: 10px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.surfaceHover}; border-radius: 10px; }
  &::-webkit-scrollbar-thumb:hover { background: ${({ theme }) => theme.colors.surfaceActive || theme.colors.surfaceHover}; }
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 140px);
  gap: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, 120px);
  }
`;

const BookWrapper = styled.div`
  position: relative;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(239, 83, 80, 0.9);
  color: #FFFFFF;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 15;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  ${BookWrapper}:hover & {
    opacity: 1;
  }
  
  &:hover {
    background: #EF5350;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(239, 83, 80, 0.5);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxxl};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  opacity: 0;
  animation: fadeSlide 0.5s forwards cubic-bezier(0.4, 0, 0.2, 1);
  
  @keyframes fadeSlide {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  h3 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.accentHover});
    -webkit-background-clip: text;
    color: transparent;
  }
`;

const GroupViewModal = ({ group, books, onClose, onOpenBook, onRemoveBook, onDeleteGroup, onReorderInGroup }) => {
  const [confirm, setConfirm] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const renameGroup = useLibraryStore((state) => state.renameGroup);
  const updateGroup = useLibraryStore((state) => state.updateGroup);
  
  const groupBooks = books.filter((book) => group.bookIds.includes(book.id));
  
  const colorOptions = [
    '#89B4FA', '#F38BA8', '#A6E3A1', '#FAB387',
    '#CBA6F7', '#F9E2AF', '#94E2D5', '#EBA0AC',
    '#F5C2E7', '#74C7EC', '#B4BEFE', '#89DCEB',
  ];
  
  const handleRename = () => {
    if (groupName.trim() && groupName !== group.name) {
      renameGroup(group.id, groupName.trim());
    }
    setIsRenaming(false);
  };
  
  const handleColorChange = (color) => {
    updateGroup(group.id, { color });
    setShowColorPicker(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = group.bookIds.indexOf(active.id);
    const newIndex = group.bookIds.indexOf(over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(group.bookIds, oldIndex, newIndex);
      onReorderInGroup(group.id, newOrder);
    }

    setActiveId(null);
  };

  const handleRemoveBook = (bookId) => {
    setConfirm({
      title: 'Remove from Group',
      message: 'Remove this book from the group? The book will not be deleted.',
      onConfirm: () => {
        onRemoveBook(group.id, bookId);
        setConfirm(null);
      },
    });
  };

  const handleDeleteGroup = () => {
    setConfirm({
      title: 'Delete Group',
      message: `Delete the group "${group.name}"? Books will not be deleted.`,
      danger: true,
      onConfirm: () => {
        onDeleteGroup(group.id);
        setConfirm(null);
        onClose();
      },
    });
  };

  return (
    <>
      <Overlay onClick={onClose}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <Header>
            {isRenaming ? (
              <TitleInput
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') { setGroupName(group.name); setIsRenaming(false); }
                }}
                autoFocus
              />
            ) : (
              <Title style={{ color: group.color || '#89B4FA' }}>{group.name}</Title>
            )}
            <HeaderActions>
              {!isRenaming && (
                <IconButton 
                  title="Rename Group" 
                  onClick={() => setIsRenaming(true)}
                >
                  <Edit2 size={18} />
                </IconButton>
              )}
              <ColorPickerWrapper>
                <IconButton 
                  title="Change Color" 
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  <Palette size={18} />
                </IconButton>
                <ColorOptions $show={showColorPicker}>
                  {colorOptions.map((color) => (
                    <ColorSwatch
                      key={color}
                      $color={color}
                      $isActive={group.color === color}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </ColorOptions>
              </ColorPickerWrapper>
              <IconButton 
                title="Delete Group" 
                $danger 
                onClick={handleDeleteGroup}
              >
                <Trash2 size={18} />
              </IconButton>
              <IconButton title="Close" onClick={onClose}>
                <X size={18} />
              </IconButton>
            </HeaderActions>
          </Header>
          <Content>
            {groupBooks.length === 0 ? (
              <EmptyState>
                <h3>No books in this group</h3>
                <p>This group is empty</p>
              </EmptyState>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <BooksGrid>
                  <SortableContext items={groupBooks.map(b => b.id)} strategy={rectSortingStrategy}>
                    {groupBooks.map((book) => (
                      <BookWrapper key={book.id}>
                        <BookCard
                          book={book}
                          onOpen={() => {
                            onClose();
                            onOpenBook(book);
                          }}
                        />
                        <RemoveButton
                          title="Remove from group"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBook(book.id);
                          }}
                        >
                          <FolderMinus size={16} />
                        </RemoveButton>
                      </BookWrapper>
                    ))}
                  </SortableContext>
                </BooksGrid>
                <DragOverlay dropAnimation={{
                  duration: 250,
                  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                  {activeId ? (
                    <DragGhost book={books.find(b => b.id === activeId)} />
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </Content>
        </Modal>
      </Overlay>
      {confirm && (
        <ConfirmDialog
          open={true}
          title={confirm.title}
          message={confirm.message}
          danger={confirm.danger}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
};

export default GroupViewModal;
