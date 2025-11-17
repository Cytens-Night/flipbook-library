import { useState } from 'react';
import styled from 'styled-components';
import { Upload, X, AlertCircle } from 'lucide-react';
import { useLibraryStore } from '../../store/useStore';
import { parseBook } from '../../utils/bookParser';
import { generateFileHash } from '../../utils/fileHash';

const UploadButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.accentHover});
  color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.base};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 12px ${({ theme }) => theme.colors.accentGlow},
    ${({ theme }) => theme.elevation.low};
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 24px ${({ theme }) => theme.colors.accentGlow},
      ${({ theme }) => theme.elevation.medium};
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    
    &:hover::before {
      left: -100%;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 500px;
  width: 100%;
  box-shadow: ${({ theme }) => theme.elevation.popup};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const UploadArea = styled.div`
  border: 2px dashed ${({ theme, $isDragging }) => 
    $isDragging ? theme.colors.accent : theme.colors.border
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing['2xl']};
  text-align: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};
  background: ${({ theme, $isDragging }) => 
    $isDragging ? theme.colors.surfaceHover : 'transparent'
  };
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const UploadIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.accent};
`;

const UploadText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.base};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const UploadHint = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.error}22;
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const HiddenInput = styled.input`
  display: none;
`;

const BookUpload = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  
  const addBook = useLibraryStore((state) => state.addBook);
  const bookExists = useLibraryStore((state) => state.bookExists);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    setError(null);
    setIsProcessing(true);
    
    const fileArray = Array.from(files);
    const results = { success: 0, failed: 0, skipped: 0 };

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setCurrentFile({ name: file.name, index: i + 1, total: fileArray.length });
      
      try {
        // Generate file hash
        const fileHash = await generateFileHash(file);
        
        // Check if book already exists
        if (bookExists(fileHash)) {
          results.skipped++;
          continue;
        }

        // Parse the book
        const parsedBook = await parseBook(file, fileHash);
        
        // Add to library
        addBook(parsedBook);
        results.success++;
        
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
        results.failed++;
      }
    }
    
    // Show summary
    if (results.failed > 0 || results.skipped > 0) {
      const messages = [];
      if (results.success > 0) messages.push(`${results.success} uploaded`);
      if (results.skipped > 0) messages.push(`${results.skipped} already exist`);
      if (results.failed > 0) messages.push(`${results.failed} failed`);
      setError(messages.join(', '));
    } else {
      setIsModalOpen(false);
    }
    
    setIsProcessing(false);
    setCurrentFile(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/epub+zip' || 
      file.type === 'text/plain'
    );
    
    if (files.length > 0) {
      handleFileSelect(files);
    } else {
      setError('Please upload valid PDF, EPUB, or TXT files.');
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  return (
    <>
      <UploadButton onClick={() => setIsModalOpen(true)}>
        <Upload size={20} />
        Upload Book
      </UploadButton>

      {isModalOpen && (
        <Modal onClick={() => !isProcessing && setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Upload Book</ModalTitle>
              <CloseButton 
                onClick={() => setIsModalOpen(false)}
                disabled={isProcessing}
              >
                <X size={24} />
              </CloseButton>
            </ModalHeader>

            <label>
              <UploadArea
                $isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <UploadIcon>
                  <Upload size={48} />
                </UploadIcon>
                <UploadText>
                  {isProcessing && currentFile 
                    ? `Processing ${currentFile.name} (${currentFile.index}/${currentFile.total})...` 
                    : isProcessing
                    ? 'Processing...' 
                    : 'Click to upload or drag and drop'}
                </UploadText>
                <UploadHint>PDF, EPUB, or TXT files (multiple files supported)</UploadHint>
              </UploadArea>
              <HiddenInput
                type="file"
                accept=".pdf,.epub,.txt"
                multiple
                onChange={handleInputChange}
                disabled={isProcessing}
              />
            </label>

            {error && (
              <ErrorMessage>
                <AlertCircle size={20} />
                {error}
              </ErrorMessage>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default BookUpload;
